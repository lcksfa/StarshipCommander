// 类型映射工具 - 前后端类型转换
// Type mapping utilities - frontend-backend type conversion

import { MissionCategory as FrontendCategory, LocalizedText } from "./types";
import { DbCategory } from "./types";

/**
 * 前端类别转换为数据库类别
 * Frontend category to database category conversion
 */
export function mapFrontendToDbCategory(
  frontendCategory: FrontendCategory,
): DbCategory {
  switch (frontendCategory) {
    case "study":
      return DbCategory.STUDY;
    case "health":
      return DbCategory.HEALTH;
    case "chore":
      return DbCategory.CHORE;
    case "creative":
      return DbCategory.CREATIVE;
    default:
      throw new Error(`Unknown frontend category: ${frontendCategory}`);
  }
}

/**
 * 数据库类别转换为前端类别
 * Database category to frontend category conversion
 */
export function mapDbToFrontendCategory(
  dbCategory: DbCategory | string,
): FrontendCategory {
  // 处理 Prisma 的枚举类型
  const categoryStr =
    typeof dbCategory === "string" ? dbCategory : String(dbCategory);

  switch (categoryStr) {
    case "STUDY":
      return "study";
    case "HEALTH":
      return "health";
    case "CHORE":
      return "chore";
    case "CREATIVE":
      return "creative";
    default:
      throw new Error(`Unknown database category: ${categoryStr}`);
  }
}

/**
 * 验证前端类别是否有效
 * Validate if frontend category is valid
 */
export function isValidFrontendCategory(
  category: string,
): category is FrontendCategory {
  return ["study", "health", "chore", "creative"].includes(category);
}

/**
 * 验证数据库类别是否有效
 * Validate if database category is valid
 */
export function isValidDbCategory(category: string): category is DbCategory {
  return Object.values(DbCategory).includes(category as DbCategory);
}

/**
 * 获取类别的本地化显示名称
 * Get localized display name for category
 */
export function getCategoryDisplayName(
  category: FrontendCategory,
  language: "en" | "zh" = "en",
): string {
  const displayNames = {
    en: {
      study: "Study",
      health: "Health",
      chore: "Chore",
      creative: "Creative",
    },
    zh: {
      study: "学习",
      health: "健康",
      chore: "日常",
      creative: "创意",
    },
  };

  return displayNames[language][category];
}

/**
 * 获取所有可用的前端类别
 * Get all available frontend categories
 */
export function getAllFrontendCategories(): FrontendCategory[] {
  return ["study", "health", "chore", "creative"];
}

/**
 * 获取所有可用的数据库类别
 * Get all available database categories
 */
export function getAllDbCategories(): DbCategory[] {
  return Object.values(DbCategory);
}

/**
 * 本地化文本工具函数
 * Localized text utility functions
 */
export function createLocalizedText(en: string, zh?: string): LocalizedText {
  return {
    en,
    zh: zh || en, // 如果中文版本未提供，使用英文作为后备
  };
}

/**
 * 获取本地化文本
 * Get localized text based on language preference
 */
export function getLocalizedText(
  text: LocalizedText,
  language: "en" | "zh" = "en",
): string {
  return text[language] || text.en || Object.values(text)[0] || "";
}

/**
 * 验证本地化文本结构
 * Validate localized text structure
 */
export function isValidLocalizedText(text: unknown): text is LocalizedText {
  return (
    text !== null &&
    text !== undefined &&
    typeof text === "object" &&
    "en" in text &&
    "zh" in text &&
    typeof text.en === "string" &&
    typeof text.zh === "string"
  );
}
