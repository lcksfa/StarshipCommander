import React from "react";
import { Flame } from "lucide-react";

/**
 * 连续天数等级配置 / Streak level configuration
 */
interface StreakLevel {
  days: number;
  label: string; // "新手", "坚持者", "习惯大师", "传奇"
  color: string; // 火焰颜色 / Flame color
  size: "sm" | "md" | "lg" | "xl";
  effect: "none" | "pulse" | "glow" | "particles";
  flameIcon: number; // 1-5 个火焰 / 1-5 flames
}

/**
 * 连续等级系统配置 / Streak level system configuration
 * 根据连续天数显示不同等级的视觉效果
 */
export const STREAK_LEVELS: StreakLevel[] = [
  { days: 0, label: "开始", color: "text-slate-500", size: "sm", effect: "none", flameIcon: 0 },
  { days: 1, label: "初学者", color: "text-orange-400", size: "md", effect: "pulse", flameIcon: 1 },
  { days: 4, label: "坚持者", color: "text-orange-500", size: "md", effect: "glow", flameIcon: 1 },
  { days: 8, label: "习惯养成", color: "text-orange-600", size: "lg", effect: "glow", flameIcon: 2 },
  { days: 15, label: "稳定习惯", color: "text-red-500", size: "lg", effect: "particles", flameIcon: 3 },
  { days: 22, label: "习惯大师", color: "text-red-600", size: "xl", effect: "particles", flameIcon: 4 },
  { days: 31, label: "传奇", color: "text-purple-500", size: "xl", effect: "particles", flameIcon: 5 },
];

/**
 * 根据连续天数获取等级信息 / Get streak level by days
 * @param streakDays - 连续天数 / Consecutive days
 * @returns 对应的等级配置 / Corresponding level configuration
 */
export function getStreakLevel(streakDays: number): StreakLevel {
  // 从高到低查找匹配的等级
  for (let i = STREAK_LEVELS.length - 1; i >= 0; i--) {
    if (streakDays >= STREAK_LEVELS[i].days) {
      return STREAK_LEVELS[i];
    }
  }
  return STREAK_LEVELS[0];
}

/**
 * 连续徽章组件 / Streak badge component
 * 显示连续天数、等级标签和动态火焰效果
 */
interface StreakBadgeProps {
  streak: number; // 连续天数 / Consecutive days
  isCompleted?: boolean; // 今日是否已完成 / Completed today (reserved for future use)
  size?: "sm" | "md" | "lg"; // 组件尺寸 / Component size
  showLabel?: boolean; // 是否显示等级标签 / Show level label
}

const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  size = "md",
  showLabel = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isCompleted = false,
}) => {
  // 获取当前连续等级
  const level = getStreakLevel(streak);

  // 根据等级确定火焰大小
  const getFlameSize = (): number => {
    switch (size) {
      case "sm":
        return 12;
      case "lg":
        return 24;
      default:
        return 16;
    }
  };

  // 根据等级确定容器尺寸
  const getContainerClass = (): string => {
    switch (size) {
      case "sm":
        return "px-2 py-1 rounded-lg";
      case "lg":
        return "px-4 py-2 rounded-xl";
      default:
        return "px-3 py-1.5 rounded-xl";
    }
  };

  return (
    <div
      className={`
        streak-badge
        inline-flex
        items-center
        gap-2
        ${getContainerClass()}
        ${streak > 0
          ? "bg-gradient-to-br from-orange-500/20 to-red-500/10 border-orange-500/40 shadow-[0_0_20px_rgba(251,146,60,0.3)]"
          : "bg-slate-900/40 border-slate-700/40"
        }
        border-2
        backdrop-blur-sm
        transition-all
        duration-300
      `}
    >
      {/* 火焰图标容器 - 根据等级显示不同数量 / Flame container - show multiple flames based on level */}
      <div className="flames-container flex items-center gap-0.5">
        {[...Array(level.flameIcon)].map((_, i) => (
          <Flame
            key={i}
            className={`
              flame-icon
              ${level.color}
              ${level.effect}
              ${streak > 0 ? "fill-current" : ""}
              transition-all
              duration-300
            `}
            size={getFlameSize()}
            strokeWidth={2.5}
          />
        ))}
      </div>

      {/* 连续天数 / Streak count */}
      <div className="streak-count flex items-baseline gap-1">
        <span className={`text-base font-black ${streak > 0 ? level.color : "text-slate-500"}`}>
          {streak}
        </span>
        <span className="text-xs font-bold text-slate-400">天</span>
      </div>

      {/* 等级标签（可选） / Level label (optional) */}
      {showLabel && size !== "sm" && (
        <div className={`streak-level text-[10px] font-black uppercase tracking-wider ${level.color}`}>
          {level.label}
        </div>
      )}
    </div>
  );
};

export default StreakBadge;
