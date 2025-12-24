# 局域网部署指南 / LAN Deployment Guide

> **适用场景 / Use Case**: 在局域网内让多台设备访问你的 Starship Commander 应用

## 📋 前置要求 / Prerequisites

1. 所有设备连接到同一局域网（同一 Wi-Fi 或路由器）
2. 服务器的防火墙允许端口 3000 和 3001
3. Docker 和 Docker Compose 已安装

---

## 🚀 快速开始 / Quick Start

### 方法 1：使用自动化脚本（推荐） / Method 1: Automated Script (Recommended)

```bash
# 1. 运行自动化脚本 / Run automated script
bash docker/lan-deploy.sh

# 脚本会自动：
# - 检测你的局域网 IP 地址
# - 配置环境变量
# - 启动 Docker 服务
```

**脚本输出示例 / Example Output:**
```
🌐 Starship Commander 局域网部署脚本
========================================
📡 检测到的局域网 IP: 192.168.1.100
✅ 服务启动成功！
📱 访问信息:
  前端:  http://192.168.1.100:3000
  后端:  http://192.168.1.100:3001
```

---

### 方法 2：手动部署 / Method 2: Manual Deployment

#### Step 1: 获取本机局域网 IP 地址

**macOS:**
```bash
ipconfig getifaddr en0
# 或者如果有其他网卡
ipconfig getifaddr en1
```

**Linux:**
```bash
hostname -I | awk '{print $1}'
# 或者
ip route get 1 | awk '{print $7}'
```

**Windows (PowerShell):**
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" }
```

#### Step 2: 启动服务

```bash
# 假设你的 IP 是 192.168.1.100
LAN_IP=192.168.1.100 docker-compose -f docker-compose.lan.yml up -d
```

#### Step 3: 验证服务

```bash
# 查看服务状态
docker-compose -f docker-compose.lan.yml ps

# 查看日志
docker-compose -f docker-compose.lan.yml logs -f
```

---

## 📱 局域网内访问 / Access from LAN

### 从其他设备访问

假设你的服务器 IP 是 `192.168.1.100`：

**手机/平板/其他电脑:**
- 前端应用: http://192.168.1.100:3000
- API 文档: http://192.168.1.100:3001/api/docs

**注意:**
- 确保设备在同一局域网
- 如果使用 Windows 防火墙，需要添加入站规则

---

## 🔧 防火墙配置 / Firewall Configuration

### macOS

```bash
# 系统偏好设置 -> 安全性与隐私 -> 防火墙选项
# 添加允许 Docker 的规则
```

### Linux (UFW)

```bash
# 允许端口 3000 和 3001
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# 重新加载防火墙
sudo ufw reload
```

### Windows

```powershell
# 以管理员身份运行 PowerShell
New-NetFirewallRule -DisplayName "Starship Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Starship Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

---

## 🛠️ 故障排查 / Troubleshooting

### 问题 1: 其他设备无法访问

**症状 / Symptoms:** 浏览器显示"无法访问此网站"

**解决方案 / Solutions:**

1. **检查 IP 地址是否正确**
   ```bash
   # 服务器上运行
   ipconfig getifaddr en0  # macOS
   hostname -I             # Linux
   ```

2. **检查防火墙设置**（见上文）

3. **验证服务正在运行**
   ```bash
   docker-compose -f docker-compose.lan.yml ps
   ```

4. **从服务器本身测试**
   ```bash
   curl http://localhost:3000
   curl http://localhost:3001/trpc/health
   ```

---

### 问题 2: CORS 错误

**症状 / Symptoms:** 浏览器控制台显示 CORS 相关错误

**解决方案:** 确保 `docker-compose.lan.yml` 中的 `CORS_ORIGINS` 包含正确的 IP

```yaml
environment:
  - CORS_ORIGINS=http://192.168.1.100:3000,http://localhost:3000
```

---

### 问题 3: API 连接失败

**症状 / Symptoms:** 前端加载但无法获取数据

**检查步骤:**

1. **验证后端 API**
   ```bash
   curl http://192.168.1.100:3001/trpc/health
   ```

2. **检查前端 API URL 配置**
   ```bash
   # 应该看到构建时的 API URL
   docker-compose -f docker-compose.lan.yml config | grep VITE_API_URL
   ```

3. **重新构建前端**（如果 IP 变更）
   ```bash
   docker-compose -f docker-compose.lan.yml build --no-cache frontend
   docker-compose -f docker-compose.lan.yml up -d frontend
   ```

---

## 📊 配置文件说明 / Configuration Files

### docker-compose.lan.yml

局域网部署配置文件，包含：

- **端口绑定**: `0.0.0.0:3000` 和 `0.0.0.0:3001`（允许外部访问）
- **环境变量**:
  - `FRONTEND_URL`: 前端访问地址（CORS）
  - `VITE_API_URL`: 前端连接后端的地址
  - `CORS_ORIGINS`: 允许的跨域来源

---

## 🔐 安全提示 / Security Notes

⚠️ **重要 / Important:**

1. **仅用于可信局域网** - 此配置未包含 HTTPS 和身份验证
2. **不要暴露到公网** - 除非你添加了额外的安全措施
3. **定期更换 JWT_SECRET** - 修改 `.env` 文件中的密钥
4. **生产环境建议** - 使用 Nginx 反向代理 + SSL 证书

---

## 📝 常用命令 / Common Commands

```bash
# 查看服务状态 / Check status
docker-compose -f docker-compose.lan.yml ps

# 查看日志 / View logs
docker-compose -f docker-compose.lan.yml logs -f

# 重启服务 / Restart services
docker-compose -f docker-compose.lan.yml restart

# 停止服务 / Stop services
docker-compose -f docker-compose.lan.yml down

# 重新构建并启动 / Rebuild and start
docker-compose -f docker-compose.lan.yml up -d --build

# 查看后端日志 / View backend logs
docker logs -f starship-backend

# 查看前端日志 / View frontend logs
docker logs -f starship-frontend
```

---

## 🌐 公网部署（进阶） / Public Deployment (Advanced)

如果需要从外网访问，请参考：

- [docker-compose.public.yml](../docker-compose.public.yml) - 公网部署配置
- [docker/PUBLIC-DEPLOYMENT.md](./PUBLIC-DEPLOYMENT.md) - 公网部署完整指南

---

## 💡 提示与技巧 / Tips & Tricks

### 固定局域网 IP

为了避免 IP 每次重启后变化，建议在路由器中设置 IP 地址保留（DHCP Reservation）

### 使用域名代替 IP

可以通过以下方式使用域名访问：

1. **本地 DNS** - 在 `/etc/hosts` 中添加映射
2. **mDNS/Bonjour** - macOS/Linux 支持 `hostname.local`
3. **配置本地 DNS 服务器** - 使用 Pi-hole 或类似工具

### 性能优化

如果局域网内设备较多，可以考虑：

1. 使用 Nginx 反向代理（见 `docker-compose.lan.yml` 中的 nginx 服务）
2. 启用 gzip 压缩
3. 配置 CDN 缓存静态资源

---

## 📞 获取帮助 / Getting Help

如果遇到问题：

1. 查看日志: `docker-compose -f docker-compose.lan.yml logs`
2. 检查防火墙设置
3. 确认 IP 地址正确
4. 参考 [主 README](../README.md)

---

**最后更新 / Last Updated:** 2025-12-24
**版本 / Version:** 1.0.0
