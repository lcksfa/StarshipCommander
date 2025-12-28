# 🚀 Starship Commander - 局域网部署指南

> LAN Deployment Guide for Starship Commander

本指南将帮助你在局域网内部署 Starship Commander，让局域网内的其他设备可以访问应用。

---

## 📋 前置要求

### 必需软件

- **Docker** >= 20.10
- **Docker Compose** >= 2.0

### 安装 Docker

#### macOS
```bash
# 使用 Homebrew 安装
brew install --cask docker

# 或访问官网下载
# https://www.docker.com/products/docker-desktop
```

#### Linux (Ubuntu/Debian)
```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt-get install docker-compose-plugin
```

#### Windows
- 访问 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- 下载并安装

---

## 🌐 获取局域网 IP 地址

在部署之前，你需要获取本机在局域网中的 IP 地址。

### macOS
```bash
ipconfig getifaddr en0
# 如果使用 Wi-Fi
ipconfig getifaddr en1
```

### Linux
```bash
hostname -I | awk '{print $1}'
# 或
ip addr show | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1
```

### Windows
```powershell
ipconfig | findstr IPv4
# 或在 PowerShell 中
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}).IPAddress
```

---

## ⚡ 快速部署

### 方式一：使用自动部署脚本（推荐）

我们提供了自动化部署脚本，可以自动检测 IP 并完成所有配置。

```bash
# 1. 进入项目目录
cd StarshipCommander

# 2. 运行部署脚本（自动检测 IP）
./deploy-lan.sh

# 3. 或手动指定 IP
./deploy-lan.sh 192.168.1.100
```

脚本会自动：
- ✅ 检查 Docker 是否安装
- ✅ 检测或验证局域网 IP
- ✅ 清理旧容器
- ✅ 构建 Docker 镜像
- ✅ 启动所有服务
- ✅ 等待服务健康检查
- ✅ 显示访问地址

### 方式二：手动部署

如果你需要更多控制，可以手动执行部署步骤。

#### 步骤 1：配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，修改你的局域网 IP
vim .env
```

修改以下配置：
```env
LAN_IP=192.168.1.100  # 改为你的局域网 IP
FRONTEND_URL=http://192.168.1.100:3000
CORS_ORIGINS=http://192.168.1.100:3000,http://localhost:3000
```

#### 步骤 2：构建并启动

```bash
# 设置环境变量并启动
export LAN_IP=192.168.1.100
docker-compose up -d --build

# 或使用 docker compose（新版本）
export LAN_IP=192.168.1.100
docker compose up -d --build
```

#### 步骤 3：验证部署

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试后端健康检查
curl http://localhost:3001/trpc/health

# 测试前端健康检查
curl http://localhost:3000/health
```

---

## 📱 访问应用

部署完成后，你可以通过以下地址访问应用：

### 从本机访问
```
前端 Frontend:  http://localhost:3000
后端 Backend:   http://localhost:3001
```

### 从局域网内其他设备访问
```
前端 Frontend:  http://YOUR_LAN_IP:3000
后端 Backend:   http://YOUR_LAN_IP:3001

示例（假设你的 IP 是 192.168.1.100）:
前端: http://192.168.1.100:3000
后端: http://192.168.1.100:3001
```

### 移动设备访问
确保移动设备连接到同一个 Wi-Fi 网络，然后使用局域网 IP 访问。

---

## 🔧 常用管理命令

### 查看服务状态
```bash
docker-compose ps
```

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看最近 100 行日志
docker-compose logs --tail=100 -f
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
docker-compose restart frontend
```

### 停止服务
```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（⚠️ 会删除数据库数据）
docker-compose down -v
```

### 更新应用
```bash
# 停止服务
docker-compose down

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

### 进入容器调试
```bash
# 进入后端容器
docker-compose exec backend sh

# 进入前端容器
docker-compose exec frontend sh
```

---

## 🐛 故障排除

### 问题 1：容器无法启动

**症状**：容器状态为 `Exited` 或 `Restarting`

**解决方法**：
```bash
# 查看容器日志
docker-compose logs backend
docker-compose logs frontend

# 检查端口占用
lsof -i :3000
lsof -i :3001

# 清理并重新启动
docker-compose down
docker-compose up -d --force-recreate
```

### 问题 2：局域网内其他设备无法访问

**症状**：本机可以访问，但其他设备无法访问

**解决方法**：
1. 确认防火墙设置
```bash
# macOS
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Linux
sudo ufw status
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
```

2. 确认 IP 地址正确
```bash
# 重新获取 IP
ipconfig getifaddr en0  # macOS
hostname -I | awk '{print $1}'  # Linux
```

3. 测试网络连通性
```bash
# 从其他设备 ping
ping 192.168.1.100
```

### 问题 3：前端无法连接后端

**症状**：前端页面可以访问，但无法加载数据

**解决方法**：
1. 检查环境变量配置
```bash
# 查看后端环境变量
docker-compose exec backend env | grep API

# 查看 docker-compose.yml 中的 VITE_API_URL
```

2. 确认后端服务正常运行
```bash
curl http://localhost:3001/trpc/health
curl http://YOUR_LAN_IP:3001/trpc/health
```

3. 检查 CORS 配置
```bash
# 查看 .env 中的 CORS_ORIGINS
docker-compose exec backend env | grep CORS
```

### 问题 4：数据库权限问题

**症状**：后端日志显示数据库访问权限错误

**解决方法**：
```bash
# 修复数据库文件权限
docker-compose exec backend chown -R nestjs:nodejs /app/prisma

# 或使用 root 用户重建容器
docker-compose down
docker-compose up -d --force-recreate
```

### 问题 5：端口被占用

**症状**：启动失败，提示端口已被使用

**解决方法**：
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :3001

# 杀死进程
kill -9 <PID>

# 或修改 docker-compose.yml 中的端口映射
ports:
  - "8000:3000"  # 将前端改为 8000
  - "8001:3001"  # 将后端改为 8001
```

---

## 🔐 安全建议

### 生产环境部署

如果你计划在更广泛的环境中部署，请考虑以下安全措施：

1. **更改默认密码**
```bash
# 生成强随机 JWT 密钥
openssl rand -base64 32

# 更新 .env 文件
JWT_SECRET=<生成的随机字符串>
```

2. **配置防火墙**
```bash
# 仅允许特定 IP 访问
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw allow from 192.168.1.0/24 to any port 3001
```

3. **使用 HTTPS**
- 考虑在 Nginx 前添加反向代理
- 配置 SSL 证书（Let's Encrypt）

4. **定期更新**
```bash
# 定期更新 Docker 镜像
docker-compose pull
docker-compose up -d --build
```

5. **备份数据**
```bash
# 备份数据库
docker-compose exec backend cp /app/prisma/dev.db /app/prisma/backup.db

# 从主机备份
docker cp starship-backend:/app/prisma/dev.db ./backup.db
```

---

## 📊 监控与日志

### 健康检查

应用内置了健康检查端点：

```bash
# 后端健康检查
curl http://localhost:3001/trpc/health

# 前端健康检查
curl http://localhost:3000/health
```

### 查看资源使用情况

```bash
# 查看容器资源使用
docker stats

# 查看特定容器
docker stats starship-backend starship-frontend
```

---

## 🔄 更新与维护

### 定期更新应用

```bash
# 1. 停止服务
docker-compose down

# 2. 拉取最新代码
git pull origin main

# 3. 重新构建并启动
docker-compose up -d --build

# 4. 清理未使用的镜像
docker image prune -f
```

### 数据库迁移

如果有数据库结构变更：

```bash
# 进入后端容器
docker-compose exec backend sh

# 运行迁移
pnpm prisma:migrate

# 或推送 schema（开发环境）
pnpm prisma:push

# 退出容器
exit
```

---

## 📚 更多资源

- [Docker 文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [项目 README](./README.md)
- [开发指南](./CLAUDE.md)

---

## 💡 提示与技巧

1. **自动启动**：如果希望系统重启后自动启动应用，使用 `restart: always` 而不是 `restart: unless-stopped`

2. **日志轮转**：配置日志轮转防止磁盘空间耗尽
```yaml
# 在 docker-compose.yml 中添加
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

3. **资源限制**：限制容器资源使用
```yaml
# 在 docker-compose.yml 中添加
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
```

4. **多环境配置**：为不同环境创建不同的配置文件
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🆘 获取帮助

如果遇到问题：

1. 查看 [故障排除](#-故障排除) 部分
2. 检查容器日志：`docker-compose logs -f`
3. 查阅 [项目 Issues](https://github.com/your-repo/issues)
4. 提交新的 Issue

---

**Happy Deploying! 🚀**
