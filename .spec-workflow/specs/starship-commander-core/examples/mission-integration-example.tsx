/**
 * tRPC API 集成示例
 *
 * 本文件展示如何在前端组件中使用 tRPC API 客户端
 * 与后端服务进行交互
 */

import { useState } from "react";
import { apiClient } from "@lib/trpc";
import { useAllMissions, useCompleteMission } from "@hooks/useMissions";
import type { Mission, MissionCategory } from "@types";

// ============================================================================
// 示例 1: 基础任务列表 - 使用自定义 Hook
// ============================================================================

export function BasicMissionList() {
  const [category, setCategory] = useState<MissionCategory | "all">("all");

  // 使用自定义 Hook 获取任务列表
  const { missions, isLoading, error, refetch } = useAllMissions(
    category !== "all" ? { category } : undefined
  );

  return (
    <div className="mission-list">
      <h2>任务列表</h2>

      {/* 分类筛选器 */}
      <div className="filters">
        <button onClick={() => setCategory("all")}>全部</button>
        <button onClick={() => setCategory("study")}>学习</button>
        <button onClick={() => setCategory("health")}>健康</button>
        <button onClick={() => setCategory("chore")}>家务</button>
        <button onClick={() => setCategory("creative")}>创意</button>
      </div>

      {/* 加载状态 */}
      {isLoading && <div className="loading">加载中...</div>}

      {/* 错误状态 */}
      {error && (
        <div className="error">
          错误: {error}
          <button onClick={() => refetch()}>重试</button>
        </div>
      )}

      {/* 任务列表 */}
      <ul className="missions">
        {missions.map((mission) => (
          <li key={mission.id} className="mission-item">
            <span className="emoji">{mission.emoji}</span>
            <span className="title">{mission.title}</span>
            <span className="difficulty">{mission.difficulty}</span>
            <span className="rewards">
              +{mission.xpReward} XP, +{mission.coinReward} 金币
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// 示例 2: 任务卡片 - 完成任务
// ============================================================================

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const { completeMission, isCompleting } = useCompleteMission();

  const handleComplete = async () => {
    try {
      const result = await completeMission(mission.id);

      // 显示成功消息
      if (result.levelUp) {
        alert(`🎉 恭喜升级！新军衔: ${result.newRank}`);
      } else {
        alert(`✅ 任务完成！获得 ${result.xpEarned} XP 和 ${result.coinsEarned} 金币`);
      }
    } catch (error) {
      alert(`❌ 完成任务失败: ${error}`);
    }
  };

  return (
    <div className={`mission-card ${mission.completed ? "completed" : ""}`}>
      <div className="mission-header">
        <span className="mission-emoji">{mission.emoji}</span>
        <h3 className="mission-title">{mission.title}</h3>
      </div>

      <p className="mission-description">{mission.description}</p>

      <div className="mission-meta">
        <span className="category">{mission.category}</span>
        <span className="difficulty">{mission.difficulty}</span>
      </div>

      <div className="mission-rewards">
        <span className="xp">+{mission.xpReward} XP</span>
        <span className="coins">+{mission.coinReward} 金币</span>
      </div>

      {!mission.completed && (
        <button
          className="complete-button"
          onClick={handleComplete}
          disabled={isCompleting}
        >
          {isCompleting ? "完成中..." : "完成任务"}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// 示例 3: 任务统计仪表板
// ============================================================================

export function MissionStatsDashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");

  // 计算日期范围
  const getDateRange = () => {
    const now = new Date();
    if (timeRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { dateFrom: weekAgo.toISOString(), dateTo: now.toISOString() };
    } else if (timeRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { dateFrom: monthAgo.toISOString(), dateTo: now.toISOString() };
    }
    return {};
  };

  // 使用直接 API 调用（可以展示如何不使用 Hook）
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const filters = getDateRange();
      const data = await apiClient.getMissionStats(filters);
      setStats(data);
    } catch (error) {
      console.error("获取统计失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useState(() => {
    fetchStats();
  });

  return (
    <div className="stats-dashboard">
      <h2>任务统计</h2>

      <div className="time-range-selector">
        <button onClick={() => setTimeRange("week")}>本周</button>
        <button onClick={() => setTimeRange("month")}>本月</button>
        <button onClick={() => setTimeRange("all")}>全部</button>
      </div>

      {loading ? (
        <div>加载中...</div>
      ) : stats ? (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>已完成任务</h3>
            <p className="stat-value">{stats.completed}</p>
          </div>

          <div className="stat-card">
            <h3>总经验值</h3>
            <p className="stat-value">{stats.totalXp} XP</p>
          </div>

          <div className="stat-card">
            <h3>总金币</h3>
            <p className="stat-value">{stats.totalCoins}</p>
          </div>

          <div className="stat-card">
            <h3>按分类统计</h3>
            <ul>
              {Object.entries(stats.byCategory).map(([cat, count]) => (
                <li key={cat}>
                  {cat}: {count as number}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div>暂无数据</div>
      )}

      <button onClick={fetchStats}>刷新</button>
    </div>
  );
}

// ============================================================================
// 示例 4: 高级用法 - 多 API 调用与错误处理
// ============================================================================

export function AdvancedMissionManager() {
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 复杂操作：获取任务详情 + 相关统计
  const handleMissionSelect = async (missionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 并行获取多个数据
      const [mission, stats] = await Promise.all([
        apiClient.getMissionById(missionId),
        apiClient.getMissionStats({ category: selectedMission?.category })
      ]);

      setSelectedMission(mission);
      console.log("任务统计:", stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "未知错误";
      setError(errorMessage);
      console.error("获取任务详情失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 批量操作：完成多个任务
  const handleCompleteMultiple = async (missionIds: string[]) => {
    const results = await Promise.allSettled(
      missionIds.map((id) => apiClient.completeMission(id))
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    alert(`批量完成: ${successful} 成功, ${failed} 失败`);
  };

  return (
    <div className="mission-manager">
      <h2>高级任务管理</h2>

      {error && <div className="error">{error}</div>}

      {isLoading && <div className="loading">加载中...</div>}

      {selectedMission && (
        <div className="mission-details">
          <h3>{selectedMission.title}</h3>
          <p>{selectedMission.description}</p>
          <button onClick={() => handleCompleteMultiple([selectedMission.id])}>
            完成此任务
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 示例 5: 任务搜索与筛选
// ============================================================================

export function MissionSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<MissionCategory | "all">(
    "all"
  );
  const [difficultyFilter, setDifficultyFilter] = useState<
    "easy" | "medium" | "hard" | "all"
  >("all");

  // 使用筛选器
  const filters = {
    ...(categoryFilter !== "all" && { category: categoryFilter }),
    ...(difficultyFilter !== "all" && { difficulty: difficultyFilter })
  };

  const { missions, isLoading } = useAllMissions(
    Object.keys(filters).length > 0 ? filters : undefined
  );

  // 客户端搜索过滤
  const filteredMissions = missions.filter((mission) =>
    mission.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mission-search">
      <h2>搜索任务</h2>

      {/* 搜索框 */}
      <input
        type="text"
        placeholder="搜索任务..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 筛选器 */}
      <div className="filters">
        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as MissionCategory | "all")
          }
        >
          <option value="all">所有分类</option>
          <option value="study">学习</option>
          <option value="health">健康</option>
          <option value="chore">家务</option>
          <option value="creative">创意</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) =>
            setDifficultyFilter(
              e.target.value as "easy" | "medium" | "hard" | "all"
            )
          }
        >
          <option value="all">所有难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>

      {/* 结果 */}
      {isLoading ? (
        <div>搜索中...</div>
      ) : (
        <div className="results">
          <p>找到 {filteredMissions.length} 个任务</p>
          <ul>
            {filteredMissions.map((mission) => (
              <li key={mission.id}>{mission.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
