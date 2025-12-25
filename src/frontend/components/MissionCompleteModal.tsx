import React from "react";
import { Mission } from "../types";
import { Zap, Coins, Check, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface MissionCompleteModalProps {
  isOpen: boolean;
  mission: Mission | null;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  isOpen,
  mission,
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  const { t } = useLanguage();

  if (!isOpen || !mission) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-lg transition-opacity duration-300"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Panel - Simplified */}
      <div className="relative w-full max-w-sm bg-slate-900/95 border-2 border-neon-green/50 shadow-[0_0_50px_rgba(74,222,128,0.3)] rounded-[2rem] overflow-hidden">
        <div className="p-6">
          {/* Title & Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-green/30 to-emerald-600/30 border-3 border-neon-green flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.5)] mx-auto mb-4">
              <Check size={32} className="text-neon-green" strokeWidth={4} />
            </div>
            <h2 className="text-xl font-black text-white mb-1">
              {mission.title}
            </h2>
            <p className="text-slate-400 text-sm">
              {t.rewards_earned}
            </p>
          </div>

          {/* Rewards Display - Simplified */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* XP Reward */}
            <div className="bg-gradient-to-br from-neon-purple/20 to-purple-900/20 rounded-2xl p-4 border border-neon-purple/30 text-center">
              <Zap className="text-neon-purple mx-auto mb-2" size={24} fill="currentColor" />
              <div className="text-3xl font-black text-white mb-1">
                +{mission.xpReward}
              </div>
              <div className="text-neon-purple text-xs font-bold">
                {t.level_up}
              </div>
            </div>

            {/* Coins Reward */}
            <div className="bg-gradient-to-br from-neon-gold/20 to-yellow-900/20 rounded-2xl p-4 border border-neon-gold/30 text-center">
              <Coins className="text-neon-gold mx-auto mb-2" size={24} fill="currentColor" />
              <div className="text-3xl font-black text-white mb-1">
                +{mission.coinReward}
              </div>
              <div className="text-neon-gold text-xs font-bold">
                {t.coins}
              </div>
            </div>
          </div>

          {/* Streak Bonus for Daily Missions - Simplified */}
          {mission.isDaily && mission.streak > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 mb-6 text-center">
              <div className="text-neon-orange text-sm font-bold">
                🔥 {mission.streak} {t.streak_days}
              </div>
            </div>
          )}

          {/* Confirm Button Only */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-wider shadow-lg transition-all transform active:scale-95 ${
              isLoading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-neon-green to-emerald-600 hover:shadow-[0_0_20px_rgba(74,222,128,0.5)]"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                {t.claiming_rewards}
              </span>
            ) : (
              t.claim_rewards
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionCompleteModal;
