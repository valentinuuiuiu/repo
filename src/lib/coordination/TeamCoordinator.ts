import { AgentManager } from '../ai/AgentManager';
import { DepartmentNotifications } from '../notifications';
import { AgentAnalytics } from '../analytics/agent-analytics';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'offline';
  currentTask?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  created: Date;
  deadline?: Date;
}

export class TeamCoordinator {
  private members: Map<string, TeamMember>;
  private tasks: Map<string, Task>;
  private agentManager: AgentManager;
  private analytics: AgentAnalytics;
  private notifications: DepartmentNotifications;

  constructor(
    private departmentId: string,
    private teamId: string
  ) {
    this.members = new Map();
    this.tasks = new Map();
    this.agentManager = new AgentManager();
    this.analytics = new AgentAnalytics();
    this.notifications = new DepartmentNotifications(departmentId, 'TEAM');
  }

  // Member Management
  async addMember(member: Omit<TeamMember, 'status'>) {
    const newMember = { ...member, status: 'available' as const };
    this.members.set(member.id, newMember);
    await this.notifications.notify({
      type: 'MEMBER_JOINED',
      departmentId: this.departmentId,
      message: `${member.name} joined the team`,
      metadata: { memberId: member.id, teamId: this.teamId }
    });
    return newMember;
  }

  async updateMemberStatus(memberId: string, status: TeamMember['status']) {
    const member = this.members.get(memberId);
    if (!member) throw new Error('Member not found');
    
    member.status = status;
    this.members.set(memberId, member);
    
    await this.notifications.notify({
      type: 'MEMBER_STATUS_CHANGE',
      departmentId: this.departmentId,
      message: `${member.name} is now ${status}`,
      metadata: { memberId, teamId: this.teamId, status }
    });
  }

  // Task Management
  async createTask(task: Omit<Task, 'id' | 'status' | 'created'>) {
    const taskId = crypto.randomUUID();
    const newTask: Task = {
      ...task,
      id: taskId,
      status: 'pending',
      created: new Date()
    };
    
    this.tasks.set(taskId, newTask);
    
    if (task.assignedTo) {
      await this.assignTask(taskId, task.assignedTo);
    }
    
    return newTask;
  }

  async assignTask(taskId: string, memberId: string) {
    const task = this.tasks.get(taskId);
    const member = this.members.get(memberId);
    
    if (!task) throw new Error('Task not found');
    if (!member) throw new Error('Member not found');
    
    task.assignedTo = memberId;
    member.currentTask = taskId;
    
    this.tasks.set(taskId, task);
    this.members.set(memberId, member);
    
    await this.notifications.notify({
      type: 'TASK_ASSIGNED',
      departmentId: this.departmentId,
      message: `Task "${task.title}" assigned to ${member.name}`,
      metadata: { taskId, memberId, teamId: this.teamId }
    });
  }

  // Updated updateTaskStatus to accept an optional memberId for consistency
  async updateTaskStatus(taskId: string, status: Task['status'], memberId?: string) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    
    task.status = status;
    this.tasks.set(taskId, task);
    
    if (status === 'completed' && task.assignedTo) {
      const member = this.members.get(task.assignedTo);
      if (member) {
        member.currentTask = undefined;
        this.members.set(member.id, member);
      }
    }
    
    await this.notifications.notify({
      type: 'TASK_STATUS_UPDATE',
      departmentId: this.departmentId,
      message: `Task "${task.title}" is now ${status}`,
      metadata: { taskId, teamId: this.teamId, status }
    });
  }

  // Analytics
  async getTeamMetrics() {
    const tasks = Array.from(this.tasks.values());
    const members = Array.from(this.members.values());
    
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    
    return {
      taskCompletionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
      activeMembers: members.filter(m => m.status === 'available').length,
      totalMembers: members.length,
      averageTasksPerMember: members.length ? totalTasks / members.length : 0
    };
  }

  // Member Queries
  getAvailableMembers() {
    return Array.from(this.members.values())
      .filter(m => m.status === 'available');
  }

  getMemberTasks(memberId: string) {
    return Array.from(this.tasks.values())
      .filter(t => t.assignedTo === memberId);
  }

  // Task Queries
  getPendingTasks() {
    return Array.from(this.tasks.values())
      .filter(t => t.status === 'pending');
  }

  getTasksByPriority(priority: Task['priority']) {
    return Array.from(this.tasks.values())
      .filter(t => t.priority === priority);
  }
}