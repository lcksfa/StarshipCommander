/**
 * Mission Difficulty Configuration / 任务难度配置
 *
 * Defines reward ranges for each difficulty level
 * 定义每个难度级别的奖励范围
 */

/**
 * Mission difficulty configuration / 任务难度配置
 *
 * EASY:   Simple tasks that take 10-30 minutes
 * MEDIUM: Moderate tasks that take 30-60 minutes
 * HARD:   Challenging tasks that take 1+ hours
 */
export const MISSION_DIFFICULTY_CONFIG = {
  /**
   * EASY difficulty rewards / 简单难度奖励
   * - Min: 10-25 XP, 5-15 coins
   * - Max: 25-50 XP, 15-25 coins
   * - Recommended: 25 XP, 10 coins
   */
  EASY: {
    min: { xp: 10, coins: 5 },
    max: { xp: 50, coins: 25 },
    recommended: { xp: 25, coins: 10 },
  },

  /**
   * MEDIUM difficulty rewards / 中等难度奖励
   * - Min: 30-75 XP, 15-40 coins
   * - Max: 75-150 XP, 40-75 coins
   * - Recommended: 75 XP, 30 coins
   */
  MEDIUM: {
    min: { xp: 30, coins: 15 },
    max: { xp: 150, coins: 75 },
    recommended: { xp: 75, coins: 30 },
  },

  /**
   * HARD difficulty rewards / 困难难度奖励
   * - Min: 100-200 XP, 50-125 coins
   * - Max: 200-500 XP, 125-250 coins
   * - Recommended: 200 XP, 100 coins
   */
  HARD: {
    min: { xp: 100, coins: 50 },
    max: { xp: 500, coins: 250 },
    recommended: { xp: 200, coins: 100 },
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
