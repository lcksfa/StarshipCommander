import { Mission, UserStats, LogEntry } from "./types";

export const INITIAL_STATS: UserStats = {
  level: 5,
  currentXp: 450,
  maxXp: 1000,
  coins: 1250,
  rank: "Captain",
  totalMissionsCompleted: 142,
  totalXpEarned: 5000,
};

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: "1",
    title: {
      en: "Dental Maintenance",
      zh: "牙齿维护协议",
    },
    description: {
      en: "Brush teeth for 2 minutes.",
      zh: "执行刷牙程序，持续2分钟。",
    },
    xpReward: 50,
    coinReward: 20,
    isCompleted: false,
    category: "health",
    emoji: "🦷",
    isDaily: true,
    streak: 12,
  },
  {
    id: "2",
    title: {
      en: "Data Intake",
      zh: "数据摄入",
    },
    description: {
      en: "Read 10 pages of a book.",
      zh: "阅读书籍10页，扩充数据库。",
    },
    xpReward: 100,
    coinReward: 40,
    isCompleted: true,
    category: "study",
    emoji: "📚",
    isDaily: true,
    streak: 3,
  },
  {
    id: "3",
    title: {
      en: "Quarters Cleanup",
      zh: "舱室清理",
    },
    description: {
      en: "Make your bed nicely.",
      zh: "整理休眠舱（铺床）。",
    },
    xpReward: 75,
    coinReward: 30,
    isCompleted: false,
    category: "chore",
    emoji: "🛏️",
    isDaily: true,
    streak: 5,
  },
  {
    id: "4",
    title: {
      en: "Hydration Check",
      zh: "液体补充",
    },
    description: {
      en: "Drink a glass of water.",
      zh: "摄入一杯H2O。",
    },
    xpReward: 25,
    coinReward: 10,
    isCompleted: false,
    category: "health",
    emoji: "💧",
    isDaily: false,
    streak: 0,
  },
  {
    id: "5",
    title: {
      en: "Academy Training",
      zh: "学院特训",
    },
    description: {
      en: "Complete homework.",
      zh: "完成学院指派的作业任务。",
    },
    xpReward: 150,
    coinReward: 60,
    isCompleted: false,
    category: "study",
    emoji: "📝",
    isDaily: false,
    streak: 0,
  },
];

// Mock Data for the Log
const ONE_DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: "log-1",
    missionId: "2",
    missionTitle: "Data Intake",
    xpEarned: 100,
    coinEarned: 40,
    category: "study",
    timestamp: now - 1000 * 60 * 30, // 30 mins ago
  },
  {
    id: "log-2",
    missionId: "1",
    missionTitle: "Dental Maintenance",
    xpEarned: 50,
    coinEarned: 20,
    category: "health",
    timestamp: now - ONE_DAY, // Yesterday
  },
  {
    id: "log-3",
    missionId: "3",
    missionTitle: "Quarters Cleanup",
    xpEarned: 75,
    coinEarned: 30,
    category: "chore",
    timestamp: now - ONE_DAY - 1000 * 60 * 60 * 2, // Yesterday
  },
  {
    id: "log-4",
    missionId: "5",
    missionTitle: "Academy Training",
    xpEarned: 150,
    coinEarned: 60,
    category: "study",
    timestamp: now - ONE_DAY * 2, // 2 days ago
  },
];

export const RANKS = [
  "Cadet",
  "Ensign",
  "Lieutenant",
  "Commander",
  "Captain",
  "Admiral",
  "Galactic Hero",
];
