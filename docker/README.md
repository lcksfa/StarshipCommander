# 🐳 Docker 部署指南

> **Starship Commander** - 使用 Docker 容器化部署方案

---

## 📋 为什么选择 Docker？

Docker 部署相比传统部署方式的优势：

### ✅ 优势

1. **环境一致性** - 开发、测试、生产环境完全一致
2. **依赖隔离** - 不需要在服务器上安装 Node.js、pnpm 等依赖
3. **快速部署** - 一个命令完成部署，无需复杂配置
4. **易于扩展** - 可以使用 Docker Compose、Kubernetes 轻松扩展
5. **版本管理** - 镜像版本化，便于回滚和升级
6. **资源隔离** - 容器级别资源限制，提高安全性
7. **跨平台** - 支持 Linux、macOS、Windows

### 📊 Docker vs 传统部署对比

| 特性 | Docker 部署 | 传统部署 |
|------|------------|---------|
| 环境配置 | ✅ 自动化 | ❌ 手动配置 |
| 依赖管理 | ✅ 镜像包含 | ❌ 需手动安装 |
| 部署时间 | ✅ 2-3 分钟 | ❌ 10-15 分钟 |
| 回滚能力 | ✅ 镜像版本 | ❌ 复杂 |
| 资源隔离 | ✅ 容器级 | ❌ 进程级 |
| 可移植性 | ✅ 任意平台 | ❌ 依赖环境 |

---

## 🚀 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ 可用内存
- 5GB+ 可用磁盘空间

### 安装 Docker

#### Linux (Ubuntu/Debian)

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 添加当前用户到 docker 组（避免每次 sudo）
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo apt install docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

#### macOS

```bash
# 使用 Homebrew 安装
brew install --cask docker

# 或下载安装包
# https://www.docker.com/products/docker-desktop
```

#### Windows

下载并安装 Docker Desktop：
https://www.docker.com/products/docker-desktop

---

## 📦 部署步骤

### 方式 1：使用部署脚本（推荐）

```bash
# 1. 克隆代码
git clone https://github.com/your-username/StarshipCommander.git
cd StarshipCommander

# 2. 首次部署（初始化 + 启动）
bash docker/deploy.sh init

# 3. 查看状态
bash docker/deploy.sh status

# 4. 查看日志
bash docker/deploy.sh logs
```

### 方式 2：手动部署

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，修改 JWT_SECRET

# 2. 构建镜像
docker-compose build

# 3. 初始化数据库
docker-compose --profile init run --rm db-init

# 4. 启动服务
docker-compose up -d

# 5. 查看日志
docker-compose logs -f
```

---

## 🎯 访问应用

部署成功后，访问以下地址：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost:3000 | React 前端应用 |
| 后端 API | http://localhost:3001/trpc | tRPC API 端点 |
| 健康检查 | http://localhost:3000/health | 前端健康检查 |
| 健康检查 | http://localhost:3001/trpc/health | 后端健康检查 |

---

## 🔧 常用命令

### 使用部署脚本

```bash
# 查看所有命令
bash docker/deploy.sh help

# 启动服务
bash docker/deploy.sh start

# 停止服务
bash docker/deploy.sh stop

# 重启服务
bash docker/deploy.sh restart

# 查看日志
bash docker/deploy.sh logs

# 查看状态
bash docker/deploy.sh status

# 重新构建
bash docker/deploy.sh rebuild

# 清理所有
bash docker/deploy.sh clean

# 备份数据库
bash docker/deploy.sh backup

# 恢复数据库
bash docker/deploy.sh restore <backup-file>
```

### 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看服务状态
docker-compose ps

# 进入容器
docker-compose exec backend sh
docker-compose exec frontend sh

# 重新构建镜像
docker-compose build --no-cache

# 删除所有容器和卷
docker-compose down -v
```

---

## 🔐 安全配置

### 1. 修改 JWT 密钥（必须）

**方式 1：使用环境变量**
```bash
# 生成随机密钥
export JWT_SECRET=$(openssl rand -base64 32)

# 启动服务
docker-compose up -d
```

**方式 2：修改 .env 文件**
```bash
# 编辑 .env 文件
JWT_SECRET=<your-random-secret-key>

# 重启服务
docker-compose restart backend
```

### 2. 配置域名

编辑 `.env` 文件：
```bash
VITE_API_URL=https://your-domain.com/trpc
FRONTEND_URL=https://your-domain.com
```

### 3. 使用 SSL/TLS

**方式 1：使用 Nginx 反向代理**

```bash
# 启动 Nginx 代理
docker-compose --profile proxy up -d
```

**方式 2：使用 Traefik**

参考文档：https://doc.traefik.io/traefik/

---

## 💾 数据持久化

### 卷（Volumes）

Docker Compose 使用命名卷持久化数据：

```yaml
volumes:
  starship-db:    # 数据库文件
  starship-logs:  # 应用日志
```

### 备份数据库

```bash
# 使用部署脚本
bash docker/deploy.sh backup

# 手动备份
docker-compose exec backend \
  cp /app/prisma/dev.db /tmp/backup.db
docker cp $(docker-compose ps -q backend):/tmp/backup.db \
  ./backups/starship-db-$(date +%Y%m%d).db
```

### 恢复数据库

```bash
# 使用部署脚本
bash docker/deploy.sh restore <backup-file>

# 手动恢复
docker cp <backup-file> \
  $(docker-compose ps -q backend):/tmp/restore.db
docker-compose exec backend \
  cp /tmp/restore.db /app/prisma/dev.db
docker-compose restart backend
```

---

## 📊 监控和日志

### 查看实时日志

```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f backend
docker-compose logs -f frontend

# 最近 100 行
docker-compose logs --tail=100
```

### 查看资源使用

```bash
# 容器资源使用
docker stats

# 磁盘使用
docker system df

# 详细信息
docker inspect starship-backend
docker inspect starship-frontend
```

### 健康检查

```bash
# 使用部署脚本
bash docker/deploy.sh status

# 手动检查
curl http://localhost:3000/health
curl http://localhost:3001/trpc/health
```

---

## 🔄 更新和升级

### 更新代码

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建镜像
docker-compose build

# 3. 重启服务
docker-compose down
docker-compose up -d
```

### 使用部署脚本

```bash
# 重新构建并重启
bash docker/deploy.sh rebuild
```

---

## 🐛 故障排查

### 问题 1：容器启动失败

**排查步骤：**
```bash
# 查看容器状态
docker-compose ps

# 查看错误日志
docker-compose logs backend
docker-compose logs frontend

# 检查端口占用
sudo lsof -i :3000
sudo lsof -i :3001

# 杀死占用进程
sudo kill -9 <PID>
```

### 问题 2：数据库连接失败

**排查步骤：**
```bash
# 检查数据库卷
docker volume ls | grep starship

# 进入后端容器
docker-compose exec backend sh

# 检查数据库文件
ls -la /app/prisma/dev.db

# 重新初始化数据库
docker-compose --profile init run --rm db-init
```

### 问题 3：前端无法连接后端

**排查步骤：**
```bash
# 检查环境变量
docker-compose exec frontend env | grep VITE_API_URL

# 检查网络连接
docker-compose exec frontend ping backend

# 测试后端 API
docker-compose exec frontend \
  wget -O- http://backend:3001/trpc/health
```

### 问题 4：内存不足

**解决方案：**
```yaml
# 修改 docker-compose.yml，限制内存
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### 问题 5：磁盘空间不足

**清理未使用的资源：**
```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 清理所有未使用的资源
docker system prune -a --volumes
```

---

## 🌐 生产环境部署

### 使用 Docker Swarm

```bash
# 初始化 Swarm
docker swarm init

# 部署栈
docker stack deploy -c docker-compose.yml starship

# 查看服务
docker service ls

# 扩展服务
docker service scale starship_backend=3
```

### 使用 Kubernetes

```bash
# 创建命名空间
kubectl create namespace starship

# 部署
kubectl apply -f k8s/

# 查看 Pod
kubectl get pods -n starship

# 查看服务
kubectl get svc -n starship
```

---

## 📚 高级配置

### 自定义 Nginx 配置

编辑 `docker/nginx.conf`：

```nginx
# 添加自定义配置
client_max_body_size 10M;
proxy_read_timeout 300s;
```

### 多环境部署

```bash
# 开发环境
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### CI/CD 集成

**GitHub Actions 示例：**
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && git pull && docker-compose up -d --build'
```

---

## 🔗 相关链接

- **Docker 文档**: https://docs.docker.com/
- **Docker Compose 文档**: https://docs.docker.com/compose/
- **项目文档**: [../CLAUDE.md](../CLAUDE.md)
- **传统部署文档**: [../deploy/README.md](../deploy/README.md)

---

## ✅ 部署检查清单

部署完成后，请逐项检查：

- [ ] ✅ Docker 和 Docker Compose 已安装
- [ ] ✅ 所有容器正在运行（docker-compose ps）
- [ ] ✅ 前端可以访问（http://localhost:3000）
- [ ] ✅ 后端 API 正常（http://localhost:3001/trpc/health）
- [ ] ✅ JWT_SECRET 已修改为随机值
- [ ] ✅ 数据库持久化卷已创建（docker volume ls）
- [ ] ✅ 健康检查正常（bash docker/deploy.sh status）
- [ ] ✅ 日志输出正常（docker-compose logs）
- [ ] ✅ 备份脚本已配置（bash docker/deploy.sh backup）
- [ ] ✅ 生产环境域名已配置（如有）

---

**最后更新**: 2025-12-24
**维护者**: Starship Commander Team
