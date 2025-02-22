import { BaseAgent } from "./BaseAgent";
import { ProductAgent } from "../agents/ProductAgent";
import { SupplierAgent } from "../agents/SupplierAgent";
import { MarketingAgent } from "../agents/MarketingAgent";
import { InventoryAgent } from "../agents/InventoryAgent";
import { CustomerServiceAgent } from "../agents/CustomerServiceAgent";
import { MarketResearchAgent } from "../agents/MarketResearchAgent";
import { Task, TaskType, AgentInsight, AgentResponse } from "../types";
import { AgentAnalytics } from "./AgentAnalytics";
import { TaskHistory } from "./TaskHistory";
import { TaskValidator } from "./TaskValidator";
import { AgentOptimizer } from "./AgentOptimizer";
import { AgentRecoveryManager } from "./AgentRecoveryManager";

interface Performance {
  taskCount: number;
  successRate: number;
  averageValidationScore: number;
}

interface DepartmentStatus {
  currentParameters: Record<string, number | string>;
  performance: Performance;
}

interface OptimizationStatus {
  [department: string]: DepartmentStatus;
}

interface EnhancedTask extends Task {
  priority?: 'low' | 'medium' | 'high';
}

export class AgentManager extends BaseAgent {
  [x: string]: any;
  private agents: {
    product: ProductAgent;
    supplier: SupplierAgent;
    marketing: MarketingAgent;
    inventory: InventoryAgent;
    customerService: CustomerServiceAgent;
    marketResearch: MarketResearchAgent;
  };
  private tasks: Map<string, Task> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 3;
  private analytics: AgentAnalytics;
  private taskHistory: TaskHistory;
  private validator: TaskValidator;
  private optimizer: AgentOptimizer;
  private recoveryManager: AgentRecoveryManager;
  private recoveryInterval: NodeJS.Timeout | null = null;

  constructor() {
    super({
      name: "agent-manager",
      description: "Coordinates and orchestrates all department agents",
    });
    this.agents = {
      product: new ProductAgent(),
      supplier: new SupplierAgent(),
      marketing: new MarketingAgent(),
      inventory: new InventoryAgent(),
      customerService: new CustomerServiceAgent(),
      marketResearch: new MarketResearchAgent(),
    };
    this.analytics = new AgentAnalytics();
    this.taskHistory = new TaskHistory();
    this.validator = new TaskValidator();
    this.optimizer = new AgentOptimizer(this.taskHistory);
    this.recoveryManager = new AgentRecoveryManager();
    
    // Start recovery monitoring
    this.startRecoveryMonitoring();
  }

  private startRecoveryMonitoring() {
    // Monitor agent health every 30 seconds
    this.recoveryInterval = setInterval(async () => {
      try {
        const recentTasks = Array.from(this.tasks.values())
          .filter(task => {
            const taskAge = Date.now() - task.created_at.getTime();
            return taskAge < 24 * 60 * 60 * 1000; // Last 24 hours
          });

        await this.recoveryManager.monitorAndRecover(this.agents, recentTasks);
      } catch (error) {
        console.error('Recovery monitoring failed:', error);
      }
    }, 30000);
  }

  async coordinateTask(taskData: {
    type: TaskType;
    data: any;
    departments: string[];
    priority?: 'low' | 'medium' | 'high';
  }) {
    const task: EnhancedTask = {
      id: crypto.randomUUID(),
      ...taskData,
      status: "in_progress",
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    this.tasks.set(task.id, task);

    try {
      // Check agent health before proceeding
      const unhealthyAgents = task.departments.filter(dept => {
        const agent = this.agents[dept as keyof typeof this.agents];
        const status = agent?.getStatus();
        return status?.status !== 'active';
      });

      // Attempt recovery of unhealthy agents
      if (unhealthyAgents.length > 0) {
        await Promise.all(
          unhealthyAgents.map(async dept => {
            const agent = this.agents[dept as keyof typeof this.agents];
            if (agent) {
              await this.recoveryManager.attemptRecovery(agent);
            }
          })
        );
      }

      // Optimize agents before task execution
      const optimizedAgents = await Promise.all(
        task.departments.map(async dept => {
          const params = await this.optimizer.optimizeAgent(dept, task.type);
          return { dept, params };
        })
      );

      // Apply optimized parameters to agents
      optimizedAgents.forEach(({ dept, params }) => {
        const agent = this.agents[dept as keyof typeof this.agents];
        if (agent) {
          Object.assign(agent, params);
        }
      });

      // Get historical context
      const similarTasks = this.taskHistory.getTasksByType(task.type, 5);
      const successfulStrategies = this.taskHistory.getSuccessfulStrategies(task.type);
      
      const enhancedTask = {
        ...task,
        context: {
          similarTasks: similarTasks.map(t => ({
            departments: t.departments,
            result: t.result,
            success: t.status === 'completed'
          })),
          successfulStrategies,
          optimizedParameters: Object.fromEntries(
            optimizedAgents.map(({ dept, params }) => [dept, params])
          )
        }
      };

      const startTime = Date.now();
      const departmentInsights = await this.collectDepartmentInsights(enhancedTask);
      const result = await this.synthesizeInsights(enhancedTask, departmentInsights);
      const processingTime = Date.now() - startTime;

      const validation = await this.validator.validateTask({
        ...enhancedTask,
        result
      });

      // Update task with results and validation
      task.result = {
        ...result,
        validationDetails: validation.results,
        processingMetrics: {
          time: processingTime,
          confidence: this.calculateAverageConfidence(departmentInsights)
        }
      };
      
      task.status = validation.passed ? "completed" : "needs_review";
      task.updated_at = new Date();

      // Update analytics and optimization metrics
      this.analytics.trackAgentResponse("agent-manager", task, {
        success: validation.passed,
        data: result,
        metadata: {
          confidence: this.calculateAverageConfidence(departmentInsights),
          processingTime
        }
      });

      // Update optimizer with performance metrics
      task.departments.forEach(dept => {
        this.optimizer.updateStrategyMetrics(dept, task.type, {
          confidence: this.calculateAverageConfidence(departmentInsights),
          processingTime,
          successRate: validation.passed ? 1 : 0
        });
      });

      // Store in history
      this.taskHistory.addEntry(task, validation.totalScore);
      
      return task;
    } catch (error) {
      return await this.handleTaskError(task, error);
    }
  }

  private async collectDepartmentInsights(task: Task): Promise<AgentInsight[]> {
    const insightPromises = task.departments.map(async (dept): Promise<AgentInsight | null> => {
      const agent = this.agents[dept as keyof typeof this.agents];
      if (!agent) return null;

      const retryCount = this.retryAttempts.get(task.id) || 0;
      if (retryCount >= this.MAX_RETRIES) return null;
      
      try {
        const insight = await this.getDepartmentInsight(agent, task);
        if (!insight) return null;

        const reasoning = await this.generateReasoning(dept, insight);
        const confidence = this.calculateConfidence(insight);
        
        return {
          department: dept,
          confidence,
          recommendation: insight,
          reasoning,
          metadata: {
            confidence,
            processingTime: Date.now(),
            modelUsed: dept
          }
        };
      } catch (err) {
        console.error(`Error getting insight from ${dept}:`, err);
        this.retryAttempts.set(task.id, retryCount + 1);
        // Retry this specific department's insight collection
        return this.collectDepartmentInsight(agent, task, dept);
      }
    });

    const results = await Promise.all(insightPromises);
    return results.filter((insight): insight is AgentInsight => insight !== null);
  }

  private async collectDepartmentInsight(agent: BaseAgent, task: Task, dept: string): Promise<AgentInsight | null> {
    try {
      const insight = await this.getDepartmentInsight(agent, task);
      if (!insight) return null;

      const reasoning = await this.generateReasoning(dept, insight);
      const confidence = this.calculateConfidence(insight);
      
      return {
        department: dept,
        confidence,
        recommendation: insight,
        reasoning,
        metadata: {
          confidence,
          processingTime: Date.now(),
          modelUsed: dept
        }
      };
    } catch (err) {
      console.error(`Retry failed for ${dept}:`, err);
      return null;
    }
  }

  private async synthesizeInsights(task: EnhancedTask, insights: AgentInsight[]) {
    const messages = [
      {
        role: "system" as const,
        content: `You are a senior business manager coordinating a ${task.type} task.
           Synthesize department insights into a coordinated strategy.
           Consider the confidence levels, reasoning, and potential conflicts between departments.
           Provide clear action items and risk mitigation strategies.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          task,
          departmentInsights: insights,
          priority: task.priority || 'medium'
        }),
      },
    ];

    try {
      const result = JSON.parse((await this.chat(messages)) || "{}");
      return {
        ...result,
        metadata: {
          confidence: this.calculateAverageConfidence(insights),
          processingTime: Date.now(),
          modelUsed: this.config.name
        }
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new Error(`Failed to synthesize insights: ${error.message}`);
    }
  }

  private async handleTaskError(task: Task, error: unknown): Promise<Task> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    task.status = "failed";
    task.updated_at = new Date();
    task.result = {
      success: false,
      data: null,
      error: errorMessage,
      metadata: {
        confidence: 0,
        processingTime: 0,
        modelUsed: this.config.name,
        retryCount: this.retryAttempts.get(task.id) || 0
      }
    };
    
    // Attempt recovery for affected agents
    await Promise.all(
      task.departments.map(async dept => {
        const agent = this.agents[dept as keyof typeof this.agents];
        if (agent) {
          await this.recoveryManager.attemptRecovery(agent);
        }
      })
    );

    this.tasks.set(task.id, task);
    return task;
  }

  private calculateAverageConfidence(insights: AgentInsight[]): number {
    if (!insights.length) return 0;
    return insights.reduce((sum, insight) => sum + (insight.confidence || 0), 0) / insights.length;
  }

  private calculateConfidence(insight: any): number {
    // Implement confidence scoring based on insight completeness, consistency, etc.
    return 0.8; // Placeholder
  }

  private async generateReasoning(
    department: string,
    insight: any,
  ): Promise<string> {
    const messages = [
      {
        role: "system" as const,
        content: `You are the ${department} department expert. Explain your reasoning for the provided insight.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify(insight),
      },
    ];

    return (await this.chat(messages)) || "";
  }

  private async getDepartmentInsight(agent: BaseAgent, task: Task): Promise<AgentResponse | null> {
    try {
      switch (task.type) {
        case "product_optimization":
          if (agent instanceof ProductAgent) {
            return await agent.analyzePricing(task.data);
          }
          break;
        case "product_launch":
          if (agent instanceof ProductAgent) {
            return await agent.optimizeDescription(task.data);
          }
          break;
        case "marketing_strategy":
          if (agent instanceof MarketingAgent) {
            return await agent.createMarketingStrategy(task.data);
          }
          break;
        case "inventory_forecast":
          if (agent instanceof InventoryAgent) {
            return await agent.predictDemand(task.data.product, task.data.historicalData);
          }
          break;
        case "supplier_evaluation":
          if (agent instanceof SupplierAgent) {
            return await agent.analyzePerformance(task.data.supplier, task.data.orders);
          }
          break;
        case "customer_inquiry":
          if (agent instanceof CustomerServiceAgent) {
            return await agent.handleInquiry(task.data.inquiry, task.data.customer);
          }
          break;
        case "market_research":
          if (agent instanceof MarketResearchAgent) {
            return await agent.conductResearch(task.data);
          }
          break;
      }
      return null;
    } catch (error) {
      return this.handleError(error, `Failed to get ${task.type} insight`);
    }
  }

  async getTask(taskId: string): Promise<Task | undefined> {
    return this.tasks.get(taskId);
  }

  async updateTaskStatus(
    taskId: string,
    status: Task["status"],
    feedback?: Task["humanFeedback"],
  ) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");

    task.status = status;
    if (feedback) task.humanFeedback = feedback;
    task.updated_at = new Date();

    this.tasks.set(taskId, task);
    return task;
  }

  async getAgentStatuses() {
    return {
      manager: this.getStatus(),
      departments: {
        product: this.agents.product.getStatus(),
        supplier: this.agents.supplier.getStatus(),
        marketing: this.agents.marketing.getStatus(),
        inventory: this.agents.inventory.getStatus(),
        customerService: this.agents.customerService.getStatus(),
        marketResearch: this.agents.marketResearch.getStatus(),
      },
    };
  }

  // Add analytics getters
  getOverallPerformance(timeframe?: number) {
    return this.analytics.getPerformanceReport(timeframe);
  }

  getAgentPerformance(agentName: string) {
    return this.analytics.getAgentSpecificReport(agentName);
  }

  // Add methods to access historical data
  async getTaskInsights(taskType: string) {
    return {
      successfulStrategies: this.taskHistory.getSuccessfulStrategies(taskType),
      recentLearnings: this.taskHistory.getRecentLearningPoints(),
      departmentPerformance: Object.keys(this.agents).reduce((acc, dept) => ({
        ...acc,
        [dept]: this.taskHistory.getDepartmentPerformance(dept)
      }), {})
    };
  }

  async getAgentOptimizationStatus(): Promise<OptimizationStatus> {
    const status: OptimizationStatus = {};
    
    for (const [dept, agent] of Object.entries(this.agents)) {
      const performance = this.taskHistory.getDepartmentPerformance(dept);
      status[dept] = {
        currentParameters: agent.getParameters?.() || {},
        performance: {
          successRate: performance.successRate,
          averageValidationScore: performance.averageValidationScore,
          taskCount: performance.taskCount
        }
      };
    }

    return status;
  }

  async shutdown(): Promise<void> {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval);
    }
    
    await Promise.all([
      ...Object.values(this.agents).map(agent => agent.shutdown()),
      super.shutdown()
    ]);
  }
}
