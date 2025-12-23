// tRPC Context / tRPC 上下文
// Provides user authentication context for tRPC procedures
// 为 tRPC procedures 提供用户身份验证上下文

import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { IncomingMessage } from "http";

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
}: CreateExpressContextOptions) {
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
}: CreateExpressContextOptions) {
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
 * TODO: Implement JWT or session validation
 * TODO: 实现 JWT 或 session 验证
 *
 * Current implementation: Uses custom header (temporary solution)
 * 当前实现：使用自定义header（临时方案）
 */
async function getUserFromRequest(
  req: IncomingMessage
): Promise<User | null> {
  // Temporary solution: Get userId from custom header
  // 临时方案：从自定义header获取userId
  const userId = req.headers["x-user-id"] as string;

  if (!userId) {
    return null;
  }

  // Verify user exists in database (optional, can be added later)
  // 验证用户是否存在于数据库（可选，后续可添加）
  // const user = await prisma.userStats.findUnique({
  //   where: { userId }
  // });
  //
  // if (!user) {
  //   return null;
  // }

  return {
    id: userId,
    email: `${userId}@example.com`, // Temporary email / 临时邮箱
    role: "user",
  };
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
