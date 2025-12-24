// Authentication Context / 认证上下文
// Provides global authentication state and methods
// 提供全局认证状态和方法

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, RegisterRequest, AuthContextValue } from "../types/auth";
import { authApi } from "../lib/auth-api";

/**
 * Authentication Context
 * 认证上下文
 *
 * Provides authentication state and methods throughout the application
 * 在整个应用中提供认证状态和方法
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider Props
 * AuthProvider 属性
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * 认证提供者组件
 *
 * Wraps the application to provide authentication context
 * 包装应用以提供认证上下文
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize authentication state on mount
   * 在挂载时初始化认证状态
   */
  useEffect(() => {
    let isCancelled = false; // 清理标志，防止竞态条件 / Cleanup flag to prevent race conditions

    const initAuth = async () => {
      try {
        setIsLoading(true);

        // Check if we have stored auth data / 检查是否有存储的认证数据
        const storedUser = authApi.getStoredUser();
        const isExpired = authApi.isTokenExpired();

        // eslint-disable-next-line no-console
        console.log("=== AuthContext 初始化开始 ===");
        // eslint-disable-next-line no-console
        console.log("存储的用户:", storedUser?.email);
        // eslint-disable-next-line no-console
        console.log("Token 是否过期:", isExpired);

        if (storedUser && !isExpired) {
          // Token is still valid, use stored user directly / Token 仍然有效，直接使用存储的用户
          // Optimistic restore - don't block on API verification
          // 乐观恢复 - 不等待 API 验证
          if (!isCancelled) {
            setUser(storedUser);
            // eslint-disable-next-line no-console
            console.log("✅ Restored user session from localStorage:", storedUser.email);
          }

          // Optional: Verify token in background without blocking
          // 可选：在后台验证 token，不阻塞用户体验
          // Note: We only log verification result, don't clear session on failure
          // 注意：我们只记录验证结果，失败时不清除会话
          authApi.getCurrentUser()
            .then((currentUser) => {
              if (!isCancelled) {
                // Silent verification succeeded / 静默验证成功
                // eslint-disable-next-line no-console
                console.log("✅ Token verified successfully");
              }
            })
            .catch((error) => {
              // Verification failed, but we don't clear session
              // The token will be refreshed when it expires
              // 验证失败，但我们不清除会话
              // Token 会在过期时自动刷新
              if (!isCancelled) {
                // eslint-disable-next-line no-console
                console.warn("⚠️ Token verification failed (will retry on next API call):", error);
              }
            });
        } else if (storedUser && isExpired) {
          // Token is expired, try to refresh / Token 已过期，尝试刷新
          // eslint-disable-next-line no-console
          console.log("⚠️ Token expired, attempting refresh");
          const refreshToken = authApi.getRefreshToken();
          if (refreshToken) {
            try {
              await authApi.refreshToken(refreshToken);
              if (!isCancelled) {
                const refreshedUser = await authApi.getCurrentUser();
                setUser(refreshedUser);
                // eslint-disable-next-line no-console
                console.log("✅ Token refreshed successfully");
              }
            } catch (refreshError) {
              // Refresh failed, clear auth data / 刷新失败，清除认证数据
              if (!isCancelled) {
                // eslint-disable-next-line no-console
                console.warn("⚠️ Token refresh failed, clearing session:", refreshError);
                authApi.clearAuthData();
                setUser(null);
              }
            }
          } else {
            // No refresh token available / 没有可用的刷新令牌
            if (!isCancelled) {
              // eslint-disable-next-line no-console
              console.log("⚠️ No refresh token available");
              setUser(null);
            }
          }
        } else {
          // No stored auth data / 没有存储的认证数据
          if (!isCancelled) {
            // eslint-disable-next-line no-console
            console.log("ℹ️ No stored auth data found");
          }
        }
      } catch (err) {
        if (!isCancelled) {
          // eslint-disable-next-line no-console
          console.error("Failed to initialize auth:", err);
          setError(err instanceof Error ? err.message : "Failed to initialize auth");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          // eslint-disable-next-line no-console
          console.log("=== AuthContext 初始化完成 ===");
        }
      }
    };

    initAuth();

    // Cleanup function / 清理函数
    return () => {
      isCancelled = true;
      // eslint-disable-next-line no-console
      console.log("🔄 AuthContext cleanup: cancelling pending operations");
    };
  }, []);

  /**
   * Login user
   * 用户登录
   */
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authApi.login({ email, password });
      setUser(response.user);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   * 注册新用户
   */
  const register = async (data: RegisterRequest) => {
    try {
      setError(null);
      setIsLoading(true);

      // Register user / 注册用户
      await authApi.register(data);

      // After registration, automatically login
      // 注册后自动登录
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });

      setUser(response.user);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   * 用户登出
   */
  const logout = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const refreshToken = authApi.getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }

      setUser(null);
    } catch (err) {
      // Even if logout API call fails, clear local state
      // 即使登出 API 调用失败，也清除本地状态
      setUser(null);
      authApi.clearAuthData();
      const errorMessage =
        err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh access token
   * 刷新访问令牌
   */
  const refreshToken = async () => {
    try {
      const refreshToken = authApi.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      await authApi.refreshToken(refreshToken);

      // Update user data / 更新用户数据
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      // Refresh failed, clear auth state / 刷新失败，清除认证状态
      setUser(null);
      authApi.clearAuthData();
      const errorMessage =
        err instanceof Error ? err.message : "Token refresh failed";
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Clear error state
   * 清除错误状态
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Update user profile
   * 更新用户资料
   */
  const updateProfile = async (data: {
    displayName?: string;
    username?: string;
    preferredLang?: "en" | "zh";
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedUser = await authApi.updateProfile(data);

      // Update user state / 更新用户状态
      setUser(updatedUser);

      return updatedUser;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Profile update failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

/**
 * Use Auth Hook
 * 使用认证 Hook
 *
 * Provides access to authentication context
 * 提供对认证上下文的访问
 *
 * @throws Error if used outside AuthProvider
 * @returns Auth context value / 认证上下文值
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
