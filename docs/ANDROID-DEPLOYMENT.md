# 🤖 Starship Commander - Android 部署指南

> Android Deployment Guide for Starship Commander

---

## 📋 目录

1. [快速开始](#快速开始)
2. [IP 变化问题解决方案](#ip-变化问题解决方案)
3. [详细步骤](#详细步骤)
4. [常见问题](#常见问题)
5. [高级配置](#高级配置)

---

## 🚀 快速开始

### 方式一：使用智能构建脚本（推荐）

```bash
# 自动检测 IP 并构建
pnpm android:smart-build

# 或手动指定 IP
./scripts/build-android.sh 192.168.1.100

# 或使用 npx
npx cross-env shell ./scripts/build-android.sh
```

**脚本功能**：
- ✅ 自动检测本机局域网 IP
- ✅ 更新 Capacitor 配置
- ✅ 构建前端代码
- ✅ 同步到 Android
- ✅ 编译 APK（Debug 或 Release）

### 方式二：手动构建

```bash
# 1. 修改 capacitor.config.ts 中的 IP
vim capacitor.config.ts

# 2. 构建前端
VITE_API_URL=http://YOUR_IP:3001/trpc pnpm build

# 3. 同步到 Android
npx cap sync android

# 4. 编译 APK
cd android && ./gradlew assembleDebug
```

---

## 🔧 IP 变化问题解决方案

### 问题背景

在局域网环境中，路由器分配的 IP 地址可能会变化，导致：
- 移动端无法连接到服务器
- 每次都需要手动修改配置文件
- 重新构建 APK

### 解决方案

#### ✅ 方案 1：智能构建脚本（最简单）

每次 IP 变化后，重新运行脚本即可：

```bash
# 自动检测并构建
pnpm android:smart-build
```

**优点**：
- 全自动，无需手动修改配置
- 自动更新 IP 地址
- 自动完成所有构建步骤

#### ✅ 方案 2：固定 IP 地址（推荐）

在路由器中为服务器分配固定 IP：

**路由器配置示例（以常见路由器为例）**：

1. **TP-Link 路由器**：
   - 登录路由器管理界面（通常为 `192.168.1.1` 或 `192.168.0.1`）
   - DHCP → DHCP 设置 → 地址保留
   - 添加服务器的 MAC 地址和固定 IP

2. **ASUS 路由器**：
   - 登录路由器管理界面
   - 局域网 → DHCP 服务器 → 手动分配 IP
   - 添加 MAC 地址和 IP 映射

3. **Netgear 路由器**：
   - 登录路由器管理界面
   - 高级 → 安装 → LAN 设置 → 地址保留

**优点**：
- IP 永久固定
- 一次配置，长期有效
- 适合家庭/办公环境

#### ✅ 方案 3：使用 hosts/mDNS（高级）

在应用中配置本地域名：

1. **配置 mDNS/Bonjour 服务**（需要在服务器上设置）

2. **使用 `.local` 域名**：
   ```typescript
   // capacitor.config.ts
   server: {
     url: 'http://starship-commander.local:3000',
   }
   ```

**优点**：
- 不依赖 IP 地址
- 更专业、更灵活

**缺点**：
- 需要额外的 DNS 配置
- 兼容性问题

#### ✅ 方案 4：应用内配置（开发中）

在 Android 应用启动时让用户输入服务器地址：

```typescript
// 服务器地址配置界面
const serverConfig = {
  url: await promptUserForServerUrl(),
  saveToLocalStorage: true,
};
```

**优点**：
- 最灵活
- 用户可以随时修改
- 不需要重新构建 APK

**缺点**：
- 需要开发配置界面
- 用户体验稍差

---

## 📚 详细步骤

### 步骤 1：检查服务器运行状态

```bash
# 确认 Docker 容器正在运行
docker-compose ps

# 应该看到：
# starship-backend    健康运行中
# starship-frontend   健康运行中
```

### 步骤 2：获取本机 IP 地址

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'

# Windows
ipconfig | findstr IPv4
```

### 步骤 3：验证服务器可访问

```bash
# 测试前端
curl http://YOUR_IP:3000/health

# 测试后端
curl http://YOUR_IP:3001/trpc/health
```

### 步骤 4：运行智能构建脚本

```bash
# 自动检测 IP
pnpm android:smart-build

# 或指定 IP
./scripts/build-android.sh 192.168.1.100
```

### 步骤 5：安装 APK

```bash
# 方式一：直接安装
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 方式二：传输到手机安装
# 1. 将 APK 复制到手机
# 2. 在手机上打开并安装
```

### 步骤 6：测试应用

1. 确保 Android 设备连接到同一 Wi-Fi
2. 打开 Starship Commander 应用
3. 应该能看到加载界面
4. 测试登录功能

---

## ❓ 常见问题

### Q1: APK 无法连接到服务器

**原因**：
- 服务器未运行
- IP 地址不正确
- 设备不在同一网络

**解决方法**：
```bash
# 1. 检查服务器状态
docker-compose ps

# 2. 验证 IP 地址
ipconfig getifaddr en0  # macOS

# 3. 测试连接
curl http://YOUR_IP:3000/health

# 4. 重新构建 APK
pnpm android:smart-build
```

### Q2: 每次重启电脑后 IP 都变了

**解决方法**：
- **短期**：每次重新运行 `pnpm android:smart-build`
- **长期**：在路由器中设置固定 IP（推荐）

### Q3: 可以在不同的 Wi-Fi 网络中使用吗？

**可以**，但需要：
1. 确保手机和服务器在同一网络
2. 重新运行 `pnpm android:smart-build` 更新 IP
3. 重新安装 APK

### Q4: Release 版本和 Debug 版本有什么区别？

| 特性 | Debug 版本 | Release 版本 |
|------|-----------|-------------|
| 大小 | ~4.2 MB | ~3.1 MB |
| 性能 | 稍慢 | 更快 |
| 调试 | 启用 | 禁用 |
| 签名 | Debug 签名 | Release 签名 |
| 用途 | 开发测试 | 生产分发 |

**推荐**：
- 开发/测试：使用 Debug 版本
- 分发给他人：使用 Release 版本

### Q5: 如何在没有网络的环境中部署？

可以配置应用使用本地打包的资源：

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  // 注释掉 server 配置，使用本地资源
  // server: { url: 'http://...' },

  webDir: 'dist', // 使用打包的资源
};
```

然后构建不依赖网络的 APK。

---

## 🔧 高级配置

### 配置多个网络环境

创建不同的 Capacitor 配置文件：

```bash
# 开发环境
capacitor.config.dev.ts
url: 'http://192.168.0.3:3000'

# 测试环境
capacitor.config.staging.ts
url: 'http://test-server.local:3000'

# 生产环境
capacitor.config.prod.ts
url: 'https://app.example.com'
```

### 自动化构建脚本

创建一个完整的 CI/CD 脚本：

```bash
#!/bin/bash
# scripts/ci-build.sh

# 1. 检测环境
if [ "$CI_ENV" = "production" ]; then
  BUILD_TYPE="release"
else
  BUILD_TYPE="debug"
fi

# 2. 获取配置
SERVER_URL=$(cat server-url.txt)

# 3. 构建
VITE_API_URL="$SERVER_URL/trpc" pnpm build
npx cap sync android
cd android && ./gradlew assemble$BUILD_TYPE

# 4. 归档 APK
cp android/app/build/outputs/apk/$BUILD_TYPE/*.apk ./artifacts/
```

### 配置应用图标和名称

修改 `android/app/src/main/AndroidManifest.xml`：

```xml
<application
  android:label="Starship Commander"
  android:icon="@mipmap/ic_launcher">
```

---

## 📱 生成的 APK 文件

### Debug 版本
```
路径: android/app/build/outputs/apk/debug/app-debug.apk
大小: ~4.2 MB
用途: 开发和测试
```

### Release 版本
```
路径: android/app/build/outputs/apk/release/app-release.apk
大小: ~3.1 MB
用途: 生产分发
```

---

## 🎯 最佳实践

1. **开发阶段**：
   - 使用 Debug 版本
   - 使用智能构建脚本自动检测 IP
   - 启用 USB 调试

2. **测试阶段**：
   - 使用 Release 版本
   - 在多个设备上测试
   - 验证不同网络环境

3. **生产发布**：
   - 配置应用签名
   - 禁用调试功能
   - 测试所有功能
   - 准备应用商店材料

4. **IP 管理**：
   - **短期**：使用智能构建脚本
   - **长期**：在路由器中配置固定 IP
   - **专业**：使用 DNS/hosts 配置

---

## 📞 获取帮助

- 查看脚本源码：`scripts/build-android.sh`
- 查看 Capacitor 文档：https://capacitorjs.com/
- 查看项目主文档：[README.md](../README.md)

---

**Happy Building! 🚀**
