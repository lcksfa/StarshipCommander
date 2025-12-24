// Profile Edit Modal Component / 个人资料编辑模态框组件
// Allows users to edit their profile information
// 允许用户编辑他们的个人资料信息

import React, { useState, useEffect } from "react";
import { X, User, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ProfileEdit Component
 * 个人资料编辑组件
 *
 * Provides a modal dialog for editing user profile information
 * 提供模态对话框用于编辑用户个人资料信息
 *
 * @example
 * <ProfileEdit
 *   isOpen={isEditOpen}
 *   onClose={() => setIsEditOpen(false)}
 * />
 */
export function ProfileEdit({ isOpen, onClose }: ProfileEditProps) {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  // Form state / 表单状态
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when user data changes / 当用户数据变化时更新表单
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  /**
   * Handle form submission
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation / 验证
    const trimmedDisplayName = displayName.trim();
    if (!trimmedDisplayName) {
      toast.error("请输入显示名称");
      return;
    }

    if (trimmedDisplayName.length > 50) {
      toast.error("显示名称不能超过50个字符");
      return;
    }

    try {
      setIsSubmitting(true);

      // Update profile / 更新资料
      await updateProfile({
        displayName: trimmedDisplayName,
        preferredLang: "zh", // 固定为中文 / Fixed to Chinese
      });

      toast.success("资料更新成功！");

      // Close modal / 关闭模态框
      onClose();
    } catch (error) {
      // Error is already handled by AuthContext
      // 错误已由AuthContext处理
      toast.error("更新失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle backdrop click (close modal)
   * 处理背景点击（关闭模态框）
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if not open / 如果未打开则不渲染
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-neon-cyan/30 shadow-[0_0_50px_rgba(34,211,238,0.3)] overflow-hidden">
        {/* Header / 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-neon-cyan" />
            {t.profile_edit_title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form / 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Display Name / 显示名称 */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              {t.auth_display_name_label}
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all"
              placeholder={t.auth_display_name_placeholder}
              maxLength={50}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-slate-500">
              {t.profile_display_name_hint}
            </p>
          </div>

          {/* Action Buttons / 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-white/5 text-slate-300 rounded-xl font-bold hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.profile_saving}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t.profile_save}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Decorative gradient border at bottom / 底部装饰渐变边框 */}
        <div className="h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan" />
      </div>
    </div>
  );
}
