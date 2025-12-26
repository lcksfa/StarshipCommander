import React from "react";
import { Mission } from "../types";
import { Zap, Coins, Check } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface MissionCompleteModalProps {
  isOpen: boolean;
  mission: Mission | null;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

/**
 * 类别主题配置 - 匹配 MissionCard 的设计 / Category theme config matching MissionCard design
 */
const CATEGORY_THEMES = {
  health: {
    color: "border-rose-400",
    glow: "shadow-[0_0_50px_rgba(251,113,133,0.3)]",
    bg: "from-rose-500/20 via-pink-500/10",
    accent: "bg-rose-400",
    text: "text-rose-300",
    iconBg: "from-rose-400/30 to-pink-600/30",
  },
  study: {
    color: "border-cyan-400",
    glow: "shadow-[0_0_50px_rgba(34,211,238,0.3)]",
    bg: "from-cyan-500/20 via-blue-500/10",
    accent: "bg-cyan-400",
    text: "text-cyan-300",
    iconBg: "from-cyan-400/30 to-blue-600/30",
  },
  chore: {
    color: "border-emerald-400",
    glow: "shadow-[0_0_50px_rgba(52,211,153,0.3)]",
    bg: "from-emerald-500/20 via-green-500/10",
    accent: "bg-emerald-400",
    text: "text-emerald-300",
    iconBg: "from-emerald-400/30 to-green-600/30",
  },
  creative: {
    color: "border-violet-400",
    glow: "shadow-[0_0_50px_rgba(139,92,246,0.3)]",
    bg: "from-violet-500/20 via-purple-500/10",
    accent: "bg-violet-400",
    text: "text-violet-300",
    iconBg: "from-violet-400/30 to-purple-600/30",
  },
};

const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  isOpen,
  mission,
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  const { t } = useLanguage();

  if (!isOpen || !mission) return null;

  const theme = CATEGORY_THEMES[mission.category] || CATEGORY_THEMES.study;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-lg transition-opacity duration-300"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Panel - 科技风格设计 */}
      <div
        className={`
          relative w-full max-w-sm
          bg-slate-900/95
          border-[3px] ${theme.color}
          ${theme.glow}
          rounded-[2rem] overflow-hidden
          animate-in zoom-in-95 fade-in duration-300
        `}
      >
        {/* 背景渐变 / Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-50 pointer-events-none`} />

        {/* 顶部光晕条 / Top glow strip */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accent} opacity-60 blur-sm`} />

        {/* 内容区域 / Content area */}
        <div className="relative p-6">
          {/* Title & Icon - 动态图标区域 */}
          <div className="text-center mb-6">
            {/* 动态光晕图标容器 / Dynamic glow icon container */}
            <div className="relative inline-block mb-4">
              {/* 外圈光环 / Outer ring glow */}
              <div className={`absolute inset-0 rounded-full ${theme.accent} opacity-20 blur-xl animate-pulse`} />
              <div className={`absolute inset-0 rounded-full ${theme.accent} opacity-30 blur-md animate-[ping_2s_ease-in-out_infinite]`} />

              {/* 图标容器 / Icon container */}
              <div
                className={`
                  relative w-20 h-20 rounded-full
                  bg-gradient-to-br ${theme.iconBg}
                  border-[3px] ${theme.color}
                  flex items-center justify-center
                  ${theme.glow}
                  mx-auto
                  animate-[bounce_1s_ease-out]
                `}
              >
                <Check size={36} className={theme.text} strokeWidth={4} />
              </div>

              {/* 环绕粒子效果 / Orbiting particle effect */}
              <div className={`absolute inset-0 rounded-full ${theme.accent} opacity-40`}>
                <div
                  className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 ${theme.accent} rounded-full animate-[spin_3s_linear_infinite] origin-[50%_300%]`}
                />
              </div>
            </div>

            {/* 任务标题 / Mission title */}
            <h2 className="text-2xl font-black text-white mb-2 drop-shadow-lg">
              {mission.title}
            </h2>

            {/* 副标题 / Subtitle */}
            <p className={`
              text-sm font-bold uppercase tracking-widest ${theme.text}
              animate-pulse
            `}>
              {t.rewards_earned}
            </p>
          </div>

          {/* Rewards Display - 能量块风格 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* XP Reward - 紫色能量 */}
            <div
              className={`
                relative overflow-hidden
                bg-gradient-to-br from-neon-purple/20 to-purple-900/20
                rounded-2xl p-4
                border-2 border-neon-purple/40
                text-center
                group
                hover:border-neon-purple/60
                transition-all
              `}
            >
              {/* 内发光效 / Inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <Zap className="text-neon-purple mx-auto mb-2 relative z-10" size={28} fill="currentColor" />
              <div className="text-3xl font-black text-white mb-1 relative z-10">
                +{mission.xpReward}
              </div>
              <div className="text-neon-purple text-xs font-bold relative z-10">
                {t.level_up}
              </div>
            </div>

            {/* Coins Reward - 金色能量 */}
            <div
              className={`
                relative overflow-hidden
                bg-gradient-to-br from-neon-gold/20 to-yellow-900/20
                rounded-2xl p-4
                border-2 border-neon-gold/40
                text-center
                group
                hover:border-neon-gold/60
                transition-all
              `}
            >
              {/* 内发光效 / Inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <Coins className="text-neon-gold mx-auto mb-2 relative z-10" size={28} fill="currentColor" />
              <div className="text-3xl font-black text-white mb-1 relative z-10">
                +{mission.coinReward}
              </div>
              <div className="text-neon-gold text-xs font-bold relative z-10">
                {t.coins}
              </div>
            </div>
          </div>

          {/* Streak Bonus for Daily Missions - 火焰效果 */}
          {mission.isDaily && mission.streak > 0 && (
            <div
              className={`
                relative overflow-hidden
                bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10
                border-2 border-orange-500/40
                rounded-2xl p-4 mb-6 text-center
                animate-[shimmer_2s_infinite]
              `}
            >
              {/* 火焰光效 / Flame glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/10 to-orange-500/20" />
              <div className="relative z-10">
                <div className="text-neon-orange text-lg font-black flex items-center justify-center gap-2">
                  <span className="text-2xl animate-pulse">🔥</span>
                  <span>{mission.streak} {t.streak_days}</span>
                </div>
                <div className="text-orange-300/80 text-xs font-bold mt-1">
                  连续打卡奖励 / Streak Bonus
                </div>
              </div>
            </div>
          )}

          {/* Confirm Button - 主要操作按钮 */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              relative overflow-hidden w-full
              py-4 rounded-2xl
              font-black text-white uppercase tracking-wider
              border-2
              transition-all duration-300 transform active:scale-95
              ${
                isLoading
                  ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                  : `bg-gradient-to-r ${theme.bg} ${theme.text} border-current hover:scale-105 ${theme.glow}`
              }
            `}
          >
            {/* 按钮光效 / Button glow effect */}
            {!isLoading && (
              <div className={`absolute inset-0 ${theme.accent} opacity-20 blur-xl`} />
            )}

            {/* 按钮内容 / Button content */}
            <div className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>{t.claiming_rewards}</span>
                </>
              ) : (
                <>
                  <span className="drop-shadow-lg">{t.claim_rewards}</span>
                  <Check size={20} strokeWidth={3} />
                </>
              )}
            </div>

            {/* 按钮光泽动画 / Button shine animation */}
            {!isLoading && (
              <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0" />
            )}
          </button>

          {/* 底部光晕条 / Bottom glow strip */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${theme.accent} opacity-40 blur-sm`} />
        </div>
      </div>
    </div>
  );
};

export default MissionCompleteModal;
