import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { MissionService } from "./services/mission.service";
import { PrismaService } from "./database/prisma.service";
import { setMissionService } from "./controllers/mission.controller";
import { initTRPC } from "@trpc/server";
import * as expressAdapter from "@trpc/server/adapters/express";
import { z } from "zod";

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

  // CORS configuration - 必须在 helmet 之前配置
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:5173", // Vite 开发服务器默认端口
    "http://localhost:3000", // 备用前端端口
  ];

  app.enableCors({
    origin: allowedOrigins,
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

  // 创建 tRPC 实例
  const t = initTRPC.create();

  const procedure = t.procedure;
  const router = t.router;

  // 定义 Zod schemas
  const schemas = {
    createMission: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      xpReward: z.number().min(0).max(1000),
      coinReward: z.number().min(0).max(500),
      category: z.enum(["study", "health", "chore", "creative"]),
      emoji: z.string().min(1).max(10),
      isDaily: z.boolean(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    }),

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

    missions: router({
      createMission: procedure
        .input(schemas.createMission)
        .mutation(async ({ input }) => {
          try {
            const mission = await missionService.createMission(input);
            return {
              success: true,
              data: mission,
              message: "Mission created successfully",
            };
          } catch (error: any) {
            throw new Error(`Failed to create mission: ${error.message}`);
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
          } catch (error: any) {
            throw new Error(`Failed to get missions: ${error.message}`);
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
          } catch (error: any) {
            throw new Error(`Failed to get mission: ${error.message}`);
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
          } catch (error: any) {
            throw new Error(`Failed to complete mission: ${error.message}`);
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
          } catch (error: any) {
            throw new Error(`Failed to get daily missions: ${error.message}`);
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
          } catch (error: any) {
            throw new Error(`Failed to get mission stats: ${error.message}`);
          }
        }),
    }),

    history: router({
      getUserHistory: procedure
        .input(schemas.getUserHistory)
        .query(async ({ input }) => {
          try {
            const history = await missionService.getUserHistory(input.userId, {
              dateFrom: input.dateFrom ? new Date(input.dateFrom) : undefined,
              dateTo: input.dateTo ? new Date(input.dateTo) : undefined,
              category: input.category,
              limit: input.limit,
              offset: input.offset,
            });
            return {
              success: true,
              data: history,
              count: history.length,
            };
          } catch (error: any) {
            throw new Error(`Failed to get user history: ${error.message}`);
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
          } catch (error: any) {
            throw new Error(`Failed to get user stats: ${error.message}`);
          }
        }),
    }),
  });

  // Mount tRPC middleware - 使用已连接的 Prisma 实例创建上下文
  app.use(
    "/trpc",
    expressAdapter.createExpressMiddleware({
      router: appRouter,
      createContext: async () => ({
        prisma: prismaService, // 使用已连接的 PrismaService 实例
        user: null,
      }),
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
