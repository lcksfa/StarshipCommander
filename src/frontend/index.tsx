import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGate } from "./components/AuthGate";

// 初始化 Capacitor / Initialize Capacitor
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";

// 显示启动屏幕 / Show splash screen
const showSplashScreen = async () => {
  try {
    await SplashScreen.show({
      showDuration: 2000,
      autoHide: true,
    });
  } catch (error) {
    console.log("Splash screen not available:", error);
  }
};

// 隐藏启动屏幕 / Hide splash screen
const hideSplashScreen = async () => {
  try {
    await SplashScreen.hide();
  } catch (error) {
    console.log("Splash screen not available:", error);
  }
};

// 检测平台信息 / Detect platform information
const isCapacitorAndroid = Capacitor.getPlatform() === "android";
const isCapacitorIOS = Capacitor.getPlatform() === "ios";
const isMobile = Capacitor.isNativePlatform();
const isWeb = !isMobile;

// 添加平台类到 body / Add platform class to body
if (isCapacitorAndroid) {
  document.body.classList.add("capacitor-android");
} else if (isCapacitorIOS) {
  document.body.classList.add("capacitor-ios");
} else if (isWeb) {
  document.body.classList.add("web-platform");
}

// 设置安全区域边距 / Set safe area insets
const setSafeAreaInsets = () => {
  const root = document.documentElement;

  // 检查是否为移动设备 / Check if mobile device
  if (isMobile) {
    // 设置 CSS 变量用于安全区域 / Set CSS variables for safe area
    root.style.setProperty("--safe-area-top", "env(safe-area-inset-top)");
    root.style.setProperty("--safe-area-bottom", "env(safe-area-inset-bottom)");
    root.style.setProperty("--safe-area-left", "env(safe-area-inset-left)");
    root.style.setProperty("--safe-area-right", "env(safe-area-inset-right)");
  }
};

// 初始化应用 / Initialize app
const initApp = async () => {
  // 设置安全区域 / Set safe area insets
  setSafeAreaInsets();

  // 显示启动屏幕（仅在移动端）/ Show splash screen (mobile only)
  if (isMobile) {
    await showSplashScreen();
  }
};

// 执行初始化 / Execute initialization
initApp().then(() => {
  // 初始化完成后隐藏启动屏幕 / Hide splash screen after initialization
  if (isMobile) {
    setTimeout(() => {
      hideSplashScreen();
    }, 1000);
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
