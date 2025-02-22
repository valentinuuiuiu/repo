import type { Task, AgentInsight } from "../types";
import { TaskHistory } from "./TaskHistory";

interface OptimizationMetrics {
  confidence: number;
  processingTime: number;
  validationScore: number;
  successRate: number;
}

interface OptimizationStrategy {
  id: string;
  parameters: Record<string, any>;
  metrics: OptimizationMetrics;
}

export class AgentOptimizer {
  private strategies: Map<string, OptimizationStrategy> = new Map();
  private readonly learningRate = 0.1;
  private readonly explorationRate = 0.2;

  constructor(private taskHistory: TaskHistory) {}

  async optimizeAgent(agentName: string, taskType: string): Promise<Record<string, any>> {
    // Get historical performance data
    const performance = this.taskHistory.getDepartmentPerformance(agentName);
    const successfulStrategies = this.taskHistory.getSuccessfulStrategies(taskType);
    
    // Calculate optimal parameters
    const optimalStrategy = await this.findOptimalStrategy(
      agentName,
      taskType,
      performance,
      successfulStrategies
    );

    return this.generateOptimizedParameters(optimalStrategy);
  }

  private async findOptimalStrategy(
    agentName: string,
    taskType: string,
    performance: { successRate: number; averageValidationScore: number },
    successfulStrategies: { strategy: string; successRate: number }[]
  ): Promise<OptimizationStrategy> {
    // Get existing strategy or create new one
    const currentStrategy = this.strategies.get(`${agentName}-${taskType}`);
    
    if (!currentStrategy || Math.random() < this.explorationRate) {
      // Explore new strategy
      return this.exploreNewStrategy(agentName, taskType, successfulStrategies);
    }

    // Exploit current strategy with improvements
    return this.improveStrategy(currentStrategy, performance);
  }

  private async exploreNewStrategy(
    agentName: string,
    taskType: string,
    successfulStrategies: { strategy: string; successRate: number }[]
  ): Promise<OptimizationStrategy> {
    const baseParameters = this.getBaseParameters(taskType);
    
    // Incorporate successful strategies
    const topStrategy = successfulStrategies[0];
    if (topStrategy) {
      const strategyParams = this.extractStrategyParameters(topStrategy.strategy);
      Object.assign(baseParameters, strategyParams);
    }

    const newStrategy: OptimizationStrategy = {
      id: `${agentName}-${taskType}-${Date.now()}`,
      parameters: baseParameters,
      metrics: {
        confidence: 0.5,
        processingTime: 0,
        validationScore: 0,
        successRate: 0
      }
    };

    this.strategies.set(`${agentName}-${taskType}`, newStrategy);
    return newStrategy;
  }

  private improveStrategy(
    strategy: OptimizationStrategy,
    performance: { successRate: number; averageValidationScore: number }
  ): OptimizationStrategy {
    const updatedParameters = { ...strategy.parameters };
    
    // Adjust parameters based on performance
    if (performance.successRate < 0.7) {
      updatedParameters.maxRetries = Math.min((updatedParameters.maxRetries || 3) + 1, 5);
      updatedParameters.confidence_threshold = Math.max(
        (updatedParameters.confidence_threshold || 0.7) - this.learningRate,
        0.5
      );
    }
    
    if (performance.averageValidationScore < 0.8) {
      updatedParameters.validation_strictness = Math.min(
        (updatedParameters.validation_strictness || 1) + this.learningRate,
        1.5
      );
    }

    return {
      ...strategy,
      parameters: updatedParameters,
      metrics: {
        ...strategy.metrics,
        successRate: performance.successRate,
        validationScore: performance.averageValidationScore
      }
    };
  }

  private getBaseParameters(taskType: string): Record<string, any> {
    const baseParams = {
      maxRetries: 3,
      confidence_threshold: 0.7,
      validation_strictness: 1.0,
      processing_timeout: 30000
    };

    // Customize parameters based on task type
    switch (taskType) {
      case 'product_optimization':
        return {
          ...baseParams,
          market_analysis_depth: 0.8,
          competitor_analysis_enabled: true
        };
      case 'marketing_strategy':
        return {
          ...baseParams,
          trend_analysis_enabled: true,
          audience_segmentation_depth: 0.7
        };
      case 'inventory_forecast':
        return {
          ...baseParams,
          forecast_window_days: 30,
          seasonal_adjustment_enabled: true
        };
      default:
        return baseParams;
    }
  }

  private extractStrategyParameters(strategy: string): Record<string, any> {
    // Parse strategy string to extract parameters
    const params: Record<string, any> = {};
    
    if (strategy.includes('high-confidence')) {
      params.confidence_threshold = 0.85;
    }
    
    if (strategy.includes('quick-response')) {
      params.processing_timeout = 15000;
    }
    
    if (strategy.includes('thorough-validation')) {
      params.validation_strictness = 1.2;
    }

    return params;
  }

  updateStrategyMetrics(
    agentName: string,
    taskType: string,
    metrics: Partial<OptimizationMetrics>
  ) {
    const key = `${agentName}-${taskType}`;
    const strategy = this.strategies.get(key);
    
    if (strategy) {
      this.strategies.set(key, {
        ...strategy,
        metrics: {
          ...strategy.metrics,
          ...metrics
        }
      });
    }
  }

  private generateOptimizedParameters(strategy: OptimizationStrategy): Record<string, any> {
    return strategy.parameters;
  }
}