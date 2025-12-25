# Android 网络配置指南 / Network Configuration Guide

## 🌐 问题说明 / Problem Description

Android 移动应用无法直接访问 `localhost`，因为：
- 移动设备的 `localhost` 指向设备本身
- 而不是指向开发电脑

**解决方案**：使用局域网 IP 地址连接后端服务器。

---

## 📍 当前配置 / Current Configuration

### 已配置的局域网 IP

```typescript
// src/frontend/lib/auth-api.ts
// src/frontend/lib/trpc.ts
const API_BASE_URL = "http://192.168.0.4:3001/trpc";
```

### 如何验证配置

```bash
# 1. 检查后端是否运行
curl http://192.168.0.4:3001/health

# 2. 查看电脑 IP
ipconfig getifaddr en0  # macOS
```

---

## 🔄 如何更新 IP 地址

如果您的电脑 IP 地址发生变化，需要更新以下文件：

### 文件 1: `src/frontend/lib/auth-api.ts`

```typescript
// 第 35 行
this.baseUrl =
  (import.meta.env as any).VITE_TRPC_URL ||
  (import.meta.env as any).VITE_API_URL ||
  "http://YOUR_NEW_IP:3001/trpc"; // 修改这里 / Update here
```

### 文件 2: `src/frontend/lib/trpc.ts`

```typescript
// 第 59 行
this.baseUrl =
  (import.meta.env as any).VITE_TRPC_URL ||
  (import.meta.env as any).VITE_API_URL ||
  "http://YOUR_NEW_IP:3001/trpc"; // 修改这里 / Update here
```

### 更新后重新构建

```bash
# 1. 修改代码
# 2. 重新构建
pnpm run build

# 3. 同步到 Android
pnpm run cap:sync:android

# 4. 在 Android Studio 中重新运行
```

---

## 📱 确保设备和电脑在同一网络

### 检查网络连接

```bash
# 1. 查看电脑 IP
ipconfig getifaddr en0  # macOS
# 或
ipconfig getifaddr en1  # 某些 Mac

# 2. 设备连接到同一 WiFi
# 确保手机和电脑连接到同一个 WiFi 网络
```

### 测试连接

```bash
# 在电脑上测试后端是否可访问
curl http://192.168.0.4:3001/health

# 预期输出：
# {"status":"ok","timestamp":"...","service":"Starship Commander Backend"}
```

---

## 🔐 常见问题 / Common Issues

### 问题 1: "Failed to fetch"

**原因**：后端服务器未运行或 IP 地址不正确

**解决方案**：
```bash
# 1. 检查后端是否运行
lsof -i :3001

# 2. 如果没有运行，启动后端
pnpm run dev:backend

# 3. 验证 IP 地址
ipconfig getifaddr en0
```

### 问题 2: 设备无法连接到电脑

**原因**：
- 防火墙阻止了连接
- 设备和电脑不在同一网络

**解决方案**：
```bash
# macOS: 允许端口 3001 通过防火墙
# 系统偏好设置 > 安全性与隐私 > 防火墙 > 防火墙选项
# 添加 Node.js 允许传入连接

# 或者临时关闭防火墙（测试用）
# 系统偏好设置 > 安全性与隐私 > 防火墙 > 关闭防火墙
```

### 问题 3: CORS 错误

**原因**：后端未配置允许跨域请求

**解决方案**：已在后端配置 CORS，支持所有来源

---

## 🌍 不同平台的配置

### Web 浏览器（开发）

```typescript
// 使用 localhost
const API_BASE_URL = "http://localhost:3001/trpc";
```

### Android 移动端

```typescript
// 使用局域网 IP
const API_BASE_URL = "http://192.168.0.4:3001/trpc";
```

### 生产环境

```typescript
// 使用环境变量
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.example.com/trpc";
```

---

## 📋 快速参考 / Quick Reference

### 修改 IP 的完整流程

```bash
# 1. 获取新 IP
ipconfig getifaddr en0
# 输出示例: 192.168.0.4

# 2. 修改文件
# - src/frontend/lib/auth-api.ts (第 35 行)
# - src/frontend/lib/trpc.ts (第 59 行)
# 将 IP 地址替换为新的地址

# 3. 重新构建
pnpm run build

# 4. 同步到 Android
pnpm run cap:sync:android

# 5. 在 Android Studio 中重新运行
# 或使用命令行安装
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 验证连接的命令

```bash
# 检查后端健康状态
curl http://192.168.0.4:3001/health

# 查看后端日志
# 后端应该显示正在监听的端口
```

---

## 🚀 下一步 / Next Steps

1. **测试注册功能**：
   - 打开应用
   - 尝试注册账号
   - 如果成功，说明配置正确

2. **开发时保持 IP 同步**：
   - 每次重启路由器后 IP 可能变化
   - 修改代码中的 IP 地址
   - 重新构建应用

3. **考虑使用 mDNS**（可选）：
   - 使用 `.local` 域名代替 IP
   - 例如: `http://macbook.local:3001/trpc`
   - 需要额外的配置

---

**最后更新**: 2025-12-25
**维护者**: Starship Commander Team
