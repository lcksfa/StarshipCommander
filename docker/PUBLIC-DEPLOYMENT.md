# 🌐 公网部署指南

> **在有公网 IP 的服务器上部署 Starship Commander**

---

## ⚡ 快速开始（推荐）

### 方式 1：使用自动化脚本（最简单）

```bash
# 1. 克隆代码
git clone https://github.com/your-username/StarshipCommander.git
cd StarshipCommander

# 2. 运行公网部署脚本（自动检测 IP 并配置）
bash docker/public-deploy.sh

# 3. 打开浏览器访问
# http://your-public-ip:3000
```

脚本会自动：
- ✅ 检测您的公网 IP
- ✅ 生成安全的 JWT 密钥
- ✅ 配置环境变量
- ✅ 配置防火墙（可选）
- ✅ 构建并启动服务

---

## 🔧 手动配置

### 步骤 1：配置环境变量

创建 `.env` 文件：

```bash
# 公网 IP 或域名
PUBLIC_IP=123.45.67.89

# JWT 密钥（必须修改）
JWT_SECRET=$(openssl rand -base64 32)

# 其他配置
NODE_ENV=production
LOG_LEVEL=info
```

### 步骤 2：部署

```bash
# 使用公网配置文件部署
export PUBLIC_IP=123.45.67.89
docker-compose -f docker-compose.public.yml up -d
```

### 步骤 3：验证部署

```bash
# 检查服务状态
docker-compose -f docker-compose.public.yml ps

# 测试访问
curl http://123.45.67.89:3000/health
curl http://123.45.67.89:3001/trpc/health
```

---

## 🌐 访问方式

部署成功后，可以通过以下方式访问：

| 服务 | 访问地址 | 说明 |
|------|---------|------|
| 前端 | `http://your-ip:3000` | Web 应用 |
| 后端 API | `http://your-ip:3001/trpc` | tRPC API |

**示例：**
- 前端：`http://123.45.67.89:3000`
- 后端：`http://123.45.67.89:3001/trpc`

---

## 🔐 安全配置

### 1. 配置防火墙

**Ubuntu/Debian (UFW):**
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw reload
```

**CentOS/RHEL (firewalld):**
```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

**云服务器安全组：**
- 在云服务商控制台配置安全组规则
- 开放入站端口：3000、3001

### 2. 使用域名（可选）

如果有域名，配置 DNS A 记录指向服务器 IP：

```
@ A 123.45.67.89
www A 123.45.67.89
```

然后修改 `.env`：
```bash
PUBLIC_IP=your-domain.com
```

### 3. 配置 SSL/HTTPS（推荐）

使用 Nginx 反向代理 + Let's Encrypt：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 证书会自动配置到 Nginx
```

访问地址将变为：
- `https://your-domain.com` （前端）
- `https://your-domain.com/trpc` （后端）

---

## 📊 端口说明

| 端口 | 服务 | 说明 | 必须开放 |
|------|------|------|---------|
| 3000 | 前端（Nginx） | Web 应用 | ✅ 是 |
| 3001 | 后端（NestJS） | API 服务 | ✅ 是 |
| 80 | HTTP（可选） | Nginx 反向代理 | ❌ 否 |
| 443 | HTTPS（可选） | Nginx SSL | ❌ 否 |

---

## 🔄 更新部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建并部署
docker-compose -f docker-compose.public.yml down
docker-compose -f docker-compose.public.yml build --no-cache
docker-compose -f docker-compose.public.yml up -d
```

---

## 💾 数据备份

```bash
# 备份数据库
docker-compose -f docker-compose.public.yml exec backend \
  cp /app/prisma/dev.db /tmp/backup.db

docker cp $(docker-compose -f docker-compose.public.yml ps -q backend):/tmp/backup.db \
  ./backups/starship-db-$(date +%Y%m%d).db
```

---

## 🐛 常见问题

### Q1: 无法通过公网 IP 访问？

**排查步骤：**

1. 检查服务是否运行
   ```bash
   docker-compose -f docker-compose.public.yml ps
   ```

2. 检查防火墙
   ```bash
   sudo ufw status
   ```

3. 检查云服务商安全组

4. 测试本地访问
   ```bash
   curl http://localhost:3000
   curl http://localhost:3001/trpc/health
   ```

### Q2: 前端无法连接后端？

**原因：** 环境变量 `VITE_API_URL` 配置错误

**解决：**
1. 检查 `.env` 文件中的 `PUBLIC_IP`
2. 重新构建前端镜像
   ```bash
   docker-compose -f docker-compose.public.yml build frontend
   docker-compose -f docker-compose.public.yml up -d frontend
   ```

### Q3: CORS 错误？

**原因：** 后端 CORS 配置缺少公网 IP

**解决：**
1. 检查 `docker-compose.public.yml` 中的 `CORS_ORIGINS`
2. 确保包含您的公网 IP

---

## 📝 配置文件说明

### docker-compose.public.yml

专门用于公网部署的配置文件，主要区别：

1. **环境变量使用公网 IP**
   ```yaml
   environment:
     - FRONTEND_URL=http://${PUBLIC_IP}:3000
     - VITE_API_URL=http://${PUBLIC_IP}:3001/trpc
   ```

2. **CORS 配置**
   ```yaml
   - CORS_ORIGINS=http://${PUBLIC_IP}:3000,http://localhost:3000
   ```

3. **端口绑定到 0.0.0.0**
   ```yaml
   ports:
     - "3000:3000"  # 绑定到所有网卡
   ```

---

## ✅ 部署检查清单

部署完成后，请逐项检查：

- [ ] ✅ 公网 IP 正确配置
- [ ] ✅ 防火墙已开放端口 3000 和 3001
- [ ] ✅ JWT_SECRET 已修改为随机值
- [ ] ✅ 所有容器正在运行
- [ ] ✅ 前端可以通过公网 IP 访问
- [ ] ✅ 后端 API 正常响应
- [ ] ✅ 数据库持久化卷已创建
- [ ] ✅ 日志输出正常
- [ ] ✅ 备份脚本已配置

---

## 🔗 相关链接

- **Docker 部署文档**: [README.md](./README.md)
- **快速开始**: [QUICKSTART.md](./QUICKSTART.md)
- **项目文档**: [../CLAUDE.md](../CLAUDE.md)

---

**最后更新**: 2025-12-24
**维护者**: Starship Commander Team
