#!/bin/bash
# 服务健康检查脚本 / Service health check script
# 使用方法 / Usage: bash deploy/health-check.sh

set -e

echo "🔍 Starship Commander 服务健康检查"
echo "=================================="
echo ""

# 颜色定义 / Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数器
PASS_COUNT=0
FAIL_COUNT=0

# 检查函数
check_service() {
    local service_name=$1
    local check_command=$2

    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} $service_name - 运行正常"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "${RED}❌${NC} $service_name - 运行异常"
        ((FAIL_COUNT++))
        return 1
    fi
}

# 1. 检查 PM2 服务
echo "📊 PM2 服务状态："
if pm2 list | grep -q "starship"; then
    ((PASS_COUNT++))
    pm2 list | grep "starship"
else
    ((FAIL_COUNT++))
    echo -e "${RED}❌ PM2 服务未运行${NC}"
fi
echo ""

# 2. 检查前端服务
echo "🌐 前端服务："
check_service "前端服务 (端口 3000)" "curl -f -s -o /dev/null -w '%{http_code}' http://localhost:3000"
echo ""

# 3. 检查后端服务
echo "🔧 后端服务："
check_service "后端服务 (端口 3001)" "curl -f -s -o /dev/null -w '%{http_code}' http://localhost:3001"
echo ""

# 4. 检查数据库
echo "💾 数据库："
if [ -f "/var/www/starship-commander/prisma/dev.db" ]; then
    ((PASS_COUNT++))
    DB_SIZE=$(du -h /var/www/starship-commander/prisma/dev.db | cut -f1)
    echo -e "${GREEN}✅${NC} 数据库文件存在 (大小: $DB_SIZE)"
else
    ((FAIL_COUNT++))
    echo -e "${RED}❌ 数据库文件不存在${NC}"
fi
echo ""

# 5. 检查 Nginx
echo "🌍 Nginx 服务："
if systemctl is-active --quiet nginx; then
    ((PASS_COUNT++))
    echo -e "${GREEN}✅${NC} Nginx 运行正常"
else
    ((FAIL_COUNT++))
    echo -e "${RED}❌ Nginx 未运行${NC}"
fi
echo ""

# 6. 检查磁盘空间
echo "💿 磁盘空间："
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    ((PASS_COUNT++))
    echo -e "${GREEN}✅${NC} 磁盘空间充足 (使用率: ${DISK_USAGE}%)"
else
    ((FAIL_COUNT++))
    echo -e "${YELLOW}⚠️${NC}  磁盘空间不足 (使用率: ${DISK_USAGE}%)"
fi
echo ""

# 7. 检查内存使用
echo "🧠 内存使用："
MEM_USAGE=$(free | awk 'NR==2 {printf "%.0f", ($3/$2)*100}')
if [ $MEM_USAGE -lt 80 ]; then
    ((PASS_COUNT++))
    echo -e "${GREEN}✅${NC} 内存充足 (使用率: ${MEM_USAGE}%)"
else
    ((FAIL_COUNT++))
    echo -e "${YELLOW}⚠️${NC}  内存使用率高 (使用率: ${MEM_USAGE}%)"
fi
echo ""

# 8. 检查最近的错误日志
echo "📋 最近错误日志（最近 10 条）："
if [ -d "/var/www/starship-commander/logs" ]; then
    echo "前端错误日志："
    if [ -f "/var/www/starship-commander/logs/frontend-error.log" ]; then
        tail -n 5 /var/www/starship-commander/logs/frontend-error.log || echo "无错误日志"
    else
        echo "无错误日志文件"
    fi

    echo ""
    echo "后端错误日志："
    if [ -f "/var/www/starship-commander/logs/backend-error.log" ]; then
        tail -n 5 /var/www/starship-commander/logs/backend-error.log || echo "无错误日志"
    else
        echo "无错误日志文件"
    fi
else
    echo -e "${YELLOW}⚠️${NC}  日志目录不存在"
fi
echo ""

# 总结
echo "=================================="
echo -e "检查结果：${GREEN}通过 $PASS_COUNT${NC} / ${RED}失败 $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 所有服务运行正常！${NC}"
    exit 0
else
    echo -e "${RED}⚠️  发现 $FAIL_COUNT 个问题，请检查上述错误${NC}"
    exit 1
fi
