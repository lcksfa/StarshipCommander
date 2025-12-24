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

# 4. 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
pnpm prisma:generate

# 5. 推送数据库 schema（开发环境用 prisma:push，生产环境建议用 migrate）
echo "💾 初始化数据库..."
pnpm prisma:push

# 6. 运行种子数据（可选）
echo "🌱 运行种子数据..."
pnpm prisma:seed

# 7. 构建前端
echo "🔨 构建前端应用..."
pnpm build

# 8. 构建后端
echo "🔨 构建后端应用..."
pnpm build:backend

echo "✅ 构建完成！"
echo "📌 前端构建输出: dist/"
echo "📌 后端构建输出: dist/backend/"

# 9. 提示启动服务
echo ""
echo "🎯 下一步：运行启动脚本"
echo "   bash 03-start-services.sh"
