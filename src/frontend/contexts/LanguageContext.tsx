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

    // Authentication / 认证
    auth_login_title: "Welcome Back",
    auth_login_subtitle: "Sign in to continue your journey",
    auth_email_label: "Email Address",
    auth_email_placeholder: "you@example.com",
    auth_password_label: "Password",
    auth_password_placeholder: "••••••••",
    auth_login_button: "Sign In",
    auth_logging_in: "Signing in...",
    auth_no_account: "Don't have an account?",
    auth_register_link: "Sign up",
    auth_register_title: "Create Account",
    auth_register_subtitle: "Start your gamified productivity journey",
    auth_display_name_label: "Display Name",
    auth_display_name_placeholder: "Starship Commander",
    auth_optional: "optional",
    auth_confirm_password_label: "Confirm Password",
    auth_confirm_password_placeholder: "••••••••",
    auth_register_button: "Create Account",
    auth_registering: "Creating account...",
    auth_already_have_account: "Already have an account?",
    auth_login_link: "Sign in",

    // Auth Errors / 认证错误
    auth_error_email_required: "Email is required",
    auth_error_email_invalid: "Invalid email format",
    auth_error_password_required: "Password is required",
    auth_error_password_too_short: "Password must be at least 8 characters",
    auth_error_password_need_letter: "Password must contain at least one letter",
    auth_error_password_need_number: "Password must contain at least one number",
    auth_error_password_mismatch: "Passwords do not match",
    auth_password_requirement_length: "At least 8 characters",
    auth_password_requirement_letter: "Contains a letter",
    auth_password_requirement_number: "Contains a number",
    auth_password_match: "Passwords match",
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

    // Authentication / 认证
    auth_login_title: "欢迎回来",
    auth_login_subtitle: "登录以继续您的旅程",
    auth_email_label: "邮箱地址",
    auth_email_placeholder: "you@example.com",
    auth_password_label: "密码",
    auth_password_placeholder: "••••••••",
    auth_login_button: "登录",
    auth_logging_in: "登录中...",
    auth_no_account: "还没有账号？",
    auth_register_link: "注册",
    auth_register_title: "创建账号",
    auth_register_subtitle: "开启您的游戏化生产力之旅",
    auth_display_name_label: "显示名称",
    auth_display_name_placeholder: "星际指挥官",
    auth_optional: "可选",
    auth_confirm_password_label: "确认密码",
    auth_confirm_password_placeholder: "••••••••",
    auth_register_button: "创建账号",
    auth_registering: "创建中...",
    auth_already_have_account: "已有账号？",
    auth_login_link: "登录",

    // Auth Errors / 认证错误
    auth_error_email_required: "邮箱不能为空",
    auth_error_email_invalid: "邮箱格式不正确",
    auth_error_password_required: "密码不能为空",
    auth_error_password_too_short: "密码至少需要8个字符",
    auth_error_password_need_letter: "密码必须包含至少一个字母",
    auth_error_password_need_number: "密码必须包含至少一个数字",
    auth_error_password_mismatch: "两次输入的密码不一致",
    auth_password_requirement_length: "至少8个字符",
    auth_password_requirement_letter: "包含字母",
    auth_password_requirement_number: "包含数字",
    auth_password_match: "密码匹配",
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
