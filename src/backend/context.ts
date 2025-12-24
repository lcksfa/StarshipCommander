// tRPC Context / tRPC 上下文
// Provides user authentication context for tRPC procedures
// 为 tRPC procedures 提供用户身份验证上下文

import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { IncomingMessage } from "http";
import { authService } from "./services/auth.service";

/**
 * User interface / 用户接口
 */
interface User {
  id: string;
  email: string;
  role: string;
}

/**
 * Create tRPC context with user authentication
 * 创建带用户身份验证的 tRPC 上下文
 */
export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<{
  req: typeof req;
  res: typeof res;
  user: User | null;
}> {
  // Get user from request headers or cookie
  // 从请求头或cookie中获取用户信息
  const user = await getUserFromRequest(req);

  return {
    req,
    res,
    user,
  };
}

/**
 * Create context without authentication for public endpoints
 * 为公共端点创建无身份验证的上下文
 */
export async function createPublicContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<{
  req: typeof req;
  res: typeof res;
  user: null;
}> {
  return {
    req,
    res,
    user: null,
  };
}

/**
 * Extract user information from request
 * 从请求中提取用户信息
 *
 * Supports two authentication methods:
 * 支持两种认证方式：
 * 1. JWT Bearer token (preferred) / JWT Bearer token（推荐）
 * 2. x-user-id header (for backward compatibility) / x-user-id header（向后兼容）
 */
async function getUserFromRequest(
  req: IncomingMessage
): Promise<User | null> {
  try {
    // Method 1: Try JWT Bearer token first / 方法1：首先尝试 JWT Bearer token
    const authHeader = req.headers["authorization"];

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7); // Remove "Bearer " prefix / 移除 "Bearer " 前缀

      try {
        // Verify JWT token / 验证 JWT token
        const payload = await authService.verifyAccessToken(token);

        return {
          id: payload.userId,
          email: payload.email,
          role: "user",
        };
      } catch (error) {
        // Token verification failed (expired or invalid), fall through to method 2
        // This is expected behavior when tokens expire, not an error condition
        // Token 验证失败（过期或无效），回退到方法2
        // 这是token过期的预期行为，不是错误条件
        // Silent fail - let the frontend handle token refresh
      }
    }

    // Method 2: Fallback to x-user-id header (backward compatibility)
    // 方法2：回退到 x-user-id header（向后兼容）
    const userId = req.headers["x-user-id"] as string;

    if (userId) {
      // TODO: Verify user exists in database
      // TODO: 验证用户是否存在于数据库
      return {
        id: userId,
        email: `${userId}@example.com`, // Temporary email / 临时邮箱
        role: "user",
      };
    }

    // No authentication found / 未找到认证信息
    return null;
  } catch (error) {
     
    console.error("Error extracting user from request:", error);
    return null;
  }
}

/**
 * Context type with optional user
 * 带有可选用户的上下文类型
 */
export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Create context with meta information
 * 创建带元信息的上下文（可选）
 */
export interface ContextMeta {
  // Add any metadata you want to track
  // 添加任何您想追踪的元数据
  requestId?: string;
  timestamp?: Date;
}
