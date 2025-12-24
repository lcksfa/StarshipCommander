import React, { createContext, useContext, ReactNode } from "react";

// 语言上下文类型定义 / Language context type definition
interface LanguageContextType {
  t: Record<string, string>;
}

// 中文翻译 / Chinese translations
const translations: Record<string, string> = {
  // 导航 / Nav
  nav_missions: "行动指令",
  nav_log: "舰长日志",
  nav_hangar: "星舰机库",
  nav_profile: "指挥官档案",
  nav_abort: "休眠模式",

  // 状态 / HUD
  status_report: "状态报告",
  level: "等级",
  power_level: "能量水平",

  // 任务卡片 / Mission Card
  card_launch: "执行",
  card_recharging: "充能中",
  card_great: "完成!",
  card_streak: "连胜",

  // 类别 / Categories
  cat_brain: "脑力",
  cat_body: "机体",
  cat_base: "基地",
  cat_art: "创造",

  // 弹窗 / Modal
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

  // 日志 / Log
  total_victories: "胜利总数",
  lifetime_xp: "累积能量",
  success: "行动成功",
  no_logs: "暂无日志。请开始任务。",
  weekly_chart: "周航行记录",

  // 机库 / Hangar
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

  // 档案 / Profile
  profile_xp: "总能量值",
  profile_missions: "完成任务",
  achievements: "勋章与成就",

  // 类别详细描述 / Categories Verbose
  label_brain: "脑力运算",
  label_body: "机体动力",
  label_base: "基地维护",
  label_creative: "创造模块",

  // 军衔 / Ranks
  rank_captain: "舰长",
  user_anonymous: "指挥官",

  // 成功界面 / Success Overlay
  mission_accomplished: "任务达成",
  rewards_acquired: "获取奖励",

  // 认证 / Authentication
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

  // 认证错误 / Auth Errors
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

  // 资料编辑 / Profile Edit
  profile_edit_title: "编辑资料",
  profile_display_name_hint: "这是其他玩家看到的名称",
  profile_saving: "保存中...",
  profile_save: "保存",

  // 任务完成弹窗 / Mission Complete Modal
  mission_complete_title: "任务完成！",
  rewards_earned: "获得奖励",
  claim_rewards: "领取奖励",
  power_level: "能力水平",
  coins: "星币",
  streak_bonus: "连胜奖励",
  streak_days: "天连胜",
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <LanguageContext.Provider value={{ t: translations }}>
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
