// 共享类型定义 - 前后端通用
// Shared type definitions - for both frontend and backend

export type MissionCategory = "study" | "health" | "chore" | "creative";

export interface LocalizedText {
  en: string;
  zh: string;
}

export interface Mission {
  id: string;
  title: string; // 简化为单一字符串 / Simplified to single string
  description: string; // 简化为单一字符串 / Simplified to single string
  xpReward: number;
  coinReward: number;
  isCompleted: boolean;
  category: MissionCategory;
  emoji: string;
  isDaily: boolean;
  streak: number;
}

export interface LogEntry {
  id: string;
  missionId: string;
  missionTitle: string; // Keep historical logs simple as strings for now
  xpEarned: number;
  coinEarned: number;
  timestamp: number;
  category: MissionCategory;
}

export interface UserStats {
  level: number;
  currentXp: number;
  maxXp: number;
  coins: number;
  rank: string;
  totalMissionsCompleted: number;
  totalXpEarned: number;
  preferredLang?: string; // 可选字段，后端使用
  currentStreak?: number; // 可选字段，后端使用
  longestStreak?: number; // 可选字段，后端使用
  lastActive?: Date; // 可选字段，后端使用
}

export enum Tab {
  MISSIONS = "MISSIONS",
  LOG = "LOG",
  HANGAR = "HANGAR",
  PROFILE = "PROFILE",
}

// 后端专用类型扩展
// Backend-specific type extensions

export interface MissionCreateInput {
  title: LocalizedText;
  description: LocalizedText;
  xpReward: number;
  coinReward: number;
  category: MissionCategory;
  emoji: string;
  isDaily: boolean;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface MissionUpdateInput {
  title?: LocalizedText;
  description?: LocalizedText;
  xpReward?: number;
  coinReward?: number;
  category?: MissionCategory;
  emoji?: string;
  isDaily?: boolean;
  isActive?: boolean;
}

export interface MissionCompleteInput {
  missionId: string;
  userId: string;
}

export interface MissionCompleteOutput {
  success: boolean;
  xpEarned: number;
  coinEarned: number;
  newLevel?: number;
  streakUpdated: boolean;
  message: string;
}

// API 响应类型
// API response types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 数据库枚举类型 - 与 Prisma schema 同步
// Database enum types - synced with Prisma schema

export enum DbCategory {
  STUDY = "STUDY",
  HEALTH = "HEALTH",
  CHORE = "CHORE",
  CREATIVE = "CREATIVE",
}

export enum DbDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum DbRank {
  CADET = "CADET",
  LIEUTENANT = "LIEUTENANT",
  CAPTAIN = "CAPTAIN",
  COMMANDER = "COMMANDER",
}

// 工具类型
// Utility types

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type MissionCreateRequest = Omit<
  Mission,
  "id" | "isCompleted" | "streak"
>;
export type MissionUpdateRequest = DeepPartial<
  Pick<
    Mission,
    | "title"
    | "description"
    | "xpReward"
    | "coinReward"
    | "category"
    | "emoji"
    | "isDaily"
  >
>;
