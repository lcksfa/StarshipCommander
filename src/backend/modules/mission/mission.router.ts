// Mission tRPC 路由器
// Mission tRPC Router

import { Injectable } from "@nestjs/common";
import {
  initTRPC,
  TRPCError,
  type inferRouterInputs,
  type inferRouterOutputs,
} from "@trpc/server";
import { ZodError } from "zod";
import { MissionService } from "../../services/mission.service.js";
import { z } from "zod";

/**
 * 从错误对象中提取错误消息
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// 创建 tRPC 实例
const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

// 基础程序
export const procedure = t.procedure;

// 路由器
export const router = t.router;

@Injectable()
export class MissionRouter {
  constructor(private readonly missionService: MissionService) {}

  /**
   * Zod 模式定义
   */
  private readonly schemas = {
    // 任务创建模式
    createMission: z.object({
      title: z.object({
        en: z.string().min(1),
        zh: z.string().min(1),
      }),
      description: z.object({
        en: z.string().min(1),
        zh: z.string().min(1),
      }),
      xpReward: z.number().min(0).max(1000),
      coinReward: z.number().min(0).max(500),
      category: z.enum(["study", "health", "chore", "creative"]),
      emoji: z.string().min(1).max(10),
      isDaily: z.boolean(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    }),

    // 任务更新模式
    updateMission: z.object({
      id: z.string().min(1),
      title: z
        .object({
          en: z.string().min(1),
          zh: z.string().min(1),
        })
        .optional(),
      description: z
        .object({
          en: z.string().min(1),
          zh: z.string().min(1),
        })
        .optional(),
      xpReward: z.number().min(0).max(1000).optional(),
      coinReward: z.number().min(0).max(500).optional(),
      category: z.enum(["study", "health", "chore", "creative"]).optional(),
      emoji: z.string().min(1).max(10).optional(),
      isDaily: z.boolean().optional(),
      isActive: z.boolean().optional(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    }),

    // 任务完成模式
    completeMission: z.object({
      missionId: z.string().min(1),
      userId: z.string().min(1),
    }),

    // 查询过滤模式
    getMissions: z.object({
      userId: z.string().min(1).optional(),
      category: z.enum(["study", "health", "chore", "creative"]).optional(),
      isDaily: z.boolean().optional(),
      isActive: z.boolean().optional(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }),

    // 用户任务查询模式
    getUserMissions: z.object({
      userId: z.string().min(1),
      isCompleted: z.boolean().optional(),
      category: z.enum(["study", "health", "chore", "creative"]).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }),

    // 任务统计查询模式
    getMissionStats: z.object({
      userId: z.string().min(1),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
    }),

    // ID 查询模式
    getMission: z.object({
      id: z.string().min(1),
    }),

    // 删除任务模式
    deleteMission: z.object({
      id: z.string().min(1),
    }),

    // 每日任务查询模式
    getDailyMissions: z.object({
      userId: z.string().min(1),
    }),
  };

  /**
   * 获取 Mission 路由器
   */
  getRouter() {
    return router({
      // 任务 CRUD 操作
      createMission: procedure
        .input(this.schemas.createMission)
        .mutation(async ({ input }) => {
          try {
            const mission = await this.missionService.createMission(input);
            return {
              success: true,
              data: mission,
              message: "Mission created successfully",
            };
          } catch (error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Failed to create mission: ${getErrorMessage(error)}`,
            });
          }
        }),

      getMission: procedure
        .input(this.schemas.getMission)
        .query(async ({ input }) => {
          try {
            const mission = await this.missionService.getMission(input.id);
            if (!mission) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Mission with id ${input.id} not found`,
              });
            }
            return {
              success: true,
              data: mission,
            };
          } catch (error) {
            if (error instanceof TRPCError) {
              throw error;
            }
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to get mission: ${getErrorMessage(error)}`,
            });
          }
        }),

      getAllMissions: procedure
        .input(this.schemas.getMissions)
        .query(async ({ input }) => {
          try {
            const missions = await this.missionService.getAllMissions(input);
            return {
              success: true,
              data: missions,
              count: missions.length,
            };
          } catch (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to get missions: ${getErrorMessage(error)}`,
            });
          }
        }),

      updateMission: procedure
        .input(this.schemas.updateMission)
        .mutation(async ({ input }) => {
          try {
            const { id, ...updateData } = input;
            const mission = await this.missionService.updateMission(
              id,
              updateData,
            );
            return {
              success: true,
              data: mission,
              message: "Mission updated successfully",
            };
          } catch (error) {
            const errorMessage = getErrorMessage(error);
            if (errorMessage.includes("not found")) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: errorMessage,
              });
            }
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Failed to update mission: ${getErrorMessage(error)}`,
            });
          }
        }),

      deleteMission: procedure
        .input(this.schemas.deleteMission)
        .mutation(async ({ input }) => {
          try {
            const success = await this.missionService.deleteMission(input.id);
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
          } catch (error) {
            if (error instanceof TRPCError) {
              throw error;
            }
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to delete mission: ${getErrorMessage(error)}`,
            });
          }
        }),

      // 任务相关操作
      completeMission: procedure
        .input(this.schemas.completeMission)
        .mutation(async ({ input }) => {
          try {
            const result = await this.missionService.completeMission(
              input.missionId,
              input.userId,
            );
            return {
              success: true,
              data: result,
              message: result.message,
            };
          } catch (error) {
            const errorMessage = getErrorMessage(error);
            if (errorMessage.includes("not found")) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: errorMessage,
              });
            }
            if (errorMessage.includes("cooldown")) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: errorMessage,
              });
            }
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to complete mission: ${getErrorMessage(error)}`,
            });
          }
        }),

      getDailyMissions: procedure
        .input(this.schemas.getDailyMissions)
        .query(async ({ input }) => {
          try {
            const missions = await this.missionService.getDailyMissions(
              input.userId,
            );
            return {
              success: true,
              data: missions,
              count: missions.length,
            };
          } catch (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to get daily missions: ${getErrorMessage(error)}`,
            });
          }
        }),

      getUserMissions: procedure
        .input(this.schemas.getUserMissions)
        .query(async ({ input }) => {
          try {
            // 转换日期字符串为 Date 对象
            const filters = {
              ...input,
              dateFrom: input.dateFrom ? new Date(input.dateFrom) : undefined,
              dateTo: input.dateTo ? new Date(input.dateTo) : undefined,
            };

            const userMissions = await this.missionService.getUserMissions(
              input.userId,
              filters,
            );
            return {
              success: true,
              data: userMissions,
              count: userMissions.length,
            };
          } catch (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to get user missions: ${getErrorMessage(error)}`,
            });
          }
        }),

      getMissionStats: procedure
        .input(this.schemas.getMissionStats)
        .query(async ({ input }) => {
          try {
            const stats = await this.missionService.getMissionStats(
              input.userId,
              {
                from: input.dateFrom ? new Date(input.dateFrom) : new Date(),
                to: input.dateTo ? new Date(input.dateTo) : new Date(),
              },
            );
            return {
              success: true,
              data: stats,
            };
          } catch (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to get mission stats: ${getErrorMessage(error)}`,
            });
          }
        }),
    });
  }
}

// 导出类型用于客户端
export type MissionRouterType = ReturnType<MissionRouter["getRouter"]>;
export type MissionRouterInputs = inferRouterInputs<MissionRouterType>;
export type MissionRouterOutputs = inferRouterOutputs<MissionRouterType>;
