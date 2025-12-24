# 部署配置修复说明

> **更新日期**: 2025-12-24
> **版本**: 1.0.0

---

## 📋 问题排查总结

本文档记录了在部署过程中发现并修复的所有配置问题。

---

## ✅ 已修复的问题

### 1. PM2 配置路径错误

**问题描述：**
- 原配置指向：`./dist/backend/main.js`
- 实际构建输出：`src/backend/dist/backend/main.js`

**修复内容：**
- ✅ 更正后端入口路径为 `./src/backend/dist/backend/main.js`
- ✅ 添加完整的环境变量配置（NODE_ENV, PORT, FRONTEND_URL, DATABASE_URL, JWT_SECRET 等）
- ✅ 前端环境变量添加 `VITE_API_URL`

**文件位置：** [deploy/ecosystem.config.js](../ecosystem.config.js)

---

### 2. 环境变量配置缺失

**问题描述：**
- 缺少前端所需的环境变量（VITE_API_URL）
- 没有生产环境配置文件（.env.production）
- CORS 配置缺少生产环境域名支持

**修复内容：**
- ✅ 创建 `.env.production` 生产环境配置文件
- ✅ 更新 `.env.example` 添加前端配置说明
- ✅ 更新 `.env` 开发环境配置
- ✅ PM2 配置中添加所有必需的环境变量

**新增文件：**
- [.env.production](../.env.production) - 生产环境配置
- 更新：[.env.example](../.env.example) - 环境变量模板
- 更新：[.env](../.env) - 开发环境配置

---

### 3. 部署脚本优化

**问题描述：**
- 缺少 Prisma 目录创建步骤
- 没有环境变量配置步骤
- 缺少构建验证步骤
- 数据库路径说明不正确

**修复内容：**
- ✅ 添加 Prisma 目录创建（mkdir -p prisma）
- ✅ 添加自动配置生产环境变量（复制 .env.production → .env）
- ✅ 添加构建输出验证（检查 dist/index.html 和 src/backend/dist/backend/main.js）
- ✅ 智能数据库初始化（仅当数据库不存在时）
- ✅ 更新构建输出路径说明

**文件位置：** [deploy/02-deploy.sh](./02-deploy.sh)

---

## 🔧 部署前必做的配置

### ⚠️ 安全配置（必须修改）

在部署到生产环境前，**必须**修改以下配置：

#### 1. JWT 密钥

**文件位置：** `.env.production` 或 `deploy/ecosystem.config.js`

```bash
# ❌ 不安全（默认值）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ✅ 安全（随机生成，至少 32 字符）
JWT_SECRET=$(openssl rand -base64 32)
```

**生成随机密钥命令：**
```bash
openssl rand -base64 32
# 或
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 2. CORS 域名配置

**文件位置：** `deploy/ecosystem.config.js`

```javascript
env: {
  // 如果有域名，替换为实际域名
  FRONTEND_URL: "http://localhost:3000", // 改为 https://your-domain.com
}
```

**后端 main.ts 中的 CORS 配置：**
```typescript
// src/backend/main.ts:29-33
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:5173", // Vite 开发服务器
  "http://localhost:3000", // 备用前端端口
  // ⚠️ 生产环境添加您的域名
  // "https://your-domain.com",
];
```

#### 3. 数据库备份

**建议：** 设置自动备份任务

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

---

## 📊 项目结构说明

### 构建输出路径

```
StarshipCommander/
├── dist/                          # 前端构建输出（Vite）
│   ├── index.html
│   └── assets/
│
├── src/backend/dist/              # 后端构建输出（NestJS）
│   └── backend/
│       ├── main.js                # ✅ 后端入口文件
│       ├── main.js.map
│       └── ...
│
├── prisma/                        # 数据库
│   ├── schema.prisma
│   └── dev.db                     # SQLite 数据文件
│
├── logs/                          # PM2 日志（自动创建）
│   ├── backend-error.log
│   ├── backend-out.log
│   ├── frontend-error.log
│   └── frontend-out.log
│
└── .env                           # 环境变量（生产环境）
```

### 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端（Vite Preview） | 3000 | 生产环境前端服务 |
| 后端（NestJS） | 3001 | tRPC API 服务 |
| Nginx（HTTP） | 80 | 反向代理 |
| Nginx（HTTPS） | 443 | SSL 加密访问 |

---

## 🚀 快速部署步骤

### 方式 1：使用 Git 仓库

```bash
# 1. 登录服务器
ssh user@your-server-ip

# 2. 克隆代码
sudo git clone https://github.com/your-username/StarshipCommander.git /var/www/starship-commander
sudo chown -R $USER:$USER /var/www/starship-commander

# 3. 进入目录并部署
cd /var/www/starship-commander/deploy
bash 02-deploy.sh

# 4. 启动服务
bash 03-start-services.sh

# 5. 配置 Nginx
sudo bash 04-nginx-setup.sh your-domain.com

# 6. （可选）配置 SSL
sudo bash 05-ssl-setup.sh admin@domain.com your-domain.com
```

### 方式 2：手动上传代码

```bash
# 1. 本地打包（排除 node_modules）
tar -czf starship-commander.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=src/backend/dist \
  --exclude=.git \
  .

# 2. 上传到服务器
scp starship-commander.tar.gz user@your-server-ip:/tmp/

# 3. 服务器上解压并部署
ssh user@your-server-ip
cd /var/www
sudo mkdir -p starship-commander
sudo chown -R $USER:$USER starship-commander
cd starship-commander
tar -xzf /tmp/starship-commander.tar.gz
cd deploy
bash 02-deploy.sh
bash 03-start-services.sh
```

---

## 🔍 部署验证

### 1. 检查服务状态

```bash
# PM2 服务列表
pm2 list

# 应该看到：
# ┌────┬────────────────────┬──────────┬─────────┐
# │ id │ name               │ mode     │ status  │
# ├────┼────────────────────┼──────────┼─────────┤
# │ 0  │ starship-backend   │ cluster  │ online  │
# │ 1  │ starship-frontend  │ fork     │ online  │
# └────┴────────────────────┴──────────┴─────────┘
```

### 2. 测试 API 端点

```bash
# 测试后端健康检查
curl http://localhost:3001/trpc/health

# 预期返回：
# {"result":{"data":{"status":"Server is running",...}}}
```

### 3. 测试前端访问

```bash
# 测试前端页面
curl http://localhost:3000

# 预期返回：HTML 页面（包含 <!DOCTYPE html>）
```

### 4. 检查日志

```bash
# 后端日志
pm2 logs starship-backend

# 前端日志
pm2 logs starship-frontend

# 实时监控
pm2 monit
```

### 5. 运行健康检查

```bash
# 使用健康检查脚本
bash /var/www/starship-commander/deploy/health-check.sh
```

---

## 🐛 常见问题排查

### 问题 1：后端启动失败

**可能原因：**
- 数据库不存在或路径错误
- 端口被占用
- 环境变量配置错误

**排查步骤：**
```bash
# 1. 检查数据库
ls -la /var/www/starship-commander/prisma/dev.db

# 2. 检查端口占用
sudo lsof -i :3001

# 3. 查看详细错误日志
pm2 logs starship-backend --err

# 4. 手动测试后端启动
cd /var/www/starship-commander
NODE_ENV=production PORT=3001 node src/backend/dist/backend/main.js
```

### 问题 2：前端无法连接后端

**可能原因：**
- 环境变量 VITE_API_URL 配置错误
- CORS 配置问题
- 后端服务未启动

**排查步骤：**
```bash
# 1. 检查环境变量
pm2 env 0 | grep VITE_API_URL

# 2. 测试后端 API
curl http://localhost:3001/trpc/health

# 3. 检查 CORS 配置
pm2 env 0 | grep FRONTEND_URL

# 4. 查看前端错误日志
pm2 logs starship-frontend --err
```

### 问题 3：数据库连接失败

**可能原因：**
- Prisma Client 未生成
- 数据库文件权限问题
- DATABASE_URL 配置错误

**排查步骤：**
```bash
# 1. 重新生成 Prisma Client
cd /var/www/starship-commander
pnpm prisma:generate

# 2. 检查数据库文件权限
ls -la prisma/dev.db

# 3. 修复权限（如果需要）
chmod 644 prisma/dev.db
chmod 755 prisma

# 4. 验证数据库
pnpm prisma:studio
```

---

## 📞 获取帮助

- **完整部署文档**: [README.md](./README.md)
- **快速开始指南**: [QUICKSTART.md](./QUICKSTART.md)
- **项目文档**: [../CLAUDE.md](../CLAUDE.md)

---

## ✅ 部署检查清单

部署完成后，请逐项检查：

- [ ] ✅ 后端服务运行正常（pm2 list 显示 online）
- [ ] ✅ 前端服务运行正常（pm2 list 显示 online）
- [ ] ✅ 数据库文件存在（prisma/dev.db）
- [ ] ✅ JWT_SECRET 已修改为随机值
- [ ] ✅ CORS 域名已配置（如有域名）
- [ ] ✅ Nginx 反向代理工作正常
- [ ] ✅ SSL 证书已配置（如需要）
- [ ] ✅ 防火墙规则已设置（22, 80, 443）
- [ ] ✅ 数据库自动备份已配置
- [ ] ✅ PM2 开机自启已配置（pm2 startup）
- [ ] ✅ 健康检查脚本运行通过

---

**最后更新**: 2025-12-24
**维护者**: Starship Commander Team
