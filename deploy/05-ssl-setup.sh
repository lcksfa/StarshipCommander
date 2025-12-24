#!/bin/bash
# SSL 证书安装脚本（使用 Let's Encrypt）/ SSL certificate setup using Let's Encrypt
# 使用方法 / Usage: sudo bash 05-ssl-setup.sh your-email@domain.com your-domain.com

set -e

EMAIL=${1:-"admin@your-domain.com"}
DOMAIN=${2:-"your-domain.com"}

echo "🔒 配置 SSL 证书..."
echo "📌 邮箱: $EMAIL"
echo "📌 域名: $DOMAIN"

# 1. 安装 Certbot
echo "📦 安装 Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot 已安装"
fi

# 2. 获取 SSL 证书
echo "🔑 获取 SSL 证书..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# 3. 设置自动续期
echo "⏰ 配置证书自动续期..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 4. 测试续期
echo "🧪 测试证书续期..."
sudo certbot renew --dry-run

echo "✅ SSL 证书配置完成！"
echo "📌 证书位置: /etc/letsencrypt/live/$DOMAIN/"
echo "📌 自动续期已启用"
echo "🌐 访问地址: https://$DOMAIN"
