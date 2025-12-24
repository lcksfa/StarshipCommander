# 🚀 Docker 快速开始

> **3 分钟部署 Starship Commander**

---

## ⚡ 超快速部署（Linux/macOS）

```bash
# 1. 安装 Docker（如果未安装）
curl -fsSL https://get.docker.com | sh

# 2. 克隆并部署
git clone https://github.com/your-username/StarshipCommander.git
cd StarshipCommander
bash docker/deploy.sh init

# 3. 打开浏览器
open http://localhost:3000
```

**完成！** 🎉

---

## 📋 Windows 快速部署

```powershell
# 1. 下载并安装 Docker Desktop
# https://www.docker.com/products/docker-desktop

# 2. 克隆并部署
git clone https://github.com/your-username/StarshipCommander.git
cd StarshipCommander
docker\deploy.bat init

# 3. 打开浏览器访问
# http://localhost:3000
```

---

## 🎯 常用命令速查

```bash
# 查看状态
bash docker/deploy.sh status

# 查看日志
bash docker/deploy.sh logs

# 重启服务
bash docker/deploy.sh restart

# 停止服务
bash docker/deploy.sh stop

# 备份数据库
bash docker/deploy.sh backup
```

---

## 🔧 遇到问题？

查看详细文档：[README.md](./README.md)

---

**就这么简单！** 🐳
