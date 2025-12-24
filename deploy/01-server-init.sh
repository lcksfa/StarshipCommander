#!/bin/bash
# 服务器初始化脚本 / Server initialization script
# 使用方法 / Usage: sudo bash 01-server-init.sh

set -e

echo "🚀 开始服务器环境初始化..."

# 1. 更新系统 / Update system
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 18.x (通过 NodeSource 仓库)
echo "📦 安装 Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js 已安装: $(node -v)"
fi

# 3. 安装 pnpm
echo "📦 安装 pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
else
    echo "✅ pnpm 已安装: $(pnpm -v)"
fi

# 4. 安装 Nginx
echo "📦 安装 Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo ufw allow 'Nginx Full'
else
    echo "✅ Nginx 已安装"
fi

# 5. 安装 PM2
echo "📦 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    echo "✅ PM2 已安装: $(pm2 -v)"
fi

# 6. 创建应用目录
echo "📁 创建应用目录..."
sudo mkdir -p /var/www/starship-commander
sudo chown -R $USER:$USER /var/www/starship-commander

# 7. 配置防火墙
echo "🔒 配置防火墙..."
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ 服务器环境初始化完成！"
echo "📌 Node.js: $(node -v)"
echo "📌 npm: $(npm -v)"
echo "📌 pnpm: $(pnpm -v)"
echo "📌 PM2: $(pm2 -v)"
echo "📌 应用目录: /var/www/starship-commander"
