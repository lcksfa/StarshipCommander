import React, { useState, useEffect } from "react";
import StarBackground from "./components/StarBackground";
import HUD from "./components/HUD";
import MissionCard from "./components/MissionCard";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import Hologram from "./components/Hologram";
import AddMissionModal from "./components/AddMissionModal";
import CaptainsLog from "./components/CaptainsLog";
import SuccessOverlay from "./components/SuccessOverlay";
import { ProfileEdit } from "./components/ProfileEdit";
import { Toaster, toast } from "sonner";
import { Tab, MissionCategory } from "./types";
import { INITIAL_STATS } from "./constants";
import { useAllMissions, useUserStats } from "./hooks/useMissions";
import { apiClient } from "./lib/trpc";
import { useAuth } from "./contexts/AuthContext";
import { useLanguage } from "./contexts/LanguageContext";
import { getErrorMessage, getErrorTitle, logError } from "./utils/error-utils";
import {
  Star,
  Plus,
  Award,
  Trophy,
  Hexagon,
  Zap,
  Shield,
  Rocket as RocketIcon,
  Palette,
  Wrench,
  Settings,
  Edit,
} from "lucide-react";

const App: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth(); // 使用认证系统的用户信息 / Use authenticated user info

  // 使用认证用户的 ID / Use authenticated user ID
  const userId = user?.id;

  // 使用真实 API 获取数据 / Use real API to fetch data
  const {
    missions,
    isLoading: missionsLoading,
    refetch: refetchMissions,
  } = useAllMissions({ userId, isActive: true });
  const {
    stats,
    refetch: refetchStats,
  } = useUserStats(userId);

  // 使用本地状态管理 UI 状态
  const [activeTab, setActiveTab] = useState<Tab>(Tab.MISSIONS);
  const [activeHangarTab, setActiveHangarTab] = useState<"ship" | "exchange">(
    "ship",
  );
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false); // Profile edit modal / 资料编辑模态框

  // New State for Mission Accomplished Overlay
  const [successData, setSuccessData] = useState<{
    xp: number;
    coins: number;
  } | null>(null);

  // 默认统计数据（如果 API 未加载）
  const displayStats = stats || INITIAL_STATS;

  // 任务排序：未完成的在前，已完成的在后
  const displayMissions = React.useMemo(() => {
    if (!missions) return [];
    return [...missions].sort((a, b) => {
      // 已完成的任务放最后
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      // 同状态的按创建时间排序（新的在前）
      return 0;
    });
  }, [missions]);

  // Simulation: Hangar unlocks at level 2.
  const isHangarUnlocked = displayStats.level >= 2;

  // 任务完成后的处理：显示覆盖层 + 刷新数据
  const handleMissionComplete = async (id: string, result?: any) => {
    // 1. 显示奖励覆盖层
    const mission = displayMissions.find((m) => m.id === id);
    if (mission) {
      setSuccessData({ xp: mission.xpReward, coins: mission.coinReward });

      // 等待 2 秒后隐藏覆盖层
      setTimeout(() => {
        setSuccessData(null);
      }, 2000);
    }

    // 2. 刷新任务和用户统计数据
    await Promise.all([refetchMissions(), refetchStats()]);

    // 3. 如果有升级信息，显示升级动画
    if (result?.levelUp) {
      setShowLevelUp(true);
    }
  };

  const handleAddMission = async (missionData: {
    title: string;
    category: MissionCategory;
    difficulty: string;
    xp: number;
    coins: number;
    emoji: string;
    isDaily: boolean;
  }) => {
    // 显示加载提示 / Show loading toast
    const loadingToast = toast.loading(
      language === "zh" ? "正在创建任务..." : "Creating mission..."
    );

    try {
      // 调用 API 创建任务 / Call API to create mission
      await apiClient.createMission({
        title: missionData.title,
        description: `优先级: ${missionData.difficulty.toUpperCase()}`,
        xpReward: missionData.xp,
        coinReward: missionData.coins,
        category: missionData.category,
        emoji: missionData.emoji,
        isDaily: missionData.isDaily,
        difficulty: missionData.difficulty.toUpperCase() as "EASY" | "MEDIUM" | "HARD",
      });

      // 成功提示 / Success toast
      toast.success(
        language === "zh" ? "任务创建成功！" : "Mission created successfully!",
        {
          id: loadingToast,
          description:
            language === "zh"
              ? `"${missionData.title}" 已添加到您的任务列表`
              : `"${missionData.title}" has been added to your mission list`,
          duration: 4000,
        }
      );

      // 关闭模态框并刷新任务列表
      // Close modal and refresh mission list
      setIsModalOpen(false);
      await refetchMissions();
    } catch (error) {
      // 错误提示 / Error toast
      const errorMessage = getErrorMessage(error);
      const errorTitle = getErrorTitle(error);

      logError("handleAddMission", error, { missionData });

      toast.error(errorTitle, {
        id: loadingToast,
        description: errorMessage,
        action: {
          label: language === "zh" ? "重试" : "Retry",
          onClick: () => handleAddMission(missionData),
        },
      });
    }
  };

  useEffect(() => {
    if (showLevelUp) {
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showLevelUp]);

  // Render Hangar Content (Locked vs Unlocked)
  const renderHangar = () => {
    const exchangeItems = [
      {
        icon: RocketIcon,
        name: "Turbo Thruster",
        price: 2000,
        color: "text-neon-orange",
      },
      {
        icon: Shield,
        name: "Plasma Shield",
        price: 1500,
        color: "text-neon-blue",
      },
      {
        icon: Palette,
        name: "Gold Skin",
        price: 5000,
        color: "text-neon-gold",
      },
      { icon: Zap, name: "Energy Cell", price: 800, color: "text-neon-purple" },
      {
        icon: Hexagon,
        name: "Base Module",
        price: 3000,
        color: "text-neon-green",
      },
      { icon: Star, name: "Rank Badge", price: 1000, color: "text-white" },
    ];

    return (
      <div className="flex flex-col h-full relative">
        {/* Hangar Navigation Tabs (Glassmorphism Control Panel) */}
        <div className="px-4 mb-4">
          <div className="bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl flex gap-2 border border-white/10">
            <button
              onClick={() => setActiveHangarTab("ship")}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold uppercase transition-all duration-300 ${activeHangarTab === "ship" ? "bg-neon-cyan text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]" : "bg-transparent text-slate-400 hover:text-white"}`}
            >
              <Wrench size={18} /> {t.tab_starship}
            </button>
            <button
              onClick={() => setActiveHangarTab("exchange")}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold uppercase transition-all duration-300 ${activeHangarTab === "exchange" ? "bg-neon-gold text-black shadow-[0_0_15px_rgba(250,204,21,0.4)]" : "bg-transparent text-slate-400 hover:text-white"}`}
            >
              <Hexagon size={18} /> {t.tab_exchange}
            </button>
          </div>
        </div>

        {/* Hangar Content Area */}
        <div className="flex-1 px-4 overflow-y-auto pb-32 md:pb-8 relative">
          {/* BLUEPRINT MODE (Locked State) Overlay */}
          {!isHangarUnlocked && (
            <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center select-none">
              <div className="border-4 border-dashed border-blue-500/30 p-10 rounded-[2rem] w-full max-w-sm relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/blueprint-grid.png')] bg-blue-900/10">
                {/* Blueprint Ship Wireframe */}
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-48 mx-auto mb-6 opacity-60 animate-pulse-slow"
                >
                  <path
                    d="M100 20 L130 80 L180 100 L130 140 L130 180 L100 160 L70 180 L70 140 L20 100 L70 80 Z"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                  />
                  <circle
                    cx="100"
                    cy="90"
                    r="10"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="1"
                  />
                  <line
                    x1="20"
                    y1="100"
                    x2="180"
                    y2="100"
                    stroke="#60a5fa"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="100"
                    y1="20"
                    x2="100"
                    y2="180"
                    stroke="#60a5fa"
                    strokeWidth="0.5"
                  />
                </svg>
                <div className="inline-flex items-center gap-2 bg-blue-900/50 px-4 py-2 rounded-lg border border-blue-400/30 mb-2">
                  <Settings
                    className="animate-spin-slow text-blue-400"
                    size={16}
                  />
                  <span className="text-blue-200 font-mono text-xs font-bold tracking-widest uppercase">
                    Blueprint v1.0
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">
                  {t.hangar_locked}
                </h2>
                <p className="text-blue-300 font-bold text-sm">
                  {t.hangar_unlock_msg}
                </p>
              </div>
            </div>
          )}

          {/* UNLOCKED CONTENT */}
          <div
            className={`${!isHangarUnlocked ? "blur-sm opacity-30 pointer-events-none" : ""}`}
          >
            {/* TAB 1: SHIP CUSTOMIZATION */}
            {activeHangarTab === "ship" && (
              <div className="animate-in slide-in-from-right fade-in duration-500">
                {/* Hero Ship Visual */}
                <div className="relative h-64 w-full flex items-center justify-center mb-6">
                  {/* Glow behind ship */}
                  <div className="absolute w-48 h-48 bg-neon-cyan/20 blur-3xl rounded-full animate-pulse-slow"></div>

                  {/* Custom Ship SVG */}
                  <svg
                    viewBox="0 0 200 200"
                    className="w-56 h-56 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-float"
                  >
                    <defs>
                      <linearGradient
                        id="shipBody"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#e2e8f0" />
                        <stop offset="100%" stopColor="#94a3b8" />
                      </linearGradient>
                      <linearGradient
                        id="cockpit"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M100 20 L130 80 L180 100 L130 140 L130 180 L100 160 L70 180 L70 140 L20 100 L70 80 Z"
                      fill="url(#shipBody)"
                      stroke="#475569"
                      strokeWidth="2"
                    />
                    <path
                      d="M100 20 L100 160"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                    {/* Wings */}
                    <path d="M20 100 L70 140 L70 100 Z" fill="#64748b" />
                    <path d="M180 100 L130 140 L130 100 Z" fill="#64748b" />
                    {/* Cockpit */}
                    <circle
                      cx="100"
                      cy="90"
                      r="12"
                      fill="url(#cockpit)"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    {/* Engine Glow */}
                    <path
                      d="M90 165 L100 190 L110 165 Z"
                      fill="#facc15"
                      className="animate-pulse"
                    />
                  </svg>
                </div>

                {/* Ship Stats Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-white font-black text-xl">
                        {t.ship_class}:{" "}
                        <span className="text-neon-cyan">Voyager</span>
                      </h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                        {t.level} {displayStats.level}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-neon-green font-mono font-bold text-lg">
                        100%
                      </div>
                      <div className="text-slate-500 text-[10px] font-bold uppercase">
                        {t.ship_integrity}
                      </div>
                    </div>
                  </div>
                  {/* Progress Bars */}
                  <div className="space-y-4">
                    {[
                      {
                        label: t.part_engine,
                        progress: 65,
                        color: "bg-neon-orange",
                        icon: Zap,
                      },
                      {
                        label: t.part_cockpit,
                        progress: 40,
                        color: "bg-neon-blue",
                        icon: Hexagon,
                      },
                      {
                        label: t.part_wings,
                        progress: 80,
                        color: "bg-neon-purple",
                        icon: RocketIcon,
                      },
                    ].map((part, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                            <part.icon
                              size={12}
                              className={part.color.replace("bg-", "text-")}
                            />{" "}
                            {part.label}
                          </span>
                          <button className="text-[10px] bg-white/10 hover:bg-neon-green hover:text-black px-2 py-0.5 rounded text-neon-green transition-colors font-bold">
                            {t.upgrade}
                          </button>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${part.color} w-[${part.progress}%]`}
                            style={{ width: `${part.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EXCHANGE (SHOP) */}
            {activeHangarTab === "exchange" && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right fade-in duration-500">
                {exchangeItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors group relative overflow-hidden"
                  >
                    <div
                      className={`p-4 rounded-full bg-slate-900 border border-white/5 ${item.color} shadow-inner group-hover:scale-110 transition-transform`}
                    >
                      <item.icon size={28} />
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold text-sm leading-tight mb-1">
                        {item.name}
                      </div>
                      <div className="text-neon-gold text-xs font-black bg-black/40 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-neon-gold"></div>{" "}
                        {item.price}
                      </div>
                    </div>
                    <button className="w-full mt-2 py-2 bg-white/5 hover:bg-neon-gold hover:text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors">
                      {t.buy}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Placeholder views for Profile
  const renderContent = () => {
    switch (activeTab) {
      case Tab.MISSIONS:
        return (
          <div className="flex flex-col pb-32 md:pb-8">
            <h2 className="text-white text-2xl md:text-3xl font-bold px-4 mb-6 flex items-center gap-3 drop-shadow-md">
              <span className="w-2 h-8 md:h-10 bg-neon-cyan rounded-full block shadow-[0_0_10px_#22d3ee]"></span>
              {t.nav_missions}
            </h2>
            <div className="px-4">
              {missionsLoading ? (
                <div className="text-center py-10 text-slate-400">
                  {language === "zh" ? "加载中..." : "Loading..."}
                </div>
              ) : (
                <div className="flex flex-col gap-5 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                  {displayMissions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      onComplete={handleMissionComplete}
                      userId={userId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case Tab.LOG:
        return <CaptainsLog stats={displayStats} userId={userId} />;
      case Tab.HANGAR:
        return renderHangar();
      case Tab.PROFILE:
        return (
          <div className="px-4 pb-32 md:pb-8 pt-8">
            <div className="mt-6 mx-auto max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden">
              {/* Decorative Background for Profile */}
              <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/20 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-neon-cyan to-neon-purple rounded-full mx-auto mb-4 border-4 border-white/20 shadow-[0_0_20px_rgba(192,132,252,0.4)] flex items-center justify-center text-4xl md:text-6xl">
                  🧑‍🚀
                </div>

                {/* Profile Header with Edit Button / 带编辑按钮的资料标题 */}
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h2 className="text-2xl md:text-4xl font-bold text-white">
                    {t.rank_captain} {user?.displayName || user?.username || t.user_anonymous || "指挥官"}
                  </h2>
                  <button
                    onClick={() => setIsProfileEditOpen(true)}
                    className="p-2 rounded-full bg-white/10 hover:bg-neon-cyan/20 text-white/60 hover:text-neon-cyan transition-all group"
                    title={language === "zh" ? "编辑资料" : "Edit Profile"}
                  >
                    <Edit className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <p className="text-neon-cyan font-bold mb-6 md:text-xl">
                  {t.level} {displayStats.level} {displayStats.rank}
                </p>

                <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8">
                  <div className="bg-black/30 p-4 md:p-6 rounded-2xl border border-white/10">
                    <div className="text-slate-400 text-xs md:text-sm font-bold uppercase mb-1">
                      {t.profile_xp}
                    </div>
                    <div className="text-white text-xl md:text-3xl font-bold">
                      {displayStats.totalXpEarned.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-black/30 p-4 md:p-6 rounded-2xl border border-white/10">
                    <div className="text-slate-400 text-xs md:text-sm font-bold uppercase mb-1">
                      {t.profile_missions}
                    </div>
                    <div className="text-white text-xl md:text-3xl font-bold">
                      {displayStats.totalMissionsCompleted}
                    </div>
                  </div>
                </div>

                {/* Trophy Room (Medals & Achievements) */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-neon-gold text-lg font-black uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
                    <Trophy size={20} /> {t.achievements}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 md:gap-6">
                    {/* 1. Unlocked Badge */}
                    <div className="flex flex-col items-center group">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-neon-gold to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.5)] border-4 border-white/20 mb-2 transform group-hover:scale-110 transition-transform">
                        <Award size={32} className="text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-neon-gold uppercase">
                        First Flight
                      </span>
                    </div>

                    {/* 2. Locked Badge */}
                    <div className="flex flex-col items-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 mb-2">
                        <Hexagon size={32} className="text-slate-600" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Speed Demon
                      </span>
                    </div>

                    {/* 3. Locked Badge */}
                    <div className="flex flex-col items-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 mb-2">
                        <Star size={32} className="text-slate-600" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Super Star
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen font-sans text-slate-100 overflow-hidden select-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black flex">
      <StarBackground />
      <Hologram />

      {/* Toast 通知组件 / Toast notification component */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.9)",
            color: "#f1f5f9",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
          },
          className: "font-sans",
        }}
      />

      {/* Sidebar - Desktop Only */}
      <Sidebar
        currentTab={activeTab}
        onTabChange={setActiveTab}
        stats={displayStats}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 md:ml-64">
        {/* HUD: Conditionally Rendered */}
        {activeTab !== Tab.PROFILE && (
          <HUD
            stats={displayStats}
            compact={activeTab === Tab.LOG || activeTab === Tab.HANGAR}
          />
        )}

        <main className="flex-1 overflow-y-auto pt-0 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full h-full">
            {renderContent()}
          </div>
        </main>

        {/* Floating Action Button for New Mission */}
        {activeTab === Tab.MISSIONS && (
          <div className="fixed bottom-24 right-4 z-40 md:absolute md:bottom-8 md:right-8">
            <button
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-neon-rose to-neon-purple flex items-center justify-center text-white shadow-lg shadow-purple-500/40 hover:scale-110 active:scale-95 transition-all duration-300 animate-[bounce_3s_infinite]"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={32} strokeWidth={3} className="md:w-10 md:h-10" />
            </button>
          </div>
        )}

        {/* Bottom Nav - Mobile Only */}
        <BottomNav currentTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Add Mission Modal */}
      <AddMissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddMission}
      />

      {/* Mission Accomplished Overlay */}
      {successData && (
        <SuccessOverlay xp={successData.xp} coins={successData.coins} />
      )}

      {/* Level Up Overlay */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="text-center p-8 bg-slate-900 border-2 border-neon-gold rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.5)] transform animate-bounce">
            <Star
              size={64}
              className="text-neon-gold mx-auto mb-4 animate-spin-slow fill-current"
            />
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-2">
              LEVEL UP!
            </h2>
            <p className="text-white text-xl font-bold">
              You reached Level {displayStats.level}!
            </p>
          </div>
        </div>
      )}

      {/* Profile Edit Modal / 资料编辑模态框 */}
      <ProfileEdit
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
      />
    </div>
  );
};

export default App;
