import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { CheckCircle2, Zap, Coins } from "lucide-react";

interface SuccessOverlayProps {
  xp: number;
  coins: number;
}

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ xp, coins }) => {
  const { t } = useLanguage();
  const [animateRewards, setAnimateRewards] = useState(false);

  useEffect(() => {
    // Slight delay for reward numbers to pop in
    const timer = setTimeout(() => setAnimateRewards(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto" />

      {/* Main Card - Bottom Sheet / Half Screen */}
      <div className="relative w-full max-w-2xl mx-auto mb-0 md:mb-12 rounded-t-[3rem] md:rounded-[3rem] bg-slate-900 border-t-4 md:border-4 border-emerald-500/50 shadow-[0_0_100px_rgba(16,185,129,0.3)] p-8 pb-16 md:pb-8 text-center overflow-hidden transform animate-in slide-in-from-bottom-24 duration-500 ease-out-back">
        {/* Holographic Scanlines Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-40 animate-pulse" />
            <CheckCircle2
              size={96}
              className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-[bounce_1s_infinite]"
              fill="rgba(6, 78, 59, 1)"
            />
          </div>

          {/* Headline */}
          <div>
            <h2 className="text-3xl md:text-5xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-emerald-200 to-emerald-600 drop-shadow-lg mb-2">
              {t.mission_accomplished}
            </h2>
            <div className="h-1 w-24 bg-emerald-500 mx-auto rounded-full shadow-[0_0_10px_#10b981]" />
          </div>

          {/* Rewards Container */}
          <div
            className={`flex items-center gap-6 md:gap-12 transition-all duration-700 transform ${animateRewards ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
          >
            {/* XP Reward */}
            <div className="flex flex-col items-center">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                XP
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-emerald-500/30 px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(192,132,252,0.15)]">
                <Zap
                  size={32}
                  className="text-neon-purple animate-[pulse_2s_infinite]"
                  fill="currentColor"
                />
                <span className="text-3xl font-black text-white">+{xp}</span>
              </div>
            </div>

            {/* Coin Reward */}
            <div className="flex flex-col items-center">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                COINS
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-emerald-500/30 px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.15)]">
                <Coins
                  size={32}
                  className="text-neon-gold animate-[pulse_2s_infinite]"
                  fill="currentColor"
                />
                <span className="text-3xl font-black text-white">+{coins}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessOverlay;
