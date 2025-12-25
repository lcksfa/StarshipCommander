# 云服务器部署指南 / Cloud Server Deployment Guide

> **目标读者**：需要将 Starship Commander 部署到公网云服务器的开发者
> **Target Audience**: Developers deploying Starship Commander to public cloud servers

---

## 📋 目录 / Table of Contents

1. [准备工作](#准备工作)
2. [安全配置](#安全配置)
3. [部署步骤](#部署步骤)
4. [HTTPS 配置（可选但推荐）](#https-配置可选但推荐)
5. [防火墙配置](#防火墙配置)
6. [故障排查](#故障排查)
7. [维护和监控](#维护和监控)

---

## 准备工作 / Prerequisites

### 1. 服务器要求 / Server Requirements

**最低配置 / Minimum Specs:**
- CPU: 1 核心
- 内存: 1 GB RAM
- 磁盘: 10 GB
- 操作系统: Linux (Ubuntu 20.04+ 推荐)

**推荐配置 / Recommended Specs:**
- CPU: 2 核心
- 内存: 2 GB RAM
- 磁盘: 20 GB SSD

### 2. 安装必要的软件 / Install Required Software

```bash
# 更新系统 / Update system
sudo apt update && sudo apt upgrade -y

# 安装 Docker / Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose / Install Docker Compose
sudo apt install docker-compose-plugin -y

# 将当前用户添加到 docker 组（可选）/ Add current user to docker group (optional)
sudo usermod -aG docker $USER

# 验证安装 / Verify installation
docker --version
docker compose version
```

### 3. 获取项目代码 / Get Project Code

```bash
# 克隆项目 / Clone project
git clone <your-repo-url> StarshipCommander
cd StarshipCommander

# 或上传本地代码到服务器 / Or upload local code to server
# rsync -avz ./StarshipCommander/ user@server:/path/to/StarshipCommander/
```

---

## 安全配置 / Security Configuration

### 🔐 **必须修改的安全配置 / Must-Change Security Settings**

#### 1. 生成安全的 JWT_SECRET

```bash
# 生成 32 字节的随机密钥 / Generate 32-byte random secret
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"
```

#### 2. 获取服务器信息 / Get Server Information

```bash
# 获取公网 IP / Get public IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "PUBLIC_IP=$PUBLIC_IP"

# 如果有域名 / If you have a domain
# DOMAIN="yourdomain.com"
```

---

## 部署步骤 / Deployment Steps

### 方案 A：使用改进的配置文件（推荐）/ Option A: Using Improved Config (Recommended)

#### 1️⃣ 首次部署（包含数据库初始化）/ First Deployment (With DB Init)

```bash
# 设置环境变量 / Set environment variables
export PUBLIC_IP="your.server.ip"  # 替换为你的公网 IP / Replace with your public IP
export JWT_SECRET="$(openssl rand -base64 32)"  # 生成随机密钥 / Generate random secret

# 可选：如果有域名 / Optional: If you have a domain
# export DOMAIN="yourdomain.com"

# 首次部署，初始化数据库 / First deployment, initialize database
docker compose -f docker-compose.cloud.yml --profile init up -d

# 查看日志确认数据库初始化成功 / Check logs to confirm DB initialization
docker compose -f docker-compose.cloud.yml logs -f db-init

# 看到 "Database initialized successfully" 后，Ctrl+C 退出日志查看
# After seeing "Database initialized successfully", press Ctrl+C to exit
```

#### 2️⃣ 后续部署（不含数据库初始化）/ Subsequent Deployments (Without DB Init)

```bash
# 设置环境变量（每次部署都需要）/ Set environment variables (required every time)
export PUBLIC_IP="your.server.ip"
export JWT_SECRET="your-saved-jwt-secret"  # 使用首次部署时保存的 JWT_SECRET

# 启动服务 / Start services
docker compose -f docker-compose.cloud.yml up -d

# 查看服务状态 / Check service status
docker compose -f docker-compose.cloud.yml ps
```

#### 3️⃣ 验证部署 / Verify Deployment

```bash
# 检查服务健康状态 / Check service health
docker compose -f docker-compose.cloud.yml ps

# 查看后端日志 / Check backend logs
docker compose -f docker-compose.cloud.yml logs -f backend

# 查看前端日志 / Check frontend logs
docker compose -f docker-compose.cloud.yml logs -f frontend

# 测试后端健康检查 / Test backend health
curl http://localhost:3001/trpc/health

# 测试前端 / Test frontend
curl http://localhost:3000/
```

### 方案 B：使用原有的 public.yml（需要手动修复）/ Option B: Using Original public.yml (Manual Fix Required)

如果你坚持使用 `docker-compose.public.yml`，需要先修复权限问题：

```bash
# 1. 修改 docker-compose.public.yml
# 在 backend 服务中添加：user: "0:0"

# 2. 部署
export PUBLIC_IP="your.server.ip"
export JWT_SECRET="$(openssl rand -base64 32)"

docker compose -f docker-compose.public.yml --profile init up -d
```

---

## HTTPS 配置（可选但推荐）/ HTTPS Configuration (Optional but Recommended)

### 使用 Nginx 反向代理 + Let's Encrypt / Nginx Reverse Proxy + Let's Encrypt

#### 1. 安装 Nginx 和 Certbot / Install Nginx and Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

#### 2. 配置 Nginx 反向代理 / Configure Nginx Reverse Proxy

创建 Nginx 配置文件 `/etc/nginx/sites-available/starship-commander`:

```nginx
# HTTP 重定向到 HTTPS / HTTP redirect to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 配置 / HTTPS configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL 证书（由 Certbot 自动配置）/ SSL certificate (auto-configured by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # 前端代理 / Frontend proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API 代理 / Backend API proxy
    location /trpc/ {
        proxy_pass http://localhost:3001/trpc/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS 支持（如果需要）/ CORS support (if needed)
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        add_header Access-Control-Allow-Credentials "true" always;

        if ($request_method = OPTIONS) {
            return 204;
        }
    }
}
```

#### 3. 启用配置并获取证书 / Enable Config and Get Certificate

```bash
# 启用站点配置 / Enable site config
sudo ln -s /etc/nginx/sites-available/starship-commander /etc/nginx/sites-enabled/

# 测试 Nginx 配置 / Test Nginx config
sudo nginx -t

# 重启 Nginx / Restart Nginx
sudo systemctl restart nginx

# 获取 SSL 证书 / Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot 会自动修改 Nginx 配置以启用 HTTPS
# Certbot will automatically modify Nginx config to enable HTTPS
```

#### 4. 更新环境变量 / Update Environment Variables

使用 HTTPS 后，需要更新 Docker Compose 环境变量：

```bash
# 更新环境变量 / Update environment variables
export DOMAIN="yourdomain.com"
export FRONTEND_URL="https://yourdomain.com"
export VITE_API_URL="https://yourdomain.com/trpc"

# 重新部署 / Redeploy
docker compose -f docker-compose.cloud.yml up -d --force-recreate
```

---

## 防火墙配置 / Firewall Configuration

### 使用 UFW 配置防火墙 / Configure Firewall with UFW

```bash
# 安装 UFW / Install UFW
sudo apt install ufw -y

# 默认策略 / Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 允许 SSH（重要！否则会锁自己在外面）/ Allow SSH (IMPORTANT! Or you'll lock yourself out)
sudo ufw allow 22/tcp

# 允许 HTTP / Allow HTTP
sudo ufw allow 80/tcp

# 允许 HTTPS / Allow HTTPS
sudo ufw allow 443/tcp

# 如果直接暴露端口（不使用 Nginx）/ If exposing ports directly (without Nginx)
# sudo ufw allow 3000/tcp  # 前端 / Frontend
# sudo ufw allow 3001/tcp  # 后端 / Backend

# 启用防火墙 / Enable firewall
sudo ufw enable

# 查看状态 / Check status
sudo ufw status
```

### 云服务商安全组 / Cloud Provider Security Groups

如果你使用的是云服务商（AWS、阿里云、腾讯云等），还需要配置安全组规则：

**推荐的入站规则 / Recommended Inbound Rules:**

| 协议 / Protocol | 端口 / Port | 来源 / Source | 说明 / Description |
|-----------------|-------------|---------------|-------------------|
| TCP | 22 | 你的 IP (或 0.0.0.0/0) | SSH |
| TCP | 80 | 0.0.0.0/0 | HTTP |
| TCP | 443 | 0.0.0.0/0 | HTTPS |

**不推荐的入站规则（不安全）/ Not Recommended Inbound Rules (Insecure):**
- ❌ 直接暴露 3000 端口（前端）
- ❌ 直接暴露 3001 端口（后端 API）

---

## 故障排查 / Troubleshooting

### 1. 服务无法启动 / Service Won't Start

```bash
# 查看详细日志 / Check detailed logs
docker compose -f docker-compose.cloud.yml logs backend
docker compose -f docker-compose.cloud.yml logs frontend

# 检查容器状态 / Check container status
docker compose -f docker-compose.cloud.yml ps

# 检查资源使用 / Check resource usage
docker stats
```

### 2. 数据库权限错误 / Database Permission Error

**症状 / Symptoms:**
```
Error: Database access error: EROFS: read-only file system
```

**解决方案 / Solution:**
确保在 `docker-compose.cloud.yml` 的 backend 服务中添加了 `user: "0:0"`。

### 3. 前端无法连接后端 / Frontend Can't Connect to Backend

**检查步骤 / Debug Steps:**

```bash
# 1. 检查环境变量 / Check environment variables
docker compose -f docker-compose.cloud.yml exec backend env | grep -E "FRONTEND_URL|CORS"

# 2. 检查后端健康状态 / Check backend health
curl http://localhost:3001/trpc/health

# 3. 检查网络连接 / Check network connectivity
docker compose -f docker-compose.cloud.yml exec frontend wget -O- http://backend:3001/trpc/health
```

### 4. CORS 错误 / CORS Errors

**症状 / Symptoms:**
浏览器控制台显示：
```
Access to XMLHttpRequest at 'http://xxx:3001/trpc/...' from origin 'http://xxx:3000' has been blocked by CORS policy
```

**解决方案 / Solution:**
检查 `CORS_ORIGINS` 环境变量是否包含前端 URL。

### 5. JWT 验证失败 / JWT Validation Failures

**症状 / Symptoms:**
```
Error: Invalid JWT token
```

**可能原因 / Possible Causes:**
1. JWT_SECRET 前后端不一致
2. JWT_SECRET 使用了默认值

**解决方案 / Solution:**
```bash
# 重新生成 JWT_SECRET / Regenerate JWT_SECRET
export JWT_SECRET="$(openssl rand -base64 32)"

# 更新 docker-compose.yml 或使用环境变量
# Update docker-compose.yml or use environment variables

# 重新部署 / Redeploy
docker compose -f docker-compose.cloud.yml up -d --force-recreate
```

---

## 维护和监控 / Maintenance and Monitoring

### 1. 日常维护命令 / Daily Maintenance Commands

```bash
# 查看所有容器状态 / Check all containers
docker compose -f docker-compose.cloud.yml ps

# 查看日志 / View logs
docker compose -f docker-compose.cloud.yml logs -f

# 重启服务 / Restart services
docker compose -f docker-compose.cloud.yml restart

# 停止服务 / Stop services
docker compose -f docker-compose.cloud.yml down

# 更新服务（更新代码后）/ Update services (after code changes)
git pull
docker compose -f docker-compose.cloud.yml build
docker compose -f docker-compose.cloud.yml up -d --force-recreate
```

### 2. 数据库备份 / Database Backup

```bash
# 创建备份脚本 / Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/starship-commander"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库 / Backup database
docker compose -f docker-compose.cloud.yml exec -T backend \
  cp /app/prisma/dev.db - > $BACKUP_DIR/db_$DATE.db

# 保留最近 7 天的备份 / Keep backups from last 7 days
find $BACKUP_DIR -name "db_*.db" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR/db_$DATE.db"
EOF

chmod +x backup.sh

# 设置定时任务 / Set up cron job
crontab -e
# 添加以下行（每天凌晨 2 点备份）/ Add this line (backup daily at 2 AM)
# 0 2 * * * /path/to/backup.sh >> /var/log/starship-backup.log 2>&1
```

### 3. 监控服务健康 / Monitor Service Health

```bash
# 创建健康检查脚本 / Create health check script
cat > health-check.sh << 'EOF'
#!/bin/bash

echo "🔍 Checking Starship Commander services..."

# 检查后端 / Check backend
if curl -sf http://localhost:3001/trpc/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is down!"
    # 可以添加告警通知 / Can add alert notification
fi

# 检查前端 / Check frontend
if curl -sf http://localhost:3000/ > /dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is down!"
fi

# 检查磁盘空间 / Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  Disk usage is ${DISK_USAGE}% - Consider cleaning up"
fi
EOF

chmod +x health-check.sh

# 每 5 分钟检查一次 / Check every 5 minutes
crontab -e
# */5 * * * * /path/to/health-check.sh >> /var/log/starship-health.log 2>&1
```

### 4. 日志管理 / Log Management

```bash
# 清理旧日志 / Clean old logs
docker compose -f docker-compose.cloud.yml exec backend \
  find /app/logs -name "*.log" -mtime +30 -delete

# 或在 docker-compose.yml 中配置日志轮转 / Or configure log rotation in docker-compose.yml
```

---

## 性能优化 / Performance Optimization

### 1. 启用 Docker BuildKit / Enable Docker BuildKit

```bash
# 加速构建 / Speed up builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### 2. 使用多阶段构建缓存 / Use Multi-stage Build Cache

```bash
# 构建时使用缓存 / Use cache during build
docker compose build --build-arg BUILDKIT_INLINE_CACHE=1
```

### 3. 限制容器资源 / Limit Container Resources

已在 `docker-compose.cloud.yml` 中配置了资源限制，可以根据服务器配置调整。

---

## 安全检查清单 / Security Checklist

部署前请确认以下安全措施：

- [ ] 已修改 `JWT_SECRET` 为随机字符串
- [ ] 已配置防火墙（仅开放必要端口）
- [ ] 已禁用容器 root 用户（除数据库初始化外）
- [ ] 已配置 HTTPS（推荐使用 Let's Encrypt）
- [ ] 已设置定期备份
- [ ] 已配置日志监控
- [ ] 已更新服务器系统包
- [ ] 已限制直接暴露后端端口（3001）
- [ ] 已配置强密码策略（如果有用户管理）
- [ ] 已设置入侵检测（可选）

---

## 快速参考 / Quick Reference

### 常用命令 / Common Commands

```bash
# 部署 / Deploy
docker compose -f docker-compose.cloud.yml up -d

# 查看日志 / View logs
docker compose -f docker-compose.cloud.yml logs -f

# 重启 / Restart
docker compose -f docker-compose.cloud.yml restart

# 停止 / Stop
docker compose -f docker-compose.cloud.yml down

# 查看状态 / Check status
docker compose -f docker-compose.cloud.yml ps

# 进入容器 / Enter container
docker compose -f docker-compose.cloud.yml exec backend sh
```

### 环境变量 / Environment Variables

```bash
PUBLIC_IP="your.server.ip"
DOMAIN="yourdomain.com"  # 可选 / Optional
JWT_SECRET="$(openssl rand -base64 32)"  # 必须 / Required
```

---

## 相关文档 / Related Documentation

- [Capacitor Android 指南](./CAPACITOR_ANDROID_GUIDE.md)
- [动态服务器配置](./DYNAMIC_SERVER_CONFIG.md)
- [Android 网络配置](./ANDROID_NETWORK_CONFIG.md)

---

**最后更新 / Last Updated:** 2025-12-25
**维护者 / Maintainer:** Starship Commander Team
