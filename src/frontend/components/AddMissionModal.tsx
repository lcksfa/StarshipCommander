import React, { useState } from "react";
import { MissionCategory } from "../types";
import {
  Brain,
  Dumbbell,
  Home,
  Palette,
  X,
  Rocket,
  Zap,
  Coins,
  Repeat,
  Target,
  Flame,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface AddMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (mission: {
    title: string;
    category: MissionCategory;
    difficulty: "easy" | "medium" | "hard";
    xp: number;
    coins: number;
    emoji: string;
    isDaily: boolean;
  }) => void;
}

// 难度配置：与后端 mission-rules.ts 保持一致
// Difficulty configuration: matches backend mission-rules.ts
const DIFFICULTIES = [
  {
    id: "easy",
    label: "Cadet",
    coinReward: 1,   // EASY: 1 coin
    xpReward: 5,     // EASY: 5 XP
    color: "bg-green-500",
  },
  {
    id: "medium",
    label: "Lieutenant",
    coinReward: 2,   // MEDIUM: 2 coins
    xpReward: 10,    // MEDIUM: 10 XP
    color: "bg-blue-500",
  },
  {
    id: "hard",
    label: "Captain",
    coinReward: 5,   // HARD: 5 coins
    xpReward: 20,    // HARD: 20 XP
    color: "bg-orange-500",
  },
] as const;

const AddMissionModal: React.FC<AddMissionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<MissionCategory>("study");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("easy");
  const [isDaily, setIsDaily] = useState(false);

  const CATEGORIES: {
    id: MissionCategory;
    label: string;
    icon: React.ElementType;
    emoji: string;
  }[] = [
    { id: "study", label: t.label_brain, icon: Brain, emoji: "🧠" },
    { id: "health", label: t.label_body, icon: Dumbbell, emoji: "💪" },
    { id: "chore", label: t.label_base, icon: Home, emoji: "🏠" },
    { id: "creative", label: t.label_creative, icon: Palette, emoji: "🎨" },
  ];

  if (!isOpen) return null;

  const currentDifficulty =
    DIFFICULTIES.find((d) => d.id === selectedDifficulty) || DIFFICULTIES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const categoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

    onAdd({
      title,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      xp: currentDifficulty.xpReward,
      coins: currentDifficulty.coinReward,
      emoji: categoryObj?.emoji || "🚀",
      isDaily,
    });

    // Reset form
    setTitle("");
    setSelectedCategory("study");
    setSelectedDifficulty("easy");
    setIsDaily(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-lg transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-lg bg-slate-900/90 border-2 border-neon-cyan/50 shadow-[0_0_50px_rgba(34,211,238,0.2)] rounded-[2rem] overflow-hidden animate-[pulse-glow_4s_infinite]">
        {/* Holographic Header Line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>

        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Rocket className="text-neon-cyan" />
              {t.new_mission_orders}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Mission Name */}
            <div className="space-y-2">
              <label className="text-neon-cyan text-xs font-bold uppercase tracking-wider ml-1">
                {t.mission_objective}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.placeholder_name}
                className="w-full bg-black/30 border-2 border-white/10 rounded-2xl px-4 py-4 text-xl font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-cyan/60 focus:bg-black/50 transition-all"
                autoFocus
              />
            </div>

            {/* 2. Mission Type Picker */}
            <div className="space-y-2">
              <label className="text-neon-cyan text-xs font-bold uppercase tracking-wider ml-1">
                {t.mission_type}
              </label>
              <div className="grid grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`
                                        flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200
                                        ${
                                          isSelected
                                            ? "bg-neon-cyan/20 border-neon-cyan text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-105"
                                            : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200"
                                        }
                                    `}
                    >
                      <Icon
                        size={24}
                        className="mb-1"
                        strokeWidth={isSelected ? 3 : 2}
                      />
                      <span className="text-[10px] font-bold uppercase">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. MISSION FREQUENCY (NEW) */}
            <div className="space-y-2">
              <label className="text-neon-cyan text-xs font-bold uppercase tracking-wider ml-1">
                {t.mission_frequency}
              </label>
              <div
                className={`
                        flex p-1.5 rounded-2xl border-2 relative transition-all duration-500
                        ${
                          isDaily
                            ? "bg-orange-950/40 border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.15)]"
                            : "bg-black/40 border-white/10"
                        }
                    `}
              >
                {/* Option A: Single */}
                <button
                  type="button"
                  onClick={() => setIsDaily(false)}
                  className={`
                                flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase transition-all duration-300
                                ${
                                  !isDaily
                                    ? "bg-slate-700 text-white shadow-lg scale-100 ring-1 ring-white/20"
                                    : "text-slate-500 hover:text-slate-300 scale-95"
                                }
                            `}
                >
                  <Target size={16} /> {t.single_operation}
                </button>

                {/* Option B: Daily */}
                <button
                  type="button"
                  onClick={() => setIsDaily(true)}
                  className={`
                                flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase transition-all duration-300
                                ${
                                  isDaily
                                    ? "bg-neon-orange text-slate-900 shadow-[0_0_15px_rgba(251,146,60,0.4)] scale-100 ring-1 ring-white/20"
                                    : "text-slate-500 hover:text-slate-300 scale-95"
                                }
                            `}
                >
                  <Repeat size={16} strokeWidth={2.5} /> {t.daily_protocol}
                </button>
              </div>

              {/* Streak Badge Indicator */}
              <div
                className={`
                        flex justify-end overflow-hidden transition-all duration-500 ease-out
                        ${isDaily ? "max-h-8 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"}
                    `}
              >
                <div className="flex items-center gap-1.5 text-neon-orange text-[10px] font-black uppercase bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20 mt-1">
                  <Flame
                    size={12}
                    fill="currentColor"
                    className="animate-pulse"
                  />{" "}
                  {t.streak_enabled}
                </div>
              </div>
            </div>

            {/* 4. Difficulty / Rewards */}
            <div className="space-y-2">
              <label className="text-neon-cyan text-xs font-bold uppercase tracking-wider ml-1">
                {t.difficulty_rewards}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map((diff) => {
                  const isSelected = selectedDifficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff.id)}
                      className={`
                                        relative overflow-hidden rounded-2xl border-2 p-3 transition-all duration-200 text-left
                                        ${
                                          isSelected
                                            ? `border-white/50 bg-gradient-to-br from-white/10 to-transparent shadow-lg scale-105 ring-1 ring-white/50`
                                            : "border-white/5 bg-black/20 text-slate-500 hover:bg-white/5"
                                        }
                                    `}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${diff.color} mb-2 shadow-[0_0_8px_currentColor]`}
                      ></div>
                      <div
                        className={`text-xs font-black uppercase mb-1 ${isSelected ? "text-white" : "text-slate-400"}`}
                      >
                        {diff.label}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div
                          className={`text-[10px] font-bold flex items-center gap-1 ${isSelected ? "text-neon-gold" : "text-slate-600"}`}
                        >
                          <Coins size={10} /> {diff.coinReward}
                        </div>
                        <div
                          className={`text-[10px] font-bold flex items-center gap-1 ${isSelected ? "text-neon-purple" : "text-slate-600"}`}
                        >
                          <Zap size={10} /> {diff.xpReward}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className={`
                            flex-[2] py-4 rounded-2xl font-black text-white uppercase tracking-wider shadow-lg transition-all transform active:scale-95
                            ${
                              title.trim()
                                ? "bg-gradient-to-r from-neon-purple to-neon-cyan hover:shadow-[0_0_20px_rgba(192,132,252,0.5)]"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            }
                        `}
              >
                {isDaily ? t.initiate_routine : t.deploy_mission}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMissionModal;
