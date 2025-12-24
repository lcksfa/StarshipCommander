import React from "react";
import { Tab, UserStats } from "../types";
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
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth(); // 获取当前用户信息和登出方法 / Get current user info and logout method

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
        <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Rocket className="text-white transform -rotate-45" size={24} />
        </div>
        <h1 className="text-white font-black text-xl leading-tight">
          Starship
          <br />
          <span className="text-neon-cyan">Commander</span>
        </h1>
      </div>

      {/* User Profile Summary */}
      <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-neon-cyan overflow-hidden">
            <img
              src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Captain"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-white font-bold text-sm">
              {t.rank_captain} {user?.displayName || user?.username || t.user_anonymous || "指挥官"}
            </div>
            <div className="text-neon-cyan text-xs font-bold uppercase">
              {stats.rank}
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

      {/* Footer Area: Sleep Mode & Language Toggle */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-3 text-slate-500 hover:text-rose-400 transition-colors px-2 py-2 group"
          title="登出 / Logout"
        >
          <Moon size={20} className="group-hover:animate-pulse" />
          <span className="font-bold text-sm">{t.nav_abort}</span>
        </button>

        <button
          onClick={() => setLanguage(language === "en" ? "zh" : "en")}
          className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-neon-cyan hover:text-black hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-300 group"
          title="Switch Language"
        >
          <span className="text-[10px] font-black uppercase group-hover:scale-110 transition-transform">
            {language === "en" ? "EN" : "中"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
