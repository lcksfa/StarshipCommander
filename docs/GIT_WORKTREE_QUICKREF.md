# Git Worktree 快速参考卡片
# Git Worktree Quick Reference Card

> 🚀 快速上手 Git Worktree，30 秒开始并行开发！

---

## 📌 基础命令速查

### 创建 Worktree

```bash
# 使用 pnpm 命令（推荐）
pnpm worktree:create feature/add-user-profile

# 或使用脚本
./scripts/git-worktree.sh create feature/add-user-profile

# 或使用原生 Git
git worktree add -b feature/add-user-profile ../.zcf/StarshipCommander/feature/add-user-profile main
```

### 查看所有 Worktree

```bash
pnpm worktree:list
# 或
./scripts/git-worktree.sh list
# 或
git worktree list
```

### 删除 Worktree

```bash
pnpm worktree:remove feature/add-user-profile
# 或
./scripts/git-worktree.sh remove feature/add-user-profile
```

### 清理无效 Worktree

```bash
pnpm worktree:prune
```

---

## 🎯 分支命名规范

```
<类型>/<简短描述>

类型：
  feature/    - 新功能
  bugfix/     - Bug 修复
  hotfix/     - 紧急修复
  refactor/   - 代码重构
  test/       - 测试相关
  docs/       - 文档更新

示例：
  feature/user-profile-page
  bugfix/login-timeout
  hotfix/security-patch
  refactor/optimize-api
  test/add-e2e-tests
  docs/update-readme
```

---

## ⚡ 典型工作流

```
1. 创建 worktree
   pnpm worktree:create feature/new-feature

2. 进入 worktree
   cd ../.zcf/StarshipCommander/feature/new-feature

3. 开发
   pnpm dev:all
   # ... 编写代码 ...

4. 提交
   git add .
   git commit -m "feat: add new feature"

5. 推送并创建 PR
   git push -u origin feature/new-feature
   gh pr create

6. 合并后清理
   cd /Users/lizhao/workspace/hulus/StarshipCommander
   pnpm worktree:remove feature/new-feature
```

---

## 🔥 常用场景

### 场景 1：紧急修复 Bug

```bash
# 当前正在开发功能 A
# 突然需要紧急修复 Bug

# 创建 bugfix worktree
pnpm worktree:create hotfix/critical-bug

# 快速修复...
cd ../.zcf/StarshipCommander/hotfix/critical-bug
# ... 修复代码 ...
git commit -m "hotfix: fix critical bug"
git push

# 修复完成后继续原来的工作
cd /Users/lizhao/workspace/hulus/StarshipCommander
# 功能 A 的代码完好无损！
```

### 场景 2：代码审查

```bash
# 同时打开 PR 的原始分支和修改后的分支

# Worktree 1：原始分支
cd ../.zcf/StarshipCommander/feature/original-branch
code .

# Worktree 2：修改后的分支
cd ../.zcf/StarshipCommander/feature/modified-branch
code .

# 在两个 VS Code 窗口中并排对比
```

### 场景 3：并行开发

```bash
# Worktree 1：功能 A
../.zcf/StarshipCommander/feature/user-auth/     (port 5174)

# Worktree 2：功能 B
../.zcf/StarshipCommander/feature/admin-panel/   (port 5175)

# 主仓库：主分支
/Users/lizhao/workspace/hulus/StarshipCommander  (port 3000)

# 三个终端，三个服务实例，同时运行！
```

---

## 💡 提示与技巧

### 端口管理

```bash
# 主仓库
pnpm dev:all  # 前端 :3000, 后端 :3001

# Worktree（使用不同端口）
PORT=5174 BACKEND_PORT=3002 pnpm dev:all
```

### 快速切换目录

添加到 `~/.zshrc` 或 `~/.bashrc`：

```bash
# Worktree 快速切换函数
wt() {
    cd "$HOME/../.zcf/StarshipCommander/$1"
}

# 使用
wt feature/user-authentication
wt bugfix/login-fix
```

### VS Code 集成

```bash
# 打开主仓库
code /Users/lizhao/workspace/hulus/StarshipCommander

# 打开 worktree
code /Users/lizhao/.zcf/StarshipCommander/feature/my-feature
```

---

## ⚠️ 注意事项

### ✅ DO - 推荐做法

- ✅ 遵循分支命名规范
- ✅ 每个 worktree 专注一个功能
- ✅ 完成后及时清理 worktree
- ✅ 提交前运行测试
- ✅ 使用有意义的提交信息

### ❌ DON'T - 避免做法

- ❌ 在 worktree 中切换分支
- ❌ 创建太多 worktree（建议不超过 3 个）
- ❌ 忘记提交就删除 worktree
- ❌ 在不同 worktree 使用相同端口
- ❌ 提交敏感信息

---

## 📁 目录结构

```
~/
└── lizhao/
    └── workspace/
        └── StarshipCommander/              # 主仓库 (main)
            ├── src/
            ├── scripts/
            └── ...
    └── .zcf/
        └── StarshipCommander/              # Worktree 基础目录
            ├── feature/user-auth/          # Worktree 1
            ├── bugfix/login-fix/           # Worktree 2
            └── refactor/optimize-api/      # Worktree 3
```

---

## 🆘 故障排除

### Worktree 无法删除

```bash
# 方法 1：使用脚本强制删除
./scripts/git-worktree.sh remove feature/name

# 方法 2：手动清理
git worktree prune
rm -rf ../.zcf/StarshipCommander/feature/name
```

### 端口被占用

```bash
# 清理端口
pnpm ports:clean:all

# 或使用其他端口
PORT=5174 pnpm dev
```

### 依赖问题

```bash
# 在 worktree 中重新安装依赖
cd ../.zcf/StarshipCommander/feature/my-feature
pnpm install
```

---

## 📚 更多信息

完整文档：[docs/GIT_WORKTREE_WORKFLOW.md](./GIT_WORKTREE_WORKFLOW.md)

---

**版本**：1.0.0
**更新时间**：2025-12-26
