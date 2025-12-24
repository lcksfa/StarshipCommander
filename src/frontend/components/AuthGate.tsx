// Authentication Gate Component / 认证门面组件
// Handles conditional rendering based on authentication status
// 根据认证状态处理条件渲染

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LoginForm } from "./auth/LoginForm";
import { RegisterForm } from "./auth/RegisterForm";
import { Rocket, Loader2 } from "lucide-react";

/**
 * AuthGate Component
 * 认证门面组件
 *
 * Checks authentication status and conditionally renders:
 * - Login/Register forms if not authenticated
 * - Main application if authenticated
 *
 * 检查认证状态并条件渲染：
 * - 未认证时显示登录/注册表单
 * - 已认证时显示主应用
 *
 * @example
 * <AuthGate>
 *   <App />
 * </AuthGate>
 */
interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);

  // 显示加载状态 / Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-neon-cyan animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">
            正在初始化系统... / Initializing system...
          </p>
        </div>
      </div>
    );
  }

  // 已认证，显示主应用 / Authenticated, show main app
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // 未认证，显示登录/注册页面 / Not authenticated, show login/register page
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black relative overflow-hidden">
      {/* SVG Starship Background / SVG 星舰背景 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Starship Outline / 主星舰轮廓 */}
          <g
            stroke="currentColor"
            strokeWidth="1"
            className="text-neon-cyan"
            fill="none"
          >
            {/* Ship body / 船体 */}
            <path d="M600 100 L750 300 L900 400 L750 500 L750 700 L600 600 L450 700 L450 500 L300 400 L450 300 Z" />
            {/* Cockpit / 驾驶舱 */}
            <circle cx="600" cy="380" r="40" />
            {/* Engine glow / 引擎光效 */}
            <path d="M550 650 L600 750 L650 650 Z" className="text-neon-purple" />
            {/* Wing details / 机翼细节 */}
            <line x1="300" y1="400" x2="450" y2="500" />
            <line x1="900" y1="400" x2="750" y2="500" />
            {/* Center line / 中线 */}
            <line x1="600" y1="100" x2="600" y2="600" strokeDasharray="5,5" opacity="0.5" />
          </g>

          {/* Grid lines / 网格线 */}
          <g className="text-slate-600" strokeWidth="0.5" opacity="0.3">
            <line x1="0" y1="200" x2="1200" y2="200" />
            <line x1="0" y1="400" x2="1200" y2="400" />
            <line x1="0" y1="600" x2="1200" y2="600" />
            <line x1="300" y1="0" x2="300" y2="800" />
            <line x1="600" y1="0" x2="600" y2="800" />
            <line x1="900" y1="0" x2="900" y2="800" />
          </g>

          {/* Decorative elements / 装饰元素 */}
          <g className="text-neon-purple" opacity="0.2">
            <circle cx="100" cy="100" r="5" fill="currentColor" />
            <circle cx="1100" cy="100" r="5" fill="currentColor" />
            <circle cx="100" cy="700" r="5" fill="currentColor" />
            <circle cx="1100" cy="700" r="5" fill="currentColor" />
          </g>
        </svg>
      </div>

      {/* Content Container / 内容容器 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8 py-12">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {/* Logo and Title / Logo 和标题（左侧） */}
          {/* 小屏幕上隐藏标题区域，避免挤压登录表单 / Hide title section on small screens */}
          <div className="hidden md:block text-center md:text-left md:w-1/2 self-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple mb-6 shadow-[0_0_30px_rgba(34,211,238,0.5)]">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-wider">
              STARSHIP COMMANDER
            </h1>
            <p className="text-neon-cyan font-bold text-sm md:text-base uppercase tracking-widest mb-6">
              Gamified Productivity System / 游戏化生产力系统
            </p>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Embark on an epic journey of productivity and self-improvement.
              <br />
              开启史诗般的生产力与自我提升之旅。
            </p>
          </div>

          {/* Auth Forms Container / 认证表单容器（右侧） */}
          {/* 小屏幕上占满宽度，大屏幕上固定宽度 / Full width on small screens, fixed width on large screens */}
          <div className="w-full max-w-md flex-shrink-0 px-2 sm:px-0">
          {/* Toggle between Login and Register / 登录和注册切换 */}
          <div className="mb-6 flex gap-2 bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setIsLoginView(true)}
              className={`flex-1 py-3 rounded-xl font-bold uppercase transition-all duration-300 ${
                isLoginView
                  ? "bg-neon-cyan text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  : "bg-transparent text-slate-400 hover:text-white"
              }`}
            >
              登录 / Sign In
            </button>
            <button
              onClick={() => setIsLoginView(false)}
              className={`flex-1 py-3 rounded-xl font-bold uppercase transition-all duration-300 ${
                !isLoginView
                  ? "bg-neon-green text-black shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                  : "bg-transparent text-slate-400 hover:text-white"
              }`}
            >
              注册 / Sign Up
            </button>
          </div>

          {/* Form / 表单 */}
          {isLoginView ? (
            <LoginForm
              onSuccess={() => {}}
              onSwitchToRegister={() => setIsLoginView(false)}
            />
          ) : (
            <RegisterForm
              onSuccess={() => {}}
              onSwitchToLogin={() => setIsLoginView(true)}
            />
          )}

          {/* Footer Info / 页脚信息 */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
            <p className="text-slate-600 text-xs mt-1">
              继续使用即表示您同意我们的服务条款和隐私政策
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
