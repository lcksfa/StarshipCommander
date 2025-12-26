// 任务操作自定义 Hooks / Mission operations custom hooks
import { useState } from "react";
import { apiClient } from "../lib/trpc";
import { toast } from "sonner";
import { getErrorMessage } from "../utils/error-utils";

/**
 * 更新任务的自定义 Hook / Custom hook for updating missions
 */
export function useUpdateMission() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMission = async (
    missionId: string,
    data: {
      title?: string;
      description?: string;
      xpReward?: number;
      coinReward?: number;
      category?: "study" | "health" | "chore" | "creative";
      emoji?: string;
      difficulty?: "EASY" | "MEDIUM" | "HARD";
    },
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.updateMission({
        id: missionId,
        ...data,
      });

      toast.success("任务已更新 / Mission Updated", {
        description: "任务信息更新成功",
      });

      return result.data;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error("更新失败 / Update Failed", {
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateMission, isLoading, error };
}

/**
 * 删除任务的自定义 Hook / Custom hook for deleting missions
 */
export function useDeleteMission() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMission = async (missionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.deleteMission({ id: missionId });

      toast.success("任务已删除 / Mission Deleted", {
        description: "任务已成功删除",
      });

      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error("删除失败 / Delete Failed", {
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteMission, isLoading, error };
}
