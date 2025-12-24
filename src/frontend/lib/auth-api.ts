// Authentication API Client / 认证 API 客户端
// Handles all authentication-related API calls
// 处理所有认证相关的 API 调用

import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  User,
} from "../types/auth";

/**
 * Authentication API Client
 * 认证 API 客户端
 *
 * Provides methods for:
 * - User registration / 用户注册
 * - User login / 用户登录
 * - Token refresh / Token 刷新
 * - Logout / 登出
 * - Get current user / 获取当前用户
 */
class AuthApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      (import.meta.env as any).VITE_TRPC_URL ||
      (import.meta.env as any).VITE_API_URL ||
      "http://localhost:3001/trpc";
  }

  /**
   * Generic API call method
   * 通用 API 调用方法
   */
  private async call<T>(
    endpoint: string,
    input?: any,
    method: "GET" | "POST" = "POST"
  ): Promise<T> {
    try {
      let url = `${this.baseUrl}${endpoint}`;

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(30000),
      };

      // Add authorization header if token exists / 如果 token 存在则添加授权头
      const authData = this.getStoredAuthData();
      if (authData?.accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authData.accessToken}`,
        };
      }

      // GET requests encode input in URL / GET 请求将参数编码到 URL
      if (method === "GET" && input) {
        const params = encodeURIComponent(JSON.stringify(input));
        url += `?input=${params}`;
      }
      // POST requests send JSON body / POST 请求发送 JSON 请求体
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
          await this.refreshToken(authData.refreshToken);

          // Retry the original request with new token / 使用新 token 重试原始请求
          const newAuthData = this.getStoredAuthData();
          if (newAuthData?.accessToken) {
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${newAuthData.accessToken}`,
            };
            // eslint-disable-next-line no-console
            console.log("✅ Token refreshed, retrying original request");

            response = await fetch(url, options);
          }
        } catch (refreshError) {
          // eslint-disable-next-line no-console
          console.error("❌ Token refresh failed:", refreshError);
          // Clear auth data and let the error propagate
          // 清除认证数据并让错误传播
          this.clearAuthData();
          throw new Error("Session expired. Please login again.");
        }
      }

      if (!response.ok) {
        throw new Error(
          `API call failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      // tRPC returns: { result: { data: {...} } }
      // 我们的后端返回: { result: { data: { success: true, data: [...] } } }
      return result.result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Auth API call failed (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Get stored authentication data from localStorage
   * 从 localStorage 获取存储的认证数据
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
   * Store authentication data in localStorage
   * 将认证数据存储到 localStorage
   */
  storeAuthData(
    accessToken: string,
    refreshToken: string,
    user: User,
    expiresIn: number
  ): void {
    try {
      const expiresAt = Date.now() + expiresIn * 1000;
      const data = {
        accessToken,
        refreshToken,
        user,
        expiresAt,
      };
      localStorage.setItem("starship-auth-data", JSON.stringify(data));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to store auth data:", error);
    }
  }

  /**
   * Clear authentication data from localStorage
   * 清除 localStorage 中的认证数据
   */
  clearAuthData(): void {
    localStorage.removeItem("starship-auth-data");
  }

  /**
   * Register a new user
   * 注册新用户
   *
   * @param data - Registration data / 注册数据
   * @returns User object / 用户对象
   *
   * @example
   * const user = await authApi.register({
   *   email: "user@example.com",
   *   password: "password123",
   *   displayName: "Starship Commander"
   * });
   */
  async register(data: RegisterRequest): Promise<User> {
    const response = await this.call<ApiResponse<RegisterResponse>>(
      "/auth.register",
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Registration failed");
    }

    return response.data.user;
  }

  /**
   * Login user
   * 用户登录
   *
   * @param data - Login credentials / 登录凭据
   * @returns Login response with user and tokens / 包含用户和 token 的登录响应
   *
   * @example
   * const { user, tokens } = await authApi.login({
   *   email: "user@example.com",
   *   password: "password123"
   * });
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.call<ApiResponse<LoginResponse>>(
      "/auth.login",
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Login failed");
    }

    const { user, tokens } = response.data;

    // Store auth data / 存储认证数据
    this.storeAuthData(
      tokens.accessToken,
      tokens.refreshToken,
      user,
      tokens.expiresIn
    );

    return response.data;
  }

  /**
   * Refresh access token
   * 刷新访问令牌
   *
   * @param refreshToken - Refresh token / 刷新令牌
   * @returns New token pair / 新的 token 对
   *
   * @example
   * const { tokens } = await authApi.refreshToken(refreshToken);
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await this.call<ApiResponse<RefreshTokenResponse>>(
      "/auth.refresh",
      { refreshToken }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Token refresh failed");
    }

    // Update stored auth data / 更新存储的认证数据
    const authData = this.getStoredAuthData();
    if (authData && response.data.tokens) {
      this.storeAuthData(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken,
        authData.user,
        response.data.tokens.expiresIn
      );
    }

    return response.data;
  }

  /**
   * Logout user
   * 用户登出
   *
   * @param refreshToken - Refresh token to invalidate / 要失效的刷新令牌
   *
   * @example
   * await authApi.logout(refreshToken);
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await this.call<ApiResponse<null>>("/auth.logout", {
        refreshToken,
      });

      // Clear stored auth data / 清除存储的认证数据
      this.clearAuthData();
    } catch (error) {
      // Even if API call fails, clear local data
      // 即使 API 调用失败，也清除本地数据
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Get current user information
   * 获取当前用户信息
   *
   * @returns User object / 用户对象
   *
   * @example
   * const user = await authApi.getCurrentUser();
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.call<ApiResponse<{ user: User }>>("/auth.me");

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Failed to get user");
    }

    return response.data.user;
  }

  /**
   * Get stored access token
   * 获取存储的访问令牌
   */
  getAccessToken(): string | null {
    const authData = this.getStoredAuthData();
    return authData?.accessToken || null;
  }

  /**
   * Get stored refresh token
   * 获取存储的刷新令牌
   */
  getRefreshToken(): string | null {
    const authData = this.getStoredAuthData();
    return authData?.refreshToken || null;
  }

  /**
   * Get stored user
   * 获取存储的用户
   */
  getStoredUser(): User | null {
    const authData = this.getStoredAuthData();
    return authData?.user || null;
  }

  /**
   * Check if access token is expired
   * 检查访问令牌是否过期
   */
  isTokenExpired(): boolean {
    const authData = this.getStoredAuthData();
    if (!authData || !authData.expiresAt) {
      return true;
    }
    return Date.now() >= authData.expiresAt;
  }
}

// Create and export singleton instance / 创建并导出单例实例
export const authApi = new AuthApiClient();
