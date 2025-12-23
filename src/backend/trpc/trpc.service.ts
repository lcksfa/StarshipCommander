// tRPC 服务
// tRPC Service

import { Injectable } from "@nestjs/common";
import { initTRPC, type inferAsyncReturnType } from "@trpc/server";
import { PrismaService } from "../database/prisma.service.js";

// 创建上下文类型
export type CreateContextOptions = {
  req?: {
    headers?: Record<string, string | string[] | undefined>;
  }; // Express Request 对象 (简化类型)
  res?: {
    status?: (code: number) => void;
  }; // Express Response 对象 (简化类型)
};

/**
 * 创建异步上下文
 * 这将在每个 tRPC 请求中运行
 */
export async function createContext() {
  // 这里可以添加认证、授权等逻辑
  // 例如：从请求头中获取用户信息

  const prisma = new PrismaService();

  return {
    prisma,
    // 可以在这里添加其他上下文信息
    user: null, // 稍后会实现用户认证
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

// 创建 tRPC 实例
const t = initTRPC.context<Context>().create();

// 基础路由器和程序
export const router = t.router;
export const procedure = t.procedure;

@Injectable()
export class TrpcService {
  constructor() {}

  /**
   * 基础程序
   */
  public readonly procedure = procedure;

  /**
   * 路由器
   */
  public readonly router = router;

  /**
   * 创建上下文
   */
  createContext = createContext;

  /**
   * 健康检查程序
   */
  readonly healthProcedure = procedure.query(async () => ({
    status: "Server is running",
    timestamp: new Date().toISOString(),
    framework: "NestJS + tRPC",
    version: "2.0.0",
  }));

  /**
   * 错误处理器
   */
  readonly errorHandler = t.procedure.use(async (opts) => {
    try {
      return await opts.next();
    } catch (error) {
      console.error("tRPC Error:", error);
      throw error;
    }
  });

  /**
   * 认证中间件
   * 稍后会实现完整的用户认证
   */
  readonly authenticatedProcedure = procedure.use(async (opts) => {
    const { ctx } = opts;

    // 简单的用户验证逻辑
    // 在实际应用中，这里会验证 JWT token 或其他认证信息
    if (!ctx.user) {
      // 暂时允许匿名访问，稍后会实现完整认证
      console.warn("Access without authentication");
    }

    return opts.next({
      ctx: {
        ...ctx,
        user: ctx.user || { id: "anonymous" }, // 临时匿名用户
      },
    });
  });

  /**
   * 日志中间件
   */
  readonly loggingProcedure = procedure.use(async (opts) => {
    const start = Date.now();
    const result = await opts.next();
    const duration = Date.now() - start;

    console.log(`tRPC ${opts.type} took ${duration}ms`);
    return result;
  });

  /**
   * 创建完整的路由器
   */
  createRouter(missionsRouter: ReturnType<typeof router>) {
    return this.router({
      health: this.healthProcedure,
      missions: missionsRouter,
      // 可以在这里添加其他路由器
    });
  }
}
