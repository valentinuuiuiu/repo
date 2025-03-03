import { PrismaClient, AgentType } from '@prisma/client';
import type { Task, TaskType } from '../types';

//type AgentType = TaskType;

const prisma = new PrismaClient();

export class TaskHistory {
  async addEntry(task: Task) {
    const priorityMap = {
      low: 1,
      medium: 2,
      high: 3
    };

    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        type: AgentType.PRICING_OPTIMIZATION,
        status: task.status,
        priority: task.priority ? priorityMap[task.priority] : 2, // Default to medium (2)
        metadata: task.data,
        timestamp: new Date(),
        agent: {
          create: {
            id: task.id, // Using task ID as agent ID since we don't have direct agent reference
            name: `agent-${task.type}`,
            type: AgentType.PRICING_OPTIMIZATION,
            department: {
              create: {
                name: 'AI',
                code: 'DEP_AI'
              }
            }
          }
        }
      }
    });
  }

  async getTaskMetrics(timeframe: number = 24): Promise<{
    totalTasks: number;
    successRate: number;
    averageCompletionTime: number;
    failureRate: number;
  }> {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - timeframe);
    const tasks = await prisma.taskHistory.findMany({
      where: {
        timestamp: {
          gte: startTime
        }
      }
    });

    const totalTasks = tasks.length;
    if (totalTasks === 0) {
      return {
        totalTasks: 0,
        successRate: 0,
        averageCompletionTime: 0,
        failureRate: 0
      };
    }

    const successful = tasks.filter(t => t.status === 'completed').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    
    // Calculate completion times for tasks with valid metadata
    const completionTimes = tasks
      .filter(t => t.status === 'completed' && t.metadata && typeof t.metadata === 'object')
      .map(t => {
        const metadata = t.metadata as Record<string, unknown>;
        const startTime = metadata.startTime;
        if (startTime && typeof startTime === 'string') {
          return t.timestamp.getTime() - new Date(startTime).getTime();
        }
        return 0;
      })
      .filter(time => time > 0);

    return {
      totalTasks,
      successRate: (successful / totalTasks) * 100,
      averageCompletionTime: completionTimes.length > 0 
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length 
        : 0,
      failureRate: (failed / totalTasks) * 100
    };
  }

  async getTasksByAgent(agentId: string, limit: number = 10) {
    return prisma.taskHistory.findMany({
      where: {
        taskId: agentId // Since we no longer have assignedTo
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });
  }

  async getFailurePatterns(): Promise<Array<{
    pattern: string;
    frequency: number;
  }>> {
    const failedTasks = await prisma.taskHistory.findMany({
      where: {
        status: 'failed'
      },
      select: {
        type: true,
        metadata: true
      }
    });

    const patterns = failedTasks.reduce((acc, task) => {
      let errorType = 'unknown';
      if (task.metadata && typeof task.metadata === 'object') {
        const metadata = task.metadata as Record<string, unknown>;
        if (metadata.error && typeof metadata.error === 'string') {
          errorType = metadata.error;
        }
      }
      const pattern = `${task.type}:${errorType}`;
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(patterns)
      .map(([pattern, frequency]) => ({ pattern, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }
}