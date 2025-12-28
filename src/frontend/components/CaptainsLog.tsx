import React, { useState, useMemo, useRef } from "react";
import { UserStats, WeekGroup, LogEntry } from "../types";
import { ClipboardList, Terminal, Zap, CheckCircle2, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useHistory } from "../hooks/useMissions";

interface CaptainsLogProps {
  stats: UserStats;
  userId: string;
}

// 日期分组的类型 / Date group type
interface DateGroup {
  date: string; // YYYY-MM-DD 格式 / YYYY-MM-DD format
  displayDate: string; // 显示日期 / Display date (e.g., "12/22 周日")
  logs: LogEntry[];
  totalCount: number;
  totalXp: number;
}

const CaptainsLog: React.FC<CaptainsLogProps> = ({ stats, userId }) => {
  const { t } = useLanguage();
  const { weekGroups, isLoading, error, refetch } = useHistory(userId);

  // 管理周的折叠/展开状态 / Manage week collapse/expand state
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  // 管理日期的折叠/展开状态 / Manage date collapse/expand state
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // 管理选中的日期（用于高亮显示）/ Manage selected date (for highlighting)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 引用日期分组容器，用于滚动 / Ref to date groups container for scrolling
  const dateGroupsRef = useRef<HTMLDivElement>(null);

  // 切换周的展开/折叠状态 / Toggle week expand/collapse
  const toggleWeek = (weekStart: string) => {
    setExpandedWeeks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(weekStart)) {
        newSet.delete(weekStart);
      } else {
        newSet.add(weekStart);
      }
      return newSet;
    });
  };

  // 切换日期的展开/折叠状态 / Toggle date expand/collapse
  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
        // 如果折叠的是当前选中的日期，清除选中状态
        // If collapsing the currently selected date, clear selection
        if (selectedDate === date) {
          setSelectedDate(null);
        }
      } else {
        newSet.add(date);
        // 设置选中的日期 / Set selected date
        setSelectedDate(date);
      }
      return newSet;
    });
  };

  // 处理点击柱形图的某一天 / Handle click on a day in the bar chart
  const handleBarClick = (dayIndex: number) => {
    // 获取当前展开的周 / Get the currently expanded week
    const expandedWeek = weekDateGroups.find((wg) => expandedWeeks.has(wg.weekStart)) || weekDateGroups.find((wg) => wg.isCurrentWeek);

    if (!expandedWeek) return;

    // 计算 dayIndex 对应的日期 / Calculate the date for dayIndex
    // dayIndex: 0=周一, 1=周二, ..., 6=周日
    // 我们需要找到 weekStart（周一）对应的日期，然后加上 dayIndex 天
    const weekStartDate = new Date(expandedWeek.weekStart);
    const targetDate = new Date(weekStartDate);
    targetDate.setDate(targetDate.getDate() + dayIndex);

    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // 查找该日期是否有任务 / Check if this date has tasks
    const dateGroup = expandedWeek.dateGroups.find((dg) => dg.date === targetDateStr);

    if (dateGroup) {
      // 展开包含该日期的周（如果还没展开）
      // Expand the week containing this date (if not already expanded)
      setExpandedWeeks((prev) => new Set([...prev, expandedWeek.weekStart]));

      // 展开该日期 / Expand this date
      setExpandedDates((prev) => new Set([...prev, targetDateStr]));

      // 设置选中的日期 / Set selected date
      setSelectedDate(targetDateStr);

      // 滚动到该日期 / Scroll to this date
      setTimeout(() => {
        const dateElement = document.getElementById(`date-${targetDateStr}`);
        if (dateElement) {
          dateElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // 添加高亮动画 / Add highlight animation
          dateElement.classList.add('ring-2', 'ring-neon-purple', 'ring-offset-2', 'ring-offset-black');
          setTimeout(() => {
            dateElement.classList.remove('ring-2', 'ring-neon-purple', 'ring-offset-2', 'ring-offset-black');
          }, 2000);
        }
      }, 100);
    }
  };

  // 默认展开当前周 / Default expand current week
  React.useEffect(() => {
    if (weekGroups.length > 0) {
      const currentWeek = weekGroups.find((wg) => wg.isCurrentWeek);
      if (currentWeek) {
        setExpandedWeeks(new Set([currentWeek.weekStart]));
        // 默认展开本周的所有日期 / Default expand all dates in current week
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        setExpandedDates(new Set([todayStr]));
      }
    }
  }, [weekGroups]);

  // 将周分组转换为日期分组 / Convert week groups to date groups
  const weekDateGroups = useMemo(() => {
    return weekGroups.map((weekGroup) => {
      // 按日期分组 / Group by date
      const dateMap = new Map<string, LogEntry[]>();

      weekGroup.logs.forEach((log) => {
        const date = new Date(log.timestamp);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, []);
        }
        dateMap.get(dateStr)!.push(log);
      });

      // 转换为 DateGroup 数组并按日期降序排序 / Convert to DateGroup array and sort by date descending
      const dateGroups: DateGroup[] = Array.from(dateMap.entries()).map(([date, logs]) => {
        const dateObj = new Date(date);
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekDays[dateObj.getDay()];

        // 计算该日期的总 XP / Calculate total XP for this date
        const totalXp = logs.reduce((sum, log) => sum + log.xpEarned, 0);

        return {
          date,
          displayDate: `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${weekDay}`,
          logs: logs.sort((a, b) => b.timestamp - a.timestamp),
          totalCount: logs.length,
          totalXp,
        };
      }).sort((a, b) => b.date.localeCompare(a.date)); // 按日期降序 / Sort by date descending

      return {
        ...weekGroup,
        dateGroups,
      };
    });
  }, [weekGroups]);

  // 星期标签 - 周一在最前面 / Week day labels - Monday first
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  const todayIndex = new Date().getDay();
  const mondayIndex = todayIndex === 0 ? 6 : todayIndex - 1; // 调整为周一是 0 / Adjust to Monday is 0

  // 计算周数据 - 只使用当前展开的周，如果没有展开的则使用当前周
  // Calculate week data - Only use currently expanded week, or current week if none expanded
  // 使用 useMemo 确保展开状态变化时重新计算
  // Use useMemo to recalculate when expanded state changes
  const weekData = useMemo(() => {
    const data = Array(7)
      .fill(0)
      .map(() => ({
        active: false,
        score: 15, // base height percentage
      }));

    // 找到当前展开的周（优先使用第一个展开的周）
    // Find the currently expanded week (prefer the first expanded one)
    const expandedWeek = weekDateGroups.find((wg) => expandedWeeks.has(wg.weekStart)) || weekDateGroups.find((wg) => wg.isCurrentWeek);

    if (expandedWeek) {
      expandedWeek.dateGroups.forEach((dateGroup) => {
        const date = new Date(dateGroup.date);
        const dayOfWeek = date.getDay();
        const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 周日(0) 转换为 6，其他减 1

        // 根据任务数量计算柱形高度 / Calculate bar height based on task count
        // 基础高度 50%，每个任务增加 10%，最高 100%
        const taskCount = dateGroup.totalCount;
        data[adjustedIndex].active = true;
        data[adjustedIndex].score = Math.min(100, Math.max(50, 50 + taskCount * 10));
      });
    }

    return data;
  }, [weekDateGroups, expandedWeeks]);

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
              const isToday = idx === mondayIndex;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end gap-2 group h-full"
                >
                  {/* The Bar - Clickable */}
                  <div
                    onClick={() => data.active && handleBarClick(idx)}
                    className={`
                      w-full rounded-t-md transition-all duration-1000 relative overflow-hidden flex items-end
                      ${data.active ? "bg-neon-green shadow-[0_0_10px_rgba(74,222,128,0.4)] cursor-pointer hover:shadow-[0_0_15px_rgba(74,222,128,0.6)] hover:scale-105" : "bg-slate-800"}
                      ${isToday && !data.active ? "bg-slate-700" : ""}
                    `}
                    style={{ height: `${data.score}%` }}
                  >
                    {data.active && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    )}
                    {/* Tooltip hint */}
                    {data.active && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/90 text-white text-[10px] px-2 py-1 rounded pointer-events-none">
                        点击查看详情
                      </div>
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

      {/* Week Groups */}
      <div className="flex-1 px-4 overflow-y-auto">
        <div className="relative pl-4">
          {/* The Timeline Line */}
          <div className="absolute left-[3px] top-2 bottom-0 w-[2px] bg-gradient-to-b from-neon-cyan via-blue-900 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>

          {weekDateGroups.map((weekGroup) => {
            const isExpanded = expandedWeeks.has(weekGroup.weekStart);

            return (
              <div key={weekGroup.weekStart} className="mb-6 relative">
                {/* Week Header - Collapsible */}
                <div
                  onClick={() => toggleWeek(weekGroup.weekStart)}
                  className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/5 transition-colors p-2 -ml-2 rounded-lg group"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-[0_0_10px_#22d3ee] relative z-10"></div>
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-neon-cyan" />
                  ) : (
                    <ChevronRight size={16} className="text-neon-cyan" />
                  )}
                  <h3 className="text-neon-cyan text-sm font-bold uppercase tracking-[0.2em] font-mono bg-black/60 px-3 py-1 rounded flex items-center gap-3">
                    <span>{weekGroup.weekLabel}</span>
                    <span className="text-slate-500 text-xs">
                      ({weekGroup.weekStart} ~ {weekGroup.weekEnd})
                    </span>
                  </h3>
                  <div className="ml-auto flex items-center gap-3 text-xs">
                    <span className="text-neon-green font-bold">
                      {weekGroup.totalCount} {t.success || "成功"}
                    </span>
                    <span className="text-neon-purple font-bold">
                      {weekGroup.totalXp} XP
                    </span>
                  </div>
                </div>

                {/* Date Groups - Only show when week is expanded */}
                {isExpanded && (
                  <div className="space-y-3 pl-4 animate-in slide-in-from-left-2 fade-in duration-300" ref={dateGroupsRef}>
                    {weekGroup.dateGroups.map((dateGroup) => {
                      const isDateExpanded = expandedDates.has(dateGroup.date);
                      const isSelected = selectedDate === dateGroup.date;

                      return (
                        <div
                          key={dateGroup.date}
                          id={`date-${dateGroup.date}`}
                          className={`relative transition-all duration-300 ${isSelected ? 'rounded-lg' : ''}`}
                        >
                          {/* Date Header - Collapsible */}
                          <div
                            onClick={() => toggleDate(dateGroup.date)}
                            className={`flex items-center gap-3 mb-2 cursor-pointer hover:bg-white/5 transition-colors p-2 -ml-2 rounded-lg group ${
                              isSelected ? 'bg-neon-purple/10 border border-neon-purple/30' : ''
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_8px_rgba(168,85,247,0.5)] relative z-10"></div>
                            {isDateExpanded ? (
                              <ChevronDown size={14} className="text-neon-purple" />
                            ) : (
                              <ChevronRight size={14} className="text-neon-purple" />
                            )}
                            <h4 className="text-neon-purple text-xs font-bold uppercase tracking-wider font-mono bg-black/40 px-2 py-0.5 rounded flex items-center gap-2">
                              <Calendar size={12} className="text-neon-purple" />
                              {dateGroup.displayDate}
                            </h4>
                            <div className="ml-auto flex items-center gap-2 text-[10px]">
                              <span className="text-neon-green">
                                {dateGroup.totalCount} 任务
                              </span>
                              <span className="text-slate-500">
                                {dateGroup.totalXp} XP
                              </span>
                            </div>
                          </div>

                          {/* Date Entries - Only show when date is expanded */}
                          {isDateExpanded && (
                            <div className="space-y-2 pl-4">
                              {dateGroup.logs.map((entry) => (
                                <div
                                  key={entry.id}
                                  className="bg-black/40 border border-white/5 border-l-2 border-l-neon-green/50 rounded-r-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-white/5 transition-colors group"
                                >
                                  {/* Date & Time / 日期和时间 */}
                                  <div className="text-slate-500 font-mono text-xs whitespace-nowrap min-w-[100px] flex items-center gap-2">
                                    <Terminal size={12} />
                                    {new Date(entry.timestamp).toLocaleDateString('zh-CN', {
                                      month: '2-digit',
                                      day: '2-digit',
                                    })} {new Date(entry.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="text-center py-10 opacity-50">
              <div className="font-mono text-slate-400 animate-pulse">
                加载中...
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <div className="font-mono text-red-400 mb-2">
                加载失败
              </div>
              <button
                onClick={() => refetch()}
                className="text-neon-cyan hover:underline text-sm"
              >
                重试
              </button>
            </div>
          )}

          {!isLoading && !error && weekGroups.length === 0 && (
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
