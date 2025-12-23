import React from "react";
import { Mission } from "../types";
import { useCompleteMission } from "../hooks/useMissions";
import {
  Sparkles,
  Check,
  Zap,
  Coins,
  Flame,
  Repeat,
  Hourglass,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface MissionCardProps {
  mission: Mission;
  onComplete: (id: string) => void;
  userId: string; // 添加 userId 参数 / Add userId parameter
}

const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onComplete,
  userId,
}) => {
  const { t } = useLanguage();
  const { completeMission, isLoading } = useCompleteMission();

  const categoryConfig = {
    health: { label: t.cat_body, color: "text-rose-400" },
    study: { label: t.cat_brain, color: "text-blue-400" },
    chore: { label: t.cat_base, color: "text-green-400" },
    creative: { label: t.cat_art, color: "text-purple-400" },
  };

  const config = categoryConfig[mission.category] || categoryConfig.study;

  const handleComplete = async () => {
    if (mission.isCompleted) return;

    try {
      const result = await completeMission(mission.id, userId);

      // 触发父组件回调以刷新数据和显示覆盖层
      onComplete(mission.id, result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // eslint-disable-next-line no-console
      console.error("Failed to complete mission:", error);

      // 显示错误提示（只保留错误提示，移除成功消息避免与覆盖层冲突）
      alert(
        `❌ ${t.card_error || "Failed to complete mission"}: ${errorMessage}`,
      );
    }
  };

  return (
    <div
      data-testid="mission-card"
      className={`
        relative group rounded-[2rem] p-1.5 transition-all duration-300 transform
        border backdrop-blur-md h-full flex flex-col min-h-[200px]
        ${
          mission.isCompleted && !mission.isDaily
            ? "bg-white/10 border-neon-green shadow-[0_0_15px_rgba(74,222,128,0.2)] scale-[0.98]"
            : "bg-white/10 border-white/20 hover:border-white/40 hover:-translate-y-1 hover:shadow-lg"
        }
      `}
    >
      <div
        className={`
          flex flex-col h-full p-5 rounded-[1.7rem] relative overflow-hidden
          ${mission.isCompleted && !mission.isDaily ? "bg-gradient-to-br from-green-500/10 to-transparent" : "bg-transparent"}
      `}
      >
        {/* --- EYEBROW ROW --- */}
        <div className="flex justify-between items-center mb-3">
          {/* Category Badge */}
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 border border-white/5">
            <span className="text-sm">{mission.emoji}</span>
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}
            >
              {config.label}
            </span>
          </div>

          {/* Streak Counter (Daily Only) */}
          {mission.isDaily && (
            <div
              className={`
                    flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-orange-500/30
                    ${mission.streak > 0 ? "text-neon-orange shadow-[0_0_10px_rgba(251,146,60,0.3)]" : "text-slate-500"}
                `}
            >
              <Flame
                size={12}
                fill={mission.streak > 0 ? "currentColor" : "none"}
              />
              <span className="text-[10px] font-black">{mission.streak}</span>
            </div>
          )}
        </div>

        {/* --- MAIN CONTENT --- */}
        <div
          className={`flex-grow w-full mb-6 ${isLoading ? "opacity-50" : ""}`}
        >
          {/* Title */}
          <h3
            className={`text-2xl font-black leading-none mb-2 flex items-center gap-2 ${mission.isCompleted && !mission.isDaily ? "text-neon-green drop-shadow-md" : "text-white"}`}
          >
            {mission.title}
            {/* Daily Loop Icon (Small distinction next to title) */}
            {mission.isDaily && (
              <Repeat size={14} className="text-slate-600" strokeWidth={3} />
            )}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-sm font-bold leading-relaxed">
            {mission.description}
          </p>
        </div>

        {/* --- FOOTER: Action Zone --- */}
        <div className="mt-auto flex justify-between items-center gap-2">
          {/* Left: Rewards Badges */}
          <div
            className={`flex flex-col xs:flex-row sm:flex-row gap-2 transition-opacity ${mission.isCompleted ? "opacity-50" : "opacity-100"}`}
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
                    relative overflow-hidden group/btn px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300
                    ${
                      isLoading
                        ? "bg-slate-800/50 text-slate-500 border-2 border-slate-700 cursor-not-allowed"
                        : mission.isCompleted
                          ? "bg-transparent text-neon-green border-2 border-neon-green cursor-default"
                          : "bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(192,132,252,0.6)] hover:scale-105 active:scale-95"
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
      </div>

      {/* Victory Glow for completed ONE-TIME cards */}
      {mission.isCompleted && !mission.isDaily && (
        <div className="absolute inset-0 bg-neon-green/5 rounded-[2rem] pointer-events-none animate-pulse-glow" />
      )}
    </div>
  );
};

export default MissionCard;
