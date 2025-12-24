#!/bin/bash
# 公网部署配置脚本 / Public Network Deployment Configuration Script
# 使用方法 / Usage: bash docker/public-deploy.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Starship Commander 公网部署配置向导${NC}"
echo "=========================================="
echo ""

# 获取公网 IP
get_public_ip() {
    echo -e "${BLUE}正在检测您的公网 IP...${NC}"

    # 尝试多种方式获取公网 IP
    PUBLIC_IP=$(curl -s https://api.ipify.org 2>/dev/null || \
                curl -s https://ipecho.net/plain 2>/dev/null || \
                curl -s https://icanhazip.com 2>/dev/null || \
                hostname -I | awk '{print $1}')

    if [ -z "$PUBLIC_IP" ]; then
        echo -e "${RED}❌ 无法自动检测公网 IP${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ 检测到公网 IP: ${PUBLIC_IP}${NC}"
    return 0
}

# 配置公网 IP
configure_public_ip() {
    echo ""
    echo -e "${YELLOW}请输入您的公网 IP 或域名${NC}"

    if get_public_ip; then
        read -p "是否使用检测到的 IP [$PUBLIC_IP]? (Y/n): " use_detected
        if [[ ! $use_detected =~ ^[Nn]$ ]]; then
            echo $PUBLIC_IP
            return 0
        fi
    fi

    read -p "请输入公网 IP 或域名: " input_ip
    echo $input_ip
}

# 生成 JWT 密钥
generate_jwt_secret() {
    openssl rand -base64 32 2>/dev/null || echo "change-this-to-random-string-$(date +%s)"
}

# 创建环境变量文件
create_env_file() {
    cat > .env << EOF
# 公网部署配置 / Public Network Deployment Configuration
PUBLIC_IP=$1

# JWT 配置 / JWT Configuration
JWT_SECRET=$2
JWT_EXPIRES_IN=7d

# 服务配置 / Service Configuration
NODE_ENV=production
LOG_LEVEL=info
EOF

    echo -e "${GREEN}✅ 环境变量文件已创建: .env${NC}"
}

# 配置防火墙
configure_firewall() {
    echo ""
    echo -e "${BLUE}🔒 配置防火墙...${NC}"

    if command -v ufw &> /dev/null; then
        echo "检测到 UFW 防火墙"
        sudo ufw allow 3000/tcp comment 'Starship Frontend'
        sudo ufw allow 3001/tcp comment 'Starship Backend'
        echo -e "${GREEN}✅ UFW 防火墙规则已添加${NC}"
    elif command -v firewall-cmd &> /dev/null; then
        echo "检测到 firewalld 防火墙"
        sudo firewall-cmd --permanent --add-port=3000/tcp
        sudo firewall-cmd --permanent --add-port=3001/tcp
        sudo firewall-cmd --reload
        echo -e "${GREEN}✅ firewalld 防火墙规则已添加${NC}"
    else
        echo -e "${YELLOW}⚠️  未检测到防火墙，请手动开放端口 3000 和 3001${NC}"
    fi
}

# 部署应用
deploy_application() {
    echo ""
    echo -e "${BLUE}🚀 开始部署应用...${NC}"

    # 使用公网配置文件启动
    export PUBLIC_IP=$1
    export JWT_SECRET=$2

    echo -e "${BLUE}📦 构建 Docker 镜像...${NC}"
    docker-compose -f docker-compose.public.yml build

    echo -e "${BLUE}🔧 初始化数据库...${NC}"
    docker-compose -f docker-compose.public.yml --profile init run --rm db-init

    echo -e "${BLUE}🚀 启动服务...${NC}"
    docker-compose -f docker-compose.public.yml up -d

    echo -e "${GREEN}✅ 部署完成！${NC}"
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 部署成功！${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}📊 访问地址：${NC}"
    echo -e "  前端 / Frontend: ${GREEN}http://$1:3000${NC}"
    echo -e "  后端 / Backend:  ${GREEN}http://$1:3001/trpc${NC}"
    echo ""
    echo -e "${BLUE}🔍 测试访问：${NC}"
    echo -e "  前端健康检查: curl http://$1:3000/health"
    echo -e "  后端健康检查: curl http://$1:3001/trpc/health"
    echo ""
    echo -e "${BLUE}📝 管理命令：${NC}"
    echo -e "  查看日志: docker-compose -f docker-compose.public.yml logs -f"
    echo -e "  查看状态: docker-compose -f docker-compose.public.yml ps"
    echo -e "  停止服务: docker-compose -f docker-compose.public.yml down"
    echo ""
    echo -e "${YELLOW}⚠️  重要提示：${NC}"
    echo -e "  1. 请确保防火墙已开放端口 3000 和 3001"
    echo -e "  2. 请妥善保管 .env 文件中的 JWT_SECRET"
    echo -e "  3. 建议定期备份数据库: docker-compose -f docker-compose.public.yml exec backend cp /app/prisma/dev.db /tmp/backup.db"
    echo ""
}

# 主流程
main() {
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
        exit 1
    fi

    # 配置公网 IP
    PUBLIC_IP=$(configure_public_ip)

    if [ -z "$PUBLIC_IP" ]; then
        echo -e "${RED}❌ 公网 IP 不能为空${NC}"
        exit 1
    fi

    echo ""
    echo -e "${BLUE}使用公网 IP/域名: ${GREEN}${PUBLIC_IP}${NC}"
    echo ""

    # 确认部署
    read -p "确认继续部署? (Y/n): " confirm
    if [[ $confirm =~ ^[Nn]$ ]]; then
        echo "部署已取消"
        exit 0
    fi

    # 生成 JWT 密钥
    JWT_SECRET=$(generate_jwt_secret)
    echo -e "${GREEN}✅ JWT 密钥已生成${NC}"

    # 创建环境变量文件
    create_env_file "$PUBLIC_IP" "$JWT_SECRET"

    # 配置防火墙
    read -p "是否配置防火墙? (Y/n): " config_fw
    if [[ ! $config_fw =~ ^[Nn]$ ]]; then
        configure_firewall
    fi

    # 部署应用
    deploy_application "$PUBLIC_IP" "$JWT_SECRET"

    # 显示部署信息
    show_deployment_info "$PUBLIC_IP"
}

# 运行主流程
main
