// Authentication Types / 认证类型定义
// Type definitions for authentication-related data
// 认证相关数据的类型定义

/**
 * Language type / 语言类型
 */
export type Language = "en" | "zh";

/**
 * User interface / 用户接口
 */
export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  preferredLang: Language;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  stats?: UserStats;
}

/**
 * User Stats interface / 用户统计接口
 */
export interface UserStats {
  id: string;
  userId: string;
  preferredLang: Language;
  level: number;
  currentXp: number;
  maxXp: number;
  coins: number;
  totalMissionsCompleted: number;
  totalXpEarned: number;
  currentStreak: number;
  longestStreak: number;
  lastActive?: string;
}

/**
 * Token Pair interface / Token 对接口
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Access token expiration in seconds / 访问令牌过期时间（秒）
}

/**
 * Login Request interface / 登录请求接口
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register Request interface / 注册请求接口
 */
export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
  preferredLang?: Language;
}

/**
 * Login Response interface / 登录响应接口
 */
export interface LoginResponse {
  user: User;
  tokens: TokenPair;
}

/**
 * Register Response interface / 注册响应接口
 */
export interface RegisterResponse {
  user: User;
}

/**
 * Refresh Token Request interface / 刷新令牌请求接口
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh Token Response interface / 刷新令牌响应接口
 */
export interface RefreshTokenResponse {
  tokens: TokenPair;
}

/**
 * API Response interface / API 响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Auth Context Value interface / 认证上下文值接口
 */
export interface AuthContextValue {
  // State / 状态
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Methods / 方法
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

/**
 * Stored Auth Data interface / 存储的认证数据接口
 */
export interface StoredAuthData {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: number; // Unix timestamp / Unix 时间戳
}
