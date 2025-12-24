/**
 * Level System Configuration / 等级系统配置
 *
 * Implements progressive XP requirements for each level
 * 实现每级渐进式 XP 需求
 */

/**
 * XP required for each level / 每级所需 XP（渐进式设计）
 *
 * Design principles / 设计原则：
 * 1. Early levels: Easy to achieve (keep new users motivated) / 早期等级：容易达成（保持新手动力）
 * 2. Mid levels: Moderate progression (maintain engagement) / 中期等级：适中进度（保持参与度）
 * 3. Late levels: Challenging (provide long-term goals) / 后期等级：挑战性（提供长期目标）
 *
 * Formula: / 公式：
 * - Level 1-10: Linear growth (基础线性增长)
 * - Level 11-30: Moderate exponential (适度指数增长)
 * - Level 31+: Steeper exponential (陡峭指数增长)
 */
export const LEVEL_THRESHOLDS = [
  // Foundation Phase / 基础阶段 (Level 1-5): 快速升级，建立信心
  { level: 1, requiredXp: 0, rank: "Cadet" },
  { level: 2, requiredXp: 50, rank: "Cadet" },
  { level: 3, requiredXp: 120, rank: "Ensign" },
  { level: 4, requiredXp: 200, rank: "Ensign" },
  { level: 5, requiredXp: 300, rank: "Lieutenant" },

  // Growth Phase / 成长阶段 (Level 6-15): 稳定成长
  { level: 6, requiredXp: 420, rank: "Lieutenant" },
  { level: 7, requiredXp: 560, rank: "Lieutenant" },
  { level: 8, requiredXp: 720, rank: "Lieutenant" },
  { level: 9, requiredXp: 900, rank: "Commander" },
  { level: 10, requiredXp: 1100, rank: "Commander" },
  { level: 11, requiredXp: 1350, rank: "Commander" },
  { level: 12, requiredXp: 1620, rank: "Commander" },
  { level: 13, requiredXp: 1920, rank: "Commander" },
  { level: 14, requiredXp: 2250, rank: "Captain" },
  { level: 15, requiredXp: 2600, rank: "Captain" },

  // Challenge Phase / 挑战阶段 (Level 16-25): 增加难度
  { level: 16, requiredXp: 3000, rank: "Captain" },
  { level: 17, requiredXp: 3450, rank: "Captain" },
  { level: 18, requiredXp: 3950, rank: "Captain" },
  { level: 19, requiredXp: 4500, rank: "Captain" },
  { level: 20, requiredXp: 5100, rank: "Admiral" },
  { level: 21, requiredXp: 5750, rank: "Admiral" },
  { level: 22, requiredXp: 6450, rank: "Admiral" },
  { level: 23, requiredXp: 7200, rank: "Admiral" },
  { level: 24, requiredXp: 8000, rank: "Admiral" },
  { level: 25, requiredXp: 8850, rank: "Admiral" },

  // Mastery Phase / 精通阶段 (Level 26-40): 长期目标
  { level: 26, requiredXp: 9750, rank: "Admiral" },
  { level: 27, requiredXp: 10700, rank: "Admiral" },
  { level: 28, requiredXp: 11700, rank: "Galactic Hero" },
  { level: 29, requiredXp: 12750, rank: "Galactic Hero" },
  { level: 30, requiredXp: 13850, rank: "Galactic Hero" },
  { level: 31, requiredXp: 15000, rank: "Galactic Hero" },
  { level: 32, requiredXp: 16200, rank: "Galactic Hero" },
  { level: 33, requiredXp: 17450, rank: "Galactic Hero" },
  { level: 34, requiredXp: 18750, rank: "Galactic Hero" },
  { level: 35, requiredXp: 20100, rank: "Galactic Hero" },
  { level: 36, requiredXp: 21500, rank: "Galactic Hero" },
  { level: 37, requiredXp: 22950, rank: "Galactic Hero" },
  { level: 38, requiredXp: 24450, rank: "Galactic Hero" },
  { level: 39, requiredXp: 26000, rank: "Galactic Hero" },
  { level: 40, requiredXp: 27600, rank: "Galactic Hero" },

  // Legend Phase / 传奇阶段 (Level 41+): 终极挑战
  { level: 41, requiredXp: 30000, rank: "Galactic Legend" },
  { level: 42, requiredXp: 32500, rank: "Galactic Legend" },
  { level: 43, requiredXp: 35100, rank: "Galactic Legend" },
  { level: 44, requiredXp: 37800, rank: "Galactic Legend" },
  { level: 45, requiredXp: 40600, rank: "Galactic Legend" },
  { level: 46, requiredXp: 43500, rank: "Galactic Legend" },
  { level: 47, requiredXp: 46500, rank: "Galactic Legend" },
  { level: 48, requiredXp: 49600, rank: "Galactic Legend" },
  { level: 49, requiredXp: 52800, rank: "Galactic Legend" },
  { level: 50, requiredXp: 56100, rank: "Galactic Legend" },
];

/**
 * Calculate rank based on level / 根据等级计算军衔
 */
export function calculateRank(level: number): string {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (level >= LEVEL_THRESHOLDS[i].level) {
      return LEVEL_THRESHOLDS[i].rank;
    }
  }
  return LEVEL_THRESHOLDS[0].rank;
}

/**
 * Calculate level based on total XP / 根据总 XP 计算等级
 */
export function calculateLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].requiredXp) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

/**
 * Calculate XP progress for current level / 计算当前等级的 XP 进度
 */
export function calculateLevelProgress(totalXp: number): {
  level: number;
  currentXp: number;
  maxXp: number;
  requiredForNext: number;
  progress: number; // percentage 0-100
} {
  const level = calculateLevel(totalXp);

  // Find current and next level thresholds / 查找当前和下一级阈值
  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level);
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level + 1);

  if (!currentThreshold) {
    // Fallback for very high levels / 超高等级的回退方案
    return {
      level,
      currentXp: 0,
      maxXp: 1000,
      requiredForNext: totalXp + 1000,
      progress: 0,
    };
  }

  const currentLevelBaseXp = currentThreshold.requiredXp;
  const currentXp = totalXp - currentLevelBaseXp;

  if (!nextThreshold) {
    // Max level reached / 已达最高等级
    return {
      level,
      currentXp,
      maxXp: currentXp,
      requiredForNext: totalXp,
      progress: 100,
    };
  }

  const maxXp = nextThreshold.requiredXp - currentLevelBaseXp;
  const progress = (currentXp / maxXp) * 100;

  return {
    level,
    currentXp,
    maxXp,
    requiredForNext: nextThreshold.requiredXp,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

/**
 * Get XP requirement for a specific level / 获取特定等级的 XP 需求
 */
export function getRequiredXpForLevel(level: number): number {
  const threshold = LEVEL_THRESHOLDS.find((t) => t.level === level);
  return threshold?.requiredXp ?? 0;
}

/**
 * Calculate XP needed to reach next level / 计算升到下一级所需 XP
 */
export function getXpNeededForNextLevel(totalXp: number): number {
  const level = calculateLevel(totalXp);
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level + 1);

  if (!nextThreshold) {
    return 0; // Already at max level / 已达最高等级
  }

  return nextThreshold.requiredXp - totalXp;
}

/**
 * Format level display string / 格式化等级显示字符串
 */
export function formatLevelDisplay(level: number): string {
  const rank = calculateRank(level);
  return `Level ${level} // ${rank}`;
}

/**
 * Get level tier / 获取等级阶位（用于特殊奖励或解锁）
 */
export type LevelTier = "beginner" | "intermediate" | "advanced" | "expert" | "legend";

export function getLevelTier(level: number): LevelTier {
  if (level <= 5) return "beginner";
  if (level <= 15) return "intermediate";
  if (level <= 25) return "advanced";
  if (level <= 40) return "expert";
  return "legend";
}

/**
 * Calculate bonus multiplier based on level tier / 根据等级阶位计算奖励倍率
 * (for future features like coin bonuses or special missions)
 * （用于未来的功能，如金币奖励加成或特殊任务）
 */
export function getLevelMultiplier(level: number): number {
  const tier = getLevelTier(level);
  switch (tier) {
    case "beginner":
      return 1.0;
    case "intermediate":
      return 1.1;
    case "advanced":
      return 1.25;
    case "expert":
      return 1.5;
    case "legend":
      return 2.0;
    default:
      return 1.0;
  }
}
