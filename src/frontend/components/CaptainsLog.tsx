import React from "react";
import { LogEntry, UserStats } from "../types";
import { ClipboardList, Terminal, Zap, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useHistory } from "../hooks/useMissions";

interface CaptainsLogProps {
  stats: UserStats;
  userId: string;
}

const CaptainsLog: React.FC<CaptainsLogProps> = ({ stats, userId }) => {
  const { t, language } = useLanguage();
  const { logs, isLoading, error, refetch } = useHistory(userId);

  // Weekly Chart Data
  const days =
    language === "zh"
      ? ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const todayIndex = new Date().getDay();

  // Calculate fake "scores" for visual variety based on logs
  // In a real app, this would sum up XP per day
  const weekData = Array(7)
    .fill(0)
    .map(() => {
      // Base random activity
      return {
        active: false,
        score: 15, // base height percentage
      };
    });

  logs.forEach((log) => {
    const d = new Date(log.timestamp);
    const diffTime = Math.abs(Date.now() - log.timestamp);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      const idx = d.getDay();
      weekData[idx].active = true;
      // Assign a semi-random high score for active days (50-100%)
      // using the day index to keep it deterministic for this render
      weekData[idx].score = Math.max(50, (d.getDate() * 13) % 100);
    }
  });

  // Group logs by date
  const groupedLogs = logs.reduce(
    (groups, entry) => {
      const date = new Date(entry.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateLabel = date.toLocaleDateString();

      if (date.toDateString() === today.toDateString()) {
        dateLabel = language === "zh" ? "今天" : "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateLabel = language === "zh" ? "昨天" : "Yesterday";
      } else {
        // Futuristic Date Format
        dateLabel = `Stardate ${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(entry);
      return groups;
    },
    {} as Record<string, LogEntry[]>,
  );

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => {
    if (a === "Today" || a === "今天") return -1;
    if (b === "Today" || b === "今天") return 1;
    if (a === "Yesterday" || a === "昨天") return -1;
    if (b === "Yesterday" || b === "昨天") return 1;
    return b.localeCompare(a);
  });

  return (
    <div className="pb-32 md:pb-8 flex flex-col h-full pt-4">
      {/* Weekly Flight Chart */}
      <div className="px-4 mb-4">
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4">
          <h3 className="text-neon-cyan text-xs font-bold uppercase tracking-widest mb-3">
            {t.weekly_chart}
          </h3>
          <div className="flex justify-between items-end h-24 gap-2">
            {days.map((day, idx) => {
              const data = weekData[idx];
              const isToday = idx === todayIndex;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end gap-2 group h-full"
                >
                  {/* The Bar */}
                  <div
                    className={`
                                    w-full rounded-t-md transition-all duration-1000 relative overflow-hidden flex items-end
                                    ${data.active ? "bg-neon-green shadow-[0_0_10px_rgba(74,222,128,0.4)]" : "bg-slate-800"}
                                    ${isToday && !data.active ? "bg-slate-700" : ""}
                                `}
                    style={{ height: `${data.score}%` }}
                  >
                    {data.active && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-bold uppercase ${isToday ? "text-white" : "text-slate-500"}`}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Header Stats */}
      <div className="px-4 mb-6">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex justify-around items-center shadow-inner">
          <div className="text-center">
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
              {t.total_victories}
            </div>
            <div className="text-white text-2xl font-mono font-bold flex items-center gap-2 justify-center">
              <CheckCircle2 size={20} className="text-neon-green" />
              {stats.totalMissionsCompleted}
            </div>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="text-center">
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
              {t.lifetime_xp}
            </div>
            <div className="text-neon-gold text-2xl font-mono font-bold flex items-center gap-2 justify-center">
              <Zap size={20} fill="currentColor" />
              {stats.totalXpEarned}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 overflow-y-auto">
        <div className="relative pl-4">
          {/* The Timeline Line */}
          <div className="absolute left-[3px] top-2 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan via-blue-900 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>

          {sortedDates.map((date) => (
            <div key={date} className="mb-8 relative">
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-[0_0_10px_#22d3ee] relative z-10 -ml-[5px]"></div>
                <h3 className="text-neon-cyan text-sm font-bold uppercase tracking-[0.2em] font-mono bg-black/60 px-2 rounded">
                  {date}
                </h3>
              </div>

              {/* Entries */}
              <div className="space-y-3 pl-4">
                {groupedLogs[date].map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-black/40 border border-white/5 border-l-2 border-l-neon-green/50 rounded-r-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-white/5 transition-colors group animate-in slide-in-from-left-4 fade-in duration-500"
                  >
                    {/* Time */}
                    <div className="text-slate-500 font-mono text-xs whitespace-nowrap min-w-[70px] flex items-center gap-2">
                      <Terminal size={12} />
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </div>

                    {/* Mission Info */}
                    <div className="flex-1 font-mono text-sm">
                      <span className="text-neon-green font-bold">
                        {t.success}:
                      </span>
                      <span className="text-slate-200 ml-2">
                        {entry.missionTitle}
                      </span>
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center gap-3 text-xs font-bold opacity-80 group-hover:opacity-100 transition-opacity mt-1 sm:mt-0">
                      <span className="text-neon-purple">
                        +{entry.xpEarned} XP
                      </span>
                      <span className="text-neon-gold">
                        +{entry.coinEarned} Coins
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="text-center py-10 opacity-50">
              <div className="font-mono text-slate-400 animate-pulse">
                {language === "zh" ? "加载中..." : "Loading..."}
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <div className="font-mono text-red-400 mb-2">
                {language === "zh" ? "加载失败" : "Failed to load"}
              </div>
              <button
                onClick={() => refetch()}
                className="text-neon-cyan hover:underline text-sm"
              >
                {language === "zh" ? "重试" : "Retry"}
              </button>
            </div>
          )}

          {!isLoading && !error && logs.length === 0 && (
            <div className="text-center py-10 opacity-50">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="font-mono text-slate-400">{t.no_logs}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaptainsLog;
