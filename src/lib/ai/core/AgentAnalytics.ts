import type { Task, AgentResponse } from "../types";

export interface AgentMetric {
  agentName: string;
  taskType: string;
  success: boolean;
  confidence: number;
  processingTime: number;
  timestamp: Date;
}

export interface AgentPerformanceReport {
  successRate: number;
  averageConfidence: number;
  averageProcessingTime: number;
  tasksByType: Record<string, number>;
  errorRate: number;
}

export class AgentAnalytics {
  private metrics: AgentMetric[] = [];

  trackAgentResponse(agentName: string, task: Task, response: AgentResponse) {
    this.metrics.push({
      agentName,
      taskType: task.type,
      success: response.success,
      confidence: response.metadata?.confidence || 0,
      processingTime: response.metadata?.processingTime || 0,
      timestamp: new Date()
    });
  }

  getPerformanceReport(timeframe: number = 7 * 24 * 60 * 60 * 1000): AgentPerformanceReport {
    const cutoff = new Date(Date.now() - timeframe);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff);

    if (recentMetrics.length === 0) {
      return {
        successRate: 0,
        averageConfidence: 0,
        averageProcessingTime: 0,
        tasksByType: {},
        errorRate: 0
      };
    }

    const successCount = recentMetrics.filter(m => m.success).length;
    const totalTasks = recentMetrics.length;

    const tasksByType = recentMetrics.reduce((acc, metric) => {
      acc[metric.taskType] = (acc[metric.taskType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      successRate: successCount / totalTasks,
      averageConfidence: this.calculateAverage(recentMetrics.map(m => m.confidence)),
      averageProcessingTime: this.calculateAverage(recentMetrics.map(m => m.processingTime)),
      tasksByType,
      errorRate: (totalTasks - successCount) / totalTasks
    };
  }

  getAgentSpecificReport(agentName: string): AgentPerformanceReport {
    const agentMetrics = this.metrics.filter(m => m.agentName === agentName);
    return this.calculateReport(agentMetrics);
  }

  private calculateReport(metrics: AgentMetric[]): AgentPerformanceReport {
    if (metrics.length === 0) {
      return {
        successRate: 0,
        averageConfidence: 0,
        averageProcessingTime: 0,
        tasksByType: {},
        errorRate: 0
      };
    }

    const successCount = metrics.filter(m => m.success).length;
    const totalTasks = metrics.length;

    const tasksByType = metrics.reduce((acc, metric) => {
      acc[metric.taskType] = (acc[metric.taskType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      successRate: successCount / totalTasks,
      averageConfidence: this.calculateAverage(metrics.map(m => m.confidence)),
      averageProcessingTime: this.calculateAverage(metrics.map(m => m.processingTime)),
      tasksByType,
      errorRate: (totalTasks - successCount) / totalTasks
    };
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }
}