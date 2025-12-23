// tRPC API 客户端 - 简化版
// tRPC API Client - Simplified Version

/**
 * 后端 API 类型定义（临时，稍后从后端生成）
 */
export interface Mission {
  id: string;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
  xpReward: number;
  coinReward: number;
  isCompleted: boolean;
  category: "study" | "health" | "chore" | "creative";
  emoji: string;
  isDaily: boolean;
  streak: number;
}

export interface UserStats {
  level: number;
  currentXp: number;
  maxXp: number;
  coins: number;
  rank: string;
  totalMissionsCompleted: number;
  totalXpEarned: number;
  preferredLang?: string;
  currentStreak?: number;
  longestStreak?: number;
}

export interface MissionCompleteResult {
  success: boolean;
  mission: Mission;
  userStats: UserStats;
  xpEarned: number;
  coinEarned: number;
  streakUpdated: boolean;
  newLevel?: number;
  message: string;
}

/**
 * tRPC API 客户端类
 * 直接使用 fetch 调用后端 API
 */
class TrpcApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      (import.meta.env as any).VITE_TRPC_URL ||
      (import.meta.env as any).VITE_API_URL ||
      "http://localhost:3001/trpc";
  }

  /**
   * 通用 API 调用方法
   */
  private async call<T>(endpoint: string, input?: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(
          `API call failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      // tRPC 返回格式: { result: { data: {...} } }
      return result.result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`tRPC API call failed (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * 获取所有任务
   */
  async getAllMissions(input?: {
    category?: "study" | "health" | "chore" | "creative";
    isDaily?: boolean;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }) {
    return this.call<any>("/missions.getAllMissions", input);
  }

  /**
   * 完成任务
   */
  async completeMission(input: { missionId: string; userId: string }) {
    return this.call<any>("/missions.completeMission", input);
  }

  /**
   * 获取每日任务
   */
  async getDailyMissions(input: { userId: string }) {
    return this.call<any>("/missions.getDailyMissions", input);
  }

  /**
   * 获取用户任务
   */
  async getUserMissions(input: {
    userId: string;
    isCompleted?: boolean;
    category?: "study" | "health" | "chore" | "creative";
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.call<any>("/missions.getUserMissions", input);
  }

  /**
   * 获取任务统计
   */
  async getMissionStats(input: {
    userId: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.call<any>("/missions.getMissionStats", input);
  }
}

// 创建并导出单例实例
export const apiClient = new TrpcApiClient();
