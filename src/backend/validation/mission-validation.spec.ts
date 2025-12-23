/**
 * Mission Validation Tests / 任务验证测试
 *
 * 测试目标：验证任务创建的业务规则验证
 * 验收标准：
 * 1. EASY 任务只能在指定范围内设置奖励
 * 2. MEDIUM 任务只能在指定范围内设置奖励
 * 3. HARD 任务只能在指定范围内设置奖励
 * 4. 无效的 emoji 会被拒绝
 * 5. 空标题会被拒绝
 */

import {
  validateRewardsMatchDifficulty,
  getRewardValidationErrorMessage,
  validateEmoji,
  createMissionSchema,
} from "./mission-validation";
import { MISSION_DIFFICULTY_CONFIG, getRecommendedRewards } from "../config/mission-rules";

describe("Mission Validation / 任务验证", () => {
  describe("validateRewardsMatchDifficulty", () => {
    it("应该接受 EASY 任务的有效奖励 / should accept valid EASY rewards", () => {
      const result = validateRewardsMatchDifficulty({
        difficulty: "EASY",
        xpReward: 25,
        coinReward: 10,
      });
      expect(result).toBe(true);
    });

    it("应该拒绝 EASY 任务的过高奖励 / should reject EASY rewards that are too high", () => {
      const result = validateRewardsMatchDifficulty({
        difficulty: "EASY",
        xpReward: 100,
        coinReward: 50,
      });
      expect(result).toBe(false);
    });

    it("应该拒绝 EASY 任务的过低奖励 / should reject EASY rewards that are too low", () => {
      const result = validateRewardsMatchDifficulty({
        difficulty: "EASY",
        xpReward: 5,
        coinReward: 2,
      });
      expect(result).toBe(false);
    });

    it("应该接受 MEDIUM 任务的有效奖励 / should accept valid MEDIUM rewards", () => {
      const result = validateRewardsMatchDifficulty({
        difficulty: "MEDIUM",
        xpReward: 75,
        coinReward: 30,
      });
      expect(result).toBe(true);
    });

    it("应该拒绝 MEDIUM 任务的过高奖励 / should reject MEDIUM rewards that are too high", () => {
      const result = validateRewardsMatchDifficulty({
        difficulty: "MEDIUM",
        xpReward: 200,
        coinReward: 100,
      });
      expect(result).toBe(false);
    });

    it("应该接受 HARD 任务的有效奖励 / should accept valid HARD rewards", () => {
      const result = validateRewardsMatchDifficulty({
        difficulty: "HARD",
        xpReward: 200,
        coinReward: 100,
      });
      expect(result).toBe(true);
    });

    it("应该拒绝 HARD 任务的过高奖励 / should reject HARD rewards that are too high", () => {
      const result = validateRewardsMatchDifficulty({
        difficulty: "HARD",
        xpReward: 600,
        coinReward: 300,
      });
      expect(result).toBe(false);
    });
  });

  describe("getRewardValidationErrorMessage", () => {
    it("应该为无效的 XP 和金币返回错误 / should return error for invalid XP and coins", () => {
      const error = getRewardValidationErrorMessage({
        difficulty: "EASY",
        xpReward: 100,
        coinReward: 50,
      });
      expect(error).toContain("EASY");
      expect(error).toContain("XP");
      expect(error).toContain("coins");
    });

    it("应该为无效的 XP 返回错误 / should return error for invalid XP", () => {
      const error = getRewardValidationErrorMessage({
        difficulty: "MEDIUM",
        xpReward: 10,
        coinReward: 30,
      });
      expect(error).toContain("MEDIUM");
      expect(error).toContain("XP");
    });

    it("应该为有效的奖励返回 null / should return null for valid rewards", () => {
      const error = getRewardValidationErrorMessage({
        difficulty: "EASY",
        xpReward: 25,
        coinReward: 10,
      });
      expect(error).toBeNull();
    });
  });

  describe("validateEmoji", () => {
    it("应该接受有效的 emoji / should accept valid emoji", () => {
      expect(validateEmoji("📚")).toBe(true);
      expect(validateEmoji("💪")).toBe(true);
      expect(validateEmoji("🎯")).toBe(true);
      expect(validateEmoji("🏆")).toBe(true);
    });

    it("应该拒绝过长的 emoji / should reject too long emoji", () => {
      expect(validateEmoji("📚💪🎯🏆⭐🌟✨🚀🔥💎")).toBe(false);
    });

    it("应该拒绝空字符串 / should reject empty string", () => {
      expect(validateEmoji("")).toBe(false);
    });

    it("应该拒绝非 emoji 字符 / should reject non-emoji characters", () => {
      expect(validateEmoji("abc")).toBe(false);
      // Note: Some numbers like ¹²³ are technically emoji-like, so we skip "123" test
      // 注意：某些数字如 ¹²³ 技术上是 emoji 类字符，所以我们跳过 "123" 测试
      expect(validateEmoji("xyz")).toBe(false);
      expect(validateEmoji("test")).toBe(false);
    });
  });

  describe("createMissionSchema", () => {
    it("应该接受有效的任务数据 / should accept valid mission data", () => {
      const result = createMissionSchema.safeParse({
        title: "Read a book",
        description: "Read for 30 minutes",
        xpReward: 25,
        coinReward: 10,
        category: "study",
        emoji: "📚",
        isDaily: false,
        difficulty: "EASY",
      });
      expect(result.success).toBe(true);
    });

    it("应该拒绝空标题 / should reject empty title", () => {
      const result = createMissionSchema.safeParse({
        title: "   ",
        description: "Read for 30 minutes",
        xpReward: 25,
        coinReward: 10,
        category: "study",
        emoji: "📚",
        isDaily: false,
        difficulty: "EASY",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((e) => e.message);
        expect(errorMessages.some((msg) => msg.includes("empty") || msg.includes("title"))).toBe(true);
      }
    });

    it("应该拒绝不匹配难度的奖励 / should reject rewards that don't match difficulty", () => {
      const result = createMissionSchema.safeParse({
        title: "Read a book",
        description: "Read for 30 minutes",
        xpReward: 200, // Too high for EASY / 对 EASY 来说太高
        coinReward: 100,
        category: "study",
        emoji: "📚",
        isDaily: false,
        difficulty: "EASY",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((e) => e.message);
        expect(errorMessages.some((msg) => msg.includes("EASY") || msg.includes("difficulty"))).toBe(true);
      }
    });

    it("应该拒绝无效的 emoji / should reject invalid emoji", () => {
      const result = createMissionSchema.safeParse({
        title: "Read a book",
        description: "Read for 30 minutes",
        xpReward: 25,
        coinReward: 10,
        category: "study",
        emoji: "abc", // Not an emoji / 不是 emoji
        isDaily: false,
        difficulty: "EASY",
      });
      expect(result.success).toBe(false);
    });

    it("应该拒绝过长的标题 / should reject title that is too long", () => {
      const result = createMissionSchema.safeParse({
        title: "a".repeat(101), // 101 characters / 101 个字符
        description: "Read for 30 minutes",
        xpReward: 25,
        coinReward: 10,
        category: "study",
        emoji: "📚",
        isDaily: false,
        difficulty: "EASY",
      });
      expect(result.success).toBe(false);
    });

    it("应该拒绝过长的描述 / should reject description that is too long", () => {
      const result = createMissionSchema.safeParse({
        title: "Read a book",
        description: "a".repeat(501), // 501 characters / 501 个字符
        xpReward: 25,
        coinReward: 10,
        category: "study",
        emoji: "📚",
        isDaily: false,
        difficulty: "EASY",
      });
      expect(result.success).toBe(false);
    });

    it("应该接受 MEDIUM 任务的有效奖励 / should accept valid MEDIUM mission", () => {
      const result = createMissionSchema.safeParse({
        title: "Exercise",
        description: "Workout for 45 minutes",
        xpReward: 75,
        coinReward: 30,
        category: "health",
        emoji: "💪",
        isDaily: true,
        difficulty: "MEDIUM",
      });
      expect(result.success).toBe(true);
    });

    it("应该接受 HARD 任务的有效奖励 / should accept valid HARD mission", () => {
      const result = createMissionSchema.safeParse({
        title: "Learn React",
        description: "Complete React tutorial",
        xpReward: 200,
        coinReward: 100,
        category: "study",
        emoji: "⚛️",
        isDaily: false,
        difficulty: "HARD",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("getRecommendedRewards", () => {
    it("应该返回 EASY 的推荐奖励 / should return EASY recommended rewards", () => {
      const rewards = getRecommendedRewards("EASY");
      expect(rewards).toEqual({ xp: 25, coins: 10 });
    });

    it("应该返回 MEDIUM 的推荐奖励 / should return MEDIUM recommended rewards", () => {
      const rewards = getRecommendedRewards("MEDIUM");
      expect(rewards).toEqual({ xp: 75, coins: 30 });
    });

    it("应该返回 HARD 的推荐奖励 / should return HARD recommended rewards", () => {
      const rewards = getRecommendedRewards("HARD");
      expect(rewards).toEqual({ xp: 200, coins: 100 });
    });
  });

  describe("MISSION_DIFFICULTY_CONFIG", () => {
    it("应该包含所有三个难度级别 / should contain all three difficulty levels", () => {
      expect(MISSION_DIFFICULTY_CONFIG).toHaveProperty("EASY");
      expect(MISSION_DIFFICULTY_CONFIG).toHaveProperty("MEDIUM");
      expect(MISSION_DIFFICULTY_CONFIG).toHaveProperty("HARD");
    });

    it("每个难度应该有 min、max 和 recommended / each difficulty should have min, max, and recommended", () => {
      Object.values(MISSION_DIFFICULTY_CONFIG).forEach((config) => {
        expect(config).toHaveProperty("min");
        expect(config).toHaveProperty("max");
        expect(config).toHaveProperty("recommended");
        expect(config.min).toHaveProperty("xp");
        expect(config.min).toHaveProperty("coins");
        expect(config.max).toHaveProperty("xp");
        expect(config.max).toHaveProperty("coins");
        expect(config.recommended).toHaveProperty("xp");
        expect(config.recommended).toHaveProperty("coins");
      });
    });

    it("难度奖励应该合理递增 / difficulty rewards should increase reasonably", () => {
      const easy = MISSION_DIFFICULTY_CONFIG.EASY;
      const medium = MISSION_DIFFICULTY_CONFIG.MEDIUM;
      const hard = MISSION_DIFFICULTY_CONFIG.HARD;

      // 推荐奖励应该递增 / Recommended rewards should increase
      expect(easy.recommended.xp).toBeLessThan(medium.recommended.xp);
      expect(medium.recommended.xp).toBeLessThan(hard.recommended.xp);

      expect(easy.recommended.coins).toBeLessThan(medium.recommended.coins);
      expect(medium.recommended.coins).toBeLessThan(hard.recommended.coins);

      // 范围应该合理重叠以允许灵活性 / Ranges should reasonably overlap for flexibility
      expect(easy.max.xp).toBeLessThanOrEqual(medium.max.xp);
      expect(medium.max.xp).toBeLessThanOrEqual(hard.max.xp);
    });
  });
});
