// Login Form Component / 登录表单组件
// User login form with validation
// 带验证的用户登录表单

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

/**
 * LoginForm Component
 * 登录表单组件
 *
 * Provides a form for users to login with email and password
 * 提供表单让用户使用邮箱和密码登录
 *
 * @example
 * <LoginForm onSuccess={() => navigate("/dashboard")} onSwitchToRegister={() => setView('register')} />
 */
interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { t } = useLanguage();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Validate form inputs
   * 验证表单输入
   */
  const validateForm = (): boolean => {
    // Clear previous errors / 清除之前的错误
    setLocalError(null);
    clearError();

    // Validate email / 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setLocalError(t.auth_error_email_required || "Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setLocalError(t.auth_error_email_invalid || "Invalid email format");
      return false;
    }

    // Validate password / 验证密码
    if (!password.trim()) {
      setLocalError(t.auth_error_password_required || "Password is required");
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(email.trim(), password);

      // Call success callback if provided / 如果提供成功回调则调用
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error is already set by AuthContext
      // 错误已由 AuthContext 设置
      // eslint-disable-next-line no-console
      console.error("Login failed:", err);
    }
  };

  /**
   * Handle input changes
   * 处理输入变化
   */
  const handleInputChange =
    (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      // Clear errors when user types / 当用户输入时清除错误
      if (localError || error) {
        setLocalError(null);
        clearError();
      }
    };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* Scrollable Content Container / 可滚动内容容器 */}
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600">
        {/* Header / 头部 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {t.auth_login_title || "Welcome Back"}
          </h2>
          <p className="text-gray-300">
            {t.auth_login_subtitle || "Sign in to continue your journey"}
          </p>
        </div>

        {/* Error Display / 错误显示 */}
        {(localError || error) && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-200 font-medium">
                {localError || error}
              </p>
            </div>
          </div>
        )}

        {/* Form / 表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input / 邮箱输入 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {t.auth_email_label || "Email Address"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleInputChange(setEmail)}
                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder={t.auth_email_placeholder || "you@example.com"}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input / 密码输入 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {t.auth_password_label || "Password"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handleInputChange(setPassword)}
                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder={t.auth_password_placeholder || "••••••••"}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Submit Button / 提交按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.auth_logging_in || "Signing in..."}</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>{t.auth_login_button || "Sign In"}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer / 页脚 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {t.auth_no_account || "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors bg-transparent border-none cursor-pointer underline"
            >
              {t.auth_register_link || "Sign up"}
            </button>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
