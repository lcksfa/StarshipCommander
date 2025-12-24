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
 * - Early game (Level 1-10): 3-5 EASY tasks or 1-2 MEDIUM tasks to level up / 前期：3-5个EASY或1-2个MEDIUM任务升级
 * - Mid game (Level 11-25): 6-10 EASY tasks or 3-5 MEDIUM tasks to level up / 中期：6-10个EASY或3-5个MEDIUM任务升级
 * - Late game (Level 26+): 15+ EASY tasks or 7+ MEDIUM tasks to level up / 后期：15+个EASY或7+个MEDIUM任务升级
 */
export const MISSION_DIFFICULTY_CONFIG = {
  /**
   * EASY difficulty rewards / 简单难度奖励
   * - Min: 8-15 XP, 4-8 coins
   * - Max: 15-30 XP, 8-15 coins
   * - Recommended: 12 XP, 6 coins
   *
   * Leveling speed / 升级速度：
   * - Level 1→2 (needs 50 XP): ~4 tasks / 约4个任务
   * - Level 5→6 (needs 120 XP): ~10 tasks / 约10个任务
   * - Level 10→11 (needs 250 XP): ~21 tasks / 约21个任务
   */
  EASY: {
    min: { xp: 8, coins: 4 },
    max: { xp: 30, coins: 15 },
    recommended: { xp: 12, coins: 6 },
  },

  /**
   * MEDIUM difficulty rewards / 中等难度奖励
   * - Min: 20-40 XP, 10-20 coins
   * - Max: 40-80 XP, 20-40 coins
   * - Recommended: 30 XP, 15 coins
   *
   * Leveling speed / 升级速度：
   * - Level 1→2 (needs 50 XP): ~2 tasks / 约2个任务
   * - Level 5→6 (needs 120 XP): ~4 tasks / 约4个任务
   * - Level 10→11 (needs 250 XP): ~8 tasks / 约8个任务
   */
  MEDIUM: {
    min: { xp: 20, coins: 10 },
    max: { xp: 80, coins: 40 },
    recommended: { xp: 30, coins: 15 },
  },

  /**
   * HARD difficulty rewards / 困难难度奖励
   * - Min: 50-80 XP, 25-40 coins
   * - Max: 80-150 XP, 40-75 coins
   * - Recommended: 60 XP, 30 coins
   *
   * Leveling speed / 升级速度：
   * - Level 1→2 (needs 50 XP): ~1 task / 约1个任务
   * - Level 5→6 (needs 120 XP): ~2 tasks / 约2个任务
   * - Level 10→11 (needs 250 XP): ~4 tasks / 约4个任务
   */
  HARD: {
    min: { xp: 50, coins: 25 },
    max: { xp: 150, coins: 75 },
    recommended: { xp: 60, coins: 30 },
  },
} as const;

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
