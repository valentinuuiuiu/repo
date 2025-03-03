import { PrismaClient } from '@prisma/client';
import { TaskHistory } from './TaskHistory';

const prisma = new PrismaClient();

interface OptimizationParameters extends Record<string, any> {
  batchSize: number;
  concurrencyLimit: number;
  timeoutMs: number;
  retryAttempts: number;
}

export class AgentOptimizer {
  private readonly taskHistory: TaskHistory;
  private optimizationCache: Map<string, OptimizationParameters>;

  constructor() {
    this.taskHistory = new TaskHistory();
    this.optimizationCache = new Map();
  }

  async optimizeAgent(agentId: string, taskType: string): Promise<OptimizationParameters> {
    const cacheKey = `${agentId}:${taskType}`;
    const cached = this.optimizationCache.get(cacheKey);
    if (cached) return cached;

    const metrics = await this.taskHistory.getTaskMetrics(24);
    const agentTasks = await this.taskHistory.getTasksByAgent(agentId, 100);
    
    const parameters = this.calculateOptimalParameters(metrics, agentTasks);
    this.optimizationCache.set(cacheKey, parameters);

    await this.recordOptimization(agentId, taskType, parameters);
    return parameters;
  }

  private calculateOptimalParameters(
    metrics: any,
    recentTasks: any[]
  ): OptimizationParameters {
    const avgCompletionTime = metrics.averageCompletionTime;
    const failureRate = metrics.failureRate;

    // Adjust batch size based on completion time
    const batchSize = this.calculateOptimalBatchSize(avgCompletionTime);

    // Adjust concurrency based on failure rate
    const concurrencyLimit = this.calculateOptimalConcurrency(failureRate);

    // Adjust timeout based on completion time distribution
    const timeoutMs = this.calculateOptimalTimeout(avgCompletionTime);

    // Adjust retry attempts based on failure patterns
    const retryAttempts = this.calculateOptimalRetries(failureRate);

    return {
      batchSize,
      concurrencyLimit,
      timeoutMs,
      retryAttempts
    };
  }

  private calculateOptimalBatchSize(avgCompletionTime: number): number {
    // Start with a baseline of 10
    let batchSize = 10;

    // Reduce batch size for slower completion times
    if (avgCompletionTime > 5000) { // 5 seconds
      batchSize = 5;
    } else if (avgCompletionTime < 1000) { // 1 second
      batchSize = 20;
    }

    return batchSize;
  }

  private calculateOptimalConcurrency(failureRate: number): number {
    // Base concurrency on failure rate
    if (failureRate > 10) {
      return 1; // Sequential execution for high failure rates
    } else if (failureRate > 5) {
      return 2;
    } else {
      return 3;
    }
  }

  private calculateOptimalTimeout(avgCompletionTime: number): number {
    // Set timeout to 3x average completion time
    return Math.max(5000, avgCompletionTime * 3);
  }

  private calculateOptimalRetries(failureRate: number): number {
    // More retries for lower failure rates
    if (failureRate > 20) {
      return 1;
    } else if (failureRate > 10) {
      return 2;
    } else {
      return 3;
    }
  }

  private async recordOptimization(
    agentId: string,
    taskType: string,
    parameters: OptimizationParameters
  ): Promise<void> {
    await prisma.optimizationLog.create({
      data: {
        agentId,
        taskType,
        parameters,
        timestamp: new Date()
      }
    });
  }
}