#!/bin/bash
# 快速更新脚本 / Quick update script
# 使用方法 / Usage: bash 06-update.sh

set -e

APP_DIR="/var/www/starship-commander"

echo "🔄 开始更新 Starship Commander..."

cd $APP_DIR

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 2. 安装依赖
echo "📦 安装依赖..."
pnpm install

# 3. 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
pnpm prisma:generate

# 4. 推送数据库 schema（如果需要）
# pnpm prisma:push

# 5. 构建应用
echo "🔨 构建应用..."
pnpm build:all

# 6. 重启服务
echo "🔄 重启服务..."
pm2 restart ecosystem.config.js --update-env

echo "✅ 更新完成！"
echo "📊 服务状态："
pm2 list
