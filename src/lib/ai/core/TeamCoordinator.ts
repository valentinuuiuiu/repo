import { AgentType } from '@prisma/client';
import { AgentManager } from './AgentManager';
import { DepartmentNotifications } from '../../notifications/department-notifications';
import { AgentAnalytics } from './AgentAnalytics';
import { CircuitBreaker } from './CircuitBreaker';
import type { AgentResponse, Task } from '../types';
import { TaskType } from '../types';
import { $Enums } from '@prisma/client';

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    status: 'available' | 'busy' | 'offline';
    currentTask?: string;
    skills: string[];
    performance?: {
        tasksCompleted: number;
        successRate: number;
        averageTaskTime: number;
    };
}

export interface TeamCapacity {
    availableCapacity: number;
    skillMatch: number;
    currentWorkload: number;
}

export class TeamCoordinator {
    private members: Map<string, TeamMember>;
    private tasks: Map<string, Task>;
    private readonly analytics: AgentAnalytics;
    private readonly notifications: DepartmentNotifications;
    private readonly circuitBreaker: CircuitBreaker;
    protected readonly agentManager: AgentManager = new AgentManager();

    constructor(
        private readonly departmentId: string,
        private readonly teamId: string
    ) {
        this.members = new Map();
        this.tasks = new Map();
        this.analytics = new AgentAnalytics();
        this.notifications = new DepartmentNotifications(departmentId, "HOME");
        this.circuitBreaker = new CircuitBreaker();
    }

    // Member Management
    public async addMember(member: Omit<TeamMember, 'status' | 'performance'>): Promise<TeamMember> {
        const newMember: TeamMember = {
            ...member,
            status: 'available',
            performance: {
                tasksCompleted: 0,
                successRate: 0,
                averageTaskTime: 0
            }
        };

        this.members.set(member.id, newMember);

        try {
            await this.notifications.createAlert({
                type: 'agent',
                priority: 'low',
                title: 'Member Joined',
                message: `${member.name} joined the team`,
                metadata: { memberId: member.id, teamId: this.teamId }
            });
        } catch (error) {
            console.error("Failed to create alert:", error);
        }

        return newMember;
    }

    public async updateMemberStatus(memberId: string, status: TeamMember['status']): Promise<void> {
        const member = this.members.get(memberId);
        if (!member) throw new Error('Member not found');

        member.status = status;
        this.members.set(memberId, member);

        try {
            await this.notifications.createAlert({
                type: 'agent',
                priority: 'low',
                title: 'Member Status Change',
                message: `${member.name} is now ${status}`,
                metadata: { memberId, teamId: this.teamId, status }
            });
        } catch (error) {
            console.error("Failed to create alert:", error);
        }
    }

    // Task Management with AI Assistance
    public async createTask(task: Omit<Task, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Task> {
        const taskId = crypto.randomUUID();
        const newTask: Task = {
            ...task,
            id: taskId,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
        };

        this.tasks.set(taskId, newTask);

        if (task.departments?.length) {
            await this.autoAssignTask(newTask);
        }

        return newTask;
    }

    private async autoAssignTask(task: Task): Promise<void> {
        if (!this.circuitBreaker.canPass()) {
            console.warn('Circuit breaker is open, skipping task assignment.');
            return;
        }

        try {            
            const availableMembers = Array.from(this.members.values())
                .filter(m => m.status === 'available');

            const taskAssignment = await this.agentManager.executeTask({
                ...task,
                type: 'pricing_optimization',
                data: {
                    availableMembers: availableMembers.map(m => ({
                        id: m.id,
                        skills: m.skills,
                        performance: m.performance
                    })),
                    task: {
                        departments: task.departments,
                        priority: task.priority
                    }
                }
            });

            if (taskAssignment.success && typeof taskAssignment.data === 'object' && taskAssignment.data && 'memberId' in taskAssignment.data) {
                await this.assignTask(task.id, taskAssignment.data.memberId as string);
            }

            this.circuitBreaker.recordSuccess();
        } catch (error) {
            console.error('Auto-assignment failed:', error);
            this.circuitBreaker.recordFailure();
            throw error;
        }
    }

    public async assignTask(taskId: string, memberId: string): Promise<void> {
        const task = this.tasks.get(taskId);
        const member = this.members.get(memberId);

        if (!task) throw new Error('Task not found');
        if (!member) throw new Error('Member not found');

        const prevStatus = task.status;
        task.status = 'in_progress';
        member.status = 'busy';
        member.currentTask = taskId;

        this.tasks.set(taskId, task);
        this.members.set(memberId, member);

        // Removed analytics.trackEvent call
        // Removed notifications.broadcast call

        return;
    }

    public async updateTaskStatus(taskId: string, newStatus: Task['status'], memberId: string): Promise<void> {
        const task = this.tasks.get(taskId);
        if (!task) throw new Error('Task not found');
        const member = this.members.get(memberId);
        if (!member) throw new Error('Member not found');

        const oldStatus = task.status;
        task.status = newStatus;
        task.updated_at = new Date();

        if (newStatus === 'completed' && task.departments?.length) {
            await this.handleTaskCompletion(task);
        }

        this.tasks.set(taskId, task);

        // Removed analytics.trackEvent call
        // Removed notifications.broadcast call

        return;
    }

    private async handleTaskCompletion(task: Task): Promise<void> {
        for (const [id, otherTask] of this.tasks.entries()) {
            if (otherTask.departments?.some(dept => task.departments?.includes(dept))) {
                const allDependenciesMet = true; // Simplified dependency check
                if (allDependenciesMet && otherTask.status === 'pending') {
                    await this.updateTaskStatus(id, 'in_progress', id);
                    await this.autoAssignTask(otherTask);
                }
            }
        }
    }

    // Analytics and Metrics
    public async getTeamMetrics() {
        const tasks = Array.from(this.tasks.values());
        const members = Array.from(this.members.values());

        const completedTasks = tasks.filter(t => t.status === 'completed');
        const totalTasks = tasks.length;

        const metrics = {
            taskCompletionRate: totalTasks ? (completedTasks.length / totalTasks) * 100 : 0,
            activeMembers: members.filter(m => m.status === 'available' || m.status === 'busy').length,
            totalMembers: members.length,
            averageTasksPerMember: members.length ? totalTasks / members.length : 0,
            skillDistribution: this.analyzeTeamSkills(),
            workloadBalance: this.analyzeWorkloadBalance()
        };

        return metrics;
    }

    private analyzeTeamSkills(): Record<string, number> {
        const skillCount: Record<string, number> = {};
        for (const member of this.members.values()) {
            member.skills.forEach(skill => {
                skillCount[skill] = (skillCount[skill] || 0) + 1;
            });
        }
        return skillCount;
    }

    public analyzeWorkloadBalance(): TeamCapacity {
        const availableMembers = this.getAvailableMembers();
        const totalMembers = this.members.size;
        const pendingTasks = this.getPendingTasks();

        return {
            availableCapacity: (availableMembers.length / totalMembers) * 100,
            skillMatch: this.calculateSkillMatchRate(),
            currentWorkload: (pendingTasks.length / totalMembers) * 100
        };
    }

    private calculateSkillMatchRate(): number {
        const tasks = Array.from(this.tasks.values());
        const members = Array.from(this.members.values());
        let matchCount = 0;
        let totalChecks = 0;

        tasks.forEach(task => {
            members.forEach(member => {
                totalChecks++;
                if (task.departments?.some(dept => member.skills.includes(dept))) {
                    matchCount++;
                }
            });
        });

        return totalChecks > 0 ? (matchCount / totalChecks) * 100 : 0;
    }

    private calculateWorkloadBalanceScore(): number {
        const memberTaskCounts = Array.from(this.members.values()).map(m =>
            Array.from(this.tasks.values()).filter(t => t.id === m.currentTask).length
        );

        if (memberTaskCounts.length === 0) return 1;

        const avg = memberTaskCounts.reduce((a, b) => a + b, 0) / memberTaskCounts.length;
        const variance = memberTaskCounts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / memberTaskCounts.length;

        // Return a score between 0 and 1, where 1 is perfectly balanced
        return 1 / (1 + Math.sqrt(variance));
    }

    // Queries
    public getAvailableMembers(): TeamMember[] {
        return Array.from(this.members.values())
            .filter(m => m.status === 'available');
    }

    public getMemberTasks(memberId: string): Task[] {
        // Updated filtering to cast task as any to access assignedTo property
        return Array.from(this.tasks.values())
            .filter(t => (t as any).assignedTo === memberId);
    }

    public getPendingTasks(): Task[] {
        return Array.from(this.tasks.values())
            .filter(t => t.status === 'pending');
    }

    public getTasksByPriority(priority: Task['priority']): Task[] {
        return Array.from(this.tasks.values())
            .filter(t => t.priority === priority);
    }

    public getBlockedTasks(): Task[] {
        return Array.from(this.tasks.values())
            .filter(t => t.status === ('blocked' as Task['status']));
    }
}
