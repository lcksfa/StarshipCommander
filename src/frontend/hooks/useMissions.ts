// 任务管理自定义 Hook
// Mission Management Custom Hooks

import { useState, useEffect } from "react";
import { apiClient } from "../lib/trpc";
import { Mission, UserStats, LogEntry, MissionCategory } from "../types";

/**
 * 获取所有任务的自定义 Hook
 */
export function useAllMissions(filters?: {
  category?: "study" | "health" | "chore" | "creative";
  isDaily?: boolean;
  isActive?: boolean;
}) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getAllMissions(filters);
      setMissions(response.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch missions";
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Error fetching missions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, [JSON.stringify(filters)]);

  return { missions, isLoading, error, refetch: fetchMissions };
}

/**
 * 获取用户统计的自定义 Hook
 */
export function useUserStats(userId: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.getUserStats({ userId });
        if (!cancelled) {
          setStats(response.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch user stats";
          setError(errorMessage);
          // eslint-disable-next-line no-console
          console.error("Error fetching user stats:", err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { stats, isLoading, error };
}

/**
 * 完成任务的自定义 Hook
 */
export function useCompleteMission() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeMission = async (missionId: string, userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.completeMission({
        missionId,
        userId,
      });

      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to complete mission";
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Error completing mission:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { completeMission, isLoading, error };
}

/**
 * 获取用户历史记录的自定义 Hook
 */
export function useHistory(
  userId: string,
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    category?: MissionCategory;
    limit?: number;
    offset?: number;
  },
) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getUserHistory({
        userId,
        dateFrom: filters?.dateFrom?.toISOString(),
        dateTo: filters?.dateTo?.toISOString(),
        category: filters?.category,
        limit: filters?.limit,
        offset: filters?.offset,
      });
      setLogs(response.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch history";
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Error fetching history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId, JSON.stringify(filters)]);

  return { logs, isLoading, error, refetch: fetchHistory };
}
