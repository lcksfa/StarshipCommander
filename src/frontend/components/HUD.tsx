import React from "react";
import { UserStats, getRankInChinese } from "../types";
import { Coins, Zap } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import AnimatedNumber from "./AnimatedNumber";

interface HUDProps {
  stats: UserStats;
  compact?: boolean;
}

const HUD: React.FC<HUDProps> = ({ stats, compact = false }) => {
  const { t } = useLanguage();
  const xpPercentage = Math.min((stats.currentXp / stats.maxXp) * 100, 100);

  // --- COMPACT MODE: Top Bar Style (Anchored) ---
  if (compact) {
    return (
      <div className="w-full sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Left: Level Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-neon-cyan overflow-hidden shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              <img
                src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Captain"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                {t.rank_captain}
              </span>
              <span className="text-white font-black text-lg leading-none">
                LVL {stats.level}
              </span>
            </div>
          </div>

          {/* Right: Coins */}
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-neon-gold/30">
            <Coins className="text-neon-gold" size={16} fill="#facc15" />
            <AnimatedNumber
              value={stats.coins}
              duration={800}
              className="text-neon-gold font-black text-lg leading-none"
            />
          </div>
        </div>

        {/* Subtle XP Progress Line at the very bottom of the bar */}
        <div className="h-[2px] w-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  // --- NORMAL MODE: Dashboard Style ---
  return (
    <div className="w-full px-4 pt-4 pb-2 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700/50 rounded-3xl p-4 md:p-6 shadow-lg">
        {/* Top Row: Avatar, Info & Coins */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar - Mobile Only */}
            <div className="relative md:hidden">
              <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-neon-cyan overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all">
                <img
                  src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Captain"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-neon-cyan text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">
                LVL {stats.level}
              </div>
            </div>

            {/* User Info - Mobile */}
            <div className="md:hidden">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {t.rank_captain}
              </div>
              <div className="text-white font-black text-xl leading-none tracking-wide drop-shadow-md">
                {getRankInChinese(stats.rank)}
              </div>
            </div>

            {/* Desktop Only: Large Title or Status */}
            <div className="hidden md:block">
              <div className="text-neon-cyan text-sm font-bold uppercase tracking-[0.2em] mb-1">
                {t.status_report}
              </div>
              <div className="text-white font-black leading-none drop-shadow-md flex items-center gap-3 text-3xl">
                <span>
                  {t.level} {stats.level}
                </span>
                <span className="text-neon-purple text-xl font-bold">
                  {getRankInChinese(stats.rank)}
                </span>
              </div>
            </div>
          </div>

          {/* Coins Display */}
          <div className="flex items-center gap-2 bg-slate-950/80 rounded-2xl border-2 border-neon-gold/50 shadow-[0_0_10px_rgba(250,204,21,0.2)] px-4 py-2 md:px-6 md:py-3">
            <Coins
              className="text-neon-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              size={24}
              fill="#facc15"
            />
            <AnimatedNumber
              value={stats.coins}
              duration={800}
              className="text-neon-gold font-black tracking-wide leading-none text-2xl md:text-3xl"
            />
          </div>
        </div>

        {/* Bottom Row: Chunky XP Bar */}
        <div className="relative w-full group">
          <div className="flex justify-between text-xs md:text-sm font-bold text-slate-300 mb-1.5 px-1 uppercase tracking-wider">
            <span className="flex items-center gap-1 text-neon-purple drop-shadow-sm">
              <Zap size={14} fill="currentColor" /> {t.power_level}
            </span>
            <span className="text-white/80">
              <AnimatedNumber value={stats.currentXp} duration={800} /> / {stats.maxXp} XP
            </span>
          </div>

          {/* The Bar Container */}
          <div className="w-full bg-slate-950 rounded-full p-1 border border-slate-700 shadow-inner h-6 md:h-8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan shadow-[0_0_15px_rgba(192,132,252,0.6)] transition-all duration-700 ease-out relative overflow-hidden animate-pulse-slow"
              style={{ width: `${xpPercentage}%` }}
            >
              {/* Striped Pattern Animation */}
              <div className="absolute inset-0 bg-stripes animate-stripes opacity-40"></div>

              {/* Glossy Top Highlight */}
              <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/30 rounded-t-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
