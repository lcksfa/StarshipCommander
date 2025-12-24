/**
 * Mission Difficulty Configuration / 任务难度配置
 *
 * Defines reward ranges for each difficulty level
 * 定义每个难度级别的奖励范围
 *
 * Balanced for progressive leveling system / 为渐进式等级系统平衡
 */

/**
 * Mission difficulty configuration / 任务难度配置
 *
 * EASY:   Simple tasks that take 10-30 minutes
 * MEDIUM: Moderate tasks that take 30-60 minutes
 * HARD:   Challenging tasks that take 1+ hours
 *
 * Progression Design / 进度设计：
 * - Early game (Level 1-10): 10 EASY tasks to level up / 前期：10个EASY任务升级
 * - Mid game (Level 11-25): 25 EASY tasks to level up / 中期：25个EASY任务升级
 * - Late game (Level 26+): 50 EASY tasks to level up / 后期：50个EASY任务升级
 */
export const MISSION_DIFFICULTY_CONFIG = {
  /**
   * EASY difficulty rewards / 简单难度奖励
   * - Fixed: 5 XP, 1 coin
   *
   * Leveling speed / 升级速度：
   * - Level 1→2 (needs 50 XP): 10 tasks / 10个任务
   * - Level 5→6 (needs 120 XP): 24 tasks / 24个任务
   * - Level 10→11 (needs 250 XP): 50 tasks / 50个任务
   */
  EASY: {
    min: { xp: 5, coins: 1 },
    max: { xp: 5, coins: 1 },
    recommended: { xp: 5, coins: 1 },
  },

  /**
   * MEDIUM difficulty rewards / 中等难度奖励
   * - Fixed: 10 XP, 2 coins
   *
   * Leveling speed / 升级速度：
   * - Level 1→2 (needs 50 XP): 5 tasks / 5个任务
   * - Level 5→6 (needs 120 XP): 12 tasks / 12个任务
   * - Level 10→11 (needs 250 XP): 25 tasks / 25个任务
   */
  MEDIUM: {
    min: { xp: 10, coins: 2 },
    max: { xp: 10, coins: 2 },
    recommended: { xp: 10, coins: 2 },
  },

  /**
   * HARD difficulty rewards / 困难难度奖励
   * - Fixed: 20 XP, 5 coins
   *
   * Leveling speed / 升级速度：
   * - Level 1→2 (needs 50 XP): 2.5 tasks / 2.5个任务
   * - Level 5→6 (needs 120 XP): 6 tasks / 6个任务
   * - Level 10→11 (needs 250 XP): 12.5 tasks / 12.5个任务
   */
  HARD: {
    min: { xp: 20, coins: 5 },
    max: { xp: 20, coins: 5 },
    recommended: { xp: 20, coins: 5 },
  },
} as const;

/**
 * Streak bonus configuration / 连胜奖励配置
 */
export const STREAK_BONUS_CONFIG = {
  /**
   * Daily streak bonus thresholds / 每日连胜奖励阈值
   */
  thresholds: [
    { days: 5, bonus: { xp: 20, coins: 2 } }, // 5天连胜：20经验，2星币
  ],

  /**
   * Check if streak qualifies for bonus / 检查连胜是否符合奖励条件
   *
   * @param currentStreak - Current streak days / 当前连胜天数
   * @returns Bonus if qualified, null otherwise / 符合奖励条件返回奖励，否则返回null
   */
  getStreakBonus(currentStreak: number): { xp: number; coins: number } | null {
    // Find the highest threshold that the streak qualifies for
    // 找到连胜符合的最高阈值
    for (const threshold of this.thresholds) {
      if (currentStreak >= threshold.days) {
        return threshold.bonus;
      }
    }
    return null;
  },

  /**
   * Get next streak milestone / 获取下一个连胜里程碑
   *
   * @param currentStreak - Current streak days / 当前连胜天数
   * @returns Next milestone or null if already at max / 下一个里程碑或已达到最大值返回null
   */
  getNextMilestone(currentStreak: number): { days: number; bonus: { xp: number; coins: number } } | null {
    for (const threshold of this.thresholds) {
      if (currentStreak < threshold.days) {
        return threshold;
      }
    }
    return null;
  },
};

/**
 * Mission difficulty type / 任务难度类型
 */
export type MissionDifficulty = keyof typeof MISSION_DIFFICULTY_CONFIG;

/**
 * Mission category type / 任务类别类型
 */
export type MissionCategory = "study" | "health" | "chore" | "creative";

/**
 * Get recommended rewards for a difficulty / 获取难度的推荐奖励
 *
 * @param difficulty - The mission difficulty / 任务难度
 * @returns Recommended XP and coins / 推荐的 XP 和金币
 */
export function getRecommendedRewards(difficulty: MissionDifficulty) {
  return MISSION_DIFFICULTY_CONFIG[difficulty].recommended;
}

/**
 * Get reward range for a difficulty / 获取难度的奖励范围
 *
 * @param difficulty - The mission difficulty / 任务难度
 * @returns Min and max rewards / 最小和最大奖励
 */
export function getRewardRange(difficulty: MissionDifficulty) {
  const config = MISSION_DIFFICULTY_CONFIG[difficulty];
  return {
    xp: { min: config.min.xp, max: config.max.xp },
    coins: { min: config.min.coins, max: config.max.coins },
  };
}

/**
 * Validate if rewards are within acceptable range for difficulty
 * 验证奖励是否在难度可接受范围内
 *
 * @param difficulty - The mission difficulty / 任务难度
 * @param xpReward - XP reward to validate / 要验证的 XP 奖励
 * @param coinReward - Coin reward to validate / 要验证的金币奖励
 * @returns True if rewards are valid / 如果奖励有效则返回 true
 */
export function areRewardsValidForDifficulty(
  difficulty: MissionDifficulty,
  xpReward: number,
  coinReward: number
): boolean {
  const config = MISSION_DIFFICULTY_CONFIG[difficulty];

  const xpValid = xpReward >= config.min.xp && xpReward <= config.max.xp;
  const coinsValid =
    coinReward >= config.min.coins && coinReward <= config.max.coins;

  return xpValid && coinsValid;
}
