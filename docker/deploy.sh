#!/bin/bash
# Docker 部署脚本 / Docker Deployment Script
# 使用方法 / Usage: bash docker/deploy.sh [init|start|stop|restart|logs|status|clean]

set -e

# 颜色定义 / Color Definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目名称
PROJECT_NAME="starship-commander"

# 帮助信息 / Help Information
show_help() {
    echo "🐳 Starship Commander Docker 部署脚本"
    echo ""
    echo "使用方法 / Usage:"
    echo "  bash docker/deploy.sh [命令]"
    echo ""
    echo "可用命令 / Available Commands:"
    echo "  init       初始化并启动所有服务（首次部署）/ Initialize and start all services (first deployment)"
    echo "  start      启动所有服务 / Start all services"
    echo "  stop       停止所有服务 / Stop all services"
    echo "  restart    重启所有服务 / Restart all services"
    echo "  logs       查看日志 / View logs"
    echo "  status     查看服务状态 / View service status"
    echo "  clean      清理容器和卷 / Clean containers and volumes"
    echo "  rebuild    重新构建镜像 / Rebuild images"
    echo "  backup     备份数据库 / Backup database"
    echo "  restore    恢复数据库 / Restore database"
    echo ""
    echo "示例 / Examples:"
    echo "  bash docker/deploy.sh init      # 首次部署 / First deployment"
    echo "  bash docker/deploy.sh logs      # 查看日志 / View logs"
    echo "  bash docker/deploy.sh status    # 查看状态 / View status"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
        echo "安装指南 / Installation Guide: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose 未安装，请先安装 Docker Compose${NC}"
        echo "安装指南 / Installation Guide: https://docs.docker.com/compose/install/"
        exit 1
    fi
}

# 生成随机 JWT 密钥
generate_jwt_secret() {
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-this-to-random-string-$(date +%s)")
        export JWT_SECRET
        echo -e "${YELLOW}⚠️  已生成随机 JWT_SECRET: $JWT_SECRET${NC}"
        echo -e "${YELLOW}⚠️  请保存此密钥，重启服务时需要使用${NC}"
    fi
}

# 初始化环境变量
init_env() {
    if [ ! -f ".env" ]; then
        echo -e "${BLUE}📝 创建环境变量文件...${NC}"
        cat > .env << EOF
# Docker 生产环境配置 / Docker Production Configuration
NODE_ENV=production
VITE_API_URL=http://localhost:3001/trpc
JWT_SECRET=${JWT_SECRET:-change-this-to-random-string}
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
EOF
        echo -e "${GREEN}✅ 环境变量文件已创建${NC}"
    fi
}

# 初始化服务
init_services() {
    echo -e "${BLUE}🚀 初始化 Starship Commander 服务...${NC}"

    generate_jwt_secret
    init_env

    echo -e "${BLUE}📦 构建 Docker 镜像...${NC}"
    docker-compose build

    echo -e "${BLUE}🔧 初始化数据库...${NC}"
    docker-compose --profile init up db-init --abort-on-container-exit

    echo -e "${BLUE}🚀 启动服务...${NC}"
    docker-compose up -d

    echo -e "${GREEN}✅ 服务启动成功！${NC}"
    echo ""
    echo -e "${BLUE}📊 服务状态：${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}🌐 访问地址：${NC}"
    echo -e "  前端 / Frontend: ${GREEN}http://localhost:3000${NC}"
    echo -e "  后端 / Backend:  ${GREEN}http://localhost:3001${NC}"
    echo ""
    echo -e "${BLUE}📝 查看日志：${NC}"
    echo -e "  bash docker/deploy.sh logs"
}

# 启动服务
start_services() {
    echo -e "${BLUE}🚀 启动服务...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ 服务启动成功！${NC}"
    docker-compose ps
}

# 停止服务
stop_services() {
    echo -e "${BLUE}🛑 停止服务...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ 服务已停止${NC}"
}

# 重启服务
restart_services() {
    echo -e "${BLUE}🔄 重启服务...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ 服务已重启${NC}"
    docker-compose ps
}

# 查看日志
view_logs() {
    echo -e "${BLUE}📋 查看日志（Ctrl+C 退出）...${NC}"
    docker-compose logs -f
}

# 查看服务状态
show_status() {
    echo -e "${BLUE}📊 服务状态：${NC}"
    echo ""
    docker-compose ps
    echo ""

    # 检查健康状态
    echo -e "${BLUE}🏥 健康检查：${NC}"
    echo ""

    # 前端健康检查
    if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "  前端 / Frontend: ${GREEN}✅ 健康${NC}"
    else
        echo -e "  前端 / Frontend: ${RED}❌ 异常${NC}"
    fi

    # 后端健康检查
    if curl -sf http://localhost:3001/trpc/health > /dev/null 2>&1; then
        echo -e "  后端 / Backend:  ${GREEN}✅ 健康${NC}"
    else
        echo -e "  后端 / Backend:  ${RED}❌ 异常${NC}"
    fi
    echo ""
}

# 清理容器和卷
clean_all() {
    echo -e "${YELLOW}⚠️  警告：这将删除所有容器、镜像和卷！${NC}"
    read -p "确认继续？ / Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🧹 清理容器和卷...${NC}"
        docker-compose down -v --rmi all
        echo -e "${GREEN}✅ 清理完成${NC}"
    else
        echo -e "${YELLOW}❌ 已取消${NC}"
    fi
}

# 重新构建镜像
rebuild_images() {
    echo -e "${BLUE}🔨 重新构建镜像...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✅ 重新构建完成${NC}"
    echo -e "${BLUE}🔄 重启服务...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ 服务已重启${NC}"
}

# 备份数据库
backup_database() {
    echo -e "${BLUE}💾 备份数据库...${NC}"
    BACKUP_DIR="backups"
    mkdir -p $BACKUP_DIR

    BACKUP_FILE="$BACKUP_DIR/starship-db-$(date +%Y%m%d_%H%M%S).db"

    docker-compose exec -T backend \
      cp /app/prisma/dev.db /tmp/backup.db

    docker cp $(docker-compose ps -q backend):/tmp/backup.db $BACKUP_FILE

    echo -e "${GREEN}✅ 数据库已备份到: $BACKUP_FILE${NC}"
}

# 恢复数据库
restore_database() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ 请指定备份文件路径${NC}"
        echo "使用方法 / Usage: bash docker/deploy.sh restore <backup-file>"
        exit 1
    fi

    echo -e "${BLUE}🔄 恢复数据库...${NC}"
    echo -e "${YELLOW}⚠️  警告：这将覆盖当前数据库！${NC}"
    read -p "确认继续？ / Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker cp $1 $(docker-compose ps -q backend):/tmp/restore.db
        docker-compose exec -T backend \
          cp /tmp/restore.db /app/prisma/dev.db
        docker-compose restart backend
        echo -e "${GREEN}✅ 数据库已恢复，服务已重启${NC}"
    else
        echo -e "${YELLOW}❌ 已取消${NC}"
    fi
}

# 主函数
main() {
    check_docker

    case "${1:-help}" in
        init)
            init_services
            ;;
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            view_logs
            ;;
        status)
            show_status
            ;;
        clean)
            clean_all
            ;;
        rebuild)
            rebuild_images
            ;;
        backup)
            backup_database
            ;;
        restore)
            restore_database $2
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}❌ 未知命令: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
