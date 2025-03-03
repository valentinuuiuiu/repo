import { useState, useEffect } from 'react';
import { TeamTaskManager, TeamTask, TaskPriority } from '@/lib/coordination/team-tasks';

interface WorkloadAnalysis {
  assigneeId: string;
  totalTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
}

export function useTeamTasks() {
  const [taskManager] = useState(() => new TeamTaskManager());
  const [workloadAnalysis, setWorkloadAnalysis] = useState<WorkloadAnalysis[]>([]);

  useEffect(() => {
    const updateWorkloadAnalysis = async () => {
      const analysis = await taskManager.analyzeTeamWorkload();
      // Filter out entries with undefined assigneeId
      const validAnalysis = analysis.filter((entry): entry is WorkloadAnalysis => 
        entry.assigneeId !== undefined
      );
      setWorkloadAnalysis(validAnalysis);
    };

    updateWorkloadAnalysis();
    const interval = setInterval(updateWorkloadAnalysis, 60000);

    return () => clearInterval(interval);
  }, [taskManager]);

  return {
    createTask: (task: Omit<TeamTask, 'id' | 'status' | 'created'>) => 
      taskManager.createTask(task),
    assignTask: (taskId: string, assigneeId: string) => 
      taskManager.assignTask(taskId, assigneeId),
    updateTaskStatus: (taskId: string, status: TeamTask['status']) => 
      taskManager.updateTaskStatus(taskId, status),
    getTasksByAssignee: (assigneeId: string) => 
      taskManager.getTasksByAssignee(assigneeId),
    getTasksByStatus: (status: TeamTask['status']) => 
      taskManager.getTasksByStatus(status),
    getTasksByPriority: (level: TaskPriority['level']) => 
      taskManager.getTasksByPriority(level),
    getBlockedTasks: () => taskManager.getBlockedTasks(),
    workloadAnalysis
  };
}