import { UserStats } from "./types";

// 初始用户统计数据（所有值从零开始）
// 使用新的渐进式等级系统 / Using new progressive level system
export const INITIAL_STATS: UserStats = {
  level: 1,
  currentXp: 0,
  maxXp: 50, // Level 1→2 需要 50 XP / Level 1→2 needs 50 XP
  coins: 0,
  rank: "Cadet", // 初始军衔 / Initial rank
  totalMissionsCompleted: 0,
  totalXpEarned: 0,
  currentStreak: 0,
  longestStreak: 0,
};

// 军衔列表（用于显示参考）
// 军衔现在根据等级动态计算，由后端 level-system.ts 管理
// Ranks are now dynamically calculated based on level, managed by backend level-system.ts
export const RANKS = [
  "Cadet", // Level 1-2
  "Ensign", // Level 3-4
  "Lieutenant", // Level 5-8
  "Commander", // Level 9-13
  "Captain", // Level 14-20
  "Admiral", // Level 21-27
  "Galactic Hero", // Level 28-40
  "Galactic Legend", // Level 41+
] as const;
