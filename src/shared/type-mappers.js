import { DbCategory } from "./types";
export function mapFrontendToDbCategory(frontendCategory) {
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
export function mapDbToFrontendCategory(dbCategory) {
    const categoryStr = typeof dbCategory === "string" ? dbCategory : String(dbCategory);
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
export function isValidFrontendCategory(category) {
    return ["study", "health", "chore", "creative"].includes(category);
}
export function isValidDbCategory(category) {
    return Object.values(DbCategory).includes(category);
}
export function getCategoryDisplayName(category, language = "en") {
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
export function getAllFrontendCategories() {
    return ["study", "health", "chore", "creative"];
}
export function getAllDbCategories() {
    return Object.values(DbCategory);
}
export function createLocalizedText(en, zh) {
    return {
        en,
        zh: zh || en,
    };
}
export function getLocalizedText(text, language = "en") {
    return text[language] || text.en || Object.values(text)[0] || "";
}
export function isValidLocalizedText(text) {
    return (text &&
        typeof text === "object" &&
        typeof text.en === "string" &&
        typeof text.zh === "string");
}
//# sourceMappingURL=type-mappers.js.map