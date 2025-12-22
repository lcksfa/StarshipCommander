import React, { createContext, useState, useContext, ReactNode } from "react";

type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Record<string, string>;
}

const translations = {
  en: {
    // Nav
    nav_missions: "Missions",
    nav_log: "Captain's Log",
    nav_hangar: "Hangar",
    nav_profile: "Profile",
    nav_abort: "Sleep Mode",

    // Status / HUD
    status_report: "Status Report",
    level: "Level",
    power_level: "Power Level",

    // Mission Card
    card_launch: "ENGAGE",
    card_recharging: "RECHARGING",
    card_great: "GREAT!",
    card_streak: "Streak",

    // Categories
    cat_brain: "BRAIN",
    cat_body: "BODY",
    cat_base: "BASE",
    cat_art: "ART",

    // Modal
    new_mission_orders: "New Mission Orders",
    mission_objective: "Mission Objective",
    mission_type: "Mission Type",
    mission_frequency: "Mission Frequency",
    difficulty_rewards: "Difficulty & Rewards",
    single_operation: "Single Operation",
    daily_protocol: "Daily Protocol",
    streak_enabled: "Streak Tracking Enabled",
    deploy_mission: "DEPLOY MISSION",
    initiate_routine: "INITIATE ROUTINE",
    cancel: "Cancel",
    placeholder_name: "Operation Name (e.g. Read Book)...",

    // Log
    total_victories: "Total Victories",
    lifetime_xp: "Lifetime Energy",
    success: "SUCCESS",
    no_logs: "NO LOGS FOUND. BEGIN MISSION.",
    weekly_chart: "Weekly Flight Chart",

    // Hangar
    hangar_locked: "Hangar Under Construction",
    hangar_unlock_msg: "Complete missions to unlock the Starship facility.",
    tab_starship: "Starship",
    tab_exchange: "Exchange",
    ship_integrity: "Hull Integrity",
    ship_class: "Ship Class",
    part_engine: "Hyper Engine",
    part_cockpit: "Command Deck",
    part_wings: "Stabilizers",
    upgrade: "UPGRADE",
    buy: "ACQUIRE",

    // Profile
    profile_xp: "Total Energy",
    profile_missions: "Missions",
    achievements: "Medals & Trophies",

    // Categories Verbose
    label_brain: "Brain Power",
    label_body: "Body Fuel",
    label_base: "Base Care",
    label_creative: "Creative",

    // Ranks
    rank_captain: "Captain",

    // Success Overlay
    mission_accomplished: "MISSION ACCOMPLISHED",
    rewards_acquired: "REWARDS ACQUIRED",
  },
  zh: {
    // Nav
    nav_missions: "行动指令",
    nav_log: "舰长日志",
    nav_hangar: "星舰机库",
    nav_profile: "指挥官档案",
    nav_abort: "休眠模式",

    // Status / HUD
    status_report: "状态报告",
    level: "等级",
    power_level: "能量水平",

    // Mission Card
    card_launch: "执行",
    card_recharging: "充能中",
    card_great: "完成!",
    card_streak: "连胜",

    // Categories
    cat_brain: "脑力",
    cat_body: "机体",
    cat_base: "基地",
    cat_art: "创造",

    // Modal
    new_mission_orders: "新任务指令",
    mission_objective: "行动目标",
    mission_type: "行动类型",
    mission_frequency: "行动频率",
    difficulty_rewards: "难度与奖励",
    single_operation: "单次行动",
    daily_protocol: "每日协议",
    streak_enabled: "连胜系统已激活",
    deploy_mission: "发布指令",
    initiate_routine: "启动程序",
    cancel: "取消",
    placeholder_name: "输入行动代号 (如: 阅读书籍)...",

    // Log
    total_victories: "胜利总数",
    lifetime_xp: "累积能量",
    success: "行动成功",
    no_logs: "暂无日志。请开始任务。",
    weekly_chart: "周航行记录",

    // Hangar
    hangar_locked: "机库建设中...",
    hangar_unlock_msg: "完成更多任务以解锁星舰改造设施。",
    tab_starship: "星舰改造",
    tab_exchange: "战利品兑换",
    ship_integrity: "舰体完整度",
    ship_class: "星舰级别",
    part_engine: "超光速引擎",
    part_cockpit: "指挥驾驶舱",
    part_wings: "稳定翼",
    upgrade: "升级",
    buy: "兑换",

    // Profile
    profile_xp: "总能量值",
    profile_missions: "完成任务",
    achievements: "勋章与成就",

    // Categories Verbose
    label_brain: "脑力运算",
    label_body: "机体动力",
    label_base: "基地维护",
    label_creative: "创造模块",

    // Ranks
    rank_captain: "舰长",

    // Success Overlay
    mission_accomplished: "任务达成",
    rewards_acquired: "获取奖励",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
