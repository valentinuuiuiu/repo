import { EventEmitter } from 'events';
import { AgentType, AgentStatus, Department } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AgentResponse, Task, TaskPriority } from '../types';
import { SwarmCoordinator } from './SwarmCoordinator';
import { AgentAnalytics } from './AgentAnalytics';
import { DepartmentManager } from '../framework/departments/DepartmentManager';

export type TaskPriority = 'low' | 'medium' | 'high';

interface AgentTask {
  id: string;
  type: string;
  priority: TaskPriority;
  data: any;
  departmentId: string;
  deadline?: Date;
  dependencies?: string[];
}

export class AgentManager {
  private eventBus: EventEmitter;
  private swarmCoordinator: SwarmCoordinator;
  private departmentManager: DepartmentManager;
  private analytics: AgentAnalytics;
  private activeTasks: Map<string, AgentTask>;
  
  constructor() {
    this.eventBus = new EventEmitter();
    this.swarmCoordinator = new SwarmCoordinator();
    this.departmentManager = new DepartmentManager(this.swarmCoordinator);
    this.analytics = new AgentAnalytics();
    this.activeTasks = new Map();
    
    // Set up event listeners
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.eventBus.on('task:complete', this.handleTaskComplete.bind(this));
    this.eventBus.on('task:failed', this.handleTaskFailure.bind(this));
    this.eventBus.on('agent:status', this.handleAgentStatusChange.bind(this));
  }

  async submitTask(task: AgentTask): Promise<string> {
    // Validate task
    if (!task.departmentId || !task.type) {
      throw new Error('Invalid task specification');
    }

    // Store task
    this.activeTasks.set(task.id, task);

    // Get department config
    const department = await this.getDepartment(task.departmentId);
    if (!department) {
      throw new Error(`Department ${task.departmentId} not found`);
    }

    // Find available agents
    const agents = await this.findSuitableAgents(task, department);
    if (agents.length === 0) {
      throw new Error('No suitable agents available');
    }

    // Get swarm decision on how to process task
    const swarmDecision = await this.swarmCoordinator.calculateSwarmConsensus({
      id: task.id,
      type: task.type,
      priority: task.priority,
      departments: [task.departmentId],
      data: task.data,
      created_at: new Date()
    });

    // Execute task based on swarm decision
    await this.swarmCoordinator.processTask({
      id: task.id,
      type: task.type,
      priority: task.priority,
      data: task.data,
      departments: [task.departmentId],
      created_at: new Date()
    }, swarmDecision);

    return task.id;
  }

  private async findSuitableAgents(task: AgentTask, department: Department) {
    const agents = await prisma.agent.findMany({
      where: {
        departmentId: department.id,
        status: AgentStatus.AVAILABLE,
        capabilities: {
          hasSome: [task.type]
        }
      },
      include: {
        metrics: true,
        specializations: {
          where: {
            taskType: task.type
          }
        }
      }
    });

    return agents.sort((a, b) => {
      // Sort by specialization score first
      const aSpec = a.specializations[0]?.proficiencyScore || 0;
      const bSpec = b.specializations[0]?.proficiencyScore || 0;
      if (aSpec !== bSpec) return bSpec - aSpec;

      // Then by success rate
      const aSuccess = a.metrics[0]?.successfulInteractions / a.metrics[0]?.totalInteractions || 0;
      const bSuccess = b.metrics[0]?.successfulInteractions / b.metrics[0]?.totalInteractions || 0;
      return bSuccess - aSuccess;
    });
  }

  private async handleTaskComplete(taskId: string, result: AgentResponse) {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    // Update analytics
    await this.analytics.trackTaskCompletion(task, result);

    // Update agent metrics and specializations
    await this.updateAgentMetrics(task, result);

    // Clean up
    this.activeTasks.delete(taskId);

    // Emit completion event
    this.eventBus.emit('task:completed', { taskId, result });
  }

  private async handleTaskFailure(taskId: string, error: Error) {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    // Update analytics
    await this.analytics.trackTaskFailure(task, error);

    // Attempt recovery or reassignment if needed
    await this.handleFailureRecovery(task, error);

    // Clean up if no recovery possible
    this.activeTasks.delete(taskId);
  }

  private async handleAgentStatusChange(agentId: string, status: AgentStatus) {
    // Update agent status
    await prisma.agent.update({
      where: { id: agentId },
      data: { status }
    });

    // Redistribute tasks if agent becomes unavailable
    if (status === AgentStatus.OFFLINE || status === AgentStatus.MAINTENANCE) {
      await this.redistributeAgentTasks(agentId);
    }
  }

  private async handleFailureRecovery(task: AgentTask, error: Error) {
    // Implement recovery strategies (retry, reassign, etc.)
    if (task.priority === 'high') {
      // For high priority tasks, immediately try to reassign
      await this.submitTask({
        ...task,
        id: `${task.id}_retry`
      });
    }
  }

  private async redistributeAgentTasks(agentId: string) {
    // Find tasks assigned to this agent and redistribute
    const tasksToRedistribute = Array.from(this.activeTasks.values())
      .filter(task => task.assignedTo === agentId);

    for (const task of tasksToRedistribute) {
      await this.submitTask({
        ...task,
        id: `${task.id}_reassigned`
      });
    }
  }

  private async updateAgentMetrics(task: AgentTask, result: AgentResponse) {
    const agent = await prisma.agent.findFirst({
      where: {
        departmentId: task.departmentId,
        capabilities: {
          hasSome: [task.type]
        }
      },
      include: {
        metrics: true,
        specializations: {
          where: {
            taskType: task.type
          }
        }
      }
    });

    if (!agent) return;

    // Update metrics
    await prisma.agentMetrics.update({
      where: { id: agent.metrics[0].id },
      data: {
        totalInteractions: { increment: 1 },
        successfulInteractions: result.success ? { increment: 1 } : undefined,
        averageResponseTime: {
          set: ((agent.metrics[0].averageResponseTime * agent.metrics[0].totalInteractions) + 
                result.metadata.processingTime) / (agent.metrics[0].totalInteractions + 1)
        },
        lastActive: new Date()
      }
    });

    // Update specialization
    if (agent.specializations[0]) {
      await prisma.agentSpecialization.update({
        where: { id: agent.specializations[0].id },
        data: {
          tasksCompleted: { increment: 1 },
          proficiencyScore: result.success ? { increment: 0.01 } : { decrement: 0.01 },
          successRate: {
            set: ((agent.specializations[0].successRate * agent.specializations[0].tasksCompleted) +
                  (result.success ? 1 : 0)) / (agent.specializations[0].tasksCompleted + 1)
          }
        }
      });
    }
  }

  private async getDepartment(departmentId: string): Promise<Department | null> {
    return prisma.department.findUnique({
      where: { id: departmentId }
    });
  }

  // Public API methods
  async getDepartmentAgents(departmentId: string) {
    return prisma.agent.findMany({
      where: { departmentId },
      include: {
        metrics: true,
        specializations: true
      }
    });
  }

  async getAgentMetrics(agentId: string) {
    return prisma.agentMetrics.findFirst({
      where: { agentId }
    });
  }

  async updateAgentConfig(agentId: string, config: any) {
    return prisma.agent.update({
      where: { id: agentId },
      data: { config }
    });
  }

  subscribeToTaskUpdates(callback: (update: any) => void): () => void {
    this.eventBus.on('task:completed', callback);
    return () => this.eventBus.off('task:completed', callback);
  }
}
