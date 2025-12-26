# Git Worktree 开发流程指南
# Git Worktree Development Workflow

> **概述**：使用 Git Worktree 实现并行功能开发，无需频繁切换分支

---

## 📚 目录

- [什么是 Git Worktree](#什么是-git-worktree)
- [为什么使用 Worktree](#为什么使用-worktree)
- [快速开始](#快速开始)
- [完整开发流程](#完整开发流程)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)
- [命令参考](#命令参考)

---

## 🎯 什么是 Git Worktree

**Git Worktree** 允许你在同一个 Git 仓库中同时检出多个分支到不同的目录。

### 传统方式 vs Worktree 方式

| 传统方式 | Worktree 方式 |
|---------|--------------|
| 频繁切换分支 | 同时打开多个分支 |
| 需要重复安装依赖 | 每个分支独立环境 |
| 容易丢失未完成的工作 | 保留每个分支的状态 |
| 难以并行开发 | 轻松并行开发多个功能 |

**示例场景**：

```bash
# 主仓库：开发功能 A
/Users/lizhao/workspace/hulus/StarshipCommander/        # main 分支

# Worktree 1：开发功能 B
../.zcf/StarshipCommander/feature/user-authentication/  # feature/user-authentication 分支

# Worktree 2：修复 Bug
../.zcf/StarshipCommander/bugfix/login-error/           # bugfix/login-error 分支
```

---

## 💡 为什么使用 Worktree

### 1. **并行开发**
- 同时开发多个功能而不互相干扰
- 可以随时切换到不同的工作目录

### 2. **环境隔离**
- 每个 worktree 有独立的 `node_modules`
- 避免依赖冲突
- 每个分支可以运行不同的服务实例

### 3. **状态保留**
- 不会因为切换分支而丢失未完成的工作
- 每个分支保持独立的工作状态

### 4. **快速切换**
- 无需等待 `pnpm install`
- 无需重新构建
- 直接在不同目录间切换

### 5. **代码审查**
- 可以同时打开原始分支和修改后的分支进行对比
- 方便在 IDE 中并排查看

---

## 🚀 快速开始

### 1. 创建新的 Worktree

```bash
# 方式 1：使用管理脚本（推荐）
./scripts/git-worktree.sh create feature/add-user-profile

# 方式 2：使用原生 Git 命令
git worktree add -b feature/add-user-profile ../.zcf/StarshipCommander/feature/add-user-profile main
```

### 2. 在 Worktree 中工作

```bash
# 进入 worktree 目录
cd ../.zcf/StarshipCommander/feature/add-user-profile

# 启动开发服务器
pnpm dev:all

# 进行开发...
```

### 3. 列出所有 Worktree

```bash
# 使用脚本
./scripts/git-worktree.sh list

# 或使用 Git 命令
git worktree list
```

### 4. 完成 Worktree

```bash
# 使用脚本清理
./scripts/git-worktree.sh remove feature/add-user-profile

# 或手动删除
git worktree remove ../.zcf/StarshipCommander/feature/add-user-profile
```

---

## 📋 完整开发流程

### 阶段 1：创建 Worktree

#### 步骤 1：规划任务

```bash
# 确定分支类型和名称
feature/    # 新功能
bugfix/     # Bug 修复
hotfix/     # 紧急修复
refactor/   # 代码重构
test/       # 测试相关
docs/       # 文档更新
```

#### 步骤 2：创建 Worktree

```bash
# 示例：开发用户认证功能
./scripts/git-worktree.sh create feature/user-authentication
```

**输出示例**：

```
[INFO] Creating new branch: feature/user-authentication
[INFO] Installing dependencies in worktree...
[SUCCESS] Worktree created successfully!

Worktree path: /Users/lizhao/.zcf/StarshipCommander/feature/user-authentication
Branch: feature/user-authentication

To start developing:
  cd /Users/lizhao/.zcf/StarshipCommander/feature/user-authentication
  pnpm dev:all

To open in VS Code:
  code /Users/lizhao/.zcf/StarshipCommander/feature/user-authentication
```

### 阶段 2：开发功能

#### 步骤 1：在 Worktree 中开发

```bash
cd ../.zcf/StarshipCommander/feature/user-authentication

# 确认当前分支
git branch  # 应显示 * feature/user-authentication

# 启动开发服务器（使用不同端口避免冲突）
PORT=5174 pnpm dev
```

#### 步骤 2：编写代码

```bash
# 创建新文件
# 修改现有代码
# 添加测试
```

#### 步骤 3：提交更改

```bash
# 查看更改
git status
git diff

# 添加文件
git add src/frontend/components/UserAuth.tsx
git add src/backend/modules/auth/auth.service.ts

# 提交（遵循 Conventional Commits）
git commit -m "feat(auth): add user authentication component

- Implement OAuth2 login flow
- Add JWT token management
- Create user profile page

Closes #123"
```

**Conventional Commits 规范**：

| 类型 | 说明 | 示例 |
|-----|------|------|
| `feat` | 新功能 | `feat(auth): add login page` |
| `fix` | Bug 修复 | `fix(api): resolve timeout issue` |
| `docs` | 文档更新 | `docs(readme): update setup guide` |
| `style` | 代码格式 | `style(ui): fix indentation` |
| `refactor` | 重构 | `refactor(db): simplify query logic` |
| `test` | 测试 | `test(auth): add unit tests` |
| `chore` | 构建/工具 | `chore(deps): update dependencies` |

### 阶段 3：代码质量检查

#### 步骤 1：运行测试

```bash
# 在 worktree 目录中
cd ../.zcf/StarshipCommander/feature/user-authentication

# 运行单元测试
pnpm test

# 运行 E2E 测试
pnpm test:e2e:playwright

# 生成覆盖率报告
pnpm test:cov
```

#### 步骤 2：代码检查

```bash
# ESLint 检查并修复
pnpm lint

# Prettier 格式化
pnpm format

# TypeScript 类型检查
pnpm typecheck
```

### 阶段 4：同步到主分支

#### 方式 1：使用脚本（推荐）

```bash
./scripts/git-worktree.sh sync feature/user-authentication
```

**脚本会自动**：
1. 检查是否有未提交的更改
2. 切换主仓库到 `main` 分支
3. 合并功能分支
4. 询问是否清理 worktree

#### 方式 2：手动合并

```bash
# 1. 在主仓库中切换到 main
cd /Users/lizhao/workspace/hulus/StarshipCommander
git checkout main

# 2. 拉取最新更改
git pull origin main

# 3. 合并功能分支
git merge feature/user-authentication

# 4. 如果有冲突，解决冲突
# 编辑冲突文件后：
git add <resolved-files>
git commit

# 5. 推送到远程
git push origin main

# 6. 清理 worktree（可选）
git worktree remove ../.zcf/StarshipCommander/feature/user-authentication
git branch -d feature/user-authentication
```

### 阶段 5：Pull Request 流程（推荐）

对于团队协作，建议使用 Pull Request：

```bash
# 1. 推送功能分支到远程
cd ../.zcf/StarshipCommander/feature/user-authentication
git push -u origin feature/user-authentication

# 2. 在 GitHub 上创建 Pull Request
# 访问：https://github.com/lcksfa/StarshipCommander/compare/main...feature/user-authentication

# 3. 等待代码审查和 CI 检查

# 4. 审查通过后，通过 PR 合并到 main

# 5. 合并后清理本地
cd /Users/lizhao/workspace/hulus/StarshipCommander
git checkout main
git pull
git worktree remove ../.zcf/StarshipCommander/feature/user-authentication
git branch -d feature/user-authentication
```

---

## 🎯 最佳实践

### 1. 分支命名规范

```bash
# ✅ 好的命名
feature/user-profile-page
bugfix/login-timeout-error
refactor/optimize-database-queries
docs/update-api-documentation
hotfix/security-patch-2024

# ❌ 避免的命名
feature1
fix-bug
stuff
temp
```

### 2. Worktree 管理

#### 定期清理

```bash
# 查看所有 worktree
git worktree list

# 删除已完成的 worktree
./scripts/git-worktree.sh remove feature/completed-feature

# 清理无效的 worktree
./scripts/git-worktree.sh prune
```

#### 不要创建太多 worktree

```bash
# ✅ 推荐：同时维护 2-3 个 worktree
feature/feature-a     # 当前主要开发
bugfix/urgent-bug    # 紧急修复
docs/api-update      # 文档更新

# ❌ 避免：创建 10+ 个 worktree
# 会造成磁盘空间浪费和管理混乱
```

### 3. 依赖管理

#### 共享 node_modules（可选优化）

```bash
# 在 .gitignore 中添加
../.zcf/StarshipCommander/*/node_modules

# 创建符号链接共享依赖（高级）
ln -s /path/to/main/node_modules /path/to/worktree/node_modules
```

### 4. 端口管理

不同 worktree 使用不同端口避免冲突：

```bash
# 主仓库：端口 3000, 3001
pnpm dev:all  # 前端 :3000, 后端 :3001

# Worktree 1：端口 5174, 3002
PORT=5174 BACKEND_PORT=3002 pnpm dev:all

# Worktree 2：端口 5175, 3003
PORT=5175 BACKEND_PORT=3003 pnpm dev:all
```

或创建 `.env.local` 文件：

```env
# .env.local in worktree
VITE_PORT=5174
BACKEND_PORT=3002
```

### 5. 数据库隔离

```bash
# 为每个 worktree 使用独立的数据库
# 在 worktree 的 .env 中
DATABASE_URL="file:./dev-worktree.db"

# 或使用内存数据库（测试用）
DATABASE_URL="file:./dev-test.db?connection_limit=1"
```

### 6. 提交规范

```bash
# ✅ 好的提交
git commit -m "feat(auth): add OAuth2 login

- Implement Google OAuth integration
- Add token refresh logic
- Update user profile with OAuth data

Refs #123"

# ❌ 避免的提交
git commit -m "fix stuff"
git commit -m "update"
git commit -m "wip"
```

### 7. 工作流建议

#### 小步提交

```bash
# ✅ 推荐：频繁提交
git commit -m "feat: add auth component"
# ... 继续开发 ...
git commit -m "feat: add token validation"
# ... 继续开发 ...
git commit -m "test: add unit tests"

# ❌ 避免：大量更改一次性提交
git commit -m "implement complete auth system"  # 包含 100+ 文件更改
```

#### 原子化功能

```bash
# 每个 worktree 专注一个功能
feature/user-authentication     # ✅ 专注
feature/user-authentication-and-admin-panel-and-dashboard  # ❌ 职责太多
```

---

## ❓ 常见问题

### Q1: Worktree 中更改了主仓库的文件，会互相影响吗？

**A**: 不会。每个 worktree 是独立的工作目录，但共享同一个 Git 仓库的对象数据库。更改在一个 worktree 中不会影响其他 worktree，除非你提交并合并。

### Q2: 如何在不同 worktree 之间共享依赖？

**A**: 有几种方式：

```bash
# 方式 1：使用 pnpm workspace（推荐）
# 配置 pnpm-workspace.yaml

# 方式 2：符号链接
ln -s /main/node_modules /worktree/node_modules

# 方式 3：使用独立的 node_modules（默认）
# 每个_worktree 独立安装，最安全但占用更多空间
```

### Q3: Worktree 可以推送吗？

**A**: 可以。Worktree 中的分支和普通分支一样，可以推送：

```bash
cd ../.zcf/StarshipCommander/feature/my-feature
git push -u origin feature/my-feature
```

### Q4: 如何删除 worktree？

**A**: 使用脚本或 Git 命令：

```bash
# 方式 1：使用脚本
./scripts/git-worktree.sh remove feature/my-feature

# 方式 2：使用 Git 命令
git worktree remove /path/to/worktree

# 方式 3：手动删除（不推荐）
rm -rf /path/to/worktree
git worktree prune
```

### Q5: Worktree 占用多少空间？

**A**: Worktree 使用 Git 的硬链接机制，大部分 Git 对象是共享的。主要空间占用来自：
- `node_modules/`（独立安装）
- 构建产物（`dist/`）
- 临时文件

通常每个 worktree 额外占用 200-500MB（主要是 node_modules）。

### Q6: 能否在 worktree 中切换分支？

**A**: 不建议。Worktree 的设计是每个目录对应一个分支。如果需要其他分支，创建新的 worktree：

```bash
# ❌ 不要在 worktree 中切换分支
cd worktree-1
git checkout other-branch  # 会报错

# ✅ 创建新的 worktree
git worktree add ../.zcf/StarshipCommander/other-branch other-branch
```

---

## 📖 命令参考

### 脚本命令

```bash
# 创建 worktree
./scripts/git-worktree.sh create <branch-name>

# 列出 worktree
./scripts/git-worktree.sh list

# 移除 worktree
./scripts/git-worktree.sh remove <branch-name>

# 同步到主分支
./scripts/git-worktree.sh sync <branch-name>

# 清理无效 worktree
./scripts/git-worktree.sh prune

# 显示帮助
./scripts/git-worktree.sh help
```

### Git 原生命令

```bash
# 添加 worktree
git worktree add [-b <branch>] <path> [<commit-ish>]

# 列出 worktree
git worktree list [-v | --porcelain]

# 移除 worktree
git worktree remove <worktree>

# 移动 worktree
git worktree move <old-path> <new-path>

# 清理无效 worktree
git worktree prune

# 查看 worktree 状态
git worktree list --porcelain
```

### 快捷别名（可选）

添加到 `~/.gitconfig` 或项目 `.git/config`：

```ini
[alias]
    # Worktree aliases / Worktree 别名
    wt = worktree
    wt-list = worktree list
    wt-add = worktree add
    wt-remove = worktree remove
    wt-prune = worktree prune
```

使用示例：

```bash
git wt-list
git wt-add -b feature/new ../.zcf/StarshipCommander/feature/new
git wt-remove ../.zcf/StarshipCommander/feature/old
```

---

## 🔧 高级技巧

### 1. 自动创建 Pull Request

使用 GitHub CLI：

```bash
cd ../.zcf/StarshipCommander/feature/my-feature
git push -u origin feature/my-feature
gh pr create --title "Add new feature" --body "Description of changes"
```

### 2. Worktree 模板

创建 worktree 后自动设置环境：

```bash
# 添加到 scripts/git-worktree.sh
setup_worktree_env() {
    local worktree_path="$1"
    cat > "$worktree_path/.env.local" << EOF
VITE_PORT=5174
BACKEND_PORT=3002
DATABASE_URL="file:./dev-$branch.db"
EOF
}
```

### 3. VS Code 集成

创建多个 VS Code 窗口：

```bash
# 主仓库
code /Users/lizhao/workspace/hulus/StarshipCommander

# Worktree 1
code /Users/lizhao/.zcf/StarshipCommander/feature/user-auth

# Worktree 2
code /Users/lizhao/.zcf/StarshipCommander/bugfix/login-fix
```

### 4. 快速切换工作目录

添加到 shell 配置（`~/.zshrc` 或 `~/.bashrc`）：

```bash
# Worktree 快速切换
alias wtmain='cd /Users/lizhao/workspace/hulus/StarshipCommander'
alias wtauth='cd /Users/lizhao/.zcf/StarshipCommander/feature/user-authentication'
alias wtfix='cd /Users/lizhao/.zcf/StarshipCommander/bugfix/login-fix'

# 或使用函数
wt() {
    cd /Users/lizhao/.zcf/StarshipCommander/"$1"
}

# 使用：wt feature/user-authentication
```

---

## 📊 流程图

```
┌─────────────────────────────────────────────────────────────┐
│                      Git Worktree Workflow                   │
└─────────────────────────────────────────────────────────────┘

    ┌──────────┐
    │  开始    │
    └────┬─────┘
         │
         ▼
    ┌──────────────────┐
    │ 创建 Worktree    │
    │ ./git-worktree.sh│
    │   create <name>  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ 进入 Worktree    │
    │ cd ../.zcf/.../  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   开发功能        │
    │  - 编写代码       │
    │  - 运行测试       │
    │  - 代码检查       │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   提交更改        │
    │ git commit -m "" │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐     ┌──────────────┐
    │ 推送到远程        │────▶│ 创建 PR      │
    │ git push         │     │ gh pr create │
    └────────┬─────────┘     └──────────────┘
             │
             ▼
    ┌──────────────────┐
    │  代码审查         │
    │  - CI 检查        │
    │  - Review        │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  合并到 main      │
    │  (通过 PR)        │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  清理 Worktree    │
    │ ./git-worktree.sh│
    │   remove <name>  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────┐
    │   完成    │
    └──────────┘
```

---

## 📚 相关资源

- [Git Worktree 官方文档](https://git-scm.com/docs/git-worktree)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [项目 CLAUDE.md](../CLAUDE.md)

---

**文档版本**：1.0.0
**最后更新**：2025-12-26
**维护者**：Starship Commander Team
