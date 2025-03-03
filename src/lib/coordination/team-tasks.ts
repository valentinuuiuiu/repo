import { AgentManager } from '../ai/AgentManager';
import { BaseAgent } from '../ai/core/BaseAgent';
import type { Task } from '../ai/types';

export interface TaskPriority {
  level: 'low' | 'medium' | 'high';
  score: number;
  autoAssign: boolean;
}

export interface TeamTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignee?: string;
  dependencies?: string[];
  created: Date;
  deadline?: Date;
  tags: string[];
  metadata: Record<string, any>;
}

export class TeamTaskManager {
  private tasks: Map<string, TeamTask>;
  private agentManager: AgentManager;

  constructor() {
    this.tasks = new Map();
    this.agentManager = new AgentManager();
  }

  async createTask(task: Omit<TeamTask, 'id' | 'status' | 'created'>) {
    const taskId = crypto.randomUUID();
    const newTask: TeamTask = {
      ...task,
      id: taskId,
      status: 'pending',
      created: new Date()
    };

    this.tasks.set(taskId, newTask);

    if (task.priority.autoAssign) {
      await this.autoAssignTask(taskId);
    }

    return newTask;
  }

  private async autoAssignTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Use AI agent to find best assignee based on skills and workload
    const agent = this.agentManager.getAgent('task-coordinator');
    if (agent) {
      const assignee = await agent.findBestAssignee(task);
      if (assignee) {
        await this.assignTask(taskId, assignee);
      }
    }
  }

  async assignTask(taskId: string, assigneeId: string) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    task.assignee = assigneeId;
    task.status = 'in-progress';
    this.tasks.set(taskId, task);

    return task;
  }

  async updateTaskStatus(taskId: string, status: TeamTask['status']) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    task.status = status;
    this.tasks.set(taskId, task);

    if (status === 'completed') {
      await this.handleTaskCompletion(task);
    }

    return task;
  }

  private async handleTaskCompletion(task: TeamTask) {
    // Check and update dependent tasks
    for (const [id, otherTask] of this.tasks.entries()) {
      if (otherTask.dependencies?.includes(task.id)) {
        const allDependenciesMet = otherTask.dependencies.every(depId => {
          const depTask = this.tasks.get(depId);
          return depTask?.status === 'completed';
        });

        if (allDependenciesMet && otherTask.status === 'blocked') {
          await this.updateTaskStatus(id, 'pending');
          if (otherTask.priority.autoAssign) {
            await this.autoAssignTask(id);
          }
        }
      }
    }
  }

  getTasksByAssignee(assigneeId: string) {
    return Array.from(this.tasks.values())
      .filter(task => task.assignee === assigneeId);
  }

  getTasksByStatus(status: TeamTask['status']) {
    return Array.from(this.tasks.values())
      .filter(task => task.status === status);
  }

  getTasksByPriority(level: TaskPriority['level']) {
    return Array.from(this.tasks.values())
      .filter(task => task.priority.level === level);
  }

  getBlockedTasks() {
    return Array.from(this.tasks.values())
      .filter(task => task.status === 'blocked');
  }

  async analyzeTeamWorkload() {
    const tasks = Array.from(this.tasks.values());
    const assignees = new Set(tasks.map(t => t.assignee).filter(Boolean));

    return Array.from(assignees).map(assigneeId => ({
      assigneeId,
      totalTasks: tasks.filter(t => t.assignee === assigneeId).length,
      completedTasks: tasks.filter(t => t.assignee === assigneeId && t.status === 'completed').length,
      highPriorityTasks: tasks.filter(t => t.assignee === assigneeId && t.priority.level === 'high').length
    }));
  }
}

interface TeamMember {
  id: string;
  name: string;
  availability: number;
  expertise: string[];
  currentLoad: number;
}

export class TeamCoordinator {
  private members: Map<string, TeamMember> = new Map();
  private tasks: Map<string, Task> = new Map();

  async assignTask(taskId: string, task: Task): Promise<string | null> {
    const bestAssignee = await this.findBestAssignee(task);
    if (!bestAssignee) return null;
    
    this.tasks.set(taskId, {
      ...task,
      assignedTo: bestAssignee.id
    });
    
    return bestAssignee.id;
  }

  private async findBestAssignee(task: Task): Promise<TeamMember | null> {
    const availableMembers = Array.from(this.members.values())
      .filter(member => member.availability > 0);

    if (availableMembers.length === 0) return null;

    // Score each member based on expertise match and current load
    const scoredMembers = availableMembers.map(member => ({
      member,
      score: this.calculateAssignmentScore(member, task)
    }));

    // Sort by score descending
    scoredMembers.sort((a, b) => b.score - a.score);

    return scoredMembers[0]?.member || null;
  }

  private calculateAssignmentScore(member: TeamMember, task: Task): number {
    const expertiseScore = task.requiredExpertise?.some(exp => 
      member.expertise.includes(exp)) ? 1 : 0;
    
    const loadScore = 1 - (member.currentLoad / 100);
    
    return (expertiseScore * 0.7) + (loadScore * 0.3);
  }
}