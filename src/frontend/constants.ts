import { UserStats } from "./types";

// 初始用户统计数据（所有值从零开始）
export const INITIAL_STATS: UserStats = {
  level: 1,
  currentXp: 0,
  maxXp: 100,
  coins: 0,
  rank: "Cadet",
  totalMissionsCompleted: 0,
  totalXpEarned: 0,
};

// 军衔列表（用于显示参考）
export const RANKS = [
  "Cadet",
  "Ensign",
  "Lieutenant",
  "Commander",
  "Captain",
  "Admiral",
  "Galactic Hero",
];
