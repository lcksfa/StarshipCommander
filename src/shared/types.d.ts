export type MissionCategory = "study" | "health" | "chore" | "creative";
export interface LocalizedText {
    en: string;
    zh: string;
}
export interface Mission {
    id: string;
    title: LocalizedText;
    description: LocalizedText;
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
    missionTitle: string;
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
    preferredLang?: string;
    currentStreak?: number;
    longestStreak?: number;
    lastActive?: Date;
}
export declare enum Tab {
    MISSIONS = "MISSIONS",
    LOG = "LOG",
    HANGAR = "HANGAR",
    PROFILE = "PROFILE"
}
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
export declare enum DbCategory {
    STUDY = "STUDY",
    HEALTH = "HEALTH",
    CHORE = "CHORE",
    CREATIVE = "CREATIVE"
}
export declare enum DbDifficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD"
}
export declare enum DbRank {
    CADET = "CADET",
    LIEUTENANT = "LIEUTENANT",
    CAPTAIN = "CAPTAIN",
    COMMANDER = "COMMANDER"
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type MissionCreateRequest = Omit<Mission, "id" | "isCompleted" | "streak">;
export type MissionUpdateRequest = DeepPartial<Pick<Mission, "title" | "description" | "xpReward" | "coinReward" | "category" | "emoji" | "isDaily">>;
//# sourceMappingURL=types.d.ts.map