#!/bin/bash
# Git Worktree Shell Aliases
# 将此文件内容添加到 ~/.zshrc 或 ~/.bashrc 中
# Add this file content to ~/.zshrc or ~/.bashrc

# ============================================
# Git Worktree 快速别名 / Quick Aliases
# ============================================

# 项目路径配置 / Project Path Configuration
export STARSHIP_PROJECT="$HOME/workspace/hulus/StarshipCommander"
export STARSHIP_WORKTREE_BASE="$HOME/../.zcf/StarshipCommander"

# ============================================
# Git 别名 / Git Aliases
# ============================================

# Worktree 快捷命令 / Worktree Shortcuts
alias gwt='git worktree'
alias gwtl='git worktree list'
alias gwtls='git worktree list'
alias gwtprune='git worktree prune'

# 创建 worktree / Create worktree
gwta() {
    local branch_name="$1"
    local base_branch="${2:-main}"

    if [[ -z "$branch_name" ]]; then
        echo "Usage: gwta <branch-name> [base-branch]"
        return 1
    fi

    cd "$STARSHIP_PROJECT" || return
    git worktree add -b "$branch_name" "$STARSHIP_WORKTREE_BASE/$branch_name" "$base_branch"

    # 安装依赖 / Install dependencies
    echo "Installing dependencies..."
    cd "$STARSHIP_WORKTREE_BASE/$branch_name" || return
    pnpm install --frozen-lockfile

    echo "Worktree created: $STARSHIP_WORKTREE_BASE/$branch_name"
}

# 删除 worktree / Remove worktree
gwtrm() {
    local branch_name="$1"

    if [[ -z "$branch_name" ]]; then
        echo "Usage: gwtrm <branch-name>"
        return 1
    fi

    local worktree_path="$STARSHIP_WORKTREE_BASE/$branch_name"

    if [[ ! -d "$worktree_path" ]]; then
        echo "Worktree not found: $worktree_path"
        return 1
    fi

    cd "$STARSHIP_PROJECT" || return
    git worktree remove "$worktree_path"

    # 询问是否删除分支 / Ask to delete branch
    read -p "Delete branch '$branch_name' as well? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -D "$branch_name"
        echo "Branch deleted: $branch_name"
    fi

    echo "Worktree removed: $worktree_path"
}

# 切换到 worktree / Switch to worktree
wtgo() {
    local branch_name="$1"

    if [[ -z "$branch_name" ]]; then
        echo "Usage: wtgo <branch-name>"
        return 1
    fi

    local worktree_path="$STARSHIP_WORKTREE_BASE/$branch_name"

    if [[ ! -d "$worktree_path" ]]; then
        echo "Worktree not found: $worktree_path"
        echo "Available worktrees:"
        git worktree list
        return 1
    fi

    cd "$worktree_path" || return
    echo "Switched to worktree: $branch_name"
    echo "Path: $worktree_path"
    echo "Current branch: $(git branch --show-current)"
}

# 切换到主仓库 / Switch to main repo
wtmain() {
    cd "$STARSHIP_PROJECT" || return
    echo "Switched to main repository"
    echo "Path: $STARSHIP_PROJECT"
    echo "Current branch: $(git branch --show-current)"
}

# ============================================
# 项目命令快捷方式 / Project Commands
# ============================================

# 创建功能分支 worktree / Create feature worktree
wtfeature() {
    local feature_name="$1"
    if [[ -z "$feature_name" ]]; then
        echo "Usage: wtfeature <feature-name>"
        return 1
    fi
    gwta "feature/$feature_name"
}

# 创建 bugfix 分支 worktree / Create bugfix worktree
wtbugfix() {
    local bug_name="$1"
    if [[ -z "$bug_name" ]]; then
        echo "Usage: wtbugfix <bug-name>"
        return 1
    fi
    gwta "bugfix/$bug_name"
}

# 创建 hotfix 分支 worktree / Create hotfix worktree
wthotfix() {
    local fix_name="$1"
    if [[ -z "$fix_name" ]]; then
        echo "Usage: wthotfix <fix-name>"
        return 1
    fi
    gwta "hotfix/$fix_name"
}

# ============================================
# 开发命令 / Development Commands
# ============================================

# 在 worktree 中启动开发服务器 / Start dev server in worktree
wtrun() {
    local worktree_name="$1"
    local frontend_port="${2:-5174}"
    local backend_port="${3:-3002}"

    if [[ -z "$worktree_name" ]]; then
        echo "Usage: wtrun <worktree-name> [frontend_port] [backend_port]"
        return 1
    fi

    local worktree_path="$STARSHIP_WORKTREE_BASE/$worktree_name"

    if [[ ! -d "$worktree_path" ]]; then
        echo "Worktree not found: $worktree_path"
        return 1
    fi

    echo "Starting development servers..."
    echo "Frontend: http://localhost:$frontend_port"
    echo "Backend: http://localhost:$backend_port"
    echo "Worktree: $worktree_path"

    cd "$worktree_path" || return
    PORT="$frontend_port" BACKEND_PORT="$backend_port" pnpm dev:all
}

# 在 worktree 中运行测试 / Run tests in worktree
wttest() {
    local worktree_name="$1"

    if [[ -z "$worktree_name" ]]; then
        echo "Usage: wttest <worktree-name>"
        return 1
    fi

    local worktree_path="$STARSHIP_WORKTREE_BASE/$worktree_name"

    if [[ ! -d "$worktree_path" ]]; then
        echo "Worktree not found: $worktree_path"
        return 1
    fi

    cd "$worktree_path" || return
    pnpm test
}

# 在 worktree 中运行 lint / Run lint in worktree
wtlint() {
    local worktree_name="$1"

    if [[ -z "$worktree_name" ]]; then
        echo "Usage: wtlint <worktree-name>"
        return 1
    fi

    local worktree_path="$STARSHIP_WORKTREE_BASE/$worktree_name"

    if [[ ! -d "$worktree_path" ]]; then
        echo "Worktree not found: $worktree_path"
        return 1
    fi

    cd "$worktree_path" || return
    pnpm lint
}

# ============================================
# VS Code 集成 / VS Code Integration
# ============================================

# 在 VS Code 中打开 worktree / Open worktree in VS Code
wtcode() {
    local worktree_name="$1"

    if [[ -z "$worktree_name" ]]; then
        echo "Usage: wtcode <worktree-name>"
        return 1
    fi

    local worktree_path="$STARSHIP_WORKTREE_BASE/$worktree_name"

    if [[ ! -d "$worktree_path" ]]; then
        echo "Worktree not found: $worktree_path"
        return 1
    fi

    code "$worktree_path"
    echo "Opened worktree in VS Code: $worktree_path"
}

# ============================================
# 信息查询 / Information Queries
# ============================================

# 显示所有 worktree 信息 / Show all worktree info
wtinfo() {
    echo "==================================="
    echo "Git Worktree Information"
    echo "==================================="
    echo ""
    echo "Main Repository:"
    echo "  Path: $STARSHIP_PROJECT"
    echo "  Branch: $(cd "$STARSHIP_PROJECT" && git branch --show-current)"
    echo ""
    echo "Worktree Base Directory:"
    echo "  Path: $STARSHIP_WORKTREE_BASE"
    echo ""
    echo "Active Worktrees:"
    git worktree list
    echo ""
    echo "==================================="
}

# 显示 worktree 状态 / Show worktree status
wtstatus() {
    local worktree_name="${1:-}"

    if [[ -z "$worktree_name" ]]; then
        # 显示所有 worktree 状态 / Show all worktree status
        echo "Status for all worktrees:"
        echo ""

        while IFS= read -r line; do
            local worktree_path=$(echo "$line" | awk '{print $1}')
            if [[ -d "$worktree_path" ]]; then
                echo "-----------------------------------"
                echo "Path: $worktree_path"
                cd "$worktree_path" || continue
                echo "Branch: $(git branch --show-current)"
                echo ""
                git status --short
                echo ""
            fi
        done < <(git worktree list | grep -v "bare" | awk '{print $1}')
    else
        # 显示特定 worktree 状态 / Show specific worktree status
        local worktree_path="$STARSHIP_WORKTREE_BASE/$worktree_name"

        if [[ ! -d "$worktree_path" ]]; then
            echo "Worktree not found: $worktree_path"
            return 1
        fi

        echo "Status for worktree: $worktree_name"
        echo "Path: $worktree_path"
        cd "$worktree_path" || return
        echo ""
        git status
    fi
}

# ============================================
# 批量操作 / Batch Operations
# ============================================

# 在所有 worktree 中运行命令 / Run command in all worktrees
wtforall() {
    local command="$*"

    if [[ -z "$command" ]]; then
        echo "Usage: wtforall <command>"
        echo "Example: wtforall git status"
        return 1
    fi

    echo "Running command in all worktrees: $command"
    echo ""

    while IFS= read -r line; do
        local worktree_path=$(echo "$line" | awk '{print $1}')
        if [[ -d "$worktree_path" && "$worktree_path" != "$(git rev-parse --git-dir)/worktrees/"* ]]; then
            echo "==================================="
            echo "Worktree: $worktree_path"
            echo "==================================="
            cd "$worktree_path" || continue
            eval "$command"
            echo ""
        fi
    done < <(git worktree list | grep -v "bare" | awk '{print $1}')
}

# 拉取所有 worktree 的更新 / Pull updates for all worktrees
wtpullall() {
    echo "Pulling updates for all worktrees..."
    wtforall git pull
}

# ============================================
# 辅助函数 / Helper Functions
# ============================================

# 自动补全 worktree 名称 / Auto-complete worktree names
_wtcomplete() {
    local cur="${COMP_WORDS[COMP_CWORD]}"
    local worktrees=$(git worktree list | grep -v "bare" | awk -F'/.zcf/StarshipCommander/' '{print $2}' | awk '{print $1}' | grep -v "^main$")
    COMPREPLY=($(compgen -W "$worktrees" -- "$cur"))
}

# 为相关命令注册自动补全 / Register autocompletion
complete -F _wtcomplete wtgo
complete -F _wtcomplete gwtrm
complete -F _wtcomplete wtcode
complete -F _wtcomplete wtrun
complete -F _wtcomplete wttest
complete -F _wtcomplete wtlint
complete -F _wtcomplete wtstatus

# ============================================
# 初始化提示 / Initialization Message
# ============================================

echo "✅ Git Worktree aliases loaded"
echo ""
echo "Quick commands:"
echo "  wtfeature <name>   - Create feature worktree"
echo "  wtbugfix <name>    - Create bugfix worktree"
echo "  wthotfix <name>    - Create hotfix worktree"
echo "  wtgo <name>        - Switch to worktree"
echo "  wtmain             - Switch to main repository"
echo "  wtrun <name>       - Run dev server in worktree"
echo "  wtcode <name>      - Open worktree in VS Code"
echo "  wtlist / gwtl      - List all worktrees"
echo "  wtinfo             - Show worktree information"
echo "  wtstatus [name]    - Show worktree status"
echo ""
echo "Type 'wtinfo' to see all worktrees"
