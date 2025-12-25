# Android 端快速入门 / Quick Start Guide

## 🚀 5 分钟快速开始 / 5-Minute Quick Start

### 1️⃣ 前置准备 / Prerequisites

确保已安装：
- ✅ Node.js >= 18.0.0
- ✅ pnpm >= 8.0.0
- ✅ Java JDK 17+
- ✅ Android Studio

### 2️⃣ 构建并运行 / Build and Run

```bash
# 构建前端 + 同步到 Android / Build frontend + sync to Android
pnpm run android:build

# 在模拟器或真实设备上运行 / Run on emulator or real device
pnpm run cap:run:android
```

### 3️⃣ 开发模式 / Development Mode

```bash
# 同时启动前端开发服务器和 Android 应用 / Start frontend dev server and Android app together
pnpm run android:dev
```

### 4️⃣ 使用 Android Studio / Using Android Studio

```bash
# 在 Android Studio 中打开项目 / Open project in Android Studio
pnpm run cap:open:android
```

---

## 📱 在真实设备上测试 / Test on Real Device

### 步骤：

1. **启用开发者模式**：
   - 设置 > 关于手机 > 连续点击"版本号" 7 次

2. **启用 USB 调试**：
   - 开发者选项 > USB 调试

3. **连接设备**：
   - 使用 USB 线连接到电脑
   - 在设备上允许 USB 调试

4. **运行应用**：
   ```bash
   pnpm run cap:run:android
   ```

---

## 🔧 常用命令速查 / Common Commands Cheat Sheet

| 命令 / Command | 说明 / Description |
|----------------|-------------------|
| `pnpm run android:build` | 构建并同步 / Build and sync |
| `pnpm run android:dev` | 开发模式 / Development mode |
| `pnpm run cap:open:android` | 打开 Android Studio / Open Android Studio |
| `pnpm run cap:run:android` | 运行应用 / Run app |
| `pnpm run cap:build:android` | 构建发布版本 / Build release |
| `npx cap sync android` | 仅同步 / Sync only |

---

## 🌐 局域网开发配置 / LAN Development Config

### 在手机上访问电脑的后端服务器 / Access Backend Server from Phone

1. **查找电脑 IP 地址**：
   ```bash
   # macOS
   ipconfig getifaddr en0

   # Linux
   hostname -I
   ```

2. **设置环境变量**：
   ```bash
   export VITE_API_URL=http://192.168.1.100:3001
   pnpm run android:dev
   ```

3. **在应用中配置服务器地址**（如果需要）：
   - 打开应用设置
   - 输入服务器地址：`http://192.168.1.100:3001`

---

## 🐛 调试技巧 / Debugging Tips

### Chrome DevTools 调试

1. 在 Chrome 浏览器打开：`chrome://inspect`
2. 找到你的应用并点击 "inspect"
3. 像调试 Web 应用一样调试

### 查看日志 / View Logs

```bash
# 实时日志 / Real-time logs
adb logcat | grep "Capacitor"

# 清除日志 / Clear logs
adb logcat -c
```

---

## 📤 生成发布版本 / Generate Release Build

### 方法 1：Android Studio（推荐）

```bash
# 1. 构建前端 / Build frontend
pnpm run build

# 2. 同步到 Android / Sync to Android
pnpm run cap:sync:android

# 3. 打开 Android Studio / Open Android Studio
pnpm run cap:open:android

# 4. 在 Android Studio 中 / In Android Studio
# Build > Generate Signed Bundle / APK
```

### 方法 2：命令行

```bash
cd android
./gradlew assembleRelease

# APK 位置 / APK location
# android/app/build/outputs/apk/release/app-release.apk
```

---

## ❓ 遇到问题？/ Troubleshooting

### 应用无法连接到服务器

**解决方案**：
1. 确保手机和电脑在同一 WiFi 网络
2. 使用电脑的局域网 IP（不是 localhost）
3. 检查电脑防火墙设置

### 白屏或加载失败

**解决方案**：
```bash
# 重新构建和同步 / Rebuild and sync
pnpm run android:build

# 清除应用缓存 / Clear app cache
# 手机设置 > 应用 > Starship Commander > 存储 > 清除缓存
```

### 构建失败

**解决方案**：
```bash
# 清理 Gradle 缓存 / Clean Gradle cache
cd android && ./gradlew clean

# 重新安装依赖 / Reinstall dependencies
pnpm install
```

---

## 📚 完整文档 / Full Documentation

查看详细文档：[CAPACITOR_ANDROID_GUIDE.md](./CAPACITOR_ANDROID_GUIDE.md)

---

**最后更新**：2025-12-25
