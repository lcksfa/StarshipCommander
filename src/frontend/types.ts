// 前端类型定义 - 引用共享类型
// Frontend type definitions - importing from shared types

import { LogEntry, Mission, MissionCategory, UserStats } from "../shared/types";
import { Tab } from "../shared/types";

export type {
  MissionCategory,
  LocalizedText,
  Mission,
  LogEntry,
  UserStats,
} from "../shared/types";

export { Tab };

// 军衔中文映射 / Rank Chinese translations
export const RANK_ZH_MAP: Record<string, string> = {
  Cadet: "学员",
  Ensign: "少尉",
  Lieutenant: "中尉",
  Commander: "指挥官",
  Captain: "舰长",
  Admiral: "上将",
  "Galactic Hero": "银河英雄",
  "Galactic Legend": "银河传奇",
};

/**
 * 将英文军衔转换为中文
 * Convert English rank to Chinese
 */
export function getRankInChinese(rank: string): string {
  return RANK_ZH_MAP[rank] || rank;
}

// 前端专用类型
// Frontend-specific types

export interface LanguageContextType {
  language: "en" | "zh";
  t: Record<string, string>;
  setLanguage: (lang: "en" | "zh") => void;
}

export interface AddMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (mission: {
    title: string;
    category: MissionCategory;
    difficulty: "easy" | "medium" | "hard";
    xp: number;
    coins: number;
    emoji: string;
    isDaily: boolean;
  }) => void;
}

export interface MissionCardProps {
  mission: Mission;
  onComplete: (missionId: string, result?: any) => void;
  isAnimated?: boolean;
}

export interface HUDProps {
  stats: UserStats;
}

export interface CaptainsLogProps {
  logs: LogEntry[];
  stats: UserStats;
}

export interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// 本地状态类型
// Local state types

export interface AppState {
  missions: Mission[];
  stats: UserStats;
  historyLog: LogEntry[];
  activeTab: Tab;
  sidebarOpen: boolean;
  addMissionModalOpen: boolean;
  language: "en" | "zh";
}
