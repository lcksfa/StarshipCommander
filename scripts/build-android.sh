#!/bin/bash

# Starship Commander - Android 智能构建脚本
# Android Smart Build Script
# 自动检测 IP 并构建 Android APK

set -e

# 颜色定义 / Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

# 获取局域网 IP / Get LAN IP
get_lan_ip() {
    print_header "🌐 获取局域网 IP / Getting LAN IP"

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

# 更新 Capacitor 配置 / Update Capacitor config
update_capacitor_config() {
    print_header "📝 更新 Capacitor 配置 / Updating Capacitor Config"

    print_info "更新服务器地址为 / Updating server URL to: $LAN_IP"

    # 更新 capacitor.config.ts
    cat > capacitor.config.ts << EOF
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.starshipcommander.habits',
  appName: 'Starship Commander',
  webDir: 'dist',
  server: {
    // 配置为局域网服务器地址 / Configure for LAN server address
    // 移动端将从局域网服务器加载应用，而不是打包的资源
    // Mobile app will load from LAN server instead of bundled resources
    url: 'http://$LAN_IP:3000',
    androidScheme: 'https',
    // 开发环境配置：允许连接开发服务器
    // Development configuration: Allow connection to dev server
    cleartext: true,
    // 允许在安卓上加载本地网络资源
    // Allow loading local network resources on Android
    androidPathResolver: (path) => path,
    // 允许导航到外部 URL
    // Allow navigation to external URLs
    allowNavigation: [
      'http://$LAN_IP:*',
      'http://192.168.0.*:*',
      'http://192.168.1.*:*',
      'http://10.0.0.*:*',
      'http://172.16.*:*',
      'http://localhost:*',
    ],
  },
  android: {
    // 启用混合内容以支持开发环境的 HTTP 连接
    // Enable hybrid content for HTTP connections in development
    allowMixedContent: true,
    // 禁用输入捕获以避免干扰 React 受控组件
    // Disable input capture to avoid interference with React controlled components
    captureInput: false,
    // 启用 webContents 调试
    // Enable webContents debugging
    webContentsDebuggingEnabled: true,
    // 保持 WebView 在软键盘弹出时不重新布局
    // Keep WebView from relayouting when soft keyboard appears
    keyboardDisplayRequiresUserAction: false,
  },
};

export default config;
EOF

    print_success "Capacitor 配置已更新 / Capacitor config updated"
}

# 构建前端 / Build frontend
build_frontend() {
    print_header "🔨 构建前端 / Building Frontend"

    print_info "设置 API URL / Setting API URL: http://$LAN_IP:3001/trpc"
    VITE_API_URL="http://$LAN_IP:3001/trpc" pnpm build

    print_success "前端构建完成 / Frontend build completed"
}

# 同步到 Android / Sync to Android
sync_to_android() {
    print_header "🔄 同步到 Android / Syncing to Android"

    npx cap sync android

    print_success "同步完成 / Sync completed"
}

# 构建 Android APK / Build Android APK
build_android_apk() {
    print_header "📱 构建 Android APK / Building Android APK"

    print_info "选择构建版本 / Select build version:"
    echo "  1) Debug 版本 / Debug version (更快，用于开发测试)"
    echo "  2) Release 版本 / Release version (更小，用于分发)"
    echo ""

    read -p "请选择 / Please select (1/2) [默认: 1]: " build_choice
    build_choice=${build_choice:-1}

    cd android

    if [ "$build_choice" = "2" ]; then
        print_info "构建 Release 版本... / Building Release version..."
        ./gradlew assembleRelease
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
        BUILD_TYPE="Release"
    else
        print_info "构建 Debug 版本... / Building Debug version..."
        ./gradlew assembleDebug
        APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
        BUILD_TYPE="Debug"
    fi

    cd ..

    print_success "Android APK 构建完成 / Android APK build completed"
}

# 显示结果 / Show results
show_results() {
    print_header "🎉 构建完成！/ Build Completed!"

    echo ""
    echo -e "${GREEN}✨ Starship Commander Android APK 构建成功！${NC}"
    echo ""
    echo -e "${CYAN}📦 APK 文件位置 / APK Location:${NC}"
    echo "   $BUILD_TYPE APK: android/$APK_PATH"
    echo ""
    echo -e "${CYAN}🌐 服务器配置 / Server Configuration:${NC}"
    echo "   前端 / Frontend:  http://$LAN_IP:3000"
    echo "   后端 / Backend:   http://$LAN_IP:3001"
    echo ""
    echo -e "${CYAN}📲 安装方法 / Installation:${NC}"
    echo "   1. 复制 APK 到手机 / Copy APK to phone"
    echo "   2. 在文件管理器中打开并安装 / Open in file manager and install"
    echo ""
    echo -e "${CYAN}🔧 常用命令 / Common Commands:${NC}"
    echo "   查看 APK 文件 / View APK: ls -lh android/$APK_PATH"
    echo "   通过 ADB 安装 / Install via ADB: adb install android/$APK_PATH"
    echo "   重新构建 / Rebuild: $0 $LAN_IP"
    echo ""
    echo -e "${YELLOW}⚠️  注意 / Note:${NC}"
    echo "   - 确保 Android 设备连接到同一 Wi-Fi 网络"
    echo "   - Ensure Android device is on the same Wi-Fi network"
    echo "   - 确保 Docker 容器正在运行 / Ensure Docker containers are running"
    echo "   - 启动容器 / Start containers: docker-compose up -d"
    echo ""
}

# 主函数 / Main function
main() {
    print_header "🚀 Starship Commander - Android 智能构建 / Android Smart Build"

    # 获取 IP / Get IP
    get_lan_ip "$1"

    # 确认 / Confirm
    print_warning "请确认以下配置 / Please confirm the following configuration:"
    echo "  局域网 IP / LAN IP: $LAN_IP"
    echo "  前端地址 / Frontend: http://$LAN_IP:3000"
    echo "  后端地址 / Backend:  http://$LAN_IP:3001"
    echo ""

    read -p "确认继续? / Continue? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "已取消 / Cancelled"
        exit 0
    fi

    # 执行构建步骤 / Execute build steps
    update_capacitor_config
    build_frontend
    sync_to_android
    build_android_apk
    show_results
}

# 运行主函数 / Run main function
main "$@"
