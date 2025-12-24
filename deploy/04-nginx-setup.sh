#!/bin/bash
# Nginx 配置安装脚本 / Nginx configuration setup
# 使用方法 / Usage: sudo bash 04-nginx-setup.sh your-domain.com

set -e

DOMAIN=${1:-"localhost"}

echo "🌐 配置 Nginx 反向代理..."
echo "📌 域名: $DOMAIN"

# 1. 复制配置文件（替换域名）
sed "s/your-domain.com/$DOMAIN/g" nginx-starship-commander.conf > /tmp/starship-commander.conf

# 2. 安装配置文件
sudo cp /tmp/starship-commander.conf /etc/nginx/sites-available/starship-commander

# 3. 启用站点
sudo ln -sf /etc/nginx/sites-available/starship-commander /etc/nginx/sites-enabled/

# 4. 删除默认站点（可选）
# sudo rm -f /etc/nginx/sites-enabled/default

# 5. 测试 Nginx 配置
echo "🧪 测试 Nginx 配置..."
sudo nginx -t

# 6. 重启 Nginx
echo "🔄 重启 Nginx..."
sudo systemctl restart nginx

# 7. 设置 Nginx 开机自启
sudo systemctl enable nginx

echo "✅ Nginx 配置完成！"
echo "📌 配置文件: /etc/nginx/sites-available/starship-commander"
echo "📌 访问地址: http://$DOMAIN"
