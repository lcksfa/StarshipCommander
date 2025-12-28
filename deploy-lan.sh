#!/bin/bash

# Starship Commander - 局域网部署脚本 / LAN Deployment Script
# Usage: ./deploy-lan.sh [LAN_IP]
# Example: ./deploy-lan.sh 192.168.1.100

set -e

# 颜色定义 / Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息 / Print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# 检查 Docker 是否安装 / Check if Docker is installed
check_docker() {
    print_header "检查 Docker / Checking Docker"

    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装 / Docker is not installed"
        print_info "请访问 https://docs.docker.com/get-docker/ 安装 Docker"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose 未安装 / Docker Compose is not installed"
        exit 1
    fi

    print_success "Docker 已安装 / Docker is installed"
}

# 获取局域网 IP / Get LAN IP
get_lan_ip() {
    print_header "获取局域网 IP / Getting LAN IP"

    # 如果提供了 IP 参数，使用它 / If IP is provided as argument, use it
    if [ -n "$1" ]; then
        LAN_IP="$1"
        print_success "使用指定的 IP / Using specified IP: $LAN_IP"
        return
    fi

    # 自动检测 IP / Auto-detect IP
    case "$(uname -s)" in
        Darwin*)    # macOS
            LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
            ;;
        Linux*)
            LAN_IP=$(hostname -I | awk '{print $1}')
            ;;
        MINGW*|MSYS*|CYGWIN*)  # Windows
            LAN_IP=$(ipconfig | findstr IPv4 | awk '{print $2}' | head -n 1)
            ;;
        *)
            print_error "不支持的操作系统 / Unsupported operating system"
            exit 1
            ;;
    esac

    if [ -z "$LAN_IP" ]; then
        print_error "无法自动检测局域网 IP / Failed to auto-detect LAN IP"
        print_info "请手动提供 IP: $0 <YOUR_LAN_IP>"
        exit 1
    fi

    print_success "检测到的局域网 IP / Detected LAN IP: $LAN_IP"
}

# 确认 IP 地址 / Confirm IP address
confirm_ip() {
    print_header "确认 IP 地址 / Confirm IP Address"

    print_warning "请确认以下信息 / Please confirm the following information:"
    echo "  局域网 IP / LAN IP: $LAN_IP"
    echo "  前端访问地址 / Frontend URL: http://$LAN_IP:3000"
    echo "  后端访问地址 / Backend URL: http://$LAN_IP:3001"
    echo ""

    read -p "确认继续? / Continue? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "已取消 / Cancelled"
        exit 0
    fi
}

# 停止并删除旧容器 / Stop and remove old containers
cleanup_old_containers() {
    print_header "清理旧容器 / Cleaning up old containers"

    print_info "停止并删除旧容器... / Stopping and removing old containers..."
    docker-compose down 2>/dev/null || true

    print_success "清理完成 / Cleanup completed"
}

# 构建并启动容器 / Build and start containers
deploy() {
    print_header "部署应用 / Deploying Application"

    print_info "设置环境变量... / Setting environment variables..."
    export LAN_IP="$LAN_IP"

    print_info "构建 Docker 镜像（这可能需要几分钟）... / Building Docker images (this may take a few minutes)..."
    docker-compose build --no-cache

    print_info "启动容器... / Starting containers..."
    docker-compose up -d

    print_success "容器已启动 / Containers started"
}

# 等待服务健康检查 / Wait for services to be healthy
wait_for_services() {
    print_header "等待服务启动 / Waiting for Services"

    print_info "等待后端服务启动... / Waiting for backend service..."
    for i in {1..30}; do
        if curl -s "http://localhost:3001/trpc/health" > /dev/null 2>&1; then
            print_success "后端服务已就绪 / Backend service is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_warning "后端服务启动超时，但容器仍在运行 / Backend startup timeout, but container is still running"
        fi
        sleep 2
    done

    print_info "等待前端服务启动... / Waiting for frontend service..."
    for i in {1..15}; do
        if curl -s "http://localhost:3000/health" > /dev/null 2>&1; then
            print_success "前端服务已就绪 / Frontend service is ready"
            break
        fi
        if [ $i -eq 15 ]; then
            print_warning "前端服务启动超时，但容器仍在运行 / Frontend startup timeout, but container is still running"
        fi
        sleep 2
    done
}

# 显示访问信息 / Show access information
show_access_info() {
    print_header "部署完成 / Deployment Completed"

    echo ""
    print_success "🎉 Starship Commander 已成功部署! / Successfully deployed!"
    echo ""
    echo "访问地址 / Access URLs:"
    echo "  🌐 前端 / Frontend:  http://$LAN_IP:3000"
    echo "  🔧 后端 / Backend:   http://$LAN_IP:3001"
    echo ""
    echo "常用命令 / Common Commands:"
    echo "  查看日志 / View logs:           docker-compose logs -f"
    echo "  查看状态 / View status:         docker-compose ps"
    echo "  停止服务 / Stop services:       docker-compose down"
    echo "  重启服务 / Restart services:     docker-compose restart"
    echo "  查看后端日志 / Backend logs:    docker-compose logs -f backend"
    echo "  查看前端日志 / Frontend logs:    docker-compose logs -f frontend"
    echo ""
}

# 主函数 / Main function
main() {
    print_header "🚀 Starship Commander - 局域网部署 / LAN Deployment"

    check_docker
    get_lan_ip "$1"
    confirm_ip
    cleanup_old_containers
    deploy
    wait_for_services
    show_access_info
}

# 运行主函数 / Run main function
main "$@"
