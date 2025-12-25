# Android 端开发指南 / Android Development Guide

> **Starship Commander** - Capacitor Android 端开发与部署文档

## 📋 概览 / Overview

本项目使用 **Capacitor** 将 React Web 应用打包为原生 Android 应用。

### 技术栈
- **Capacitor**: 8.0.0
- **React**: 19.2.3
- **TypeScript**: 5.9.3
- **Vite**: 7.3.0

---

## 🚀 快速开始 / Quick Start

### 前置要求 / Prerequisites

1. **Node.js**: >= 18.0.0
2. **pnpm**: >= 8.0.0
3. **Java**: JDK 17 或更高版本
4. **Android Studio**: 最新稳定版
5. **Android SDK**: API Level 33+

### 检查环境 / Check Environment

```bash
# 检查 Java 版本 / Check Java version
java -version

# 检查 Android SDK / Check Android SDK
sdkmanager --list

# 检查环境变量 / Check environment variables
echo $ANDROID_HOME
echo $ANDROID_SDK_ROOT
```

---

## 📦 开发工作流 / Development Workflow

### 1. 构建并同步到 Android

```bash
# 构建前端代码 / Build frontend
pnpm run build

# 同步到 Android 平台 / Sync to Android platform
pnpm run cap:sync:android

# 或使用组合命令 / Or use combined command
pnpm run android:build
```

### 2. 在模拟器中运行 / Run on Emulator

```bash
# 启动开发服务器并运行 / Start dev server and run
pnpm run android:dev

# 或仅运行 Android 应用 / Or just run Android app
pnpm run cap:run:android
```

### 3. 在真实设备上运行 / Run on Real Device

1. **启用开发者选项**：设置 > 关于手机 > 连续点击"版本号"
2. **启用 USB 调试**：开发者选项 > USB 调试
3. **连接设备**：使用 USB 线连接电脑
4. **验证连接**：

```bash
# 查看已连接设备 / List connected devices
adb devices

# 运行到设备 / Run on device
pnpm run cap:run:android
```

### 4. 在 Android Studio 中打开项目

```bash
# 使用 Android Studio 打开项目 / Open project in Android Studio
pnpm run cap:open:android
```

**用途**：
- 查看构建日志
- 调试原生代码
- 配置应用签名
- 生成发布版本

---

## 🔧 常用命令 / Common Commands

### 开发命令 / Development Commands

```bash
# 构建前端 / Build frontend
pnpm run build

# 同步资源到 Android / Sync assets to Android
pnpm run cap:sync:android

# 打开 Android Studio / Open Android Studio
pnpm run cap:open:android

# 运行应用 / Run app
pnpm run cap:run:android

# 构建发布版本 / Build release
pnpm run cap:build:android

# 完整构建流程（前端 + 同步）/ Complete build flow (frontend + sync)
pnpm run android:build

# 开发模式（前端开发服务器 + 应用）/ Development mode (frontend dev server + app)
pnpm run android:dev

# 发布构建 / Release build
pnpm run android:release
```

### 清理命令 / Clean Commands

```bash
# 清理 Android 构建缓存 / Clean Android build cache
cd android && ./gradlew clean

# 清理所有 / Clean all
pnpm run clean:full
```

---

## 🎨 配置说明 / Configuration

### Capacitor 配置 / Capacitor Config

文件位置：[capacitor.config.ts](../capacitor.config.ts)

```typescript
{
  appId: 'com.starshipcommander.habits',  // 应用包名 / App package name
  appName: 'Starship Commander',           // 应用名称 / App name
  webDir: 'dist',                          // Web 资源目录 / Web assets directory
  server: {
    androidScheme: 'https',                // 安卓 URL scheme / Android URL scheme
    cleartext: true,                       // 允许 HTTP 连接 / Allow HTTP
  },
  android: {
    allowMixedContent: true,               // 允许混合内容 / Allow mixed content
    captureInput: true,                    // 捕获输入 / Capture input
    webContentsDebuggingEnabled: true,     // 启用调试 / Enable debugging
  },
}
```

### 应用图标 / App Icons

图标位置：`android/app/src/main/res/`

**替换步骤**：
1. 准备图标文件（PNG 格式）
2. 使用 [Capacitor Assets](https://capacitorjs.com/docs/guides/splash-screens-and-icons) 生成
3. 或手动替换以下文件夹中的图标：
   - `mipmap-mdpi` (48x48)
   - `mipmap-hdpi` (72x72)
   - `mipmap-xhdpi` (96x96)
   - `mipmap-xxhdpi` (144x144)
   - `mipmap-xxxhdpi` (192x192)

### 启动屏幕 / Splash Screen

位置：`android/app/src/main/res/drawable/`

**配置**：
```typescript
// capacitor.config.ts
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    launchAutoHide: true,
    backgroundColor: "#000000",
    androidSplashResourceName: "splash",
  },
}
```

---

## 🐛 调试 / Debugging

### Chrome DevTools 调试

1. 在浏览器中打开：`chrome://inspect`
2. 找到你的应用并点击 "inspect"
3. 使用 Chrome DevTools 调试

### 查看日志 / View Logs

```bash
# 查看实时日志 / View real-time logs
adb logcat | grep "Capacitor"

# 查看所有日志 / View all logs
adb logcat

# 清除日志 / Clear logs
adb logcat -c
```

### Android Studio 调试

1. 打开 Android Studio：`pnpm run cap:open:android`
2. 点击 "Debug" 按钮
3. 在代码中设置断点

---

## 📱 发布应用 / Publishing

### 1. 生成签名密钥 / Generate Signing Key

```bash
keytool -genkey -v -keystore starship-commander.keystore -alias starship -keyalg RSA -keysize 2048 -validity 10000
```

**重要**：妥善保管 `.keystore` 文件！

### 2. 配置签名 / Configure Signing

在 `android/app/build.gradle` 中配置：

```gradle
android {
    signingConfigs {
        release {
            storeFile file("starship-commander.keystore")
            storePassword "your-password"
            keyAlias "starship"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. 构建发布版本 / Build Release

```bash
# 构建前端 / Build frontend
pnpm run build

# 同步到 Android / Sync to Android
pnpm run cap:sync:android

# 使用 Android Studio 构建 / Build with Android Studio
pnpm run cap:open:android
# 然后在 Android Studio 中：Build > Generate Signed Bundle / APK

# 或使用命令行 / Or use command line
cd android
./gradlew assembleRelease
```

**输出位置**：`android/app/build/outputs/apk/release/`

### 4. 上传到 Google Play

1. 创建 Google Play 开发者账号
2. 创建应用 listing
3. 上传 APK 或 AAB
4. 填写商店信息
5. 提交审核

---

## 🌐 网络配置 / Network Configuration

### 局域网开发 / LAN Development

在开发环境中，应用需要连接到本地开发服务器：

1. **确保设备和电脑在同一网络**
2. **修改服务器地址**：在应用设置中配置后端服务器地址
3. **允许 HTTP 连接**：已在 `capacitor.config.ts` 中配置 `allowMixedContent: true`

### 配置后端地址 / Configure Backend URL

在 `src/frontend/lib/api.ts` 中：

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
```

**移动端使用**：
```bash
# 使用电脑的局域网 IP / Use computer's LAN IP
export VITE_API_URL=http://192.168.1.100:3001
pnpm run android:dev
```

---

## 🔐 权限配置 / Permissions

### AndroidManifest.xml

位置：`android/app/src/main/AndroidManifest.xml`

**常用权限**：

```xml
<!-- Internet access / 网络访问 -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Network state / 网络状态 -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Camera (if needed) / 相机（如需要）-->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Storage (if needed) / 存储（如需要）-->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 动态权限请求 / Runtime Permissions

使用 **@capacitor/android** 插件：

```typescript
import { Permissions } from '@capacitor/permissions';

// 请求相机权限 / Request camera permission
const requestCamera = async () => {
  const result = await Permissions.request({ name: 'camera' });
  console.log(result.state); // 'granted', 'denied', 'prompt'
};
```

---

## 🎯 常见问题 / Troubleshooting

### 问题 1：无法连接到开发服务器

**解决方案**：
1. 确保设备和电脑在同一网络
2. 使用电脑的局域网 IP 地址（不是 localhost）
3. 检查防火墙设置
4. 在 `capacitor.config.ts` 中设置 `cleartext: true`

### 问题 2：白屏或加载失败

**解决方案**：
1. 检查 `webDir: 'dist'` 配置是否正确
2. 确保已运行 `pnpm run build`
3. 运行 `pnpm run cap:sync:android` 同步资源
4. 清除应用缓存并重新安装

### 问题 3：构建失败

**解决方案**：
1. 检查 Java 版本（需要 JDK 17+）
2. 清理 Gradle 缓存：`cd android && ./gradlew clean`
3. 重新安装依赖：`pnpm install`
4. 删除 `android` 文件夹并重新添加：`npx cap add android`

### 问题 4：应用崩溃

**解决方案**：
1. 查看 logcat 日志：`adb logcat`
2. 检查 AndroidManifest.xml 权限配置
3. 在 Chrome DevTools 中检查 JavaScript 错误
4. 在 Android Studio 中查看崩溃堆栈

---

## 📚 参考资源 / Resources

- [Capacitor 官方文档](https://capacitorjs.com/docs/)
- [Android 开发文档](https://developer.android.com/docs)
- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)

---

## 📝 更新日志 / Changelog

### 2025-12-25
- ✅ 初始化 Capacitor 配置
- ✅ 添加 Android 平台
- ✅ 配置开发脚本
- ✅ 添加移动端初始化代码

---

**维护者**：Starship Commander Team
**最后更新**：2025-12-25
