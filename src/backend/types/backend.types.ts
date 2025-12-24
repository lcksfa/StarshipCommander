// 后端专用类型定义
// Backend-specific type definitions

import {
  Mission,
  MissionCategory,
  UserStats,
  LocalizedText,
} from "../../shared/types.js";
import { Prisma } from "@prisma/client";

// 数据库实体类型 - Prisma 生成的类型
export type DbMission = Prisma.MissionGetPayload<{
  include: {
    userProgress: true;
    userMissions: true;
  };
}>;

export type DbUserStats = Prisma.UserStatsGetPayload<{
  include: {
    achievements: true;
    missionHistory: true;
  };
}>;

export type DbMissionHistory = Prisma.MissionHistoryGetPayload<{}>;

// 服务层类型 - 业务逻辑中使用的数据结构
export interface MissionService {
  // 任务 CRUD 操作
  createMission(input: MissionCreateInput): Promise<Mission>;
  getMission(id: string): Promise<Mission | null>;
  getAllMissions(filters?: MissionFilters): Promise<Mission[]>;
  updateMission(id: string, input: MissionUpdateInput): Promise<Mission>;
  deleteMission(id: string): Promise<boolean>;

  // 任务完成相关
  completeMission(
    missionId: string,
    userId: string,
  ): Promise<MissionCompleteResult>;
  getDailyMissions(userId: string): Promise<Mission[]>;
  getUserMissions(
    userId: string,
    filters?: UserMissionFilters,
  ): Promise<UserMission[]>;

  // 任务统计
  getMissionStats(userId: string, period?: StatsPeriod): Promise<MissionStats>;
}

export interface UserStatsService {
  // 用户统计 CRUD 操作
  createUserStats(
    userId: string,
    input?: UserStatsCreateInput,
  ): Promise<UserStats>;
  getUserStats(userId: string): Promise<UserStats | null>;
  updateUserStats(
    userId: string,
    input: UserStatsUpdateInput,
  ): Promise<UserStats>;

  // 统计计算
  calculateLevel(totalXp: number): {
    level: number;
    currentXp: number;
    maxXp: number;
  };
  calculateRank(level: number): string;
  updateStatsAfterMission(
    userId: string,
    missionId: string,
    xpEarned: number,
    coinEarned: number,
  ): Promise<UserStats>;

  // 连击和成就
  updateStreak(userId: string, completed: boolean): Promise<UserStats>;
  checkAchievements(userId: string): Promise<Achievement[]>;
}

// 输入输出类型
export interface MissionCreateInput {
  title: string; // 简化为单一字符串 / Simplified to single string
  description: string; // 简化为单一字符串 / Simplified to single string
  xpReward: number;
  coinReward: number;
  category: MissionCategory;
  emoji: string;
  isDaily: boolean;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface MissionUpdateInput {
  title?: string; // 简化为单一字符串 / Simplified to single string
  description?: string; // 简化为单一字符串 / Simplified to single string
  xpReward?: number;
  coinReward?: number;
  category?: MissionCategory;
  emoji?: string;
  isDaily?: boolean;
  isActive?: boolean;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
}

export interface MissionCompleteResult {
  success: boolean;
  mission: Mission;
  userStats: UserStats;
  xpEarned: number;
  coinEarned: number;
  streakUpdated: boolean;
  newLevel?: number;
  message: string;
}

export interface UserMissionCreateInput {
  userId: string;
  missionId: string;
  isCompleted?: boolean;
  completedAt?: Date;
  streak?: number;
}

export interface UserStatsCreateInput {
  userId: string;
  preferredLang?: "en" | "zh";
  level?: number;
  currentXp?: number;
  coins?: number;
}

export interface UserStatsUpdateInput {
  preferredLang?: "en" | "zh";
  level?: number;
  currentXp?: number;
  maxXp?: number;
  coins?: number;
  totalMissionsCompleted?: number;
  totalXpEarned?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActive?: Date;
}

// 过滤和查询类型
export interface MissionFilters {
  category?: MissionCategory;
  isDaily?: boolean;
  isActive?: boolean;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  limit?: number;
  offset?: number;
}

export interface UserMissionFilters {
  isCompleted?: boolean;
  category?: MissionCategory;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface StatsPeriod {
  from: Date;
  to: Date;
}

export interface MissionStats {
  totalMissions: number;
  completedMissions: number;
  completionRate: number;
  xpEarned: number;
  coinsEarned: number;
  categoryStats: {
    [category in MissionCategory]: {
      total: number;
      completed: number;
      xpEarned: number;
    };
  };
  dailyStats: {
    date: string;
    missionsCompleted: number;
    xpEarned: number;
  }[];
}

// 用户任务关联类型
export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  mission: Mission;
  isCompleted: boolean;
  completedAt?: Date;
  streak: number;
  lastCompleted?: Date;
  cooldownUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 成就系统类型
export interface Achievement {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  condition: AchievementCondition;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  isHidden: boolean;
  createdAt: Date;
}

export interface AchievementCondition {
  type: "MISSIONS_COMPLETED" | "XP_EARNED" | "STREAK_DAYS" | "CATEGORY_MASTER";
  target: number;
  category?: MissionCategory;
  period?: StatsPeriod;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: Date;
  progress: Record<string, any>;
}

// API 响应类型
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface PaginatedServiceResponse<T> extends ServiceResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 错误类型
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

// 配置类型
export interface DatabaseConfig {
  url: string;
  ssl?: boolean;
  connectionLimit?: number;
}

export interface AppConfig {
  database: DatabaseConfig;
  port: number;
  nodeEnv: "development" | "production" | "test";
  logLevel: "debug" | "info" | "warn" | "error";
}
