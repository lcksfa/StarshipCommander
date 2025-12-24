# Starship Commander 服务器部署指南

## 📋 部署清单

### 前置要求

- ✅ 已购买域名（可选，如无域名可使用 IP 地址）
- ✅ 已有服务器（VPS 或云服务器）
- ✅ 服务器 SSH 访问权限
- ✅ 本地电脑已安装 Git

### 快速部署（5 步完成）

#### 1️⃣ 服务器环境初始化

```bash
# SSH 登录服务器
ssh user@your-server-ip

# 下载并运行初始化脚本
cd ~
git clone https://github.com/your-username/StarshipCommander.git temp-repo
sudo bash temp-repo/deploy/01-server-init.sh
rm -rf temp-repo
```

#### 2️⃣ 部署应用代码

```bash
# 修改 deploy/02-deploy.sh 中的 Git 仓库地址
# REPO_URL="your-git-repo-url"

# 运行部署脚本
cd /var/www/starship-commander
nano deploy/02-deploy.sh  # 编辑仓库地址
bash deploy/02-deploy.sh
```

#### 3️⃣ 启动服务

```bash
# 使用 PM2 启动前后端服务
bash deploy/03-start-services.sh
```

#### 4️⃣ 配置 Nginx

```bash
# 配置反向代理（替换为您的域名）
sudo bash deploy/04-nginx-setup.sh your-domain.com

# 或使用 IP 地址
sudo bash deploy/04-nginx-setup.sh your-server-ip
```

#### 5️⃣ 配置 SSL（可选但推荐）

```bash
# 配置 HTTPS 证书
sudo bash deploy/05-ssl-setup.sh your-email@domain.com your-domain.com
```

---

## 🚀 详细部署说明

### 方式一：从 Git 仓库部署（推荐）

**适用场景**：代码已推送到 GitHub/GitLab

```bash
# 1. 修改 deploy/02-deploy.sh 中的仓库地址
REPO_URL="https://github.com/your-username/StarshipCommander.git"

# 2. 运行部署脚本
bash deploy/02-deploy.sh
```

### 方式二：手动上传代码

**适用场景**：代码未上传到 Git，或需要本地部署

```bash
# 1. 本地打包代码
tar -czf starship-commander.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  .

# 2. 上传到服务器
scp starship-commander.tar.gz user@your-server-ip:/tmp/

# 3. 服务器上解压
cd /var/www/starship-commander
tar -xzf /tmp/starship-commander.tar.gz

# 4. 安装依赖并构建
pnpm install
pnpm prisma:generate
pnpm prisma:push
pnpm build:all
```

---

## 🔧 服务管理命令

### PM2 进程管理

```bash
# 查看服务状态
pm2 list

# 查看实时日志
pm2 logs
pm2 logs starship-backend
pm2 logs starship-frontend

# 重启服务
pm2 restart all
pm2 restart starship-backend

# 停止服务
pm2 stop all

# 删除服务
pm2 delete all

# 监控面板
pm2 monit

# 查看详细信息
pm2 show starship-backend
```

### Nginx 管理

```bash
# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 重新加载配置（无中断）
sudo systemctl reload nginx

# 查看 Nginx 状态
sudo systemctl status nginx

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 数据库管理

```bash
# 打开 Prisma Studio（数据库 GUI）
cd /var/www/starship-commander
pnpm prisma:studio --browser none

# 查看数据库内容
sqlite3 prisma/dev.db
.tables
.schema User
select * from User;

# 备份数据库
cp prisma/dev.db prisma/dev.db.backup.$(date +%Y%m%d)

# 恢复数据库
cp prisma/dev.db.backup.20231224 prisma/dev.db
```

---

## 🔄 更新部署

### 使用自动化更新脚本

```bash
cd /var/www/starship-commander
bash deploy/06-update.sh
```

### 手动更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖
pnpm install

# 3. 生成 Prisma Client
pnpm prisma:generate

# 4. 数据库迁移（如果 schema 有变更）
pnpm prisma:push

# 5. 构建应用
pnpm build:all

# 6. 重启服务
pm2 restart all
```

---

## 🔐 安全建议

### 1. 设置防火墙

```bash
sudo ufw status
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. 配置 fail2ban（防暴力破解）

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. 定期备份数据库

```bash
# 创建备份脚本
cat > /var/www/starship-commander/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/starship-commander"
mkdir -p $BACKUP_DIR
cp /var/www/starship-commander/prisma/dev.db \
   $BACKUP_DIR/dev.db.$(date +%Y%m%d_%H%M%S)
# 保留最近 7 天的备份
find $BACKUP_DIR -name "dev.db.*" -mtime +7 -delete
EOF

chmod +x /var/www/starship-commander/backup.sh

# 添加到 crontab（每天凌晨 3 点备份）
crontab -e
# 添加以下行：
0 3 * * * /var/www/starship-commander/backup.sh
```

### 4. 配置自动更新 PM2

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🐛 常见问题排查

### 问题 1：端口被占用

```bash
# 查看端口占用
sudo lsof -i :3000
sudo lsof -i :3001

# 杀死进程
sudo kill -9 <PID>
```

### 问题 2：权限问题

```bash
# 修复文件权限
sudo chown -R $USER:$USER /var/www/starship-commander
chmod -R 755 /var/www/starship-commander
```

### 问题 3：Prisma 生成失败

```bash
# 清理并重新生成
rm -rf node_modules prisma/node_modules
pnpm install
pnpm prisma:generate
```

### 问题 4：前端构建失败

```bash
# 清理缓存并重新构建
rm -rf dist node_modules/.vite
pnpm build
```

### 问题 5：Nginx 502 错误

```bash
# 检查后端服务是否运行
pm2 list

# 检查后端日志
pm2 logs starship-backend

# 检查端口是否正确
curl http://localhost:3001/health
```

---

## 📊 性能优化建议

### 1. 启用 Nginx Gzip 压缩

已在 nginx-starship-commander.conf 中配置

### 2. 配置 PM2 集群模式

```javascript
// ecosystem.config.js
instances: 4, // 根据 CPU 核心数调整
exec_mode: "cluster",
```

### 3. 使用 CDN 加速静态资源

推荐：Cloudflare, 阿里云 CDN, 腾讯云 CDN

### 4. 数据库优化

```bash
# 定期清理 Prisma 日志
rm -rf prisma/migrations/*/migration.sql

# SQLite 优化
sqlite3 prisma/dev.db "VACUUM;"
```

---

## 📞 获取帮助

- **项目文档**: [CLAUDE.md](../CLAUDE.md)
- **技术栈文档**:
  - [NestJS](https://docs.nestjs.com/)
  - [tRPC](https://trpc.io/docs/)
  - [Prisma](https://www.prisma.io/docs/)
  - [PM2](https://pm2.keymetrics.io/docs/)

---

## ✅ 部署检查清单

部署完成后，请检查：

- [ ] 前端可访问（http://your-domain.com）
- [ ] 后端 API 正常响应
- [ ] 数据库已初始化
- [ ] PM2 服务运行正常
- [ ] Nginx 反向代理工作
- [ ] SSL 证书已配置（如需要）
- [ ] 防火墙规则已设置
- [ ] 数据库自动备份已配置
- [ ] 日志轮转已配置
- [ ] 开机自启已配置

---

**部署完成后，您的星际指挥官应用将在公网上运行！** 🚀
