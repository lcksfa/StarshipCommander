#!/bin/bash

# ==========================================
# Starship Commander 服务器上传脚本
# Starship Commander Server Upload Script
# ==========================================
#
# 使用方法 / Usage:
#   chmod +x rsync-deploy.sh
#   ./rsync-deploy.sh user@server /remote/path
#
# 示例 / Examples:
#   ./rsync-deploy.sh root@123.45.67.89 /opt/starship-commander
#   ./rsync-deploy.sh ubuntu@myserver.com ~/apps/starship

set -e  # 遇到错误立即退出 / Exit on error

# 颜色输出 / Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查参数 / Check parameters
if [ $# -lt 2 ]; then
    log_error "用法: $0 <user@server> <remote-path>"
    echo ""
    echo "示例 / Examples:"
    echo "  $0 root@123.45.67.89 /opt/starship-commander"
    echo "  $0 ubuntu@myserver.com ~/apps/starship"
    exit 1
fi

SERVER=$1
REMOTE_PATH=$2

# 本地项目目录（脚本所在目录的父目录）/ Local project directory
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# 只获取项目目录名（例如：StarshipCommander）/ Only get project directory name
PROJECT_NAME="$(basename "$LOCAL_DIR")"

log_info "本地项目目录 / Local directory: $LOCAL_DIR"
log_info "项目名称 / Project name: $PROJECT_NAME"
log_info "远程服务器 / Remote server: $SERVER:$REMOTE_PATH"
echo ""

# 确认上传 / Confirm upload
echo -e "${YELLOW}"
read -p "确认上传项目到服务器? / Confirm upload project to server? (y/n) " -n 1 -r
echo -e "${NC}"
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "已取消 / Cancelled"
    exit 0
fi

echo ""
log_info "开始上传 / Starting upload..."

# 显示调试信息 / Show debug info
log_info "执行命令 / Executing command:"
echo "  rsync 源 / rsync source: $LOCAL_DIR/"
echo "  rsync 目标 / rsync destination: $SERVER:$REMOTE_PATH/"
echo ""

# 执行 rsync / Execute rsync
# 注意：LOCAL_DIR 后面的 "/" 很重要，它表示只上传目录内容
# Note: The "/" after LOCAL_DIR is important, it means upload directory contents only
rsync -avz --progress --no-relative \
    --exclude 'node_modules/' \
    --exclude '.git/' \
    --exclude '.gitignore' \
    --exclude 'dist/' \
    --exclude 'build/' \
    --exclude 'coverage/' \
    --exclude '.coverage/' \
    --exclude '*.log' \
    --exclude '.env.local' \
    --exclude '.env.development.local' \
    --exclude '.env.test.local' \
    --exclude '.env.production.local' \
    --exclude '.DS_Store' \
    --exclude '.DS_Store?' \
    --exclude '._*' \
    --exclude '.Spotlight-V100' \
    --exclude '.Trashes' \
    --exclude 'Thumbs.db' \
    --exclude 'desktop.ini' \
    --exclude '.vscode/' \
    --exclude '.idea/' \
    --exclude '*.swp' \
    --exclude '*.swo' \
    --exclude '*~' \
    --exclude '.playwright-mcp/' \
    --exclude 'playwright-report/' \
    --exclude 'test-results/' \
    --exclude 'android/' \
    --exclude 'ios/' \
    --exclude '.capacitor/' \
    --exclude '*.bak' \
    --exclude '*.backup' \
    --exclude '*.old' \
    --exclude 'tmp/' \
    --exclude 'temp/' \
    --exclude '.cache/' \
    --exclude '.parcel-cache/' \
    --exclude '.next/' \
    --exclude '.nuxt/' \
    --exclude '.serverless/' \
    --exclude '.fuse-build/' \
    --exclude '.dockerignore' \
    --exclude 'logs/' \
    --exclude '*.pid' \
    --exclude '*.seed' \
    --exclude '.eslintcache' \
    --exclude '*.tgz' \
    --exclude '.local/' \
    --exclude 'secrets.json' \
    --exclude 'api-keys.json' \
    --exclude '.python-version' \
    --exclude '.pytest_cache/' \
    --exclude '.mypy_cache/' \
    --exclude '.dmypy.json' \
    --exclude 'dmypy.json' \
    --exclude '.pyre/' \
    --exclude '.bmad-core/' \
    --exclude '.ai/' \
    --exclude 'docs/build/' \
    --exclude 'storybook-static/' \
    --exclude '.terraform/' \
    --exclude '*.tfstate' \
    --exclude '*.tfstate.*' \
    --exclude 'heroku/' \
    --exclude '.dockerignore' \
    --exclude 'backups/' \
    --exclude '*.db' \
    --exclude '*.sqlite' \
    --exclude '*.sqlite3' \
    --exclude 'prisma/*.db' \
    --exclude 'prisma/*.db-journal' \
    --exclude 'prisma/migrations/' \
    --exclude '.env.deploy' \
    "$LOCAL_DIR/" \
    "$SERVER:$REMOTE_PATH/"

echo ""
if [ $? -eq 0 ]; then
    log_success "上传完成！/ Upload complete!"
    echo ""
    echo "下一步 / Next steps:"
    echo "  1. SSH 登录服务器 / SSH to server:"
    echo "     ssh $SERVER"
    echo ""
    echo "  2. 进入项目目录 / Enter project directory:"
    echo "     cd $REMOTE_PATH"
    echo ""
    echo "  3. 运行部署脚本 / Run deploy script:"
    echo "     export PUBLIC_IP=\"$(echo $SERVER | cut -d@ -f2)\""
    echo "     ./scripts/deploy-cloud.sh"
else
    log_error "上传失败 / Upload failed"
    exit 1
fi
