# Git Worktree 使用示例
# Git Worktree Usage Examples

> 实际场景演示，帮助你快速掌握 Git Worktree 的使用

---

## 📖 目录

- [示例 1：简单的功能开发](#示例-1简单的功能开发)
- [示例 2：紧急 Bug 修复](#示例-2紧急-bug-修复)
- [示例 3：并行开发多个功能](#示例-3并行开发多个功能)
- [示例 4：代码审查工作流](#示例-4代码审查工作流)
- [示例 5：大型功能分阶段开发](#示例-5大型功能分阶段开发)

---

## 🎯 示例 1：简单的功能开发

### 场景

你需要为应用添加一个新的用户设置页面。

### 步骤

#### 1. 创建 Worktree

```bash
# 在主仓库目录
cd /Users/lizhao/workspace/hulus/StarshipCommander

# 创建新的功能分支
pnpm worktree:create feature/user-settings-page

# 输出：
# [INFO] Creating new branch: feature/user-settings-page
# [INFO] Installing dependencies in worktree...
# [SUCCESS] Worktree created successfully!
#
# Worktree path: /Users/lizhao/.zcf/StarshipCommander/feature/user-settings-page
# Branch: feature/user-settings-page
#
# To start developing:
#   cd /Users/lizhao/.zcf/StarshipCommander/feature/user-settings-page
#   pnpm dev:all
```

#### 2. 开始开发

```bash
# 进入 worktree
cd /Users/lizhao/.zcf/StarshipCommander/feature/user-settings-page

# 确认当前分支
git branch
# * feature/user-settings-page

# 启动开发服务器（使用不同端口）
PORT=5174 BACKEND_PORT=3002 pnpm dev:all

# 输出：
#   VITE v7.3.0  ready in 250 ms
#
#   ➜  Local:   http://localhost:5174/
#   ➜  Network: use --host to expose
#
#   Backend server running on http://localhost:3002
```

#### 3. 编写代码

```bash
# 创建新的组件文件
mkdir -p src/frontend/components/settings

# 添加文件：src/frontend/components/settings/UserSettings.tsx
cat > src/frontend/components/settings/UserSettings.tsx << 'EOF'
import React from 'react';
import { useLanguage } from '@contexts/LanguageContext';

const UserSettings: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t.settings_title}</h1>
      {/* Settings form */}
    </div>
  );
};

export default UserSettings;
EOF

# 添加路由
# 修改 src/frontend/App.tsx
# ... 添加设置页面路由 ...
```

#### 4. 测试更改

```bash
# 在另一个终端运行测试
cd /Users/lizhao/.zcf/StarshipCommander/feature/user-settings-page

pnpm test

# 输出：
# PASS  src/frontend/components/settings/UserSettings.test.tsx
#   ✓ renders correctly (5 ms)
#
# Test Suites: 1 passed, 1 total
```

#### 5. 提交更改

```bash
# 查看更改
git status

# 输出：
# modified:   src/frontend/App.tsx
# new file:   src/frontend/components/settings/UserSettings.tsx

# 提交
git add src/frontend/components/settings/UserSettings.tsx
git add src/frontend/App.tsx

git commit -m "feat(settings): add user settings page

- Create UserSettings component with language support
- Add settings route to main navigation
- Implement responsive layout

Closes #456"

# 输出：
# [feature/user-settings-page 7a8b9c0] feat(settings): add user settings page
#  2 files changed, 45 insertions(+)
```

#### 6. 推送并创建 PR

```bash
# 推送到远程
git push -u origin feature/user-settings-page

# 使用 GitHub CLI 创建 PR
gh pr create \
  --title "feat: Add User Settings Page" \
  --body "## 概述
添加用户设置页面，支持语言和主题切换。

## 更改
- 新增 UserSettings 组件
- 添加路由配置
- 实现响应式布局

## 测试
- [x] 单元测试通过
- [x] 手动测试完成
- [x] 代码审查通过

Closes #456"
```

#### 7. 清理 Worktree

```bash
# PR 合并后，返回主仓库
cd /Users/lizhao/workspace/hulus/StarshipCommander

# 拉取最新更改
git pull

# 删除 worktree
pnpm worktree:remove feature/user-settings-page

# 确认删除
# [WARNING] There are uncommitted changes in this worktree
# Continue anyway? (y/N) y
# [SUCCESS] Worktree removed successfully!
```

---

## 🚨 示例 2：紧急 Bug 修复

### 场景

你正在开发一个新功能，突然收到紧急 Bug 报告需要立即修复。

### 步骤

#### 1. 当前状态

```bash
# 你正在开发功能 A
cd /Users/lizhao/workspace/hulus/StarshipCommander
git branch
# * feature/new-payment-system
#   main

# 有未提交的更改
git status
# modified:   src/frontend/components/PaymentForm.tsx
```

#### 2. 创建 Hotfix Worktree

```bash
# 不需要提交或暂存当前更改！
# 直接创建 hotfix worktree
pnpm worktree:create hotfix/login-crash

# 输出：
# [INFO] Creating new branch: hotfix/login-crash
# [SUCCESS] Worktree created successfully!
```

#### 3. 修复 Bug

```bash
# 进入 hotfix worktree
cd /Users/lizhao/.zcf/StarshipCommander/hotfix/login-crash

# 查看问题（假设在 LoginButton.tsx 中）
# 问题：未处理的空指针导致崩溃
```

```typescript
// 修复前：src/frontend/components/LoginButton.tsx
const handleClick = () => {
  const user = authService.login(); // 可能返回 null
  setUser(user.name); // ❌ 崩溃！
};

// 修复后：
const handleClick = () => {
  const user = authService.login();
  if (!user) { // ✅ 添加空检查
    setError('Login failed');
    return;
  }
  setUser(user.name);
};
```

```bash
# 测试修复
pnpm test
# Test Suites: 1 passed, 1 total

# 提交修复
git add src/frontend/components/LoginButton.tsx
git commit -m "hotfix: fix login crash on null user response

Add null check after authentication to prevent crash.
Fixes #789"

# 立即推送
git push -u origin hotfix/login-crash
```

#### 4. 创建紧急 PR

```bash
# 创建并标记为紧急
gh pr create \
  --title "🔥 HOTFIX: Fix Login Crash" \
  --body "## 紧急修复
修复登录功能在特定情况下的崩溃问题。

**影响**: 用户无法登录
**优先级**: 🔥 紧急
**测试**: 已验证

Fixes #789" \
  --label "hotfix,urgent"
```

#### 5. 合并后清理

```bash
# PR 快速合并后
cd /Users/lizhao/workspace/hulus/StarshipCommander
git pull

# 清理 hotfix worktree
pnpm worktree:remove hotfix/login-crash

# 返回原来的工作
git status
# modified:   src/frontend/components/PaymentForm.tsx
# ✅ 你的更改完好无损！
```

---

## 🔄 示例 3：并行开发多个功能

### 场景

你需要同时开发三个独立的功能，它们互不依赖。

### 步骤

#### 1. 创建三个 Worktree

```bash
cd /Users/lizhao/workspace/hulus/StarshipCommander

# Worktree 1: 用户认证
pnpm worktree:create feature/user-authentication

# Worktree 2: 管理面板
pnpm worktree:create feature/admin-panel

# Worktree 3: 通知系统
pnpm worktree:create feature/notification-system
```

#### 2. 查看所有 Worktree

```bash
pnpm worktree:list

# 输出：
# [INFO] Active worktrees / 活动的 worktree：
#
# /Users/lizhao/workspace/hulus/StarshipCommander                    4034b7b [main]
# /Users/lizhao/.zcf/StarshipCommander/feature/user-authentication   7a8b9c0 [feature/user-authentication]
# /Users/lizhao/.zcf/StarshipCommander/feature/admin-panel          3d4e5f6 [feature/admin-panel]
# /Users/lizhao/.zcf/StarshipCommander/feature/notification-system  1a2b3c4 [feature/notification-system]
```

#### 3. 同时开发

```bash
# 终端 1: 用户认证（端口 5174, 3002）
cd /Users/lizhao/.zcf/StarshipCommander/feature/user-authentication
PORT=5174 BACKEND_PORT=3002 pnpm dev:all

# 终端 2: 管理面板（端口 5175, 3003）
cd /Users/lizhao/.zcf/StarshipCommander/feature/admin-panel
PORT=5175 BACKEND_PORT=3003 pnpm dev:all

# 终端 3: 通知系统（端口 5176, 3004）
cd /Users/lizhao/.zcf/StarshipCommander/feature/notification-system
PORT=5176 BACKEND_PORT=3004 pnpm dev:all

# 浏览器打开三个标签页：
# http://localhost:5174 - 用户认证
# http://localhost:5175 - 管理面板
# http://localhost:5176 - 通知系统
```

#### 4. 在 VS Code 中打开多个窗口

```bash
# 使用命令行或通过 VS Code UI
code /Users/lizhao/.zcf/StarshipCommander/feature/user-authentication
code /Users/lizhao/.zcf/StarshipCommander/feature/admin-panel
code /Users/lizhao/.zcf/StarshipCommander/feature/notification-system

# 现在你有 4 个 VS Code 窗口：
# 1. 主仓库（main）
# 2. 用户认证
# 3. 管理面板
# 4. 通知系统
```

#### 5. 独立提交

```bash
# 在认证 worktree 中
cd /Users/lizhao/.zcf/StarshipCommander/feature/user-authentication
git add .
git commit -m "feat(auth): implement OAuth2 login"
git push -u origin feature/user-authentication

# 在管理面板 worktree 中
cd /Users/lizhao/.zcf/StarshipCommander/feature/admin-panel
git add .
git commit -m "feat(admin): create dashboard with metrics"
git push -u origin feature/admin-panel

# 在通知系统 worktree 中
cd /Users/lizhao/.zcf/StarshipCommander/feature/notification-system
git add .
git commit -m "feat(notif): add real-time notifications"
git push -u origin feature/notification-system
```

#### 6. 按顺序合并

```bash
# 认证系统完成后先合并
cd /Users/lizhao/workspace/hulus/StarshipCommander
git checkout main
git pull
git merge feature/user-authentication
git push

# 然后管理面板
git merge feature/admin-panel
git push

# 最后通知系统
git merge feature/notification-system
git push

# 清理所有 worktree
pnpm worktree:remove feature/user-authentication
pnpm worktree:remove feature/admin-panel
pnpm worktree:remove feature/notification-system
```

---

## 👀 示例 4：代码审查工作流

### 场景

团队成员提交了 PR，你需要详细审查代码。

### 步骤

#### 1. 查看需要审查的 PR

```bash
# 使用 GitHub CLI 列出 PR
gh pr list

# 输出：
# #123  feat: Add user profile page      feature/user-profile
# #124  fix: Resolve timeout issue       bugfix/api-timeout
# #125  refactor: Optimize database      refactor/db-optimization
```

#### 2. 为每个 PR 创建 Worktree

```bash
# PR #123: 用户功能页面
pnpm worktree:create review/pr-123-user-profile
cd /Users/lizhao/.zcf/StarshipCommander/review/pr-123-user-profile
git checkout origin/feature/user-profile -b pr-123-review

# PR #124: 超时问题修复
pnpm worktree:create review/pr-124-timeout-fix
cd /Users/lizhao/.zcf/StarshipCommander/review/pr-124-timeout-fix
git checkout origin/bugfix/api-timeout -b pr-124-review
```

#### 3. 并排审查

```bash
# 打开两个 VS Code 窗口对比
code /Users/lizhao/workspace/hulus/StarshipCommander           # main 分支
code /Users/lizhao/.zcf/StarshipCommander/review/pr-123-review  # PR 分支

# 在 VS Code 中并排查看：
# 左侧：main 分支（原始代码）
# 右侧：PR 分支（修改后代码）
```

#### 4. 本地测试

```bash
# 在 review worktree 中测试
cd /Users/lizhao/.zcf/StarshipCommander/review/pr-123-review

# 安装依赖（如果需要）
pnpm install

# 运行测试
pnpm test

# 启动应用查看效果
PORT=5174 pnpm dev:all

# 在浏览器中测试：
# http://localhost:5174
```

#### 5. 添加审查评论

```bash
# 如果发现问题，可以创建 review worktree 进行修复
pnpm worktree:create fix/pr-123-feedback

# 在修复 worktree 中...
# ... 修复问题 ...
# ... 推送到新分支 ...
# ... 在 PR 中评论："我创建了一个修复分支，请查看..."
```

#### 6. 批准或请求更改

```bash
# 批准 PR
gh pr review 123 --approve --body "LGTM! 测试通过，代码质量良好。"

# 或请求更改
gh pr review 123 --request-changes --body "请在提交前添加单元测试。"

# 审查完成后清理
pnpm worktree:remove review/pr-123-user-profile
```

---

## 🏗️ 示例 5：大型功能分阶段开发

### 场景

开发一个复杂的多阶段功能，每个阶段可以独立完成和测试。

### 功能：用户系统升级

**阶段**：
1. 数据库模型更新
2. API 接口开发
3. 前端组件开发
4. 集成测试

### 步骤

#### 阶段 1：数据库模型

```bash
pnpm worktree:create feature/user-system-db-migration
cd /Users/lizhao/.zcf/StarshipCommander/feature/user-system-db-migration

# 修改 Prisma schema
cat > prisma/schema.prisma << 'EOF'
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Profile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  bio       String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
EOF

# 创建迁移
pnpm prisma:migrate

# 测试迁移
pnpm prisma:studio

# 提交
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): add user and profile models

- Create User model with email and username
- Create Profile model with one-to-one relationship
- Add migration scripts

Stage 1/4: Database models"
git push
```

#### 阶段 2：API 接口

```bash
# 基于 stage 1 创建新分支
pnpm worktree:create feature/user-system-api
cd /Users/lizhao/.zcf/StarshipCommander/feature/user-system-api

# 确保基于 stage 1
git merge feature/user-system-db-migration

# 创建 API 服务
mkdir -p src/backend/modules/user

# ... 实现 CRUD API ...
# ... 实现 tRPC 路由 ...

# 提交
git commit -m "feat(api): implement user CRUD operations

- Add UserService with create, read, update, delete
- Create tRPC router for user operations
- Add input validation with Zod

Stage 2/4: API layer"
git push
```

#### 阶段 3：前端组件

```bash
pnpm worktree:create feature/user-system-frontend
cd /Users/lizhao/.zcf/StarshipCommander/feature/user-system-frontend

git merge feature/user-system-api

# 创建前端组件
mkdir -p src/frontend/components/user

# ... 实现用户列表组件 ...
# ... 实现用户详情组件 ...
# ... 实现编辑表单 ...

# 提交
git commit -m "feat(ui): add user management components

- Create UserList component with filtering
- Create UserProfile component for details
- Create UserEditForm for updates
- Add routing and navigation

Stage 3/4: Frontend components"
git push
```

#### 阶段 4：集成测试

```bash
pnpm worktree:create feature/user-system-e2e
cd /Users/lizhao/.zcf/StarshipCommander/feature/user-system-e2e

git merge feature/user-system-frontend

# 编写 E2E 测试
cat > tests/e2e/user-system.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test.describe('User System', () => {
  test('should create a new user', async ({ page }) => {
    await page.goto('/users');
    await page.click('button:has-text("Add User")');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="username"]', 'testuser');
    await page.click('button:has-text("Create")');
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });

  test('should edit user profile', async ({ page }) => {
    // ...
  });
});
EOF

# 运行测试
pnpm test:e2e:playwright

# 提交
git commit -m "test(e2e): add comprehensive user system tests

- Test user creation flow
- Test user profile editing
- Test user deletion with confirmation
- Test error handling

Stage 4/4: E2E testing"
git push
```

#### 最终合并

```bash
# 所有阶段完成后，顺序合并到 main
cd /Users/lizhao/workspace/hulus/StarshipCommander

git checkout main
git pull

git merge feature/user-system-db-migration
git merge feature/user-system-api
git merge feature/user-system-frontend
git merge feature/user-system-e2e

# 运行完整测试套件
pnpm test
pnpm test:e2e:playwright

# 推送
git push origin main

# 清理所有 worktree
pnpm worktree:remove feature/user-system-db-migration
pnpm worktree:remove feature/user-system-api
pnpm worktree:remove feature/user-system-frontend
pnpm worktree:remove feature/user-system-e2e
```

---

## 📊 总结对比

| 场景 | 使用 Worktree 的优势 |
|-----|---------------------|
| 简单功能开发 | 独立环境，不影响主分支 |
| 紧急 Bug 修复 | 无需暂存或提交当前工作 |
| 并行开发 | 同时开发多个功能，提高效率 |
| 代码审查 | 并排对比，本地测试 |
| 分阶段开发 | 每个阶段独立测试和审查 |

---

**相关文档**：
- [完整流程指南](./GIT_WORKTREE_WORKFLOW.md)
- [快速参考](./GIT_WORKTREE_QUICKREF.md)
