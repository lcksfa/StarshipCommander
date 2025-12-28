import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { MissionService } from "./services/mission.service.js";
import { PrismaService } from "./database/prisma.service.js";
import { setMissionService } from "./controllers/mission.controller.js";
import { initTRPC, TRPCError } from "@trpc/server";
import * as expressAdapter from "@trpc/server/adapters/express";
import { z } from "zod";
import { createContext, type Context } from "./context.js";
import { createMissionSchema } from "./validation/mission-validation.js";
import { createAuthRouter } from "./routers/auth.router.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration - 必须在 helmet 之前配置 / CORS configuration - must be before helmet
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:5173", // Vite 开发服务器默认端口 / Vite dev server default port
    "http://localhost:3000", // 备用前端端口 / Backup frontend port
  ];

  // 解析 CORS_ORIGINS 环境变量（逗号分隔） / Parse CORS_ORIGINS env var (comma-separated)
  if (process.env.CORS_ORIGINS) {
    const corsOrigins = process.env.CORS_ORIGINS.split(",").map((o) => o.trim());
    allowedOrigins.push(...corsOrigins);
  }

  // CORS 配置 - 支持移动端和 Web 应用
  // CORS configuration - Support mobile and web apps
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow: boolean) => void,
    ) => {
      // 允许没有 origin 的请求（移动端、Postman、curl 等）
      // Allow requests without origin (mobile apps, Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // 允许 file:// 协议（移动端）
      // Allow file:// protocol (mobile apps)
      if (origin.startsWith("file://")) {
        return callback(null, true);
      }

      // 允许 capacitor:// 协议（Capacitor 移动端）
      // Allow capacitor:// protocol (Capacitor mobile apps)
      if (origin.startsWith("capacitor://") || origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      // 检查是否在允许的来源列表中
      // Check if in allowed origins list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  });

  // Security middleware - 在 CORS 之后配置,避免干扰 CORS 响应头
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // Get services from dependency injection container
  const missionService = app.get<MissionService>(MissionService);
  const prismaService = app.get<PrismaService>(PrismaService);

  // 手动连接 MissionService 的数据库
  await missionService.connect();

  // 设置 MissionService 实例到 Controller（避免依赖注入问题）
  setMissionService(missionService);

  // 创建 tRPC 实例 with context type / 创建带类型的 tRPC 实例
  const t = initTRPC.context<Context>().create();

  const procedure = t.procedure;
  const router = t.router;

  // 创建受保护的 procedure（需要身份验证） / Create protected procedure (requires authentication)
  const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action",
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user, // TypeScript now knows user exists / TypeScript 现在知道 user 存在
      },
    });
  });

  // 定义 Zod schemas
  const schemas = {
    // Use enhanced validation schema with business rules
    // 使用带有业务规则的增强验证 schema
    createMission: createMissionSchema,

    getMissions: z.object({
      userId: z.string().min(1).optional(),
      category: z.enum(["study", "health", "chore", "creative"]).optional(),
      isDaily: z.boolean().optional(),
      isActive: z.boolean().optional(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }),

    getMission: z.object({
      id: z.string().min(1),
    }),

    completeMission: z.object({
      missionId: z.string().min(1),
      userId: z.string().min(1),
    }),

    updateMission: z.object({
      id: z.string().min(1),
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      xpReward: z.number().min(0).max(1000).optional(),
      coinReward: z.number().min(0).max(500).optional(),
      category: z.enum(["study", "health", "chore", "creative"]).optional(),
      emoji: z.string().min(1).max(10).optional(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    }),

    deleteMission: z.object({
      id: z.string().min(1),
    }),

    getDailyMissions: z.object({
      userId: z.string().min(1),
    }),

    getMissionStats: z.object({
      userId: z.string().min(1),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
    }),

    getUserHistory: z.object({
      userId: z.string().min(1),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      category: z.enum(["study", "health", "chore", "creative"]).optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }),

    getUserStats: z.object({
      userId: z.string().min(1),
    }),
  };

  // 创建 app router
  const appRouter = router({
    health: procedure.query(() => ({
      status: "Server is running",
      timestamp: new Date().toISOString(),
      framework: "NestJS + tRPC",
      version: "2.0.0",
    })),

    auth: createAuthRouter(t),

    missions: router({
      createMission: protectedProcedure
        .input(schemas.createMission)
        .mutation(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          async ({ input, ctx }) => {
            // ctx.user is guaranteed to exist here by protectedProcedure
            // ctx.user 在这里由 protectedProcedure 保证存在
            // TODO: Track who created this mission by adding 'createdBy' field to Mission model
            // TODO：通过在 Mission 模型中添加 'createdBy' 字段来追踪任务创建者
            try {
              // 检查重复任务 / Check for duplicate mission
              const existing = await missionService.findDuplicate({
                title: input.title,
                isActive: true,
              });

              if (existing) {
                throw new TRPCError({
                  code: "CONFLICT",
                  message: `An active mission with title "${input.title}" already exists / 标题为 "${input.title}" 的活跃任务已存在`,
                });
              }

              const mission = await missionService.createMission({
                ...input,
              });
            return {
              success: true,
              data: mission,
              message: "Mission created successfully",
            };
          } catch (error: unknown) {
            // Re-throw TRPCError as-is / 直接重新抛出 TRPCError
            if (error instanceof TRPCError && error.code === "CONFLICT") {
              throw error;
            }
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Failed to create mission: ${message}`,
            });
          }
        }),

      getAllMissions: procedure
        .input(schemas.getMissions)
        .query(async ({ input }) => {
          try {
            const missions = await missionService.getAllMissions(input);
            return {
              success: true,
              data: missions,
              count: missions.length,
            };
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Failed to get missions: ${message}`);
          }
        }),

      getMission: procedure
        .input(schemas.getMission)
        .query(async ({ input }) => {
          try {
            const mission = await missionService.getMission(input.id);
            if (!mission) {
              throw new Error(`Mission with id ${input.id} not found`);
            }
            return {
              success: true,
              data: mission,
            };
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Failed to get mission: ${message}`);
          }
        }),

      completeMission: procedure
        .input(schemas.completeMission)
        .mutation(async ({ input }) => {
          try {
            const result = await missionService.completeMission(
              input.missionId,
              input.userId,
            );
            return {
              success: true,
              data: result,
              message: result.message,
            };
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Failed to complete mission: ${message}`);
          }
        }),

      updateMission: procedure
        .input(schemas.updateMission)
        .mutation(async ({ input }) => {
          try {
            const { id, ...updateData } = input;
            const mission = await missionService.updateMission(id, updateData);
            return {
              success: true,
              data: mission,
              message: "Mission updated successfully",
            };
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            if (message.includes("not found")) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: message,
              });
            }
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Failed to update mission: ${message}`,
            });
          }
        }),

      deleteMission: procedure
        .input(schemas.deleteMission)
        .mutation(async ({ input }) => {
          try {
            const success = await missionService.deleteMission(input.id);
            if (!success) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Mission with id ${input.id} not found`,
              });
            }
            return {
              success: true,
              message: "Mission deleted successfully",
            };
          } catch (error: unknown) {
            if (error instanceof TRPCError) {
              throw error;
            }
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to delete mission: ${message}`,
            });
          }
        }),

      getDailyMissions: procedure
        .input(schemas.getDailyMissions)
        .query(async ({ input }) => {
          try {
            const missions = await missionService.getDailyMissions(
              input.userId,
            );
            return {
              success: true,
              data: missions,
              count: missions.length,
            };
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Failed to get daily missions: ${message}`);
          }
        }),

      getMissionStats: procedure
        .input(schemas.getMissionStats)
        .query(async ({ input }) => {
          try {
            const stats = await missionService.getMissionStats(input.userId, {
              from: input.dateFrom ? new Date(input.dateFrom) : new Date(),
              to: input.dateTo ? new Date(input.dateTo) : new Date(),
            });
            return {
              success: true,
              data: stats,
            };
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Failed to get mission stats: ${message}`);
          }
        }),
    }),

    history: router({
      getUserHistory: procedure
        .input(schemas.getUserHistory)
        .query(async ({ input }) => {
          try {
            // 使用按周分组的历史记录 API / Use grouped by week history API
            const weekGroups = await missionService.getUserHistoryGroupedByWeek(input.userId, {
              dateFrom: input.dateFrom ? new Date(input.dateFrom) : undefined,
              dateTo: input.dateTo ? new Date(input.dateTo) : undefined,
              category: input.category,
            });
            return {
              success: true,
              data: weekGroups,
              count: weekGroups.length,
            };
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Failed to get user history: ${message}`);
          }
        }),
    }),

    users: router({
      getUserStats: procedure
        .input(schemas.getUserStats)
        .query(async ({ input }) => {
          try {
            const stats = await missionService.getUserStats(input.userId);
            if (!stats) {
              throw new Error(
                `User stats for userId ${input.userId} not found`,
              );
            }
            return {
              success: true,
              data: stats,
            };
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Failed to get user stats: ${message}`);
          }
        }),
    }),
  });

  // Mount tRPC middleware - 使用已连接的 Prisma 实例创建上下文
  // Mount tRPC middleware - Use connected Prisma instance and create context
  app.use(
    "/trpc",
    expressAdapter.createExpressMiddleware({
      router: appRouter,
      createContext: async (opts) => {
        // Use our createContext function and add prisma to context
        // 使用我们的 createContext 函数并添加 prisma 到上下文
        const context = await createContext(opts);
        return {
          ...context,
          prisma: prismaService, // Add PrismaService for use in procedures / 添加 PrismaService 供 procedures 使用
        };
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Starship Commander API")
    .setDescription(
      "AI-friendly backend API for Starship Commander Habits using NestJS + tRPC",
    )
    .setVersion("2.0.0")
    .addTag("tRPC")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(
    `🚀 Starship Commander Backend (NestJS + tRPC) running on port ${port}`,
  );
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔗 tRPC Endpoint: http://localhost:${port}/trpc`);
}

bootstrap();
