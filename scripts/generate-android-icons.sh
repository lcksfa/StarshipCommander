#!/bin/bash

# Starship Commander - Android Icon Generator
# 从 SVG 生成 Android 应用图标 / Generate Android app icons from SVG

set -e

# 颜色定义 / Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

# 检查依赖 / Check dependencies
check_dependencies() {
    print_header "🔍 检查依赖 / Checking Dependencies"

    # 检查 ImageMagick / Check ImageMagick
    if ! command -v convert &> /dev/null; then
        print_error "未找到 ImageMagick / ImageMagick not found"
        print_info "请安装 ImageMagick: / Please install ImageMagick:"
        print_info "  macOS: brew install imagemagick"
        print_info "  Ubuntu: sudo apt-get install imagemagick"
        exit 1
    fi

    print_success "ImageMagick 已安装 / ImageMagick installed"
}

# 生成图标 / Generate icons
generate_icons() {
    print_header "🎨 生成 Android 图标 / Generating Android Icons"

    local SOURCE_SVG="public/favicon.svg"
    local ANDROID_RES_DIR="android/app/src/main/res"

    # 检查源文件 / Check source file
    if [ ! -f "$SOURCE_SVG" ]; then
        print_error "找不到源图标文件 / Source icon not found: $SOURCE_SVG"
        exit 1
    fi

    print_info "源图标 / Source icon: $SOURCE_SVG"
    print_info "目标目录 / Target directory: $ANDROID_RES_DIR"

    # Android 图标尺寸 / Android icon sizes
    declare -A SIZES=(
        ["mipmap-mdpi"]="48"
        ["mipmap-hdpi"]="72"
        ["mipmap-xhdpi"]="96"
        ["mipmap-xxhdpi"]="144"
        ["mipmap-xxxhdpi"]="192"
    )

    # 为每个尺寸生成图标 / Generate icons for each size
    for dir in "${!SIZES[@]}"; do
        size=${SIZES[$dir]}
        target_dir="$ANDROID_RES_DIR/$dir"

        # 创建目录（如果不存在）/ Create directory if not exists
        mkdir -p "$target_dir"

        # 生成图标 / Generate icon
        print_info "生成 / Generating $dir (${size}x${size})..."

        convert \
            -background none \
            -density 300 \
            -resize ${size}x${size} \
            "$SOURCE_SVG" \
            "$target_dir/ic_launcher.png"

        # 生成圆角图标 / Generate rounded icon
        convert \
            -background none \
            -density 300 \
            -resize ${size}x${size} \
            "$SOURCE_SVG" \
            "$target_dir/ic_launcher_round.png"

        print_success "$dir 完成 / completed"
    done

    # 为 adaptive icon 生成前景 / Generate foreground for adaptive icon
    print_info "生成 adaptive icon 前景 / Generating adaptive icon foreground..."

    for dir in "${!SIZES[@]}"; do
        size=${SIZES[$dir]}
        target_dir="$ANDROID_RES_DIR/$dir"

        # adaptive icon 前景需要大 25% / Adaptive icon foreground needs to be 25% larger
        adaptive_size=$((size * 4 / 3))

        convert \
            -background none \
            -density 300 \
            -resize ${adaptive_size}x${adaptive_size} \
            "$SOURCE_SVG" \
            "$target_dir/ic_launcher_foreground.png"
    done

    print_success "Adaptive icon 前景生成完成 / Adaptive icon foreground generated"
}

# 验证图标 / Verify icons
verify_icons() {
    print_header "✅ 验证图标 / Verifying Icons"

    local ANDROID_RES_DIR="android/app/src/main/res"
    local count=0

    for dir in "$ANDROID_RES_DIR"/mipmap-*; do
        if [ -d "$dir" ]; then
            local icon_count=$(ls -1 "$dir"/ic_launcher*.png 2>/dev/null | wc -l)
            count=$((count + icon_count))
        fi
    done

    print_success "共生成 / Total generated: $count 个图标文件 / icon files"
}

# 清理旧图标（可选）/ Clean old icons (optional)
clean_old_icons() {
    print_header "🧹 清理旧图标 / Cleaning Old Icons"

    local ANDROID_RES_DIR="android/app/src/main/res"

    for dir in "$ANDROID_RES_DIR"/mipmap-*; do
        if [ -d "$dir" ]; then
            print_info "清理 / Cleaning $dir..."
            rm -f "$dir"/ic_launcher*.png
        fi
    done

    print_success "旧图标已清理 / Old icons cleaned"
}

# 主函数 / Main function
main() {
    print_header "🚀 Starship Commander - Android 图标生成器 / Icon Generator"

    # 检查是否需要清理 / Check if clean is needed
    if [ "$1" = "--clean" ]; then
        clean_old_icons
    fi

    # 检查依赖 / Check dependencies
    check_dependencies

    # 生成图标 / Generate icons
    generate_icons

    # 验证图标 / Verify icons
    verify_icons

    print_header "🎉 完成！/ Completed!"
    print_info "下一步 / Next steps:"
    echo "  1. 检查生成的图标 / Check generated icons"
    echo "  2. 构建 Android APK / Build Android APK"
    echo "     cd android && ./gradlew assembleRelease"
    echo ""
}

# 运行主函数 / Run main function
main "$@"
