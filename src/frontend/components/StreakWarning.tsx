import React, { useMemo } from "react";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";

/**
 * 连续中断警示组件 / Streak interruption warning component
 * 在用户即将断签前显示提醒，帮助保持习惯连续性
 */
interface StreakWarningProps {
  streak: number; // 连续天数 / Consecutive days
  isCompleted: boolean; // 今日是否已完成 / Completed today
  isDaily?: boolean; // 是否为每日任务 / Is daily mission
  lastCompleted?: Date | string; // 最后完成时间 / Last completion time
}

const StreakWarning: React.FC<StreakWarningProps> = ({
  streak,
  isCompleted,
  isDaily = true,
  lastCompleted,
}) => {
  // 非每日任务或连续天数不足不显示警示
  if (!isDaily || streak < 1) {
    return null;
  }

  // 格式化最后完成时间 / Format last completion time
  const formatLastCompleted = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const completedDate = new Date(d);
    completedDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `今天 ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    } else if (diffDays === 1) {
      return `昨天 ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
    }
  };

  // 计算距离断签还有多少小时
  const hoursRemaining = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diffMs = tomorrow.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      hours: diffHours,
      minutes: diffMinutes,
    };
  }, []);

  // 根据连续天数确定警示等级
  const getWarningLevel = (): "low" | "medium" | "high" => {
    if (streak >= 21) return "high";
    if (streak >= 7) return "medium";
    return "low";
  };

  const warningLevel = getWarningLevel();

  // 获取警示样式
  const getWarningStyles = () => {
    if (isCompleted) {
      return {
        container: "border-green-500/50 bg-gradient-to-r from-green-500/10 to-transparent",
        icon: "text-green-500",
        text: "text-green-400",
        iconBg: "bg-green-500/10",
      };
    }

    switch (warningLevel) {
      case "high":
        return {
          container: "border-red-500/50 bg-gradient-to-r from-red-500/10 to-transparent",
          icon: "text-red-500",
          text: "text-red-400",
          iconBg: "bg-red-500/10",
        };
      case "medium":
        return {
          container: "border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-transparent",
          icon: "text-orange-500",
          text: "text-orange-400",
          iconBg: "bg-orange-500/10",
        };
      default:
        return {
          container: "border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-transparent",
          icon: "text-yellow-500",
          text: "text-yellow-400",
          iconBg: "bg-yellow-500/10",
        };
    }
  };

  const styles = getWarningStyles();

  return (
    <div
      className={`
        streak-warning
        flex
        items-start
        gap-3
        border-l-4
        ${styles.container}
        rounded-r-lg
        p-3
        mb-3
        backdrop-blur-sm
        animate-fade-in
      `}
    >
      {/* 图标 / Icon */}
      <div
        className={`
          ${styles.iconBg}
          rounded-full
          p-2
          flex-shrink-0
        `}
      >
        {isCompleted ? (
          <CheckCircle size={18} className={styles.icon} strokeWidth={2.5} />
        ) : (
          <AlertTriangle size={18} className={styles.icon} strokeWidth={2.5} />
        )}
      </div>

      {/* 内容区域 / Content area */}
      <div className="warning-content flex-grow">
        {/* 主要文案 / Main message */}
        <p className={`text-sm font-bold mb-1 ${styles.text}`}>
          {isCompleted ? (
            <>太棒了！保持了 {streak} 天连续打卡！</>
          ) : (
            <>
              已连续 <span className="text-base">{streak}</span> 天，
              {warningLevel === "high" && "这可是宝贵的习惯记录！"}
              {warningLevel === "medium" && "习惯正在养成中！"}
              {warningLevel === "low" && "继续加油！"}
            </>
          )}
        </p>

        {/* 倒计时 / Countdown */}
        {!isCompleted && (
          <div className="countdown flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={12} className="text-slate-500" />
            <span>
              距离断签还有{" "}
              <span className="font-bold text-slate-300">
                {hoursRemaining.hours}小时{hoursRemaining.minutes}分钟
              </span>
            </span>
            {lastCompleted && (
              <>
                <span className="mx-1">·</span>
                <span>上次完成: {formatLastCompleted(lastCompleted)}</span>
              </>
            )}
          </div>
        )}

        {/* 完成后的信息 / Completion info */}
        {isCompleted && (
          <div className="completion-info text-xs text-slate-400 space-y-1">
            <p>
              {streak >= 30 && "你已经养成稳定的习惯，继续保持！"}
              {streak >= 21 && streak < 30 && "习惯大师，令人佩服！"}
              {streak >= 14 && streak < 21 && "势不可挡，稳步前进！"}
              {streak >= 7 && streak < 14 && "习惯已经养成，你真棒！"}
              {streak >= 1 && streak < 7 && streak > 0 && "不错的开始，继续保持！"}
            </p>
            <p className="text-slate-500">
              💡 明天记得继续打卡哦！
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakWarning;
