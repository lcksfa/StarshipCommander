// Mission 服务 - 任务管理业务逻辑
// Mission Service - Task management business logic

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import {
  Mission,
  MissionCategory,
  UserStats,
  LogEntry,
} from "../shared/shared/types.js";
import {
  MissionCreateInput,
  MissionUpdateInput,
  MissionCompleteResult,
  UserMissionFilters,
  MissionStats,
  StatsPeriod,
  ServiceError,
} from "../types/backend.types.js";
import {
  mapFrontendToDbCategory,
  mapDbToFrontendCategory,
} from "../shared/shared/type-mappers.js";

/**
 * 从错误对象中提取错误消息
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

@Injectable()
export class MissionService {
  private readonly prisma: PrismaClient;

  constructor() {
    // 直接创建 PrismaClient 实例，不依赖依赖注入
    this.prisma = new PrismaClient();
  }

  /**
   * 手动连接数据库（需要在应用启动时调用）
   */
  async connect() {
    await this.prisma.$connect();
    console.log("✅ MissionService: Database connected");
  }

  /**
   * 创建新任务
   */
  async createMission(input: MissionCreateInput): Promise<Mission> {
    try {
      const dbMission = await this.prisma.mission.create({
        data: {
          title: input.title,
          description: input.description,
          xpReward: input.xpReward,
          coinReward: input.coinReward,
          category: mapFrontendToDbCategory(input.category) as any,
          emoji: input.emoji,
          isDaily: input.isDaily,
          difficulty: input.difficulty as any,
          isActive: true,
        },
      });

      return this.mapDbMissionToFrontend(dbMission);
    } catch (error) {
      throw new ServiceError(
        `Failed to create mission: ${getErrorMessage(error)}`,
        "CREATE_MISSION_ERROR",
        400,
      );
    }
  }

  /**
   * 根据 ID 获取任务
   */
  async getMission(id: string): Promise<Mission | null> {
    try {
      const dbMission = await this.prisma.mission.findUnique({
        where: { id },
        include: {
          userProgress: true,
          userMissions: true,
        },
      });

      return dbMission ? this.mapDbMissionToFrontend(dbMission) : null;
    } catch (error) {
      throw new ServiceError(
        `Failed to get mission: ${getErrorMessage(error)}`,
        "GET_MISSION_ERROR",
        500,
      );
    }
  }

  /**
   * 获取所有任务
   */
  async getAllMissions(filters?: {
    category?: MissionCategory;
    isDaily?: boolean;
    isActive?: boolean;
    difficulty?: "EASY" | "MEDIUM" | "HARD";
    limit?: number;
    offset?: number;
    userId?: string; // 添加 userId 参数以获取用户特定的完成状态
  }): Promise<Mission[]> {
    try {
      const where: any = {};

      if (filters?.category) {
        where.category = mapFrontendToDbCategory(filters.category);
      }
      if (filters?.isDaily !== undefined) {
        where.isDaily = filters.isDaily;
      }
      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
      if (filters?.difficulty) {
        where.difficulty = filters.difficulty;
      }

      const dbMissions = await this.prisma.mission.findMany({
        where,
        include: {
          userMissions: filters?.userId
            ? {
                where: {
                  userId: filters.userId,
                },
              }
            : true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: filters?.limit,
        skip: filters?.offset,
      });

      return dbMissions.map((dbMission) =>
        this.mapDbMissionToFrontend(dbMission, filters?.userId),
      );
    } catch (error) {
      throw new ServiceError(
        `Failed to get all missions: ${getErrorMessage(error)}`,
        "GET_MISSIONS_ERROR",
        500,
      );
    }
  }

  /**
   * 更新任务
   */
  async updateMission(id: string, input: MissionUpdateInput): Promise<Mission> {
    try {
      // 检查任务是否存在
      const existingMission = await this.prisma.mission.findUnique({
        where: { id },
      });

      if (!existingMission) {
        throw new NotFoundException(`Mission with id ${id} not found`);
      }

      const updateData: any = {};

      if (input.title) updateData.title = input.title;
      if (input.description) updateData.description = input.description;
      if (input.xpReward !== undefined) updateData.xpReward = input.xpReward;
      if (input.coinReward !== undefined)
        updateData.coinReward = input.coinReward;
      if (input.category)
        updateData.category = mapFrontendToDbCategory(input.category);
      if (input.emoji) updateData.emoji = input.emoji;
      if (input.isDaily !== undefined) updateData.isDaily = input.isDaily;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.difficulty) updateData.difficulty = input.difficulty;

      const dbMission = await this.prisma.mission.update({
        where: { id },
        data: updateData,
        include: {
          userProgress: true,
          userMissions: true,
        },
      });

      return this.mapDbMissionToFrontend(dbMission);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ServiceError(
        `Failed to update mission: ${getErrorMessage(error)}`,
        "UPDATE_MISSION_ERROR",
        400,
      );
    }
  }

  /**
   * 删除任务
   */
  async deleteMission(id: string): Promise<boolean> {
    try {
      await this.prisma.mission.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      throw new ServiceError(
        `Failed to delete mission: ${getErrorMessage(error)}`,
        "DELETE_MISSION_ERROR",
        500,
      );
    }
  }

  /**
   * 完成任务
   */
  async completeMission(
    missionId: string,
    userId: string,
  ): Promise<MissionCompleteResult> {
    try {
      const mission = await this.prisma.mission.findUnique({
        where: { id: missionId },
      });

      if (!mission) {
        throw new NotFoundException(`Mission with id ${missionId} not found`);
      }

      // 获取用户任务记录（用于每日任务的连续性计算）
      const userMission = await this.prisma.userMission.findUnique({
        where: {
          userId_missionId: {
            userId,
            missionId,
          },
        },
      });

      // 使用事务确保数据一致性
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. 更新用户任务完成状态
        const now = new Date();
        let streak = (userMission?.streak || 0) + 1;

        if (mission.isDaily) {
          // 每日任务：检查是否是连续完成
          const lastCompleted = userMission?.lastCompleted;
          if (lastCompleted) {
            const daysDiff = Math.floor(
              (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24),
            );
            if (daysDiff > 1) {
              streak = 1; // 中断了连续性
            }
          }
        }

        await tx.userMission.upsert({
          where: {
            userId_missionId: {
              userId,
              missionId,
            },
          },
          create: {
            userId,
            missionId,
            isCompleted: true,
            completedAt: now,
            streak,
            lastCompleted: now,
          },
          update: {
            isCompleted: true,
            completedAt: now,
            streak,
            lastCompleted: now,
          },
        });

        // 2. 更新用户统计
        const userStats = await tx.userStats.findUnique({
          where: { userId },
        });

        if (!userStats) {
          throw new BadRequestException(
            `User stats for userId ${userId} not found`,
          );
        }

        const newTotalXp = userStats.totalXpEarned + mission.xpReward;
        const newCoins = userStats.coins + mission.coinReward;
        const newTotalMissions = userStats.totalMissionsCompleted + 1;

        // 计算新等级
        const newLevel = this.calculateLevel(newTotalXp);
        const levelUp = newLevel > userStats.level;

        await tx.userStats.update({
          where: { userId },
          data: {
            currentXp: userStats.currentXp + mission.xpReward,
            totalXpEarned: newTotalXp,
            coins: newCoins,
            totalMissionsCompleted: newTotalMissions,
            level: newLevel,
            currentStreak: mission.isDaily
              ? Math.max(userStats.currentStreak + 1, streak)
              : userStats.currentStreak,
            longestStreak: Math.max(
              userStats.longestStreak,
              mission.isDaily
                ? Math.max(userStats.currentStreak + 1, streak)
                : userStats.currentStreak,
            ),
            lastActive: now,
          },
        });

        // 3. 记录任务历史 / Record mission history
        await tx.missionHistory.create({
          data: {
            userStatsId: userStats.id, // 外键：引用 UserStats 的主键 / Foreign key to UserStats primary key
            userId: userStats.userId, // 冗余字段：方便查询 / Redundant field for convenience
            missionId,
            xpEarned: mission.xpReward,
            coinEarned: mission.coinReward,
            completedAt: now,
          },
        });

        return {
          xpEarned: mission.xpReward,
          coinEarned: mission.coinReward,
          newLevel,
          levelUp,
          newCoins,
        };
      });

      // 4. 获取更新后的数据
      const [updatedMission, updatedStats] = await Promise.all([
        this.getMission(missionId),
        this.prisma.userStats.findUnique({
          where: { userId },
        }),
      ]);

      if (!updatedMission || !updatedStats) {
        throw new ServiceError(
          "Failed to fetch updated data",
          "COMPLETE_MISSION_ERROR",
          500,
        );
      }

      return {
        success: true,
        mission: updatedMission,
        userStats: this.mapDbUserStatsToFrontend(updatedStats),
        xpEarned: result.xpEarned,
        coinEarned: result.coinEarned,
        streakUpdated: true,
        newLevel: result.levelUp ? result.newLevel : undefined,
        message: result.levelUp
          ? `Mission completed! You leveled up to ${result.newLevel}!`
          : `Mission completed! +${result.xpEarned} XP, +${result.coinEarned} coins`,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new ServiceError(
        `Failed to complete mission: ${getErrorMessage(error)}`,
        "COMPLETE_MISSION_ERROR",
        500,
      );
    }
  }

  /**
   * 获取每日任务
   */
  async getDailyMissions(userId: string): Promise<Mission[]> {
    try {
      const dbMissions = await this.prisma.mission.findMany({
        where: {
          isDaily: true,
          isActive: true,
        },
        include: {
          userMissions: {
            where: {
              userId,
            },
          },
        },
      });

      return dbMissions.map((dbMission) =>
        this.mapDbMissionToFrontend(dbMission),
      );
    } catch (error) {
      throw new ServiceError(
        `Failed to get daily missions: ${getErrorMessage(error)}`,
        "GET_DAILY_MISSIONS_ERROR",
        500,
      );
    }
  }

  /**
   * 获取用户任务
   */
  async getUserMissions(
    userId: string,
    filters?: UserMissionFilters,
  ): Promise<any[]> {
    try {
      const where: any = {
        userId,
      };

      if (filters?.isCompleted !== undefined) {
        where.isCompleted = filters.isCompleted;
      }
      if (filters?.dateFrom || filters?.dateTo) {
        where.completedAt = {};
        if (filters.dateFrom) where.completedAt.gte = filters.dateFrom;
        if (filters.dateTo) where.completedAt.lte = filters.dateTo;
      }

      const userMissions = await this.prisma.userMission.findMany({
        where,
        include: {
          mission: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return userMissions.map((userMission) => ({
        id: userMission.id,
        userId: userMission.userId,
        missionId: userMission.missionId,
        mission: this.mapDbMissionToFrontend(userMission.mission),
        isCompleted: userMission.isCompleted,
        completedAt: userMission.completedAt,
        streak: userMission.streak,
        lastCompleted: userMission.lastCompleted,
        cooldownUntil: userMission.cooldownUntil,
        createdAt: userMission.createdAt,
        updatedAt: userMission.updatedAt,
      }));
    } catch (error) {
      throw new ServiceError(
        `Failed to get user missions: ${getErrorMessage(error)}`,
        "GET_USER_MISSIONS_ERROR",
        500,
      );
    }
  }

  /**
   * 获取任务统计
   */
  async getMissionStats(
    userId: string,
    period?: StatsPeriod,
  ): Promise<MissionStats> {
    try {
      const dateFilter = period
        ? {
            timestamp: {
              gte: period.from,
              lte: period.to,
            },
          }
        : {};

      // 先获取 userStats 以获得其 ID
      const userStats = await this.prisma.userStats.findUnique({
        where: { userId },
      });

      if (!userStats) {
        throw new ServiceError(
          `User stats for userId ${userId} not found`,
          "GET_MISSION_STATS_ERROR",
          404,
        );
      }

      const [totalMissions, completedMissions, historyData] = await Promise.all(
        [
          this.prisma.userMission.count({
            where: { userId },
          }),
          this.prisma.userMission.count({
            where: {
              userId,
              isCompleted: true,
            },
          }),
          this.prisma.missionHistory.findMany({
            where: {
              userId: userStats.userId, // 使用正确的字段 / Use correct field
              ...dateFilter,
            },
          }),
        ],
      );

      const completionRate =
        totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

      const xpEarned = historyData.reduce(
        (sum, entry) => sum + entry.xpEarned,
        0,
      );
      const coinsEarned = historyData.reduce(
        (sum, entry) => sum + entry.coinEarned,
        0,
      );

      // 分类统计 - 暂时简化 / Category stats - temporarily simplified
      const categoryStats = {
        study: { total: 0, completed: 0, xpEarned: 0 },
        health: { total: 0, completed: 0, xpEarned: 0 },
        chore: { total: 0, completed: 0, xpEarned: 0 },
        creative: { total: 0, completed: 0, xpEarned: 0 },
      };

      // 每日统计 - 暂时简化 / Daily stats - temporarily simplified
      const dailyStatsMap = new Map<
        string,
        { missionsCompleted: number; xpEarned: number }
      >();

      historyData.forEach((entry) => {
        const dateKey = entry.completedAt.toISOString().split("T")[0];
        const existing = dailyStatsMap.get(dateKey) || {
          missionsCompleted: 0,
          xpEarned: 0,
        };
        dailyStatsMap.set(dateKey, {
          missionsCompleted: existing.missionsCompleted + 1,
          xpEarned: existing.xpEarned + entry.xpEarned,
        });
      });

      const dailyStats = Array.from(dailyStatsMap.entries())
        .map(([date, data]) => ({
          date,
          missionsCompleted: data.missionsCompleted,
          xpEarned: data.xpEarned,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalMissions,
        completedMissions,
        completionRate,
        xpEarned,
        coinsEarned,
        categoryStats: categoryStats as any,
        dailyStats,
      };
    } catch (error) {
      throw new ServiceError(
        `Failed to get mission stats: ${getErrorMessage(error)}`,
        "GET_MISSION_STATS_ERROR",
        500,
      );
    }
  }

  /**
   * 获取用户历史记录列表 / Get user history
   * 暂时简化实现 / Temporarily simplified implementation
   */
  async getUserHistory(
    userId: string,
    filters?: {
      dateFrom?: Date;
      dateTo?: Date;
      category?: MissionCategory;
      limit?: number;
      offset?: number;
    },
  ): Promise<LogEntry[]> {
    try {
      const where: any = {
        userId,
      };

      // 日期过滤 - 使用 completedAt / Date filter - use completedAt
      if (filters?.dateFrom || filters?.dateTo) {
        where.completedAt = {};
        if (filters.dateFrom) where.completedAt.gte = filters.dateFrom;
        if (filters.dateTo) where.completedAt.lte = filters.dateTo;
      }

      const historyData = await this.prisma.missionHistory.findMany({
        where,
        orderBy: {
          completedAt: "desc",
        },
        take: filters?.limit,
        skip: filters?.offset,
        include: {
          mission: true, // 包含任务信息 / Include mission info
        },
      });

      // 转换为前端 LogEntry 格式 / Convert to frontend LogEntry format
      return historyData.map((entry) => {
        // 导入 LogEntry 类型或临时定义
        const logEntry: any = {
          id: entry.id,
          missionId: entry.missionId,
          missionTitle: entry.mission?.title || "Unknown Mission", // 使用任务的 title / Use mission title
          xpEarned: entry.xpEarned,
          coinEarned: entry.coinEarned,
          timestamp: entry.completedAt.getTime(),
          category: entry.mission
            ? mapDbToFrontendCategory(entry.mission.category)
            : "study",
        };
        return logEntry;
      });
    } catch (error) {
      throw new ServiceError(
        `Failed to get user history: ${getErrorMessage(error)}`,
        "GET_USER_HISTORY_ERROR",
        500,
      );
    }
  }

  /**
   * 获取用户统计
   */
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const dbUserStats = await this.prisma.userStats.findUnique({
        where: { userId },
      });

      if (!dbUserStats) {
        return null;
      }

      return this.mapDbUserStatsToFrontend(dbUserStats);
    } catch (error) {
      throw new ServiceError(
        `Failed to get user stats: ${getErrorMessage(error)}`,
        "GET_USER_STATS_ERROR",
        500,
      );
    }
  }

  /**
   * 辅助方法：数据库任务对象转换为前端任务对象
   * Helper method: Convert database mission object to frontend mission object
   */
  private mapDbMissionToFrontend(dbMission: any, userId?: string): Mission {
    // 如果提供了 userId，从 UserMission 表中获取用户的完成状态
    let isCompleted = dbMission.isCompleted;
    let streak = dbMission.streak || 0;

    if (userId && dbMission.userMissions && dbMission.userMissions.length > 0) {
      const userMission = dbMission.userMissions[0];
      isCompleted = userMission.isCompleted;
      streak = userMission.streak || 0;
    }

    return {
      id: dbMission.id,
      title: dbMission.title,
      description: dbMission.description,
      xpReward: dbMission.xpReward,
      coinReward: dbMission.coinReward,
      isCompleted,
      category: mapDbToFrontendCategory(dbMission.category),
      emoji: dbMission.emoji,
      isDaily: dbMission.isDaily,
      streak,
    };
  }

  /**
   * 辅助方法：数据库用户统计转换为前端用户统计
   */
  private mapDbUserStatsToFrontend(dbUserStats: any): UserStats {
    return {
      level: dbUserStats.level,
      currentXp: dbUserStats.currentXp,
      maxXp: dbUserStats.maxXp,
      coins: dbUserStats.coins,
      rank: dbUserStats.rank,
      totalMissionsCompleted: dbUserStats.totalMissionsCompleted,
      totalXpEarned: dbUserStats.totalXpEarned,
      preferredLang: dbUserStats.preferredLang,
      currentStreak: dbUserStats.currentStreak,
      longestStreak: dbUserStats.longestStreak,
      lastActive: dbUserStats.lastActive,
    };
  }

  /**
   * 辅助方法：根据总 XP 计算等级
   */
  private calculateLevel(totalXp: number): number {
    // 简单的等级计算公式：每100点XP升一级
    return Math.floor(totalXp / 100) + 1;
  }
}
