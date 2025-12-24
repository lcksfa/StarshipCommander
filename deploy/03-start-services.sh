#!/bin/bash
# 启动服务脚本 / Start services script
# 使用方法 / Usage: bash 03-start-services.sh

set -e

APP_DIR="/var/www/starship-commander"

echo "🚀 启动 Starship Commander 服务..."

cd $APP_DIR

# 创建日志目录
mkdir -p logs

# 停止旧服务（如果存在）
if pm2 list | grep -q "starship"; then
    echo "🛑 停止旧服务..."
    pm2 stop ecosystem.config.js
    pm2 delete ecosystem.config.js
fi

# 启动新服务
echo "🔄 启动服务..."
pm2 start ecosystem.config.js

# 保存 PM2 进程列表
pm2 save

# 设置开机自启
echo "⚙️  配置开机自启..."
pm2 startup | tail -n 1 | sudo bash

# 显示服务状态
echo ""
echo "✅ 服务启动成功！"
echo ""
pm2 list

echo ""
echo "📊 实时日志："
echo "   pm2 logs starship-backend"
echo "   pm2 logs starship-frontend"
echo ""
echo "🔄 重启服务："
echo "   pm2 restart all"
echo ""
echo "📈 监控面板："
echo "   pm2 monit"
