// tRPC API 客户端 - 简化版
// tRPC API Client - Simplified Version

import { authApi } from "./auth-api";

/**
 * 后端 API 类型定义（临时，稍后从后端生成）
 */
export interface Mission {
  id: string;
  title: string; // 简化为单一字符串 / Simplified to single string
  description: string; // 简化为单一字符串 / Simplified to single string
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
   * 获取存储的认证数据
   * Get stored auth data from localStorage
   */
  private getStoredAuthData() {
    try {
      const data = localStorage.getItem("starship-auth-data");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse stored auth data:", error);
      return null;
    }
  }

  /**
   * 获取当前用户 ID（向后兼容）
   * Get current user ID from localStorage (backward compatibility)
   */
  private getUserId(): string {
    return localStorage.getItem("starship-user-id") || "";
  }

  /**
   * 通用 API 调用方法
   * Generic API call method with JWT auth support and auto token refresh
   */
  private async call<T>(
    endpoint: string,
    input?: any,
    method: "GET" | "POST" = "POST",
  ): Promise<T> {
    try {
      let url = `${this.baseUrl}${endpoint}`;

      // 优先使用 JWT token 认证 / Prefer JWT token authentication
      let authData = this.getStoredAuthData();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // 如果有 JWT token，使用 Bearer token / If JWT token exists, use Bearer token
      if (authData?.accessToken) {
        headers["Authorization"] = `Bearer ${authData.accessToken}`;
      }
      // 否则回退到 x-user-id header（向后兼容） / Otherwise fallback to x-user-id header
      else {
        const userId = this.getUserId();
        if (userId) {
          headers["x-user-id"] = userId;
        }
      }

      const options: RequestInit = {
        method,
        headers,
        signal: AbortSignal.timeout(30000),
      };

      // GET 请求将参数编码到 URL 中 (tRPC 格式: ?input={...})
      if (method === "GET" && input) {
        const params = encodeURIComponent(JSON.stringify(input));
        url += `?input=${params}`;
      }
      // POST 请求: tRPC mutation 直接发送 JSON,不需要 input 包装
      else if (method === "POST" && input) {
        options.body = JSON.stringify(input);
      }

      let response = await fetch(url, options);

      // Auto-refresh token on 401 Unauthorized / 401 时自动刷新 token
      if (response.status === 401 && authData?.refreshToken) {
        // eslint-disable-next-line no-console
        console.log("⚠️ Got 401, attempting to refresh token...");

        try {
          // Try to refresh the token / 尝试刷新 token
          await authApi.refreshToken(authData.refreshToken);

          // Retry the original request with new token / 使用新 token 重试原始请求
          authData = this.getStoredAuthData();
          if (authData?.accessToken) {
            headers["Authorization"] = `Bearer ${authData.accessToken}`;
            // eslint-disable-next-line no-console
            console.log("✅ Token refreshed, retrying original request");

            response = await fetch(url, options);
          }
        } catch (refreshError) {
          // eslint-disable-next-line no-console
          console.error("❌ Token refresh failed:", refreshError);
          // Clear auth data and let the error propagate
          // 清除认证数据并让错误传播
          authApi.clearAuthData();
          throw new Error("Session expired. Please login again.");
        }
      }

      if (!response.ok) {
        throw new Error(
          `API call failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      // tRPC 返回格式: { result: { data: {...} } }
      // 我们的后端返回: { result: { data: { success: true, data: [...] } } }
      return result.result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`tRPC API call failed (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Query 操作使用 GET 请求
   */
  private async query<T>(endpoint: string, input?: any): Promise<T> {
    return this.call<T>(endpoint, input, "GET");
  }

  /**
   * Mutation 操作使用 POST 请求
   */
  private async mutate<T>(endpoint: string, input?: any): Promise<T> {
    return this.call<T>(endpoint, input, "POST");
  }

  /**
   * 获取所有任务
   */
  async getAllMissions(input?: {
    userId?: string;
    category?: "study" | "health" | "chore" | "creative";
    isDaily?: boolean;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }) {
    return this.query<any>("/missions.getAllMissions", input);
  }

  /**
   * 创建新任务 / Create new mission
   */
  async createMission(input: {
    title: string;
    description: string;
    xpReward: number;
    coinReward: number;
    category: "study" | "health" | "chore" | "creative";
    emoji: string;
    isDaily: boolean;
    difficulty: "EASY" | "MEDIUM" | "HARD";
  }) {
    return this.mutate<any>("/missions.createMission", input);
  }

  /**
   * 完成任务
   */
  async completeMission(input: { missionId: string; userId: string }) {
    return this.mutate<any>("/missions.completeMission", input);
  }

  /**
   * 获取每日任务
   */
  async getDailyMissions(input: { userId: string }) {
    return this.query<any>("/missions.getDailyMissions", input);
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
    return this.query<any>("/missions.getUserMissions", input);
  }

  /**
   * 获取任务统计
   */
  async getMissionStats(input: {
    userId: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.query<any>("/missions.getMissionStats", input);
  }

  /**
   * 获取用户历史记录
   */
  async getUserHistory(input: {
    userId: string;
    dateFrom?: string;
    dateTo?: string;
    category?: "study" | "health" | "chore" | "creative";
    limit?: number;
    offset?: number;
  }) {
    return this.query<any>("/history.getUserHistory", input);
  }

  /**
   * 获取用户统计
   */
  async getUserStats(input: { userId: string }) {
    return this.query<any>("/users.getUserStats", input);
  }
}

// 创建并导出单例实例
export const apiClient = new TrpcApiClient();
