import { MissionCategory as FrontendCategory, LocalizedText } from "./types";
import { DbCategory } from "./types";
export declare function mapFrontendToDbCategory(frontendCategory: FrontendCategory): DbCategory;
export declare function mapDbToFrontendCategory(dbCategory: DbCategory | string): FrontendCategory;
export declare function isValidFrontendCategory(category: string): category is FrontendCategory;
export declare function isValidDbCategory(category: string): category is DbCategory;
export declare function getCategoryDisplayName(category: FrontendCategory, language?: "en" | "zh"): string;
export declare function getAllFrontendCategories(): FrontendCategory[];
export declare function getAllDbCategories(): DbCategory[];
export declare function createLocalizedText(en: string, zh?: string): LocalizedText;
export declare function getLocalizedText(text: LocalizedText, language?: "en" | "zh"): string;
export declare function isValidLocalizedText(text: any): text is LocalizedText;
//# sourceMappingURL=type-mappers.d.ts.map