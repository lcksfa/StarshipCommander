// 编辑任务弹窗组件 / Edit mission modal component
import React, { useState, useEffect } from "react";
import { Mission } from "../types";
import { X, Save, Loader2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useUpdateMission } from "../hooks/useMissionActions";
import { toast } from "sonner";

interface EditMissionModalProps {
  isOpen: boolean;
  mission: Mission | null;
  onClose: () => void;
  onUpdated: () => void;
}

const EditMissionModal: React.FC<EditMissionModalProps> = ({
  isOpen,
  mission,
  onClose,
  onUpdated,
}) => {
  const { t } = useLanguage();
  const { updateMission, isLoading } = useUpdateMission();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // 当 mission 变化时更新表单
  useEffect(() => {
    if (mission) {
      setTitle(mission.title);
      setDescription(mission.description);
    }
  }, [mission]);

  const handleSave = async () => {
    if (!mission) return;

    if (!title.trim() || !description.trim()) {
      toast.error("请填写完整信息 / Please fill all fields");
      return;
    }

    try {
      await updateMission(mission.id, {
        title: title.trim(),
        description: description.trim(),
      });

      onUpdated();
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
      <div className="relative w-full max-w-md bg-slate-900/95 border-2 border-neon-cyan/50 shadow-[0_0_50px_rgba(34,211,238,0.3)] rounded-[2rem] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-black text-white">编辑任务 / Edit Mission</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-neon-cyan text-xs font-bold uppercase tracking-widest mb-2">
              任务标题 / Mission Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all disabled:opacity-50"
              placeholder="输入任务标题..."
              maxLength={50}
            />
            <p className="text-white/30 text-xs mt-1">{title.length}/50</p>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-neon-cyan text-xs font-bold uppercase tracking-widest mb-2">
              任务描述 / Mission Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all resize-none disabled:opacity-50"
              placeholder="输入任务描述..."
              maxLength={200}
            />
            <p className="text-white/30 text-xs mt-1">{description.length}/200</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            取消 / Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !title.trim() || !description.trim()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-cyan to-blue-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>保存 / Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMissionModal;
