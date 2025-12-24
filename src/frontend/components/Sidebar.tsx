import React from "react";
import { Tab, UserStats, getRankInChinese } from "../types";
import { Rocket, Wrench, UserCircle2, Moon, ClipboardList } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  stats: UserStats;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  stats,
}) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const navItems = [
    { id: Tab.MISSIONS, icon: Rocket, label: t.nav_missions },
    { id: Tab.LOG, icon: ClipboardList, label: t.nav_log },
    { id: Tab.HANGAR, icon: Wrench, label: t.nav_hangar },
    { id: Tab.PROFILE, icon: UserCircle2, label: t.nav_profile },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-slate-900/80 backdrop-blur-2xl border-r border-white/10 z-50 p-6">
      {/* Logo Area */}
      <div className="mb-10 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Rocket className="text-white transform -rotate-45" size={28} />
        </div>
        <h1 className="text-white font-black text-2xl tracking-wider">
          星际<span className="text-neon-cyan ml-1">指挥官</span>
        </h1>
      </div>

      {/* User Profile Summary */}
      <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          {/* Cute Child Avatar SVG with Sci-Fi Tech Style */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan/20 to-blue-600/20 border-2 border-neon-cyan flex items-center justify-center overflow-hidden shadow-lg shadow-cyan-500/20 relative">
            {/* Animated glow ring */}
            <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/30 animate-ping" />
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full relative z-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Gradient for visor */}
                <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
                </linearGradient>
                {/* Glow filter */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Background tech circle */}
              <circle cx="50" cy="50" r="48" fill="none" stroke="#22D3EE" strokeWidth="1" opacity="0.3" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#22D3EE" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />

              {/* Tech helmet base */}
              <ellipse cx="50" cy="45" rx="40" ry="35" fill="#1E293B" opacity="0.9" />
              <ellipse cx="50" cy="43" rx="35" ry="30" fill="#334155" />

              {/* Circuit lines on helmet */}
              <path d="M20 35 L15 25" stroke="#22D3EE" strokeWidth="1.5" opacity="0.8" filter="url(#glow)" />
              <path d="M80 35 L85 25" stroke="#22D3EE" strokeWidth="1.5" opacity="0.8" filter="url(#glow)" />
              <path d="M25 45 L18 42" stroke="#22D3EE" strokeWidth="1" opacity="0.6" />
              <path d="M75 45 L82 42" stroke="#22D3EE" strokeWidth="1" opacity="0.6" />

              {/* Small tech dots */}
              <circle cx="18" cy="30" r="2" fill="#22D3EE" filter="url(#glow)" />
              <circle cx="82" cy="30" r="2" fill="#22D3EE" filter="url(#glow)" />

              {/* Face */}
              <ellipse cx="50" cy="55" rx="25" ry="22" fill="#FCD5B5" />

              {/* Sci-Fi visor/goggles */}
              <path d="M22 48 Q50 42 78 48 Q78 56 50 58 Q22 56 22 48" fill="url(#visorGrad)" stroke="#22D3EE" strokeWidth="1.5" filter="url(#glow)" />
              {/* Visor reflection */}
              <path d="M28 48 Q35 46 42 48" stroke="white" strokeWidth="2" opacity="0.4" fill="none" strokeLinecap="round" />

              {/* Eyes behind visor (glowing) */}
              <circle cx="38" cy="52" r="4" fill="#1A202C" />
              <circle cx="38" cy="52" r="2" fill="#22D3EE" opacity="0.8" filter="url(#glow)" />
              <circle cx="62" cy="52" r="4" fill="#1A202C" />
              <circle cx="62" cy="52" r="2" fill="#22D3EE" opacity="0.8" filter="url(#glow)" />

              {/* Cheeks */}
              <circle cx="32" cy="62" r="5" fill="#FEB2B2" opacity="0.5" />
              <circle cx="68" cy="62" r="5" fill="#FEB2B2" opacity="0.5" />

              {/* Smile */}
              <path d="M40 70 Q50 78 60 70" stroke="#1A202C" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Enhanced dual antenna system */}
              <line x1="40" y1="10" x2="40" y2="20" stroke="#22D3EE" strokeWidth="2.5" filter="url(#glow)" />
              <circle cx="40" cy="8" r="3" fill="#22D3EE" filter="url(#glow)" />
              <line x1="60" y1="10" x2="60" y2="20" stroke="#22D3EE" strokeWidth="2.5" filter="url(#glow)" />
              <circle cx="60" cy="8" r="3" fill="#22D3EE" filter="url(#glow)" />
              {/* Central antenna */}
              <line x1="50" y1="5" x2="50" y2="15" stroke="#F472B6" strokeWidth="2" filter="url(#glow)" />
              <circle cx="50" cy="3" r="3.5" fill="#F472B6" filter="url(#glow)" />

              {/* Energy arc between antennas */}
              <path d="M43 10 Q50 7 57 10" stroke="#22D3EE" strokeWidth="1" fill="none" opacity="0.6" filter="url(#glow)" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm">
              {t.rank_captain} {user?.displayName || user?.username || t.user_anonymous}
            </div>
            <div className="text-neon-cyan text-xs font-bold uppercase">
              {getRankInChinese(stats.rank)}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                        w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                        ${
                          isActive
                            ? "bg-gradient-to-r from-neon-cyan/20 to-transparent border-l-4 border-neon-cyan text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }
                    `}
            >
              <Icon
                size={24}
                className={`transition-colors ${isActive ? "text-neon-cyan" : "group-hover:text-neon-cyan"}`}
              />
              <span className="font-bold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Area: Sleep Mode Only */}
      <div className="mt-auto flex items-center justify-start pt-4 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-3 text-slate-500 hover:text-rose-400 transition-colors px-2 py-2 group"
          title="登出"
        >
          <Moon size={20} className="group-hover:animate-pulse" />
          <span className="font-bold text-sm">{t.nav_abort}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
