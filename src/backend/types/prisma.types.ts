/**
 * Prisma Database Types / Prisma 数据库类型
 *
 * Type-safe wrappers for Prisma generated types
 * 为 Prisma 生成的类型提供类型安全的包装器
 */

import type {
  Mission as PrismaMission,
  UserStats as PrismaUserStats,
  MissionHistory as PrismaMissionHistory,
  UserMission as PrismaUserMission,
  Prisma,
} from "@prisma/client";

/**
 * MissionWhereInput - 任务查询条件类型
 */
export type MissionWhereInput = Prisma.MissionWhereInput;

/**
 * MissionUpdateInput - 任务更新数据类型
 */
export type MissionUpdateData = Prisma.MissionUpdateInput;

/**
 * UserMissionWhereInput - 用户任务查询条件类型
 */
export type UserMissionWhereInput = Prisma.UserMissionWhereInput;

/**
 * MissionHistoryWhereInput - 任务历史查询条件类型
 */
export type MissionHistoryWhereInput = Prisma.MissionHistoryWhereInput;

/**
 * Database Mission with relations / 包含关联的数据库任务类型
 * 使用 Prisma 的 include 类型生成
 */
export type DbMissionWithRelations = PrismaMission & {
  userMissions?: PrismaUserMission[];
};

/**
 * Database UserStats / 数据库用户统计类型
 * 添加可能缺少的字段作为可选
 */
export type DbUserStats = Omit<PrismaUserStats, "lastActive"> & {
  lastActive?: Date | null;
};

/**
 * Database MissionHistory with mission / 包含任务的任务历史类型
 */
export type DbMissionHistoryWithMission = PrismaMissionHistory & {
  mission?: PrismaMission;
};

/**
 * Error with message property / 带有 message 属性的错误类型
 */
export interface ErrorWithMessage {
  message: string;
}

/**
 * Unknown error type / 未知错误类型
 */
export type UnknownError = unknown;

/**
 * Type guard for error with message / 带有消息的错误类型守卫
 */
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ErrorWithMessage).message === "string"
  );
}

/**
 * Get error message from unknown error / 从未知错误中获取错误消息
 */
export function getErrorMessage(error: UnknownError): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}
