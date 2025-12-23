# tRPC 前端集成指南

## 概述

本文档说明如何在 Starship Commander 前端使用 tRPC API 客户端与后端服务通信。

## 架构说明

由于 tRPC v11 的 React 集成 API 存在兼容性问题，我们采用简化的 API 客户端方案：

- **方式**: 基于原生 fetch 的 API 客户端
- **优点**: 轻量、稳定、无额外依赖
- **类型安全**: 保留 TypeScript 类型检查

## 核心文件

### 1. API 客户端 (`src/frontend/lib/trpc.ts`)

```typescript
class TrpcApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_TRPC_URL || "http://localhost:3001/trpc";
  }

  // 核心方法
  private async call<T>(endpoint: string, input?: any): Promise<T>

  // 任务相关 API
  getAllMissions(filters?: MissionFilters): Promise<Mission[]>
  getMissionById(id: string): Promise<Mission>
  completeMission(id: string): Promise<MissionCompletionResult>
  getMissionStats(filters?: MissionFilters): Promise<MissionStats>
  getUserMissions(filters?: MissionFilters): Promise<Mission[]>
}

export const apiClient = new TrpcApiClient();
```

### 2. React Hooks (`src/frontend/hooks/useMissions.ts`)

提供便于 React 组件使用的自定义 Hooks：

```typescript
// 获取所有任务
const { missions, isLoading, error, refetch } = useAllMissions(filters);

// 获取任务统计
const { stats, isLoading, error } = useMissionStats(filters);

// 完成任务
const { completeMission, isCompleting } = useCompleteMission();
```

## 使用示例

### 示例 1: 获取并显示任务列表

```typescript
import { useAllMissions } from "@hooks/useMissions";

function MissionList() {
  const { missions, isLoading, error, refetch } = useAllMissions({
    category: "study",
    status: "ACTIVE"
  });

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <ul>
      {missions.map((mission) => (
        <li key={mission.id}>
          <h3>{mission.title}</h3>
          <p>难度: {mission.difficulty}</p>
          <p>经验值: {mission.xpReward}</p>
          <button onClick={() => refetch()}>刷新</button>
        </li>
      ))}
    </ul>
  );
}
```

### 示例 2: 完成任务

```typescript
import { useCompleteMission } from "@hooks/useMissions";

function MissionCard({ mission }) {
  const { completeMission, isCompleting } = useCompleteMission();

  const handleComplete = async () => {
    try {
      const result = await completeMission(mission.id);
      alert(`任务完成！获得 ${result.xpEarned} XP`);
    } catch (error) {
      alert(`完成失败: ${error}`);
    }
  };

  return (
    <div>
      <h3>{mission.title}</h3>
      <button
        onClick={handleComplete}
        disabled={isCompleting || mission.completed}
      >
        {isCompleting ? "完成中..." : "完成任务"}
      </button>
    </div>
  );
}
```

### 示例 3: 获取任务统计

```typescript
import { useMissionStats } from "@hooks/useMissions";

function StatsDisplay() {
  const { stats, isLoading } = useMissionStats();

  if (isLoading) return <div>加载统计中...</div>;

  return (
    <div>
      <h2>任务统计</h2>
      <p>已完成: {stats.completed}</p>
      <p>总经验值: {stats.totalXp}</p>
      <p>总金币: {stats.totalCoins}</p>
    </div>
  );
}
```

### 示例 4: 直接使用 API 客户端

```typescript
import { apiClient } from "@lib/trpc";

function AdvancedExample() {
  const handleCustomAction = async () => {
    try {
      // 直接调用 API
      const missions = await apiClient.getAllMissions({
        category: "health",
        difficulty: "medium"
      });

      const stats = await apiClient.getMissionStats({
        dateFrom: "2025-01-01",
        dateTo: "2025-12-31"
      });

      console.log("任务:", missions);
      console.log("统计:", stats);
    } catch (error) {
      console.error("API 调用失败:", error);
    }
  };

  return <button onClick={handleCustomAction}>执行自定义操作</button>;
}
```

## 环境变量配置

### 开发环境 (`.env.development`)

```env
VITE_TRPC_URL=http://localhost:3001/trpc
VITE_API_URL=http://localhost:3001
```

### 生产环境 (`.env.production`)

```env
VITE_TRPC_URL=https://api.yourdomain.com/trpc
VITE_API_URL=https://api.yourdomain.com
```

## API 端点参考

### 任务管理端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `mission.getAll` | POST | 获取所有任务（支持筛选） |
| `mission.getById` | POST | 根据 ID 获取任务详情 |
| `mission.complete` | POST | 完成任务并获得奖励 |
| `mission.getStats` | POST | 获取任务统计数据 |
| `mission.getUserMissions` | POST | 获取用户任务历史 |

### 筛选参数类型

```typescript
interface MissionFilters {
  category?: "study" | "health" | "chore" | "creative";
  difficulty?: "easy" | "medium" | "hard";
  status?: "ACTIVE" | "COMPLETED";
  dateFrom?: string;  // ISO 8601 日期格式
  dateTo?: string;    // ISO 8601 日期格式
}
```

### 响应类型

```typescript
// 任务完成响应
interface MissionCompletionResult {
  mission: Mission;
  xpEarned: number;
  coinsEarned: number;
  levelUp: boolean;
  newRank?: string;
}

// 任务统计
interface MissionStats {
  completed: number;
  totalXp: number;
  totalCoins: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}
```

## 错误处理

所有 API 调用都应包含错误处理：

```typescript
import { apiClient } from "@lib/trpc";

async function safeApiCall() {
  try {
    const result = await apiClient.getAllMissions();
    return { success: true, data: result };
  } catch (error) {
    console.error("API 错误:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    };
  }
}
```

## 性能优化建议

### 1. 使用 React Query 缓存

未来可升级到 React Query 以实现自动缓存和重新验证：

```typescript
// 计划中的升级
import { useQuery } from "@tanstack/react-query";

function useMissions(filters) {
  return useQuery({
    queryKey: ["missions", filters],
    queryFn: () => apiClient.getAllMissions(filters)
  });
}
```

### 2. 请求去抖动

对于频繁调用的 API，使用防抖：

```typescript
import { debounce } from "lodash";

const debouncedSearch = debounce((query: string) => {
  apiClient.getAllMissions({ title: query });
}, 300);
```

## 类型安全

所有 API 调用都有完整的 TypeScript 类型支持：

```typescript
// 类型从后端自动推导
const missions: Mission[] = await apiClient.getAllMissions();
const stats: MissionStats = await apiClient.getMissionStats();

// 编译时类型检查
const result: MissionCompletionResult = await apiClient.completeMission("mission-id");
```

## 测试

### 单元测试示例

```typescript
import { apiClient } from "@lib/trpc";

vi.mock("@lib/trpc");

describe("MissionList", () => {
  it("displays missions from API", async () => {
    vi.mocked(apiClient.getAllMissions).mockResolvedValue([
      { id: "1", title: "测试任务", ... }
    ]);

    // 测试组件渲染
  });
});
```

## 故障排查

### 问题 1: 连接失败

```
Error: Failed to fetch
```

**解决方案**:
- 确认后端服务运行在 `http://localhost:3001`
- 检查 `VITE_TRPC_URL` 环境变量
- 验证网络连接和防火墙设置

### 问题 2: 类型错误

```
Type 'string' is not assignable to type 'MissionCategory'
```

**解决方案**:
- 确保使用正确的枚举值
- 从 `@types` 导入类型而不是硬编码字符串
- 运行 `pnpm run typecheck` 检查类型

### 问题 3: CORS 错误

```
Access blocked by CORS policy
```

**解决方案**:
- 确认后端 CORS 配置允许前端源
- 检查 `src/backend/main.ts` 中的 CORS 设置

## 下一步

1. 在组件中使用 `useMissions` hooks 替换模拟数据
2. 添加加载状态和错误处理 UI
3. 实现自动刷新和实时更新
4. 考虑升级到完整的 React Query 集成

## 相关文档

- [后端 tRPC 路由配置](../backend/trpc/README.md)
- [类型定义文档](../shared/types.md)
- [API 端点完整列表](../backend/api/endpoints.md)
