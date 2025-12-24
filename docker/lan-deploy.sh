#!/bin/bash

# 局域网部署脚本 / LAN Deployment Script
# 自动检测本机 IP 并配置 Docker Compose

set -e

# 颜色定义 / Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Starship Commander 局域网部署脚本${NC}"
echo "========================================"

# 检测操作系统并获取 IP 地址 / Detect OS and get IP address
detect_lan_ip() {
    case "$(uname -s)" in
        Linux*)
            # Linux
            IP=$(hostname -I 2>/dev/null | awk '{print $1}')
            if [ -z "$IP" ]; then
                IP=$(ip route get 1 2>/dev/null | awk '{print $7}' | head -1)
            fi
            ;;
        Darwin*)
            # macOS
            IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
            ;;
        MINGW*|MSYS*|CYGWIN*)
            # Windows (Git Bash)
            IP=$(ipconfig 2>/dev/null | grep -A 4 "无线局域网适配器\|Ethernet adapter" | grep "IPv4" | awk '{print $14}' | head -1)
            ;;
        *)
            echo -e "${RED}❌ 不支持的操作系统: $(uname -s)${NC}"
            exit 1
            ;;
    esac

    # 验证 IP 地址格式 / Validate IP format
    if [[ -z "$IP" ]] || ! [[ "$IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
        echo -e "${RED}❌ 无法自动检测 IP 地址${NC}"
        echo -e "${YELLOW}请手动输入你的局域网 IP 地址（例如：192.168.1.100）:${NC}"
        read -p "LAN IP: " IP
        if [[ ! "$IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
            echo -e "${RED}❌ 无效的 IP 地址格式${NC}"
            exit 1
        fi
    fi
}

# 检查 IP 是否可访问 / Check if IP is accessible
check_ip() {
    local ip=$1
    echo -e "${BLUE}📡 检测到的局域网 IP: ${GREEN}${ip}${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  请确认:${NC}"
    echo "  1. 这是你本机的局域网 IP 地址"
    echo "  2. 你的设备连接在同一局域网内"
    echo "  3. 防火墙允许端口 3000 和 3001 的访问"
    echo ""
    read -p "IP 地址正确吗？/ Is this IP correct? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
        echo -e "${YELLOW}请手动输入正确的 IP 地址:${NC}"
        read -p "LAN IP: " IP
        check_ip "$IP"
    fi
}

# 停止现有服务 / Stop existing services
stop_services() {
    echo -e "${BLUE}🛑 停止现有服务...${NC}"
    docker-compose down 2>/dev/null || docker-compose -f docker-compose.lan.yml down 2>/dev/null || true
}

# 启动服务 / Start services
start_services() {
    local ip=$1
    echo -e "${BLUE}🚀 启动局域网服务...${NC}"

    # 使用局域网配置启动 / Start with LAN config
    LAN_IP=$ip docker-compose -f docker-compose.lan.yml up -d

    # 等待服务启动 / Wait for services to start
    echo -e "${BLUE}⏳ 等待服务启动...${NC}"
    sleep 5

    # 检查服务状态 / Check service status
    if docker-compose -f docker-compose.lan.yml ps | grep -q "Up"; then
        echo -e "${GREEN}✅ 服务启动成功！${NC}"
        echo ""
        echo -e "${GREEN}📱 访问信息 / Access Information:${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "  前端 / Frontend:  ${BLUE}http://${ip}:3000${NC}"
        echo -e "  后端 / Backend:   ${BLUE}http://${ip}:3001${NC}"
        echo -e "  API 文档 / API:    ${BLUE}http://${ip}:3001/api/docs${NC}"
        echo -e "  健康检查 / Health: ${BLUE}http://${ip}:3001/trpc/health${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo -e "${YELLOW}📋 局域网内其他设备可以通过以下地址访问:${NC}"
        echo -e "  ${GREEN}http://${ip}:3000${NC}"
        echo ""
        echo -e "${YELLOW}💡 提示 / Tips:${NC}"
        echo "  1. 确保设备在同一局域网内"
        echo "  2. 检查防火墙设置"
        echo "  3. 查看日志: docker-compose -f docker-compose.lan.yml logs -f"
        echo "  4. 停止服务: docker-compose -f docker-compose.lan.yml down"
    else
        echo -e "${RED}❌ 服务启动失败${NC}"
        echo "请查看日志: docker-compose -f docker-compose.lan.yml logs"
        exit 1
    fi
}

# 主函数 / Main function
main() {
    detect_lan_ip
    check_ip "$IP"

    echo ""
    read -p "是否继续部署？/ Continue deployment? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        stop_services
        start_services "$IP"
    else
        echo -e "${YELLOW}⚠️  部署已取消${NC}"
        exit 0
    fi
}

# 运行主函数 / Run main function
main
