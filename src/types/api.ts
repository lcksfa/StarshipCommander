// Shared types between frontend and backend
export interface Mission {
  id: string;
  title: {
    en: string;
    zh: string;
  };
  description: {
    en: string;
    zh: string;
  };
  xpReward: number;
  coinReward: number;
  isCompleted: boolean;
  category: "fitness" | "learning" | "productivity" | "health" | "creativity";
  emoji: string;
  isDaily: boolean;
  streak: number;
  difficulty: "easy" | "medium" | "hard";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  level: number;
  currentXp: number;
  maxXp: number;
  coins: number;
  totalMissionsCompleted: number;
  totalXpEarned: number;
  rank:
    | "Cadet"
    | "Ensign"
    | "Lieutenant"
    | "Commander"
    | "Captain"
    | "Admiral"
    | "Galactic Hero"
    | "Galactic Legend";
  preferredLang?: "en" | "zh";
  currentStreak?: number;
  longestStreak?: number;
  lastActive?: Date;
}

export interface LogEntry {
  id: string;
  missionId: string;
  missionTitle: string;
  xpEarned: number;
  coinEarned: number;
  timestamp: number;
  category: Mission["category"];
}

// tRPC Router Types (will be auto-generated)
export interface AppRouter {
  health: {
    query: {
      input: never;
      output: {
        status: string;
        timestamp: string;
        framework: string;
        version: string;
      };
    };
  };
  missions: {
    getAll: {
      query: {
        input: never;
        output: Mission[];
      };
    };
    getById: {
      query: {
        input: { id: string };
        output: Mission;
      };
    };
    create: {
      mutation: {
        input: Omit<Mission, "id" | "createdAt" | "updatedAt" | "streak">;
        output: Mission;
      };
    };
    complete: {
      mutation: {
        input: { id: string };
        output: { mission: Mission; stats: UserStats };
      };
    };
    getStats: {
      query: {
        input: never;
        output: UserStats;
      };
    };
    initializeData: {
      mutation: {
        input: never;
        output: { success: boolean; message: string };
      };
    };
  };
}
