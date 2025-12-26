import React from "react";
import { Mission } from "../types";
import { useCompleteMission } from "../hooks/useMissions";
import {
  Sparkles,
  Check,
  Zap,
  Coins,
  Repeat,
  Hourglass,
  Activity,
  Crown,
  Ribbon,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import StreakBadge from "./StreakBadge";
import StreakWarning from "./StreakWarning";

interface MissionCardProps {
  mission: Mission;
  onComplete: (id: string) => void;
  onOpenCompleteModal: (mission: Mission) => void; // 打开完成弹窗 / Open complete modal
  userId: string; // 添加 userId 参数 / Add userId parameter
}

/**
 * 类别主题配置 / Category theme configuration
 * 为不同任务类型提供独特的视觉风格
 */
const CATEGORY_THEMES = {
  health: {
    label: "身体",
    color: "text-rose-400",
    // 完成状态配色
    completed: {
      primary: "border-rose-400",
      bg: "from-rose-500/15 via-pink-500/10",
      glow: "shadow-[0_0_30px_rgba(251,113,133,0.4)]",
      text: "text-rose-300",
      accent: "bg-rose-400",
    },
    // 边框装饰色
    borderAccent: "before:bg-rose-400/50 after:bg-rose-400/30",
    // 粒子效果颜色
    particle: "bg-rose-400",
  },
  study: {
    label: "脑力",
    color: "text-cyan-400",
    completed: {
      primary: "border-cyan-400",
      bg: "from-cyan-500/15 via-blue-500/10",
      glow: "shadow-[0_0_30px_rgba(34,211,238,0.4)]",
      text: "text-cyan-300",
      accent: "bg-cyan-400",
    },
    borderAccent: "before:bg-cyan-400/50 after:bg-cyan-400/30",
    particle: "bg-cyan-400",
  },
  chore: {
    label: "基地",
    color: "text-emerald-400",
    completed: {
      primary: "border-emerald-400",
      bg: "from-emerald-500/15 via-green-500/10",
      glow: "shadow-[0_0_30px_rgba(52,211,153,0.4)]",
      text: "text-emerald-300",
      accent: "bg-emerald-400",
    },
    borderAccent: "before:bg-emerald-400/50 after:bg-emerald-400/30",
    particle: "bg-emerald-400",
  },
  creative: {
    label: "艺术",
    color: "text-violet-400",
    completed: {
      primary: "border-violet-400",
      bg: "from-violet-500/15 via-purple-500/10",
      glow: "shadow-[0_0_30px_rgba(139,92,246,0.4)]",
      text: "text-violet-300",
      accent: "bg-violet-400",
    },
    borderAccent: "before:bg-violet-400/50 after:bg-violet-400/30",
    particle: "bg-violet-400",
  },
};

const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onComplete,
  onOpenCompleteModal,
  userId,
}) => {
  const { t } = useLanguage();
  const { completeMission, isLoading } = useCompleteMission();

  const theme = CATEGORY_THEMES[mission.category] || CATEGORY_THEMES.study;

  const handleComplete = () => {
    if (mission.isCompleted) return;

    // 打开任务完成确认弹窗 / Open mission complete confirmation modal
    onOpenCompleteModal(mission);
  };

  const isCompleted = mission.isCompleted && !mission.isDaily;
  const isDailyCompletedToday = mission.isCompleted && mission.isDaily;

  return (
    <div
      data-testid="mission-card"
      data-category={mission.category}
      data-completed={isCompleted ? "true" : "false"}
      className={`
        relative group
        rounded-[2rem] p-[2px]
        transition-all duration-500
        h-full flex flex-col min-h-[220px]
        ${isCompleted || isDailyCompletedToday ? "scale-[0.98]" : "hover:-translate-y-2 hover:scale-[1.02]"}
      `}
    >
      {/* 三层边框系统 / Triple-layer border system */}
      <div
        className={`
          relative w-full h-full
          rounded-[2rem]
          border backdrop-blur-md
          transition-all duration-500
          overflow-hidden
          ${
            isCompleted || isDailyCompletedToday
              ? `
                ${theme.completed.primary}
                ${theme.completed.glow}
                border-[3px]
                bg-gradient-to-br ${theme.completed.bg}
              `
              : `
                border-white/20
                bg-white/10
                hover:border-white/40
                hover:bg-white/15
                hover:shadow-lg
              `
          }
        `}
      >
        {/* 科技边框装饰 - 外层光晕条 / Tech border decoration - outer glow strip */}
        {(isCompleted || isDailyCompletedToday) && (
          <>
            <div
              className={`
                absolute top-0 left-0 right-0 h-1
                ${theme.completed.accent}
                opacity-60
                blur-sm
              `}
            />
            <div
              className={`
                absolute bottom-0 left-0 right-0 h-1
                ${theme.completed.accent}
                opacity-40
                blur-sm
              `}
            />
          </>
        )}

        {/* 科技边框装饰 - 侧边光带 / Tech border decoration - side glow strips */}
        {(isCompleted || isDailyCompletedToday) && (
          <>
            <div
              className={`
                absolute top-0 bottom-0 left-0 w-0.5
                ${theme.completed.accent}
                opacity-50
              `}
            />
            <div
              className={`
                absolute top-0 bottom-0 right-0 w-0.5
                ${theme.completed.accent}
                opacity-50
              `}
            />
          </>
        )}

        {/* 内层容器 / Inner container */}
        <div
          className={`
            flex flex-col h-full
            p-[2px]
            rounded-[1.9rem]
            ${isCompleted || isDailyCompletedToday ? "bg-gradient-to-br from-white/5 to-transparent" : "bg-transparent"}
          `}
        >
          {/* 内容区域 / Content area */}
          <div className="flex flex-col h-full p-5 rounded-[1.7rem] relative overflow-hidden">
            {/* 背景网格装饰（已完成时显示）/ Background grid decoration (shown when completed) */}
            {(isCompleted || isDailyCompletedToday) && (
              <div
                className={`
                  absolute inset-0 opacity-10
                  bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]
                  pointer-events-none
                `}
              />
            )}

            {/* 角标装饰 - 已完成时显示 / Corner decoration - shown when completed */}
            {(isCompleted || isDailyCompletedToday) && (
              <>
                {/* 左上角标 */}
                <div className={`absolute top-3 left-3 w-2 h-2 ${theme.completed.accent} rounded-sm opacity-80`} />
                <div className={`absolute top-3 left-3 w-6 h-0.5 ${theme.completed.accent} opacity-60`} />
                <div className={`absolute top-3 left-3 w-0.5 h-6 ${theme.completed.accent} opacity-60`} />

                {/* 右下角标 */}
                <div className={`absolute bottom-3 right-3 w-2 h-2 ${theme.completed.accent} rounded-sm opacity-80`} />
                <div className={`absolute bottom-3 right-3 w-6 h-0.5 ${theme.completed.accent} opacity-60`} />
                <div className={`absolute bottom-3 right-3 w-0.5 h-6 ${theme.completed.accent} opacity-60`} />
              </>
            )}

            {/* --- EYEBROW ROW --- */}
            <div className="flex justify-between items-center mb-3 relative z-10">
              {/* Category Badge */}
              <div
                className={`
                  flex items-center gap-2 rounded-full px-3 py-1.5 border backdrop-blur-sm transition-all
                  ${
                    isCompleted || isDailyCompletedToday
                      ? `bg-black/40 border-${mission.category}-500/30 ${theme.color}`
                      : "bg-white/10 border-white/5"
                  }
                `}
              >
                <span className="text-sm">{mission.emoji}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${theme.color}`}>
                  {theme.label}
                </span>
              </div>

              {/* Streak Badge (Daily Only) - 使用新的动态火焰徽章 / Using new dynamic flame badge */}
              {mission.isDaily && (
                <StreakBadge
                  streak={mission.streak}
                  isCompleted={mission.isCompleted}
                  size="sm"
                  showLabel={false}
                />
              )}
            </div>

            {/* Streak Warning (Daily Only) - 断签警示 / Streak interruption warning */}
            {mission.isDaily && (
              <StreakWarning
                streak={mission.streak}
                isCompleted={mission.isCompleted}
                isDaily={mission.isDaily}
                lastCompleted={mission.lastCompleted}
              />
            )}

            {/* --- MAIN CONTENT --- */}
            <div className={`flex-grow w-full mb-6 relative z-10 ${isLoading ? "opacity-50" : ""}`}>
              {/* Title */}
              <h3
                className={`
                  text-2xl font-black leading-none mb-2 flex items-center gap-2 transition-all
                  ${
                    isCompleted || isDailyCompletedToday
                      ? `${theme.completed.text} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`
                      : "text-white"
                  }
                `}
              >
                {mission.title}
                {/* Daily Loop Icon (Small distinction next to title) */}
                {mission.isDaily && (
                  <Repeat size={14} className="text-slate-600" strokeWidth={3} />
                )}
              </h3>

              {/* Description */}
              <p
                className={`
                  text-sm font-bold leading-relaxed transition-colors
                  ${isCompleted || isDailyCompletedToday ? "text-slate-400" : "text-slate-400"}
                `}
              >
                {mission.description}
              </p>
            </div>

            {/* --- FOOTER: Action Zone --- */}
            <div className="mt-auto flex justify-between items-center gap-2 relative z-10">
              {/* Left: Rewards Badges */}
              <div
                className={`flex flex-col xs:flex-row sm:flex-row gap-2 transition-opacity ${
                  mission.isCompleted ? "opacity-50" : "opacity-100"
                }`}
              >
                <span className="flex items-center gap-1.5 text-xs font-black bg-black/40 px-2.5 py-1.5 rounded-lg text-neon-purple ring-1 ring-neon-purple/30 whitespace-nowrap">
                  <Zap size={14} fill="currentColor" /> {mission.xpReward}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-black bg-black/40 px-2.5 py-1.5 rounded-lg text-neon-gold ring-1 ring-neon-gold/30 whitespace-nowrap">
                  <Coins size={14} fill="currentColor" /> {mission.coinReward}
                </span>
              </div>

              {/* Right: Action Button */}
              <button
                onClick={handleComplete}
                disabled={mission.isCompleted || isLoading}
                className={`
                  relative overflow-hidden group/btn
                  px-5 py-2.5 rounded-xl
                  font-black text-xs uppercase tracking-wider
                  transition-all duration-300
                  border-2
                  ${
                    isLoading
                      ? "bg-slate-800/50 text-slate-500 border-slate-700 cursor-not-allowed"
                      : mission.isCompleted
                        ? isCompleted || isDailyCompletedToday
                          ? `bg-transparent ${theme.completed.text} border-current cursor-default`
                          : "bg-transparent text-neon-green border-neon-green cursor-default"
                        : "bg-gradient-to-r from-neon-cyan to-neon-purple text-white border-transparent shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(192,132,252,0.6)] hover:scale-105 active:scale-95"
                  }
                `}
              >
                <div
                  className={`relative z-10 flex items-center justify-center gap-2 ${isLoading ? "animate-pulse" : ""}`}
                >
                  {isLoading ? (
                    <>
                      <span>{t.card_loading || "Loading..."}</span>
                      <Hourglass size={16} className="animate-spin" />
                    </>
                  ) : mission.isCompleted ? (
                    <>
                      <span>{t.card_great}</span>
                      <Check size={16} strokeWidth={4} />
                    </>
                  ) : (
                    <>
                      <span>{t.card_launch}</span>
                      <Sparkles size={16} className="animate-pulse" />
                    </>
                  )}
                </div>

                {/* Button Shine Effect (Active Only) */}
                {!mission.isCompleted && !isLoading && (
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0" />
                )}
              </button>
            </div>

            {/* 完成状态粒子效果 / Enhanced particle effect for completed state */}
            {(isCompleted || isDailyCompletedToday) && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[1.7rem]">
                {/* 小型漂浮粒子 / Small floating particles */}
                {[...Array(15)].map((_, i) => {
                  const size = Math.random() < 0.5 ? 1 : 2;
                  const duration = 3 + Math.random() * 4;
                  const delay = Math.random() * 3;

                  return (
                    <div
                      key={`small-${i}`}
                      className={`
                        absolute rounded-full ${theme.completed.accent}
                        animate-[float_${duration}s_ease-in-out_infinite]
                        ${Math.random() < 0.3 ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}
                      `}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: 0.2 + Math.random() * 0.3,
                        animationDelay: `${delay}s`,
                        animationDuration: `${duration}s`,
                      }}
                    />
                  );
                })}

                {/* 中型闪烁粒子 / Medium shimmer particles */}
                {[...Array(8)].map((_, i) => {
                  const size = 2 + Math.random() * 2;
                  const duration = 2 + Math.random() * 3;
                  const delay = Math.random() * 2;

                  return (
                    <div
                      key={`medium-${i}`}
                      className={`
                        absolute rounded-full ${theme.completed.accent}
                        animate-[float_${duration}s_ease-in-out_infinite]
                        animate-[pulse_1.5s_ease-in-out_infinite]
                        blur-[0.5px]
                      `}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${10 + Math.random() * 80}%`,
                        top: `${10 + Math.random() * 80}%`,
                        opacity: 0.3 + Math.random() * 0.4,
                        animationDelay: `${delay}s`,
                        animationDuration: `${duration}s`,
                        boxShadow: `0 0 ${size * 2}px ${theme.completed.accent.replace('bg-', '')}`,
                      }}
                    />
                  );
                })}

                {/* 大型光晕粒子 / Large glow particles */}
                {[...Array(4)].map((_, i) => {
                  const size = 3 + Math.random() * 2;
                  const duration = 4 + Math.random() * 3;
                  const delay = Math.random() * 4;

                  return (
                    <div
                      key={`glow-${i}`}
                      className={`
                        absolute rounded-full ${theme.completed.accent}
                        animate-[float_${duration}s_ease-in-out_infinite]
                        blur-sm
                      `}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                        opacity: 0.4 + Math.random() * 0.3,
                        animationDelay: `${delay}s`,
                        animationDuration: `${duration}s`,
                        boxShadow: `0 0 ${size * 3}px ${size}px ${theme.completed.accent.replace('bg-', '')}40`,
                      }}
                    />
                  );
                })}

                {/* 上升气泡粒子 / Rising bubble particles */}
                {[...Array(6)].map((_, i) => {
                  const size = 1.5 + Math.random() * 1.5;
                  const duration = 5 + Math.random() * 4;
                  const delay = Math.random() * 5;

                  return (
                    <div
                      key={`bubble-${i}`}
                      className={`
                        absolute rounded-full ${theme.completed.accent}
                        blur-[0.5px]
                      `}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${15 + Math.random() * 70}%`,
                        bottom: '-10px',
                        opacity: 0,
                        animation: `rise ${duration}s ease-in-out ${delay}s infinite`,
                      }}
                    />
                  );
                })}

                {/* 旋转星形粒子 / Rotating star particles */}
                {[...Array(3)].map((_, i) => {
                  const size = 3 + Math.random() * 2;
                  const duration = 6 + Math.random() * 4;
                  const delay = Math.random() * 3;

                  return (
                    <div
                      key={`star-${i}`}
                      className={`
                        absolute ${theme.completed.accent}
                        opacity-50
                      `}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                        animation: `floatRotate ${duration}s ease-in-out ${delay}s infinite`,
                        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionCard;
