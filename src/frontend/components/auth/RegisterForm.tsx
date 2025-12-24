// Register Form Component / 注册表单组件
// User registration form with validation
// 带验证的用户注册表单

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, Check } from "lucide-react";

/**
 * RegisterForm Component
 * 注册表单组件
 *
 * Provides a form for users to register with email, password, and display name
 * 提供表单让用户使用邮箱、密码和显示名称注册
 *
 * @example
 * <RegisterForm onSuccess={() => navigate("/dashboard")} onSwitchToLogin={() => setView('login')} />
 */
interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { t } = useLanguage();
  const { register, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Validate password strength
   * 验证密码强度
   */
  const validatePassword = (pwd: string): { valid: boolean; message?: string } => {
    if (pwd.length < 8) {
      return {
        valid: false,
        message:
          t.auth_error_password_too_short ||
          "Password must be at least 8 characters",
      };
    }
    if (!/[a-zA-Z]/.test(pwd)) {
      return {
        valid: false,
        message:
          t.auth_error_password_need_letter ||
          "Password must contain at least one letter",
      };
    }
    if (!/\d/.test(pwd)) {
      return {
        valid: false,
        message:
          t.auth_error_password_need_number ||
          "Password must contain at least one number",
      };
    }
    return { valid: true };
  };

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
    if (!password) {
      setLocalError(t.auth_error_password_required || "Password is required");
      return false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setLocalError(passwordValidation.message || "Password is too weak");
      return false;
    }

    // Validate confirm password / 验证确认密码
    if (password !== confirmPassword) {
      setLocalError(
        t.auth_error_password_mismatch || "Passwords do not match"
      );
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
      await register({
        email: email.trim(),
        password,
        displayName: displayName.trim() || undefined,
      });

      // Call success callback if provided / 如果提供成功回调则调用
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error is already set by AuthContext
      // 错误已由 AuthContext 设置
      // eslint-disable-next-line no-console
      console.error("Registration failed:", err);
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {t.auth_register_title || "Create Account"}
          </h2>
          <p className="text-gray-300">
            {t.auth_register_subtitle ||
              "Start your gamified productivity journey"}
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display Name Input / 显示名称输入 */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {t.auth_display_name_label || "Display Name"}
              <span className="text-gray-500 ml-1">
                ({t.auth_optional || "optional"})
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={handleInputChange(setDisplayName)}
                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder={
                  t.auth_display_name_placeholder || "Starship Commander"
                }
                disabled={isLoading}
                autoComplete="name"
              />
            </div>
          </div>

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
                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder={t.auth_password_placeholder || "••••••••"}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            {/* Password Requirements / 密码要求 */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Check
                    className={`w-4 h-4 ${
                      password.length >= 8
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`${
                      password.length >= 8 ? "text-green-400" : "text-gray-500"
                    }`}
                  >
                    {t.auth_password_requirement_length ||
                      "At least 8 characters"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Check
                    className={`w-4 h-4 ${
                      /[a-zA-Z]/.test(password)
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`${
                      /[a-zA-Z]/.test(password)
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    {t.auth_password_requirement_letter ||
                      "Contains a letter"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Check
                    className={`w-4 h-4 ${
                      /\d/.test(password) ? "text-green-400" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`${
                      /\d/.test(password) ? "text-green-400" : "text-gray-500"
                    }`}
                  >
                    {t.auth_password_requirement_number ||
                      "Contains a number"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Input / 确认密码输入 */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {t.auth_confirm_password_label || "Confirm Password"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleInputChange(setConfirmPassword)}
                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder={t.auth_confirm_password_placeholder || "••••••••"}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
            {confirmPassword && password === confirmPassword && (
              <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
                <Check className="w-4 h-4" />
                <span>{t.auth_password_match || "Passwords match"}</span>
              </div>
            )}
          </div>

          {/* Submit Button / 提交按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.auth_registering || "Creating account..."}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>{t.auth_register_button || "Create Account"}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer / 页脚 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {t.auth_already_have_account || "Already have an account?"}{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-green-400 hover:text-green-300 transition-colors bg-transparent border-none cursor-pointer underline"
            >
              {t.auth_login_link || "Sign in"}
            </button>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
