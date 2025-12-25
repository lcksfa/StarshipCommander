# 云服务器部署快速参考 / Cloud Deployment Quick Reference

> **TL;DR**: 使用 `docker-compose.cloud.yml` + `scripts/deploy-cloud.sh` 部署到公网服务器

---

## ⚡ 快速部署（3 分钟）/ Quick Deploy (3 Minutes)

### 方案 1：自动部署脚本（推荐）/ Option 1: Auto Deploy Script (Recommended)

```bash
# 1. 上传项目到服务器 / Upload project to server
rsync -avz ./StarshipCommander/ user@your-server:/path/to/StarshipCommander/

# 2. 登录服务器 / SSH to server
ssh user@your-server

# 3. 进入项目目录 / Enter project directory
cd StarshipCommander

# 4. 运行部署脚本 / Run deploy script
export PUBLIC_IP="your.server.ip"  # 替换为你的服务器 IP
./scripts/deploy-cloud.sh
```

### 方案 2：手动部署 / Option 2: Manual Deploy

```bash
# 1. 设置环境变量 / Set environment variables
export PUBLIC_IP="your.server.ip"
export JWT_SECRET="$(openssl rand -base64 32)"

# 2. 首次部署（初始化数据库）/ First deployment (init DB)
docker compose -f docker-compose.cloud.yml --profile init up -d

# 3. 后续部署（不包含数据库初始化）/ Subsequent deployments
docker compose -f docker-compose.cloud.yml up -d
```

---

## 📋 部署前检查清单 / Pre-Deployment Checklist

- [ ] 服务器已安装 Docker 和 Docker Compose
- [ ] 已设置防火墙规则（开放 80、443）
- [ ] 准备好公网 IP 或域名
- [ ] 生成安全的 JWT_SECRET

---

## 🔍 Docker 配置文件对比

| 文件 / File | 用途 / Use Case | 推荐度 / Rating |
|------------|----------------|----------------|
| `docker-compose.yml` | 本地开发 / Local dev | ⭐⭐⭐ |
| `docker-compose.lan.yml` | 局域网部署 / LAN deployment | ⭐⭐⭐⭐ |
| `docker-compose.public.yml` | 公网部署（旧版）/ Public (old) | ⭐⭐ |
| **`docker-compose.cloud.yml`** | **公网部署（改进版）/ Public (improved)** | **⭐⭐⭐⭐⭐** |

---

## ⚠️ `docker-compose.public.yml` 的问题

### ❌ 发现的问题 / Issues Found

1. **数据库权限错误**
   ```yaml
   # 缺少这一行 / Missing this line:
   user: "0:0"
   ```
   **症状 / Symptoms**: `EROFS: read-only file system`

2. **数据库初始化需要手动触发**
   ```bash
   # 需要运行 / Need to run:
   docker compose --profile init up db-init
   ```

3. **使用不安全的默认 JWT_SECRET**
   ```yaml
   JWT_SECRET=change-this-to-random-string-in-production
   ```

### ✅ `docker-compose.cloud.yml` 的改进

1. ✅ 添加了 `user: "0:0"` 修复权限问题
2. ✅ 改进了文档说明
3. ✅ 添加了资源限制
4. ✅ 更安全的 CORS 配置
5. ✅ 更清晰的注释

---

## 🚀 推荐的部署流程

### 首次部署 / First Deployment

```bash
# 1. 设置环境变量 / Set environment variables
export PUBLIC_IP="123.45.67.89"
export JWT_SECRET="$(openssl rand -base64 32)"

# 2. 使用自动脚本部署 / Deploy with auto script
./scripts/deploy-cloud.sh

# 或者手动部署 / Or manual deploy
docker compose -f docker-compose.cloud.yml --profile init up -d
```

### 更新部署 / Update Deployment

```bash
# 1. 拉取最新代码 / Pull latest code
git pull

# 2. 重新构建和部署 / Rebuild and deploy
docker compose -f docker-compose.cloud.yml up -d --build
```

### 查看日志 / View Logs

```bash
# 查看所有服务日志 / View all service logs
docker compose -f docker-compose.cloud.yml logs -f

# 仅查看后端 / Backend only
docker compose -f docker-compose.cloud.yml logs -f backend

# 仅查看前端 / Frontend only
docker compose -f docker-compose.cloud.yml logs -f frontend
```

---

## 🔐 安全配置（必须）/ Security Configuration (Required)

### 生成 JWT_SECRET

```bash
# 生成 32 字节随机密钥 / Generate 32-byte random secret
JWT_SECRET=$(openssl rand -base64 32)
echo $JWT_SECRET

# 保存到安全的地方 / Save to secure location
echo "JWT_SECRET=$JWT_SECRET" >> ~/.starship-deploy.env
```

### 配置防火墙 / Configure Firewall

```bash
# 安装 UFW / Install UFW
sudo apt install ufw -y

# 允许 SSH / Allow SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS / Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙 / Enable firewall
sudo ufw enable
```

---

## 📱 配置客户端应用 / Configure Client App

部署完成后，在客户端应用中设置服务器地址：

```
服务器地址 / Server URL: http://your-server-ip:3000
API 地址 / API URL: http://your-server-ip:3001/trpc
```

或使用应用内的**服务器设置**功能进行配置。

---

## 🌐 配置 HTTPS（可选但推荐）/ Configure HTTPS (Optional but Recommended)

### 使用 Nginx + Let's Encrypt

详细步骤请参考：[云服务器部署完整指南](./CLOUD_DEPLOYMENT_GUIDE.md#https-配置可选但推荐)

简要步骤：

```bash
# 1. 安装 Nginx 和 Certbot / Install Nginx and Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# 2. 配置 Nginx（参考文档）/ Configure Nginx (see docs)

# 3. 获取 SSL 证书 / Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# 4. 更新环境变量 / Update environment variables
export DOMAIN="yourdomain.com"

# 5. 重新部署 / Redeploy
docker compose -f docker-compose.cloud.yml up -d --force-recreate
```

---

## 🛠️ 故障排查 / Troubleshooting

### 服务无法启动 / Service Won't Start

```bash
# 查看详细日志 / Check detailed logs
docker compose -f docker-compose.cloud.yml logs backend
docker compose -f docker-compose.cloud.yml logs frontend
```

### 数据库权限错误 / Database Permission Error

确保使用 `docker-compose.cloud.yml`，其中已包含 `user: "0:0"` 配置。

### CORS 错误 / CORS Errors

检查 `CORS_ORIGINS` 环境变量是否包含前端 URL。

---

## 📚 更多文档 / More Documentation

- [云服务器部署完整指南](./CLOUD_DEPLOYMENT_GUIDE.md) - 详细的部署步骤
- [动态服务器配置](./DYNAMIC_SERVER_CONFIG.md) - 客户端配置
- [Android 网络配置](./ANDROID_NETWORK_CONFIG.md) - 移动端配置

---

## 🆘 获取帮助 / Get Help

如果遇到问题：

1. 查看 [完整部署指南](./CLOUD_DEPLOYMENT_GUIDE.md)
2. 检查 Docker 日志：`docker compose logs`
3. 检查防火墙设置
4. 确认服务器端口是否开放

---

**最后更新 / Last Updated**: 2025-12-25
**推荐配置文件 / Recommended Config**: `docker-compose.cloud.yml`
**推荐部署脚本 / Recommended Script**: `scripts/deploy-cloud.sh`
