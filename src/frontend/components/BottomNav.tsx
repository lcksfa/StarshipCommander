import React from "react";
import { Tab } from "../types";
import { Rocket, Wrench, UserCircle2, ClipboardList } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { t } = useLanguage();

  const navItems = [
    { id: Tab.MISSIONS, icon: Rocket, label: t.nav_missions },
    { id: Tab.LOG, icon: ClipboardList, label: t.nav_log },
    { id: Tab.HANGAR, icon: Wrench, label: t.nav_hangar },
    { id: Tab.PROFILE, icon: UserCircle2, label: t.nav_profile },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 z-30 pointer-events-none md:hidden">
      <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] flex justify-between items-center max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex-1 relative group"
            >
              <div
                className={`
                flex flex-col items-center justify-center py-3 rounded-[1.5rem] transition-all duration-300
                ${isActive ? "-translate-y-4" : "hover:bg-white/5"}
              `}
              >
                {/* Glowing Background for Active */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/20 to-transparent rounded-[1.5rem] blur-xl" />
                )}

                <div
                  className={`
                  relative z-10 p-3 rounded-full mb-1 transition-all duration-300
                  ${
                    isActive
                      ? "bg-gradient-to-br from-neon-cyan to-blue-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.6)] scale-110 ring-4 ring-slate-950"
                      : "text-slate-400 group-hover:text-white"
                  }
                `}
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    fill={isActive ? "currentColor" : "none"}
                  />
                </div>

                <span
                  className={`
                    text-[10px] font-black uppercase tracking-wider transition-all duration-300
                    ${
                      isActive
                        ? "text-neon-cyan translate-y-2 opacity-100"
                        : "text-slate-500 group-hover:text-slate-300"
                    }
                `}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
