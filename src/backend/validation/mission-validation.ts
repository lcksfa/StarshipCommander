/**
 * Mission Validation Functions / 任务验证函数
 *
 * Custom validation logic for mission creation
 * 任务创建的自定义验证逻辑
 */

import { z } from "zod";
import {
  MISSION_DIFFICULTY_CONFIG,
  type MissionDifficulty,
  getRewardRange,
} from "../config/mission-rules.js";

/**
 * Validate that rewards match the difficulty level
 * 验证奖励与难度级别匹配
 *
 * @param data - Mission data to validate / 要验证的任务数据
 * @returns True if rewards match difficulty / 如果奖励与难度匹配则返回 true
 */
export function validateRewardsMatchDifficulty(data: {
  difficulty: MissionDifficulty;
  xpReward: number;
  coinReward: number;
}): boolean {
  const config = MISSION_DIFFICULTY_CONFIG[data.difficulty];

  const xpValid = data.xpReward >= config.min.xp && data.xpReward <= config.max.xp;
  const coinsValid =
    data.coinReward >= config.min.coins && data.coinReward <= config.max.coins;

  return xpValid && coinsValid;
}

/**
 * Get reward validation error message
 * 获取奖励验证错误消息
 *
 * @param data - Mission data to validate / 要验证的任务数据
 * @returns Error message or null if valid / 错误消息，如果有效则返回 null
 */
export function getRewardValidationErrorMessage(data: {
  difficulty: MissionDifficulty;
  xpReward: number;
  coinReward: number;
}): string | null {
  const config = MISSION_DIFFICULTY_CONFIG[data.difficulty];
  const range = getRewardRange(data.difficulty);

  const xpValid = data.xpReward >= config.min.xp && data.xpReward <= config.max.xp;
  const coinsValid =
    data.coinReward >= config.min.coins && data.coinReward <= config.max.coins;

  if (!xpValid && !coinsValid) {
    return `For ${data.difficulty} difficulty: XP must be ${range.xp.min}-${range.xp.max}, coins must be ${range.coins.min}-${range.coins.max}`;
  }

  if (!xpValid) {
    return `For ${data.difficulty} difficulty: XP must be between ${range.xp.min}-${range.xp.max}`;
  }

  if (!coinsValid) {
    return `For ${data.difficulty} difficulty: Coins must be between ${range.coins.min}-${range.coins.max}`;
  }

  return null;
}

/**
 * Validate emoji string
 * 验证 emoji 字符串
 *
 * @param emoji - Emoji string to validate / 要验证的 emoji 字符串
 * @returns True if valid emoji / 如果是有效的 emoji 则返回 true
 */
export function validateEmoji(emoji: string): boolean {
  // Check length / 检查长度
  if (emoji.length < 1 || emoji.length > 10) {
    return false;
  }

  // Check if contains ONLY emoji characters (more strict validation)
  // 检查是否仅包含 emoji 字符（更严格的验证）
  // Use emoji presentation property to ensure it's actual emoji
  // 使用 emoji 表现属性确保它是真正的 emoji
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})+$/u;
  return emojiRegex.test(emoji);
}

/**
 * Zod refinement for reward validation
 * 奖励验证的 Zod 细化
 */
export const rewardRefinement = z.superRefine(
  (data: { difficulty: MissionDifficulty; xpReward: number; coinReward: number }, ctx) => {
    const errorMessage = getRewardValidationErrorMessage(data);

    if (errorMessage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
        path: ["xpReward"],
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
        path: ["coinReward"],
      });
    }
  }
);

/**
 * Zod schema for mission creation with enhanced validation
 * 带有增强验证的任务创建 Zod schema
 */
export const createMissionSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  xpReward: z.number().int().positive().max(1000),
  coinReward: z.number().int().positive().max(500),
  category: z.enum(["study", "health", "chore", "creative"]),
  emoji: z.string().min(1).max(10).refine(validateEmoji, {
    message: "Must be a valid emoji character / 必须是有效的 emoji 字符",
  }),
  isDaily: z.boolean(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
}).refine(validateRewardsMatchDifficulty, {
  message: "Rewards must match difficulty level / 奖励必须与难度级别匹配",
  path: ["xpReward", "coinReward"],
}).refine(
  (data) => data.title.trim().length > 0,
  {
    message: "Mission title cannot be empty / 任务标题不能为空",
    path: ["title"],
  }
);
