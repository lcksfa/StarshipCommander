// Authentication Router / 认证路由器
// tRPC router for authentication-related procedures
// 认证相关的 tRPC 路由器

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Context } from "../context";
import { authService } from "../services/auth.service";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  getCurrentUserSchema,
} from "../validation/auth-validation";

/**
 * Create authentication router
 * 创建认证路由器
 *
 * This function should be called from main.ts with the tRPC instance
 * 此函数应该从 main.ts 中调用，传入 tRPC 实例
 *
 * @param t - tRPC instance / tRPC 实例
 * @returns Authentication router / 认证路由器
 */
export function createAuthRouter(t: any) {
  const procedure = t.procedure;
  const router = t.router;
  const protectedProcedure = t.procedure.use(async ({ ctx, next }: { ctx: Context; next: any }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action",
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });

  return router({
    /**
     * Register a new user
     * 注册新用户
     *
     * Public endpoint / 公开端点
     */
    register: procedure
      .input(registerSchema)
      .mutation(async ({ input }: { input: z.infer<typeof registerSchema> }) => {
        try {
          const user = await authService.register(
            input.email,
            input.password,
            input.displayName,
            input.preferredLang
          );

          return {
            success: true,
            data: { user },
            message: "Registration successful",
          };
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Registration failed",
          });
        }
      }),

    /**
     * Login user
     * 用户登录
     *
     * Public endpoint / 公开端点
     */
    login: procedure
      .input(loginSchema)
      .mutation(async ({ input }: { input: z.infer<typeof loginSchema> }) => {
        try {
          const result = await authService.login(input.email, input.password);

          return {
            success: true,
            data: result,
            message: "Login successful",
          };
        } catch (error) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: error instanceof Error ? error.message : "Login failed",
          });
        }
      }),

    /**
     * Refresh access token
     * 刷新访问令牌
     *
     * Public endpoint / 公开端点
     */
    refresh: procedure
      .input(refreshTokenSchema)
      .mutation(async ({ input }: { input: z.infer<typeof refreshTokenSchema> }) => {
        try {
          const tokens = await authService.refreshTokens(input.refreshToken);

          return {
            success: true,
            data: { tokens },
            message: "Token refreshed successfully",
          };
        } catch (error) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              error instanceof Error ? error.message : "Token refresh failed",
          });
        }
      }),

    /**
     * Logout user
     * 用户登出
     *
     * Protected endpoint / 受保护端点
     */
    logout: protectedProcedure
      .input(logoutSchema)
      .mutation(async ({ input }: { input: z.infer<typeof logoutSchema> }) => {
        try {
          await authService.logout(input.refreshToken);

          return {
            success: true,
            data: null,
            message: "Logout successful",
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error instanceof Error ? error.message : "Logout failed",
          });
        }
      }),

    /**
     * Get current user information
     * 获取当前用户信息
     *
     * Protected endpoint / 受保护端点
     */
    me: protectedProcedure
      .input(getCurrentUserSchema)
      .query(async ({ ctx }: { ctx: Context & { user: any; prisma: any } }) => {
        try {
          // ctx.user is available here because of protectedProcedure
          // 由于使用了 protectedProcedure，这里 ctx.user 是可用的
          const { prisma, user } = ctx;

          // Get full user data from database / 从数据库获取完整用户数据
          const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
              avatar: true,
              preferredLang: true,
              isActive: true,
              isVerified: true,
              createdAt: true,
              lastLoginAt: true,
              stats: true,
            },
          });

          if (!userData) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          }

          return {
            success: true,
            data: { user: userData },
          };
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error instanceof Error ? error.message : "Failed to get user",
          });
        }
      }),
  });
}
