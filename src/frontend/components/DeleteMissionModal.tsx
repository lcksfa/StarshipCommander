// 删除任务确认弹窗组件 / Delete mission confirmation modal component
import React from "react";
import { Mission } from "../types";
import { AlertTriangle, X, Trash2, Loader2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useDeleteMission } from "../hooks/useMissionActions";

interface DeleteMissionModalProps {
  isOpen: boolean;
  mission: Mission | null;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteMissionModal: React.FC<DeleteMissionModalProps> = ({
  isOpen,
  mission,
  onClose,
  onDeleted,
}) => {
  const { t } = useLanguage();
  const { deleteMission, isLoading } = useDeleteMission();

  const handleDelete = async () => {
    if (!mission) return;

    try {
      await deleteMission(mission.id);
      onDeleted();
      onClose();
    } catch (error) {
      // Error handled in hook
    }
  };

  if (!isOpen || !mission) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-lg transition-opacity duration-300"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-sm bg-slate-900/95 border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] rounded-[2rem] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <h2 className="text-xl font-black text-white">
              确认删除 / Confirm Delete
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            {/* Mission Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center text-3xl flex-shrink-0">
              {mission.emoji}
            </div>

            {/* Mission Info */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                {mission.title}
              </h3>
              <p className="text-sm text-white/60 line-clamp-2">
                {mission.description}
              </p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-300 text-sm font-bold text-center">
              ⚠️ 此操作无法撤销！任务将被永久删除。
              <br />
              <span className="text-red-300/80">This action cannot be undone!</span>
            </p>
          </div>

          {/* Additional Info */}
          {mission.isCompleted && (
            <p className="text-white/40 text-xs mt-3 text-center">
              注意：已完成的任务删除后可能影响统计记录
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-red-500/20 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            取消 / Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>删除中...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>确认删除</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMissionModal;
