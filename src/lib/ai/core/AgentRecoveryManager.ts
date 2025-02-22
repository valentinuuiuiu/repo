import { CircuitState } from "./CircuitBreaker";
import { BaseAgent } from "./BaseAgent";
import type { Task } from "../types";

interface RecoveryStrategy {
  name: string;
  condition: (metrics: any) => boolean;
  action: (agent: BaseAgent) => Promise<void>;
  cooldown: number;
}

export class AgentRecoveryManager {
  private lastRecoveryAttempts: Map<string, number> = new Map();
  private recoveryStrategies: RecoveryStrategy[] = [
    {
      name: "circuit-reset",
      condition: (metrics) => 
        metrics.circuitBreakerMetrics?.state === CircuitState.OPEN &&
        Date.now() - metrics.circuitBreakerMetrics.lastFailureTime > 30000,
      action: async (agent) => {
        await agent.initialize();
      },
      cooldown: 60000 // 1 minute
    },
    {
      name: "performance-degradation",
      condition: (metrics) => 
        metrics.status === 'degraded' &&
        metrics.circuitBreakerMetrics?.failureCount > 3,
      action: async (agent) => {
        await agent.recalibrate?.();
      },
      cooldown: 300000 // 5 minutes
    },
    {
      name: "resource-exhaustion",
      condition: (metrics) => 
        metrics.status === 'inactive' &&
        metrics.circuitBreakerMetrics?.state === CircuitState.OPEN,
      action: async (agent) => {
        await agent.shutdown();
        await new Promise(resolve => setTimeout(resolve, 5000));
        await agent.initialize();
      },
      cooldown: 600000 // 10 minutes
    }
  ];

  async attemptRecovery(agent: BaseAgent): Promise<boolean> {
    const agentMetrics = agent.getStatus();
    const agentId = (agent as any).name;

    for (const strategy of this.recoveryStrategies) {
      if (!this.canAttemptStrategy(agentId, strategy)) {
        continue;
      }

      if (strategy.condition(agentMetrics)) {
        try {
          await strategy.action(agent);
          this.lastRecoveryAttempts.set(
            this.getStrategyKey(agentId, strategy),
            Date.now()
          );
          return true;
        } catch (error) {
          console.error(
            `Recovery strategy ${strategy.name} failed for agent ${agentId}:`,
            error
          );
        }
      }
    }

    return false;
  }

  private canAttemptStrategy(agentId: string, strategy: RecoveryStrategy): boolean {
    const lastAttempt = this.lastRecoveryAttempts.get(
      this.getStrategyKey(agentId, strategy)
    );
    
    if (!lastAttempt) return true;
    
    return Date.now() - lastAttempt > strategy.cooldown;
  }

  private getStrategyKey(agentId: string, strategy: RecoveryStrategy): string {
    return `${agentId}-${strategy.name}`;
  }

  async monitorAndRecover(
    agents: Record<string, BaseAgent>,
    recentTasks: Task[]
  ): Promise<void> {
    const recoveryPromises = Object.values(agents).map(async (agent) => {
      const metrics = agent.getStatus();
      
      if (metrics.status !== 'active') {
        const agentTasks = recentTasks.filter(task => 
          task.departments.includes((agent as any).name)
        );
        
        const failureRate = this.calculateFailureRate(agentTasks);
        
        if (failureRate > 0.3) { // More than 30% failure rate
          await this.attemptRecovery(agent);
        }
      }
    });

    await Promise.all(recoveryPromises);
  }

  private calculateFailureRate(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    
    const failures = tasks.filter(task => 
      task.status === 'failed' || 
      task.status === 'needs_review'
    ).length;
    
    return failures / tasks.length;
  }
}