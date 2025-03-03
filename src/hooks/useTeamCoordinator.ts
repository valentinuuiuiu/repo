import { useState, useEffect } from 'react';
// Changed import from '@/lib/ai/core/TeamCoordinator' to '@/lib/coordination/TeamCoordinator'
import { TeamCoordinator } from '@/lib/coordination/TeamCoordinator';

export function useTeamCoordinator(departmentId: string, teamId: string) {
  const [coordinator] = useState(() => new TeamCoordinator(departmentId, teamId));
  const [metrics, setMetrics] = useState({
    taskCompletionRate: 0,
    activeMembers: 0,
    totalMembers: 0,
    averageTasksPerMember: 0
  });

  useEffect(() => {
    const updateMetrics = async () => {
      const newMetrics = await coordinator.getTeamMetrics();
      setMetrics(newMetrics);
    };

    // Update metrics initially and every 30 seconds
    updateMetrics();
    const interval = setInterval(updateMetrics, 30000);

    return () => clearInterval(interval);
  }, [coordinator]);

  return {
    coordinator,
    metrics,
    // Helper methods that wrap coordinator functionality
    addMember: coordinator.addMember.bind(coordinator),
    updateMemberStatus: coordinator.updateMemberStatus.bind(coordinator),
    createTask: coordinator.createTask.bind(coordinator),
    assignTask: coordinator.assignTask.bind(coordinator),
    updateTaskStatus: coordinator.updateTaskStatus.bind(coordinator),
    getAvailableMembers: coordinator.getAvailableMembers.bind(coordinator),
    getMemberTasks: coordinator.getMemberTasks.bind(coordinator),
    getPendingTasks: coordinator.getPendingTasks.bind(coordinator),
    getTasksByPriority: coordinator.getTasksByPriority.bind(coordinator)
  };
}