#!/bin/bash
# Starship Commander 部署脚本 / Deployment script
# 使用方法 / Usage: bash 02-deploy.sh

set -e

# 配置变量 / Configuration
APP_DIR="/var/www/starship-commander"
REPO_URL="your-git-repo-url"  # 替换为您的 Git 仓库地址
BRANCH="main"

echo "🚀 开始部署 Starship Commander..."

# 1. 进入应用目录
cd $APP_DIR

# 2. 克隆或更新代码
if [ -d ".git" ]; then
    echo "📥 拉取最新代码..."
    git pull origin $BRANCH
else
    echo "⚠️  Git 仓库不存在，跳过代码更新"
    echo "💡 提示：首次部署请先克隆代码到 /var/www/starship-commander"
    # git clone -b $BRANCH $REPO_URL .
fi

# 3. 安装依赖
echo "📦 安装项目依赖..."
pnpm install

# 4. 创建 Prisma 目录
echo "📁 创建 Prisma 目录..."
mkdir -p prisma

# 5. 如果有生产环境配置，复制为 .env
if [ -f ".env.production" ]; then
    echo "⚙️  配置生产环境变量..."
    # 备份现有 .env
    if [ -f ".env" ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    fi
    # 复制生产环境配置
    cp .env.production .env
    echo "⚠️  请检查并修改 .env 中的敏感配置（如 JWT_SECRET）"
fi

# 6. 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
pnpm prisma:generate

# 7. 初始化数据库（如果数据库不存在）
if [ ! -f "prisma/dev.db" ]; then
    echo "💾 初始化数据库..."
    pnpm prisma:push

    # 8. 运行种子数据（仅首次部署）
    echo "🌱 运行种子数据..."
    pnpm prisma:seed
else
    echo "✅ 数据库已存在，跳过初始化"
fi

# 9. 构建前端
echo "🔨 构建前端应用..."
pnpm build

# 10. 构建后端
echo "🔨 构建后端应用..."
pnpm build:backend

echo "✅ 构建完成！"
echo "📌 前端构建输出: dist/"
echo "📌 后端构建输出: src/backend/dist/backend/"
echo ""

# 11. 检查构建输出
if [ ! -f "dist/index.html" ]; then
    echo "❌ 前端构建失败：dist/index.html 不存在"
    exit 1
fi

if [ ! -f "src/backend/dist/backend/main.js" ]; then
    echo "❌ 后端构建失败：src/backend/dist/backend/main.js 不存在"
    exit 1
fi

echo "✅ 构建验证通过！"
echo ""
echo "🎯 下一步：运行启动脚本"
echo "   bash 03-start-services.sh"
