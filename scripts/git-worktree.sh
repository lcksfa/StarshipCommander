#!/bin/bash

# Git Worktree Management Script for Starship Commander
# Git Worktree 管理脚本 - 用于 Starship Commander 项目

set -euo pipefail

# Color codes / 颜色代码
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Project root / 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKTREE_BASE_DIR="$PROJECT_ROOT/../.zcf/StarshipCommander"

# Logging functions / 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show usage / 显示用法
show_usage() {
    cat << EOF
${YELLOW}Git Worktree Management Script${NC}

${BLUE}Usage:${NC}
    $(basename "$0") <command> [options]

${BLUE}Commands:${NC}
    create <branch-name>      Create a new worktree for feature development
                               为功能开发创建新的 worktree

    list                       List all worktrees
                               列出所有 worktree

    remove <branch-name>       Remove a worktree
                               移除 worktree

    sync <branch-name>         Sync worktree changes back to main branch
                               将 worktree 的更改同步回主分支

    prune                      Remove removed worktrees
                               清理已删除的 worktree

    help                       Show this help message
                               显示帮助信息

${BLUE}Examples:${NC}
    $(basename "$0") create feature/add-user-profile
    $(basename "$0") list
    $(basename "$0") remove feature/add-user-profile

${BLUE}Directory Structure:${NC}
    Worktrees are created in: $WORKTREE_BASE_DIR
    Worktree 创建目录：$WORKTREE_BASE_DIR

EOF
}

# Create worktree directory structure / 创建 worktree 目录结构
ensure_worktree_dir() {
    if [[ ! -d "$WORKTREE_BASE_DIR" ]]; then
        log_info "Creating worktree base directory: $WORKTREE_BASE_DIR"
        mkdir -p "$WORKTREE_BASE_DIR"
    fi
}

# Create a new worktree / 创建新的 worktree
create_worktree() {
    local branch_name="$1"

    if [[ -z "$branch_name" ]]; then
        log_error "Branch name is required"
        show_usage
        exit 1
    fi

    # Validate branch name format / 验证分支名称格式
    if [[ ! "$branch_name" =~ ^(feature|bugfix|hotfix|refactor|test|docs)/.+ ]]; then
        log_warning "Branch name doesn't follow convention (prefix/type/name)"
        log_warning "分支名称不符合约定（前缀/类型/名称）"
        log_info "Recommended format: feature/description, bugfix/description, etc."
        log_info "推荐格式：feature/描述, bugfix/描述, 等"

        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    ensure_worktree_dir

    local worktree_path="$WORKTREE_BASE_DIR/$branch_name"

    # Check if worktree already exists / 检查 worktree 是否已存在
    if [[ -d "$worktree_path" ]]; then
        log_error "Worktree already exists: $worktree_path"
        exit 1
    fi

    # Check if branch already exists / 检查分支是否已存在
    if git show-ref --verify --quiet "refs/heads/$branch_name"; then
        log_info "Using existing branch: $branch_name"
        git worktree add "$worktree_path" "$branch_name"
    else
        log_info "Creating new branch: $branch_name"
        git worktree add -b "$branch_name" "$worktree_path" main
    fi

    # Install dependencies in worktree / 在 worktree 中安装依赖
    log_info "Installing dependencies in worktree..."
    cd "$worktree_path"
    pnpm install --frozen-lockfile

    log_success "Worktree created successfully!"
    log_success "Worktree 创建成功！"
    echo ""
    log_info "Worktree path: $worktree_path"
    log_info "Branch: $branch_name"
    echo ""
    log_info "To start developing:"
    log_info "开始开发："
    echo "  cd $worktree_path"
    echo "  pnpm dev:all"
    echo ""
    log_info "To open in VS Code:"
    log_info "在 VS Code 中打开："
    echo "  code $worktree_path"
}

# List all worktrees / 列出所有 worktree
list_worktrees() {
    log_info "Active worktrees / 活动的 worktree："
    echo ""

    git worktree list

    echo ""
    log_info "Worktree directory / Worktree 目录：$WORKTREE_BASE_DIR"
}

# Remove a worktree / 移除 worktree
remove_worktree() {
    local branch_name="$1"

    if [[ -z "$branch_name" ]]; then
        log_error "Branch name is required"
        show_usage
        exit 1
    fi

    local worktree_path="$WORKTREE_BASE_DIR/$branch_name"

    if [[ ! -d "$worktree_path" ]]; then
        log_error "Worktree not found: $worktree_path"
        exit 1
    fi

    # Check if there are uncommitted changes / 检查是否有未提交的更改
    cd "$worktree_path"
    if ! git diff-index --quiet HEAD --; then
        log_warning "There are uncommitted changes in this worktree"
        log_warning "此 worktree 中有未提交的更改"

        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    # Remove worktree / 移除 worktree
    cd "$PROJECT_ROOT"
    git worktree remove "$worktree_path"

    # Ask if branch should be deleted / 询问是否删除分支
    read -p "Delete branch '$branch_name' as well? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -D "$branch_name"
        log_success "Branch deleted: $branch_name"
    fi

    log_success "Worktree removed successfully!"
    log_success "Worktree 移除成功！"
}

# Sync worktree changes back to main / 将 worktree 更改同步回主分支
sync_worktree() {
    local branch_name="$1"

    if [[ -z "$branch_name" ]]; then
        log_error "Branch name is required"
        show_usage
        exit 1
    fi

    local worktree_path="$WORKTREE_BASE_DIR/$branch_name"

    if [[ ! -d "$worktree_path" ]]; then
        log_error "Worktree not found: $worktree_path"
        exit 1
    fi

    cd "$worktree_path"

    # Check if there are uncommitted changes / 检查是否有未提交的更改
    if ! git diff-index --quiet HEAD --; then
        log_error "There are uncommitted changes. Please commit first."
        log_error "存在未提交的更改。请先提交。"
        exit 1
    fi

    # Switch to main branch in main repo / 在主仓库中切换到主分支
    cd "$PROJECT_ROOT"
    git checkout main

    # Merge the feature branch / 合并功能分支
    log_info "Merging $branch_name into main..."
    git merge "$branch_name"

    log_success "Sync completed!"
    log_success "同步完成！"

    # Ask if worktree should be removed / 询问是否移除 worktree
    read -p "Remove worktree for '$branch_name'? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git worktree remove "$worktree_path"
        log_success "Worktree removed"
    fi
}

# Prune removed worktrees / 清理已删除的 worktree
prune_worktrees() {
    log_info "Pruning removed worktrees..."
    git worktree prune
    log_success "Prune completed!"
    log_success "清理完成！"
}

# Main script logic / 主脚本逻辑
main() {
    cd "$PROJECT_ROOT"

    if [[ $# -eq 0 ]]; then
        show_usage
        exit 1
    fi

    local command="$1"
    shift

    case "$command" in
        create)
            create_worktree "$@"
            ;;
        list)
            list_worktrees
            ;;
        remove)
            remove_worktree "$@"
            ;;
        sync)
            sync_worktree "$@"
            ;;
        prune)
            prune_worktrees
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
