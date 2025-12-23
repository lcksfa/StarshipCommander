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
