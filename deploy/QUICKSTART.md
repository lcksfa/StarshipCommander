# 部署文件说明

## 📁 文件结构

```
deploy/
├── 01-server-init.sh           # 服务器环境初始化脚本
├── 02-deploy.sh                 # 应用部署脚本
├── 03-start-services.sh         # PM2 服务启动脚本
├── 04-nginx-setup.sh            # Nginx 配置脚本
├── 05-ssl-setup.sh              # SSL 证书配置脚本（可选）
├── 06-update.sh                 # 快速更新脚本
├── health-check.sh              # 健康检查脚本
├── ecosystem.config.js          # PM2 进程配置文件
├── nginx-starship-commander.conf # Nginx 配置文件
├── .env.example                 # 环境变量模板
├── README.md                    # 完整部署文档
└── QUICKSTART.md               # 本文件 - 快速开始指南
```

## 🚀 快速开始（3 步部署）

### 前置条件

1. ✅ 准备一台 Linux 服务器（Ubuntu 20.04+ 推荐）
2. ✅ 将代码推送到 GitHub/GitLab 仓库
3. ✅ 获取服务器 root 权限或 sudo 权限

### 步骤 1：准备 Git 仓库

```bash
# 在项目根目录提交所有代码
git add .
git commit -m "chore: 添加部署配置文件"
git push origin main
```

### 步骤 2：登录服务器并初始化环境

```bash
# SSH 登录服务器
ssh user@your-server-ip

# 下载部署脚本
git clone https://github.com/your-username/StarshipCommander.git temp-repo

# 运行服务器初始化脚本
cd temp-repo/deploy
sudo bash 01-server-init.sh

# 清理临时文件
cd ~
rm -rf temp-repo
```

### 步骤 3：部署应用

```bash
# 克隆代码到应用目录
cd /var/www
sudo git clone https://github.com/your-username/StarshipCommander.git starship-commander
sudo chown -R $USER:$USER starship-commander
cd starship-commander/deploy

# 部署应用
bash 02-deploy.sh

# 启动服务
bash 03-start-services.sh

# 配置 Nginx（替换为您的域名或 IP）
sudo bash 04-nginx-setup.sh your-domain.com

# （可选）配置 SSL 证书
sudo bash 05-ssl-setup.sh your@email.com your-domain.com
```

## 🎉 完成！

现在您可以通过浏览器访问：`http://your-domain.com`

## 📞 需要帮助？

查看详细文档：[README.md](./README.md)

---

## ⚡ 一键部署命令（高级用户）

如果您熟悉 Linux 命令行，可以一次性执行所有操作：

```bash
# 复制以下命令到服务器终端
cd /var/www && \
sudo git clone https://github.com/your-username/StarshipCommander.git starship-commander && \
sudo chown -R $USER:$USER starship-commander && \
cd starship-commander/deploy && \
bash 02-deploy.sh && \
bash 03-start-services.sh && \
sudo bash 04-nginx-setup.sh your-domain.com && \
echo "🎉 部署完成！访问 http://your-domain.com"
```
