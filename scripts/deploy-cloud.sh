#!/bin/bash

# ==========================================
# Starship Commander 云服务器快速部署脚本
# Starship Commander Cloud Server Quick Deploy Script
# ==========================================
#
# 使用方法 / Usage:
#   chmod +x deploy-cloud.sh
#   ./deploy-cloud.sh
#
# 环境变量 / Environment Variables:
#   PUBLIC_IP    - 公网 IP / Public IP (必需 / Required)
#   DOMAIN       - 域名 / Domain (可选 / Optional)
#   JWT_SECRET   - JWT 密钥 / JWT Secret (可选，会自动生成 / Optional, will be auto-generated)
#   INIT_DB      - 是否初始化数据库 / Initialize database (true/false, default: false)
#
# 示例 / Examples:
#   PUBLIC_IP=123.45.67.89 ./deploy-cloud.sh
#   PUBLIC_IP=123.45.67.89 INIT_DB=true ./deploy-cloud.sh
#   DOMAIN=yourdomain.com PUBLIC_IP=123.45.67.89 ./deploy-cloud.sh

set -e  # 遇到错误立即退出 / Exit on error

# 颜色输出 / Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数 / Logging functions
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

# 检查依赖 / Check dependencies
check_dependencies() {
    log_info "检查依赖 / Checking dependencies..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装 / Docker is not installed"
        echo "请安装 Docker / Please install Docker:"
        echo "  curl -fsSL https://get.docker.com | sh"
        exit 1
    fi

    if ! command -v docker compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安装 / Docker Compose is not installed"
        exit 1
    fi

    log_success "依赖检查通过 / Dependencies check passed"
}

# 获取服务器信息 / Get server information
get_server_info() {
    log_info "获取服务器信息 / Getting server information..."

    # 如果没有设置 PUBLIC_IP，自动获取 / Auto-get PUBLIC_IP if not set
    if [ -z "$PUBLIC_IP" ]; then
        log_warning "PUBLIC_IP 环境变量未设置，尝试自动获取..."
        PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "")
        if [ -z "$PUBLIC_IP" ]; then
            log_error "无法自动获取公网 IP / Failed to auto-get public IP"
            echo "请手动设置 PUBLIC_IP 环境变量 / Please manually set PUBLIC_IP:"
            echo "  export PUBLIC_IP='your.server.ip'"
            exit 1
        fi
        log_info "自动获取到公网 IP: $PUBLIC_IP"
    fi

    # 如果没有设置 JWT_SECRET，自动生成 / Auto-generate JWT_SECRET if not set
    if [ -z "$JWT_SECRET" ]; then
        log_warning "JWT_SECRET 未设置，自动生成随机密钥..."
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-this-random-secret-$(date +%s)")
        log_success "JWT_SECRET 已生成"
    fi

    # 显示配置信息 / Display configuration
    echo ""
    echo "=========================================="
    echo "部署配置 / Deployment Configuration"
    echo "=========================================="
    echo "公网 IP / Public IP:      $PUBLIC_IP"
    [ -n "$DOMAIN" ] && echo "域名 / Domain:            $DOMAIN"
    echo "初始化数据库 / Init DB:     ${INIT_DB:-false}"
    echo "JWT Secret:               ${JWT_SECRET:0:10}... (已截断 / truncated)"
    echo "=========================================="
    echo ""
}

# 保存配置到 .env 文件 / Save config to .env file
save_env_config() {
    log_info "保存配置到 .env 文件 / Saving config to .env file..."

    cat > .env.deploy << EOF
# Starship Commander 部署配置 / Deployment Configuration
# 生成时间 / Generated at: $(date)

PUBLIC_IP=$PUBLIC_IP
DOMAIN=$DOMAIN
JWT_SECRET=$JWT_SECRET
EOF

    log_success "配置已保存到 .env.deploy"
}

# 确认部署 / Confirm deployment
confirm_deployment() {
    echo -e "${YELLOW}"
    read -p "是否继续部署? / Continue deployment? (y/n) " -n 1 -r
    echo -e "${NC}"
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "部署已取消 / Deployment cancelled"
        exit 0
    fi
}

# 部署服务 / Deploy services
deploy_services() {
    log_info "开始部署服务 / Starting deployment..."

    COMPOSE_FILE="docker-compose.cloud.yml"

    # 检查配置文件是否存在 / Check if config file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "找不到配置文件: $COMPOSE_FILE"
        exit 1
    fi

    # 设置环境变量 / Set environment variables
    export PUBLIC_IP
    export DOMAIN
    export JWT_SECRET

    # 检查 Docker 权限 / Check Docker permissions
    if ! docker ps &> /dev/null; then
        log_warning "检测到 Docker 权限问题 / Docker permission issue detected"
        log_info "将使用 sudo 运行 Docker 命令 / Will use sudo for Docker commands"

        # 使用 sudo 运行 docker compose / Use sudo for docker compose
        if [ "$INIT_DB" = "true" ]; then
            log_info "首次部署，包含数据库初始化 / First deployment with DB initialization..."
            sudo docker compose -f "$COMPOSE_FILE" --profile init up -d --build
        else
            log_info "部署服务（不含数据库初始化）/ Deploying services (without DB init)..."
            sudo docker compose -f "$COMPOSE_FILE" up -d --build
        fi
    else
        # 有权限，直接运行 / Has permission, run directly
        if [ "$INIT_DB" = "true" ]; then
            log_info "首次部署，包含数据库初始化 / First deployment with DB initialization..."
            docker compose -f "$COMPOSE_FILE" --profile init up -d --build
        else
            log_info "部署服务（不含数据库初始化）/ Deploying services (without DB init)..."
            docker compose -f "$COMPOSE_FILE" up -d --build
        fi
    fi

    log_success "服务已启动 / Services started"
}

# 等待服务健康 / Wait for services to be healthy
wait_for_health() {
    log_info "等待服务启动 / Waiting for services to start..."

    local max_attempts=30
    local attempt=1

    # 检查是否需要 sudo / Check if sudo is needed
    if docker ps &> /dev/null; then
        DOCKER_CMD="docker"
    else
        DOCKER_CMD="sudo docker"
        log_info "使用 sudo 运行 Docker 命令 / Using sudo for Docker commands"
    fi

    while [ $attempt -le $max_attempts ]; do
        if curl -sf http://localhost:3001/trpc/health > /dev/null 2>&1; then
            log_success "后端服务已就绪 / Backend is ready"
            break
        fi

        echo -n "."
        sleep 2
        ((attempt++))
    done

    if [ $attempt -gt $max_attempts ]; then
        log_error "后端服务启动超时 / Backend startup timeout"
        log_info "查看日志 / Check logs: $DOCKER_CMD compose -f docker-compose.cloud.yml logs"
        return 1
    fi

    # 检查前端 / Check frontend
    if curl -sf http://localhost:3000/ > /dev/null 2>&1; then
        log_success "前端服务已就绪 / Frontend is ready"
    else
        log_warning "前端服务可能还在启动中 / Frontend may still be starting"
    fi
}

# 显示部署结果 / Show deployment result
show_result() {
    # 确定是否需要 sudo / Determine if sudo is needed
    if docker ps &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="sudo docker compose"
    fi

    echo ""
    echo "=========================================="
    echo "🎉 部署完成！/ Deployment Complete!"
    echo "=========================================="
    echo ""
    echo "访问地址 / Access URLs:"
    echo "  前端 / Frontend:  http://$PUBLIC_IP:3000"
    echo "  后端 / Backend:   http://$PUBLIC_IP:3001"
    echo "  健康检查 / Health: http://$PUBLIC_IP:3001/trpc/health"
    [ -n "$DOMAIN" ] && echo ""
    [ -n "$DOMAIN" ] && echo "  域名访问 / Domain:   https://$DOMAIN"
    echo ""
    echo "常用命令 / Common Commands:"
    echo "  查看日志 / View logs:     $DOCKER_COMPOSE -f docker-compose.cloud.yml logs -f"
    echo "  查看状态 / Check status:  $DOCKER_COMPOSE -f docker-compose.cloud.yml ps"
    echo "  重启服务 / Restart:       $DOCKER_COMPOSE -f docker-compose.cloud.yml restart"
    echo "  停止服务 / Stop:          $DOCKER_COMPOSE -f docker-compose.cloud.yml down"
    echo ""
    echo "⚠️  重要提示 / Important Notes:"
    echo "  1. 请保存 JWT_SECRET: $JWT_SECRET"
    echo "  2. 建议配置 HTTPS（参考文档）/ Recommended to configure HTTPS (see docs)"
    echo "  3. 请配置防火墙规则 / Please configure firewall rules"
    echo "  4. 如遇到权限问题，使用 sudo / If permission issue, use sudo"
    echo ""
}

# 主函数 / Main function
main() {
    echo ""
    echo "🚀 Starship Commander 云服务器部署脚本"
    echo "   Cloud Server Deployment Script"
    echo ""

    check_dependencies
    get_server_info
    save_env_config
    confirm_deployment
    deploy_services

    echo ""
    log_info "等待服务就绪 / Waiting for services to be ready..."
    sleep 5
    wait_for_health

    show_result

    log_success "所有步骤完成！/ All steps completed!"
}

# 运行主函数 / Run main function
main "$@"
