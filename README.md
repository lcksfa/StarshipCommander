# 🚀 Starship Commander

> 一个游戏化的任务管理应用，让日常习惯养成变成一场星际冒险！

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![PNPM](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)

---

## 📖 项目简介

**Starship Commander** 是一款现代化的全栈游戏化任务管理应用，专为儿童和童心未泯的成年人设计。通过科幻主题的视觉设计和游戏化的奖励机制，将日常任务、学习、健康习惯等转化为令人兴奋的星际冒险！

### ✨ 核心特性

- **🎮 游戏化体验**：通过 XP（经验值）、等级系统、成就徽章和连击奖励，让任务完成充满乐趣
- **🌍 多语言支持**：内置中英文双语，可轻松扩展更多语言
- **📱 跨平台应用**：Web 端 + Android 移动端（基于 Capacitor）
- **🔒 类型安全**：端到端类型安全（tRPC），开发体验极佳
- **⚡ 现代化技术栈**：React 19 + NestJS + TypeScript + Prisma
- **🎨 精美 UI 设计**：科幻主题界面，配合动画效果和交互反馈

---

## 🛠️ 技术栈

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [React](https://react.dev/) | 19.2.3 | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.3 | 类型系统 |
| [Vite](https://vitejs.dev/) | 7.3.0 | 构建工具 |
| [TanStack Query](https://tanstack.com/query) | 5.90.12 | 服务端状态管理 |
| [Lucide React](https://lucide.dev/) | 0.562.0 | 图标库 |
| [Tailwind CSS](https://tailwindcss.com/) | - | 样式框架 |
| [tRPC](https://trpc.io/) | 11.8.1 | 类型安全的 RPC |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [NestJS](https://docs.nestjs.com/) | 11.1.9 | 企业级 Node.js 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.3 | 类型系统 |
| [tRPC](https://trpc.io/) | 11.8.1 | 类型安全的 RPC |
| [Prisma](https://www.prisma.io/) | 6.2.0 | 数据库 ORM |
| [SQLite](https://www.sqlite.org/) | - | 轻量级数据库 |
| [Express](https://expressjs.com/) | - | HTTP 服务器 |

### 测试与质量工具

| 工具 | 版本 | 用途 |
|------|------|------|
| [Jest](https://jestjs.io/) | 30.2.0 | 单元测试 |
| [Playwright](https://playwright.dev/) | 1.57.0 | 端到端测试 |
| [ESLint](https://eslint.org/) | 9.39.2 | 代码检查 |
| [Prettier](https://prettier.io/) | 3.7.4 | 代码格式化 |

---

## 🎯 功能模块

### 任务系统
- ✅ 多类别任务（学习、健康、家务、创意）
- 📅 每日任务与一次性任务
- 🎯 难度分级（简单、中等、困难）
- ⏰ 任务冷却时间和连续完成追踪

### 成长系统
- 📊 等级与经验值（XP）系统
- 💰 虚拟货币奖励
- 🔥 连击系统（Streak）
- 🏆 成就解锁（稀有度：普通、稀有、史诗、传说）

### 用户系统
- 👤 用户注册与登录
- 🔐 JWT 认证与会话管理
- 📈 个人统计面板
- ⚙️ 偏好设置（语言等）

### 移动端
- 📲 Android 原生应用
- 🔄 Capacitor 跨平台集成
- 📱 移动端优化的 UI

---

## 🚀 快速开始

### 前置要求

确保你的开发环境已安装以下工具：

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0（推荐使用最新版本）

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd StarshipCommander

# 安装所有依赖
pnpm install
```

### 环境配置

创建 `.env` 文件（根目录）：

```env
# Database / 数据库
DATABASE_URL="file:./dev.db"

# Server / 服务器
PORT=3001
FRONTEND_URL="http://localhost:5173"

# JWT / JWT 密钥
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Node Environment / Node 环境
NODE_ENV="development"
```

### 数据库初始化

```bash
# 生成 Prisma Client
pnpm prisma:generate

# 推送数据库 Schema（开发环境）
pnpm prisma:push

# 运行种子数据（可选）
pnpm prisma:seed

# 打开 Prisma Studio（数据库可视化工具）
pnpm prisma:studio
```

### 启动开发服务器

#### 方式一：同时启动前后端（推荐）

```bash
pnpm dev:all
```

- 前端：http://localhost:5173
- 后端：http://localhost:3001

#### 方式二：分别启动

```bash
# 终端 1 - 启动前端
pnpm dev

# 终端 2 - 启动后端
pnpm dev:backend
```

---

## 📚 开发指南

### 项目结构

```
StarshipCommander/
├── src/
│   ├── frontend/                 # 前端应用（React）
│   │   ├── components/           # React 组件
│   │   ├── contexts/            # Context（语言、主题）
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── lib/                 # 客户端工具（tRPC、API）
│   │   ├── types.ts             # 前端类型定义
│   │   └── App.tsx              # 应用入口
│   │
│   ├── backend/                  # 后端应用（NestJS）
│   │   ├── main.ts              # 后端入口
│   │   ├── app.module.ts        # NestJS 主模块
│   │   ├── modules/             # 业务模块
│   │   ├── services/            # 业务服务层
│   │   ├── database/            # 数据库配置
│   │   └── trpc/                # tRPC 配置
│   │
│   ├── types/                   # 共享类型定义
│   └── shared/                  # 共享工具
│
├── prisma/                      # 数据库
│   ├── schema.prisma            # 数据库模式
│   ├── migrations/              # 迁移文件
│   └── seed.ts                  # 种子数据
│
├── tests/
│   └── e2e/                     # 端到端测试（Playwright）
│
├── config/                      # 配置文件
│   ├── .prettierrc              # Prettier 配置
│   └── jest.*.config.js         # Jest 配置
│
├── eslint.config.js             # ESLint 配置
├── tsconfig.json                # TypeScript 配置
├── vite.config.ts               # Vite 配置
└── package.json                 # 项目依赖
```

### 代码规范

#### TypeScript 规范
- 使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型、交叉类型
- 避免使用 `any`，优先使用 `unknown`
- 导出类型使用 `export` 关键字

#### React 组件规范
- 使用函数组件 + TypeScript 接口
- 自定义 Hook 命名以 `use` 开头
- 遵循单一职责原则

#### 注释语言规范
- 简短注释使用中文
- 复杂逻辑或面向外部文档的注释使用中英文双语
- 保持与现有代码库一致的语言风格

**示例：**
```typescript
// 获取所有任务的自定义 Hook
export function useAllMissions(filters?: FilterOptions) {
  // ...
}

/**
 * 完成任务的自定义 Hook
 * Custom hook for completing missions
 */
export function useCompleteMission() {
  // ...
}
```

### 常用开发命令

#### 数据库操作

```bash
# 生成 Prisma Client
pnpm prisma:generate

# 推送 schema 到数据库（开发环境）
pnpm prisma:push

# 创建迁移
pnpm prisma:migrate

# 打开 Prisma Studio（数据库 GUI）
pnpm prisma:studio

# 重置数据库
pnpm db:reset

# 运行种子数据
pnpm prisma:seed
```

#### 代码质量

```bash
# 修复所有 ESLint 问题
pnpm lint

# 仅前端 lint
pnpm lint:frontend

# 仅后端 lint
pnpm lint:backend

# 格式化代码
pnpm format

# 检查格式（不修改）
pnpm format:check

# 类型检查
pnpm typecheck

# 后端类型检查
pnpm typecheck:backend
```

#### 端口清理

```bash
# 清理所有端口
pnpm ports:clean:all

# 清理特定端口
pnpm ports:clean:frontend  # 3000
pnpm ports:clean:backend   # 3001
```

---

## 🧪 测试

### 单元测试

```bash
# 运行所有测试
pnpm test

# 监视模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:cov

# 仅测试后端
pnpm test:backend
```

### 端到端测试（E2E）

```bash
# 运行 Playwright 测试
pnpm test:e2e:playwright

# Playwright UI 模式
pnpm test:e2e:playwright:ui

# Playwright 调试模式
pnpm test:e2e:playwright:debug
```

---

## 🏗️ 构建与部署

### 构建生产版本

```bash
# 构建前后端
pnpm build:all

# 仅构建前端
pnpm build

# 仅构建后端
pnpm build:backend
```

### 启动生产服务器

```bash
# 构建并启动生产服务器
pnpm start:prod

# 或手动启动后端
pnpm start:backend
```

### Android 移动端构建

```bash
# 构建并同步到 Android
pnpm android:build

# 在开发模式下运行 Android 应用
pnpm android:dev

# 构建 Android Release 版本
pnpm android:release
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

### 1. Fork 项目

点击页面右上角的 Fork 按钮

### 2. 创建特性分支

```bash
git checkout -b feature/AmazingFeature
```

### 3. 提交更改

```bash
git commit -m 'feat: Add some AmazingFeature'
```

### 4. 推送到分支

```bash
git push origin feature/AmazingFeature
```

### 5. 开启 Pull Request

访问 GitHub 页面，点击 "Compare & pull request" 按钮

### 代码审查清单

在提交 PR 前，请确保：
- [ ] 代码通过 ESLint 检查（`pnpm lint`）
- [ ] 代码通过 Prettier 格式化（`pnpm format`）
- [ ] 代码通过 TypeScript 类型检查（`pnpm typecheck`）
- [ ] 添加必要的测试用例
- [ ] 所有测试通过（`pnpm test`）
- [ ] 添加必要的注释（中英文双语）
- [ ] 更新相关文档

---

## 📝 开发最佳实践

### 类型安全优先

- 始终使用 TypeScript 类型
- 利用 tRPC 的端到端类型安全
- 在 `src/types/` 中定义共享类型

### 错误处理

- 使用统一的错误处理模式
- 提供有意义的错误消息
- 前端：使用 Toast 通知（sonner）
- 后端：使用 NestJS 内置异常处理

### 性能优化

#### 前端
- 使用 React Query 缓存
- 实施代码分割（lazy loading）
- 使用 `React.memo`、`useMemo`、`useCallback` 优化渲染

#### 后端
- 优化 Prisma 查询（只选择需要的字段）
- 使用批量操作
- 实施合理的缓存策略

---

## 📖 API 文档

项目使用 tRPC 进行类型安全的 API 通信。详细的 API 文档请查看：

- [后端路由定义](./src/backend/trpc/)
- [前端客户端配置](./src/frontend/lib/trpc.ts)

### 主要 API 端点

#### 任务相关
- `missions.getAll` - 获取所有任务
- `missions.getById` - 获取单个任务详情
- `missions.create` - 创建新任务
- `missions.complete` - 完成任务
- `missions.delete` - 删除任务

#### 用户相关
- `users.register` - 用户注册
- `users.login` - 用户登录
- `users.getStats` - 获取用户统计
- `users.updateProfile` - 更新用户资料

---

## 🔧 故障排除

### 常见问题

#### 1. 端口被占用

```bash
# 清理所有端口
pnpm ports:clean:all

# 或手动清理特定端口
pnpm ports:clean:frontend
pnpm ports:clean:backend
```

#### 2. 数据库连接错误

```bash
# 重新生成 Prisma Client
pnpm prisma:generate

# 重新推送数据库 Schema
pnpm prisma:push
```

#### 3. 依赖安装问题

```bash
# 清理并重新安装依赖
pnpm run clean:full
pnpm install
```

---

## 🌟 项目亮点

### 架构设计
- ✅ **Monorepo 架构**：前后端代码统一管理，类型共享
- ✅ **类型安全**：端到端 TypeScript 类型检查
- ✅ **模块化设计**：清晰的业务模块划分
- ✅ **可扩展性**：易于添加新功能和模块

### 开发体验
- ✅ **热重载**：前后端都支持热重载
- ✅ **代码规范**：统一的 ESLint 和 Prettier 配置
- ✅ **测试覆盖**：完整的单元测试和 E2E 测试
- ✅ **文档完善**：详细的代码注释和开发文档

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

## 👥 作者与致谢

- **项目维护者**：Starship Commander Team
- **技术栈**：React, NestJS, tRPC, Prisma, TypeScript

---

## 🔗 相关资源

- [NestJS 文档](https://docs.nestjs.com/)
- [tRPC 文档](https://trpc.io/docs/)
- [Prisma 文档](https://www.prisma.io/docs/)
- [React 文档](https://react.dev/)
- [TanStack Query 文档](https://tanstack.com/query/latest)
- [Capacitor 文档](https://capacitorjs.com/)

---

## 📞 联系我们

- **问题反馈**：请提交 [Issue](https://github.com/your-repo/issues)
- **功能建议**：请提交 [Pull Request](https://github.com/your-repo/pulls)
- **邮件联系**：your-email@example.com

---

<div align="center">

**Made with ❤️ by Starship Commander Team**

[⬆ 返回顶部](#-starship-commander)

</div>
