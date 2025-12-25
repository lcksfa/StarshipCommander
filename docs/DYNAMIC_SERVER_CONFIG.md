# 动态服务器配置指南 / Dynamic Server Configuration Guide

## 🎯 问题解决方案

之前的问题：局域网 IP 地址不固定，每次重启路由器都需要修改代码。

**现在的解决方案**：在应用内配置服务器地址，无需重新编译！

---

## ✨ 新功能

### 1️⃣ 服务器配置管理器

**位置**: [src/frontend/lib/server-config.ts](../src/frontend/lib/server-config.ts)

**功能**:
- ✅ 动态配置服务器地址
- ✅ 持久化存储（localStorage）
- ✅ 连接测试功能
- ✅ 支持多种输入格式
- ✅ 自动 URL 格式化

### 2️⃣ 应用内设置界面

**位置**: [src/frontend/components/ServerSettings.tsx](../src/frontend/components/ServerSettings.tsx)

**可访问位置**:
- 🔓 **登录/注册页面**：右上角 ⚙️ 按钮（推荐新用户）
- 👤 **用户资料页面**：用户名旁边 ⚙️ 按钮（已登录用户）

**功能**:
- 🎨 可视化配置界面
- 🧪 实时连接测试
- 📝 帮助文档集成
- 💾 一键保存配置

---

## 📱 如何使用

### 步骤 1：打开设置

**重要**：您可以在两个地方打开服务器设置：

**选项 A：登录/注册页面**（推荐新用户）
1. 打开应用
2. 在登录/注册页面的右上角，点击 **⚙️ 设置图标**
3. 服务器设置界面将弹出
4. 配置服务器后再进行登录/注册

**选项 B：用户资料页面**（已登录用户）
1. 打开应用
2. 在用户资料页面，点击 **⚙️ 设置图标**（在用户名旁边）
3. 服务器设置界面将弹出

### 步骤 2：获取电脑 IP

在您的电脑上运行以下命令：

```bash
# macOS
ipconfig getifaddr en0

# 或
ipconfig getifaddr en1
```

输出示例：`192.168.0.4`

### 步骤 3：配置服务器地址

在设置界面中输入服务器地址：

**支持的格式**：
- `192.168.0.4:3001` ✅ 推荐
- `192.168.0.4` ✅ 会自动添加端口
- `http://192.168.0.4:3001` ✅ 完整 URL
- `http://192.168.0.4:3001/trpc` ✅ 带 /trpc 路径

### 步骤 4：测试连接

1. 点击 **"测试连接 / Test"** 按钮
2. 等待测试结果
3. 如果成功，会显示延迟时间（例如：23ms）
4. 如果失败，会显示错误信息

### 步骤 5：保存配置

1. 点击 **"保存 / Save"** 按钮
2. 配置已保存！应用将自动连接到新服务器
3. 设置界面将在 2 秒后自动关闭

---

## 🔧 高级功能

### 重置为默认配置

如果需要重置：
1. 打开服务器设置
2. 点击 **"重置为默认 / Reset to Default"**
3. 配置将清除，应用将使用默认的 localhost

### 查看当前配置

当前配置显示在设置界面顶部：
- 当前服务器地址
- 配置时间
- 是否为自定义配置

### 快速测试服务器

使用以下命令测试后端是否可访问：

```bash
# 在电脑上测试
curl http://192.168.0.4:3001/health

# 预期响应
# {"status":"ok","timestamp":"...","service":"Starship Commander Backend"}
```

---

## 📊 配置优先级

系统按以下优先级选择服务器地址：

1. **自定义配置**（用户在应用内设置）
   - 存储在 localStorage
   - 最高优先级

2. **环境变量**
   - `VITE_API_URL`
   - `VITE_TRPC_URL`
   - 开发时使用

3. **自动检测**（未实现，预留）
   - Capacitor 代理
   - 本地网络 IP

4. **默认值**
   - `http://localhost:3001/trpc`（Web 开发）

---

## ⚠️ 重要提示

### 必须先配置服务器再登录

**新用户首次使用**：
1. ✅ 打开应用后，先点击右上角的 **⚙️ 设置图标**
2. ✅ 配置服务器地址并测试连接
3. ✅ 保存配置后再进行注册/登录
4. ❌ 不要直接尝试注册/登录（会失败，显示 "failed to fetch"）

**为什么？**
- 应用默认配置为 `localhost:3001`
- 移动设备上 `localhost` 指向设备本身，不是您的电脑
- 必须配置您电脑的局域网 IP 地址（如 `192.168.0.4:3001`）

---

## 🌐 网络要求

### ✅ 必需条件

1. **设备和电脑在同一网络**
   - 连接到同一个 WiFi
   - 或同一个局域网

2. **后端服务器正在运行**
   ```bash
   # 检查后端是否运行
   lsof -i :3001

   # 启动后端
   pnpm run dev:backend
   ```

3. **防火墙允许连接**
   - macOS: 系统偏好设置 > 安全性与隐私 > 防火墙
   - 确保 Node.js 允许传入连接

### ❌ 常见问题

#### 问题 1：无法连接到服务器

**检查清单**：
- [ ] 后端服务器是否运行？
- [ ] 设备和电脑在同一 WiFi？
- [ ] IP 地址是否正确？
- [ ] 防火墙是否阻止？

**解决方法**：
```bash
# 1. 确认后端运行
lsof -i :3001

# 2. 测试连接
curl http://YOUR_IP:3001/health

# 3. 在应用中重新配置
```

#### 问题 2：IP 地址经常变化

**解决方案**：
1. 配置路由器的 DHCP 预留
   - 为您的电脑分配固定 IP
   - 例如：192.168.0.100

2. 使用 mDNS（高级）
   - 配置 `.local` 域名
   - 例如：`macbook.local:3001`

3. 每次网络变化后重新配置
   - 快速获取新 IP
   - 在应用内更新

---

## 🎓 开发者信息

### 配置管理 API

```typescript
import { serverConfig } from '../lib/server-config';

// 获取当前配置的 URL
const url = serverConfig.getBaseUrl();

// 设置新的服务器地址
serverConfig.setServerUrl('192.168.0.4:3001');

// 测试连接
const result = await serverConfig.testConnection();
console.log(result.success, result.message, result.latency);

// 重置为默认
serverConfig.resetToDefault();

// 解析服务器地址
const { fullUrl, displayUrl } = serverConfig.parseServerAddress('192.168.0.4');
```

### 修改默认配置

如需修改默认服务器地址：

1. 编辑 [src/frontend/lib/server-config.ts](../src/frontend/lib/server-config.ts:82)
2. 修改 `getBaseUrl()` 方法中的默认值
3. 重新构建应用

---

## 📋 快速参考

### 典型使用场景

#### 场景 0：首次使用（最重要）

```bash
# 1. 在 Android 设备上打开应用
# 会看到登录/注册页面

# 2. 点击右上角的 ⚙️ 设置图标

# 3. 在电脑上获取 IP
ipconfig getifaddr en0  # 输出: 192.168.0.4

# 4. 在应用设置中输入: 192.168.0.4:3001
# 点击"测试连接"
# 点击"保存"

# 5. 现在可以注册账号了！
```

#### 场景 1：首次配置

```bash
# 1. 获取电脑 IP
ipconfig getifaddr en0  # 输出: 192.168.0.4

# 2. 在应用中
# - 打开设置（⚙️）
# - 输入: 192.168.0.4:3001
# - 点击测试
# - 点击保存
```

#### 场景 2：IP 地址变化

```bash
# 1. 获取新的 IP
ipconfig getifaddr en0  # 输出: 192.168.0.5

# 2. 在应用中
# - 打开设置（⚙️）
# - 修改为: 192.168.0.5:3001
# - 测试连接
# - 保存
```

#### 场景 3：切换到生产环境

```bash
# 1. 在应用设置中输入
https://api.example.com/trpc

# 2. 测试连接
# 3. 保存
```

---

## 🚀 下一步

### 在 Android Studio 中运行

```bash
# 1. 在 Android Studio 中打开项目
pnpm run cap:open:android

# 2. 点击运行按钮

# 3. 应用安装后，配置服务器地址
```

### 测试完整流程

1. ✅ 应用安装成功
2. ✅ **在登录页面配置服务器地址**（点击右上角 ⚙️）
3. ✅ 测试连接成功
4. ✅ 注册账号
5. ✅ 登录并使用应用

---

## 📚 相关文档

- 📖 [Android 网络配置指南](./ANDROID_NETWORK_CONFIG.md)
- 📖 [Android 快速入门](./ANDROID_QUICKSTART.md)
- 📖 [Capacitor 完整指南](./CAPACITOR_ANDROID_GUIDE.md)

---

## 📝 更新日志

### v1.1.0 - 2025-12-25

**重要改进**：
- ✅ 在登录/注册页面添加服务器设置入口
- ✅ 解决"鸡生蛋"问题：用户可以先配置服务器再登录
- ✅ 新用户首次使用体验优化

**修改文件**：
- [AuthGate.tsx](../src/frontend/components/AuthGate.tsx) - 添加登录页设置按钮

**之前版本**：v1.0.0 - 初始版本，仅用户资料页可访问设置

---

**更新时间**: 2025-12-25
**版本**: 1.1.0
**作者**: Starship Commander Team
