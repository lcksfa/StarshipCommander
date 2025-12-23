# Starship Commander - AI 开发指南

> **项目定位**：现代化的全栈游戏化任务管理应用，采用科幻主题设计，面向儿童及童心未泯的成年人。

---

## 📋 项目概览

### 核心架构
- **架构模式**：Monorepo 全栈应用（前后端分离）
- **通信协议**：tRPC（端到端类型安全的 RPC）
- **数据库**：SQLite + Prisma ORM
- **包管理器**：pnpm

### 技术栈

#### 前端技术栈
```
React 19.2.3          # UI 框架
TypeScript 5.9.3      # 类型系统
Vite 7.3.0            # 构建工具
TanStack Query        # 服务端状态管理
Lucide React          # 图标库
Tailwind CSS          # 样式框架
```

#### 后端技术栈
```
NestJS 11.1.9         # 企业级 Node.js 框架
TypeScript 5.9.3      # 类型系统
tRPC 11.8.1           # 类型安全的 RPC 框架
Prisma 6.2.0          # 数据库 ORM
SQLite                # 轻量级数据库
Express               # HTTP 服务器
```

#### 测试与质量
```
Jest 30.2.0           # 单元测试
Playwright 1.57.0     # 端到端测试
ESLint 9.39.2         # 代码检查
Prettier 3.7.4        # 代码格式化
```

---

## 📁 目录结构规范

```
StarshipCommander/
├── src/
│   ├── frontend/                 # 前端应用
│   │   ├── components/           # React 组件
│   │   ├── contexts/            # React Context（语言、主题）
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── lib/                 # 客户端工具库（tRPC、API）
│   │   ├── types.ts             # 前端类型定义
│   │   └── App.tsx              # 应用入口
│   │
│   ├── backend/                  # 后端应用
│   │   ├── main.ts              # 后端入口
│   │   ├── app.module.ts        # NestJS 主模块
│   │   ├── modules/             # 业务模块
│   │   │   └── mission/         # 任务模块示例
│   │   ├── services/            # 业务服务层
│   │   ├── database/            # 数据库配置
│   │   └── trpc/                # tRPC 配置
│   │
│   ├── types/                   # 共享类型定义
│   │   └── types.ts             # 前后端通用类型
│   │
│   └── shared/                  # 共享工具
│       ├── type-mappers.ts      # 类型转换工具
│       └── index.ts
│
├── prisma/                      # 数据库
│   ├── schema.prisma            # 数据库模式
│   └── migrations/              # 迁移文件
│
├── tests/
│   └── e2e/                     # 端到端测试
│
├── config/                      # 配置文件
│   └── .prettierrc              # Prettier 配置
│
├── eslint.config.js             # ESLint 配置
├── tsconfig.json                # TypeScript 配置
├── vite.config.ts               # Vite 配置
└── package.json                 # 项目依赖
```

---

## 🎯 代码规范

### 1. 注释语言规范

**必须遵循中英文双语注释原则**：
- 简短注释使用中文
- 复杂逻辑或面向外部文档的注释使用中英文双语
- 保持与现有代码库一致的语言风格

**示例**：
```typescript
// 获取所有任务的自定义 Hook
export function useAllMissions(filters?: {
  userId?: string; // 添加 userId 参数
  category?: "study" | "health" | "chore" | "creative";
  isDaily?: boolean;
  isActive?: boolean;
}) {
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

### 2. TypeScript 规范

#### 类型定义
- 优先使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型、交叉类型
- 导出类型使用 `export` 关键字

```typescript
// ✅ 推荐：使用 interface
export interface Mission {
  id: string;
  title: LocalizedText;
  xpReward: number;
}

// ✅ 推荐：使用 type 定义联合类型
export type MissionCategory = "study" | "health" | "chore" | "creative";

// ✅ 推荐：枚举使用大写
export enum Tab {
  MISSIONS = "MISSIONS",
  LOG = "LOG",
}
```

#### 类型导入
使用路径别名简化导入：
```typescript
// tsconfig.json 中已配置路径别名
import { Mission } from "@types/index";
import { useLanguage } from "@contexts/LanguageContext";
```

### 3. React 组件规范

#### 函数组件
```typescript
// ✅ 推荐：使用函数组件 + TypeScript 接口
interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 w-full p-4">
      {/* JSX 内容 */}
    </div>
  );
};

export default BottomNav;
```

#### 自定义 Hooks
```typescript
// ✅ 推荐：自定义 Hook 命名以 use 开头
export function useAllMissions(filters?: FilterOptions) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getAllMissions(filters);
      setMissions(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, [JSON.stringify(filters)]);

  return { missions, isLoading, error, refetch: fetchMissions };
}
```

### 4. NestJS 后端规范

#### 服务层模式
```typescript
@Injectable()
export class MissionService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * 创建新任务
   */
  async createMission(input: MissionCreateInput): Promise<Mission> {
    try {
      const dbMission = await this.prisma.mission.create({
        data: {
          title: input.title as any,
          description: input.description as any,
          xpReward: input.xpReward,
          // ...
        },
      });

      return this.mapDbMissionToFrontend(dbMission);
    } catch (error) {
      throw new ServiceError(
        `Failed to create mission: ${getErrorMessage(error)}`,
        "CREATE_MISSION_ERROR",
        400,
      );
    }
  }

  /**
   * 辅助方法：数据库对象转换为前端对象
   */
  private mapDbMissionToFrontend(dbMission: any): Mission {
    return {
      id: dbMission.id,
      title: dbMission.title,
      // ...
    };
  }
}
```

#### tRPC 路由器
```typescript
@Injectable()
export class MissionRouter {
  constructor(private readonly missionService: MissionService) {}

  /**
   * Zod 模式定义
   */
  private readonly schemas = {
    createMission: z.object({
      title: z.object({
        en: z.string().min(1),
        zh: z.string().min(1),
      }),
      xpReward: z.number().min(0).max(1000),
      // ...
    }),

    completeMission: z.object({
      missionId: z.string().min(1),
      userId: z.string().min(1),
    }),
  };

  /**
   * 获取 Mission 路由器
   */
  getRouter() {
    return router({
      createMission: procedure
        .input(this.schemas.createMission)
        .mutation(async ({ input }) => {
          try {
            const mission = await this.missionService.createMission(input);
            return {
              success: true,
              data: mission,
              message: "Mission created successfully",
            };
          } catch (error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Failed to create mission: ${getErrorMessage(error)}`,
            });
          }
        }),

      completeMission: procedure
        .input(this.schemas.completeMission)
        .mutation(async ({ input }) => {
          // ...
        }),
    });
  }
}
```

### 5. 样式规范（Prettier 配置）

```json
{
  "semi": true,              // 必须使用分号
  "trailingComma": "es5",    // ES5 尾随逗号
  "singleQuote": true,       // 使用单引号
  "printWidth": 80,          // 每行最大 80 字符
  "tabWidth": 2,             // 2 空格缩进
  "useTabs": false,          // 使用空格而非 Tab
  "bracketSpacing": true,    // 对象括号空格
  "arrowParens": "always",   // 箭头函数括号
  "endOfLine": "lf"          // LF 换行符
}
```

### 6. ESLint 规范

项目使用 ESLint 9.x 扁平配置，分为前端和后端规则：

#### 前端规则
```javascript
{
  files: ["src/frontend/**/*.{ts,tsx}", "src/shared/**/*.ts"],
  rules: {
    "no-console": "warn",                      // 警告 console 使用
    "prefer-const": "error",                   // 必须使用 const
    "no-var": "error",                         // 禁止 var
    "@typescript-eslint/no-unused-vars": "error",
  }
}
```

#### 后端规则
```javascript
{
  files: ["src/backend/**/*.ts"],
  rules: {
    "no-console": "off",                       // 允许 console
    "prefer-const": "error",
    "no-var": "error",
  }
}
```

---

## 🔧 开发工作流

### 启动开发环境

#### 同时启动前后端（推荐）
```bash
pnpm dev:all
```
- 前端：`http://localhost:5173`
- 后端：`http://localhost:3001`

#### 单独启动
```bash
# 前端开发服务器
pnpm dev

# 后端开发服务器（支持热重载）
pnpm dev:backend
```

### 数据库操作

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

### 测试

#### 单元测试
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

#### 端到端测试
```bash
# 运行 Playwright 测试
pnpm test:e2e:playwright

# Playwright UI 模式
pnpm test:e2e:playwright:ui

# Playwright 调试模式
pnpm test:e2e:playwright:debug
```

### 代码质量

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

### 构建与部署

```bash
# 构建前后端
pnpm build:all

# 仅构建前端
pnpm build

# 仅构建后端
pnpm build:backend

# 启动生产服务器
pnpm start:prod
```

### 端口清理

```bash
# 清理所有端口
pnpm ports:clean:all

# 清理特定端口
pnpm ports:clean:frontend  # 3000
pnpm ports:clean:backend   # 3001
```

---

## 🎨 架构模式与约定

### 1. 类型安全约定

#### 前后端类型共享
```typescript
// src/types/types.ts - 共享类型定义
export interface Mission {
  id: string;
  title: LocalizedText;
  xpReward: number;
  coinReward: number;
  isCompleted: boolean;
  category: MissionCategory;
}

// 前端和后端都导入此类型
import { Mission } from "@types/index";
```

#### 类型映射
```typescript
// src/shared/type-mappers.ts
export function mapFrontendToDbCategory(
  category: MissionCategory
): DbCategory {
  const mapping = {
    study: DbCategory.STUDY,
    health: DbCategory.HEALTH,
    chore: DbCategory.CHORE,
    creative: DbCategory.CREATIVE,
  };
  return mapping[category];
}
```

### 2. API 响应约定

所有 tRPC 过程返回统一格式：
```typescript
// 成功响应
{
  success: true,
  data: T,
  message?: string
}

// 查询响应
{
  success: true,
  data: T[],
  count: number
}
```

### 3. 错误处理约定

```typescript
// 辅助函数：提取错误消息
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// 使用自定义错误类
throw new ServiceError(
  `Failed to create mission: ${getErrorMessage(error)}`,
  "CREATE_MISSION_ERROR",
  400,
);

// tRPC 错误处理
throw new TRPCError({
  code: "BAD_REQUEST",
  message: `Failed to create mission: ${getErrorMessage(error)}`,
});
```

### 4. 多语言约定

#### LocalizedText 类型
```typescript
export interface LocalizedText {
  en: string;
  zh: string;
}

// 使用示例
const mission: Mission = {
  title: {
    en: "Read a book",
    zh: "阅读书籍"
  }
};
```

#### 前端多语言
```typescript
// src/frontend/contexts/LanguageContext.tsx
const { t, language } = useLanguage();

// 使用翻译
<h2>{t.nav_missions}</h2>
```

### 5. 数据库事务约定

```typescript
// 使用 Prisma 事务确保数据一致性
const result = await this.prisma.$transaction(async (tx) => {
  // 1. 更新用户任务
  await tx.userMission.upsert({ ... });

  // 2. 更新用户统计
  await tx.userStats.update({ ... });

  // 3. 记录历史
  await tx.missionHistory.create({ ... });

  return { xpEarned, coinEarned };
});
```

---

## 🧪 测试策略

### 单元测试

#### Jest 配置
```typescript
// jest.config.js
export default {
  moduleFileExtensions: ["js", "json", "ts", "tsx"],
  testMatch: [
    "**/__tests__/**/*.ts?(x)",
    "**/?(*.)+(spec|test).ts?(x)"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.spec.{ts,tsx}"
  ]
};
```

### 端到端测试

#### Playwright 测试规范
```typescript
test.describe("任务完成流程测试", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
  });

  test("测试1：验证应用正常加载", async ({ page }) => {
    await expect(page).toHaveTitle(/Starship Commander/);
    const levelElement = page.locator("text=/Level \\d+/");
    await expect(levelElement).toBeVisible();
  });

  test("测试2：完成任务的完整流程", async ({ page }) => {
    // 1. 获取初始状态
    const initialLevel = await page.locator("text=/Level (\\d+)/").textContent();

    // 2. 执行操作
    const completeButton = page.locator('button:has-text("LAUNCH")');
    await completeButton.click();

    // 3. 验证结果
    await expect(page.locator("text=/Mission completed/")).toBeVisible();
  });
});
```

---

## 🚀 性能优化建议

### 前端优化

1. **React Query 缓存**
   ```typescript
   const { data } = useQuery({
     queryKey: ["missions", filters],
     queryFn: () => apiClient.getAllMissions(filters),
     staleTime: 5 * 60 * 1000, // 5 分钟
   });
   ```

2. **代码分割**
   ```typescript
   const Hangar = lazy(() => import("./components/Hangar"));
   ```

3. **虚拟列表**（大量数据时）

### 后端优化

1. **Prisma 查询优化**
   ```typescript
   // ✅ 推荐：只选择需要的字段
   const missions = await prisma.mission.findMany({
     select: {
       id: true,
       title: true,
       xpReward: true,
     },
   });
   ```

2. **批量操作**
   ```typescript
   await prisma.mission.createMany({
     data: missionsBatch,
   });
   ```

3. **索引优化**（在 Prisma schema 中）

---

## 📝 常见任务指南

### 添加新的 API 端点

1. 在 `src/backend/modules/[module]/[module].router.ts` 中定义路由
2. 在 `src/backend/services/[module].service.ts` 中实现业务逻辑
3. 添加 Zod 验证模式
4. 在 `src/frontend/lib/trpc.ts` 中暴露客户端方法
5. 创建自定义 Hook（可选）

### 添加新的 React 组件

1. 在 `src/frontend/components/` 中创建组件文件
2. 定义 TypeScript Props 接口
3. 使用函数组件 + Hooks
4. 遵循现有样式规范（Tailwind CSS）
5. 添加中英文注释

### 数据库迁移

1. 修改 `prisma/schema.prisma`
2. 运行 `pnpm prisma:generate` 生成客户端
3. 运行 `pnpm prisma:push`（开发）或 `pnpm prisma:migrate`（生产）
4. 更新相关的类型定义

---

## ⚠️ 重要注意事项

1. **类型安全优先**
   - 始终使用 TypeScript 类型
   - 避免 `any` 类型，优先使用 `unknown`
   - 利用 tRPC 的端到端类型安全

2. **中英文双语**
   - 所有注释使用中英文双语
   - 保持翻译的一致性

3. **错误处理**
   - 使用统一的错误处理模式
   - 提供有意义的错误消息
   - 记录错误日志（后端允许 console.error）

4. **代码审查清单**
   - [ ] 代码格式化（Prettier）
   - [ ] ESLint 检查通过
   - [ ] TypeScript 类型检查通过
   - [ ] 添加必要的注释（中英文）
   - [ ] 测试覆盖核心逻辑
   - [ ] 遵循现有代码风格

5. **性能考虑**
   - 避免不必要的重新渲染
   - 使用 React.memo、useMemo、useCallback
   - 优化数据库查询
   - 实施合理的缓存策略

---

## 🔗 快速参考

### 常用命令速查

```bash
# 开发
pnpm dev:all              # 启动前后端
pnpm dev                  # 仅前端
pnpm dev:backend          # 仅后端

# 测试
pnpm test                 # 单元测试
pnpm test:e2e:playwright  # E2E 测试

# 代码质量
pnpm lint                 # 修复 ESLint
pnpm format               # 格式化代码
pnpm typecheck            # 类型检查

# 数据库
pnpm prisma:push          # 推送 schema
pnpm prisma:studio        # 数据库 GUI
pnpm db:reset             # 重置数据库

# 构建
pnpm build:all            # 构建前后端
pnpm start:prod           # 启动生产服务器
```

### 关键配置文件

- [tsconfig.json](./tsconfig.json) - TypeScript 配置
- [eslint.config.js](./eslint.config.js) - ESLint 配置
- [config/.prettierrc](./config/.prettierrc) - Prettier 配置
- [vite.config.ts](./vite.config.ts) - Vite 配置
- [prisma/schema.prisma](./prisma/schema.prisma) - 数据库模式

### 技术文档

- [NestJS 文档](https://docs.nestjs.com/)
- [tRPC 文档](https://trpc.io/docs/)
- [Prisma 文档](https://www.prisma.io/docs/)
- [React 文档](https://react.dev/)
- [TanStack Query 文档](https://tanstack.com/query/latest)

---

## 🤝 AI 协作最佳实践

作为 AI 助手，在协助开发时请遵循：

1. **严格遵循现有代码风格**
2. **保持中英文双语注释**
3. **优先使用类型安全的方式**
4. **提供完整的实现，不要使用 TODO**
5. **在修改代码前先阅读相关文件**
6. **使用项目的路径别名**
7. **遵循 SOLID、KISS、DRY、YAGNI 原则**
8. **测试核心功能的变更**

---

**文档版本**：1.0.0
**最后更新**：2025-12-23
**维护者**：Starship Commander Team
