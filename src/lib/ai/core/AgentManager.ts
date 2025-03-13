import { BaseAgent } from "./BaseAgent";
import { ProductAgent } from "../agents/ProductAgent";
import { SupplierAgent } from "../agents/SupplierAgent";
import { MarketingAgent } from "../agents/MarketingAgent";
import { InventoryAgent } from "../agents/InventoryAgent";
import { CustomerServiceAgent } from "../agents/CustomerServiceAgent";
import { Task, TaskType, AgentInsight } from "../types";

export class AgentManager extends BaseAgent {
  private agents: {
    product: ProductAgent;
    supplier: SupplierAgent;
    marketing: MarketingAgent;
    inventory: InventoryAgent;
    customerService: CustomerServiceAgent;
  };

  private tasks: Map<string, Task> = new Map();

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
    };
  }

  async coordinateTask(taskData: {
    type: TaskType;
    data: any;
    departments: string[];
  }) {
    const task: Task = {
      id: crypto.randomUUID(),
      ...taskData,
      status: "in_progress",
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.tasks.set(task.id, task);

    try {
      // First, collect insights from relevant department agents
      const departmentInsights = await Promise.all(
        task.departments.map(async (dept): Promise<AgentInsight | null> => {
          const agent = this.agents[dept as keyof typeof this.agents];
          if (!agent) return null;

          try {
            const insight = await this.getDepartmentInsight(agent, task);
            return {
              department: dept,
              confidence: this.calculateConfidence(insight),
              recommendation: insight,
              reasoning: await this.generateReasoning(dept, insight),
            };
          } catch (error) {
            console.error(`Error getting insight from ${dept}:`, error);
            return null;
          }
        }),
      );

      // Then, synthesize insights into a coordinated response
      const messages = [
        {
          role: "system" as const,
          content: `You are a senior business manager coordinating a ${task.type} task.
             Synthesize department insights into a coordinated strategy.
             Consider the confidence levels and reasoning from each department.`,
        },
        {
          role: "user" as const,
          content: JSON.stringify({
            task,
            departmentInsights: departmentInsights.filter(Boolean),
          }),
        },
      ];

      const result = JSON.parse((await this.chat(messages)) || "{}");

      // Update task with results
      task.result = result;
      task.status = "needs_review";
      task.updated_at = new Date();
      this.tasks.set(task.id, task);

      return task;
    } catch (error) {
      console.error("Error in coordinateTask:", error);
      // Create a fallback result
      task.result = {
        recommendation: `Fallback recommendation for ${task.type}`,
        analysis: "Generated using fallback mechanism due to processing error",
        nextSteps: [
          "Review input data",
          "Try again with modified parameters",
          "Contact support if issue persists",
        ],
      };
      task.status = "needs_review";
      task.updated_at = new Date();
      this.tasks.set(task.id, task);
      return task;
    }
  }

  private calculateConfidence(insight: any): number {
    if (!insight) return 0.5;
    // Implement confidence scoring based on insight completeness, consistency, etc.
    return 0.8; // Placeholder
  }

  private async generateReasoning(
    department: string,
    insight: any,
  ): Promise<string> {
    if (!insight) return "No insight was generated from this department.";

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

    try {
      return (await this.chat(messages)) || "";
    } catch (error) {
      console.error(`Error generating reasoning for ${department}:`, error);
      return "Unable to generate detailed reasoning at this time.";
    }
  }

  private async getDepartmentInsight(agent: BaseAgent, task: Task) {
    try {
      // Map task types to agent methods
      switch (task.type) {
        case "product_optimization":
          return agent instanceof ProductAgent
            ? await agent.analyzePricing(task.data)
            : null;
        case "product_launch":
          return agent instanceof ProductAgent
            ? await agent.optimizeDescription(task.data)
            : null;
        case "marketing_strategy":
          return agent instanceof MarketingAgent
            ? await agent.createMarketingStrategy(task.data)
            : null;
        case "inventory_forecast":
          return agent instanceof InventoryAgent
            ? await agent.predictDemand(
                task.data.product || {},
                task.data.historicalData || [],
              )
            : null;
        case "supplier_evaluation":
          return agent instanceof SupplierAgent
            ? await agent.analyzePerformance(
                task.data.supplier || {},
                task.data.orders || [],
              )
            : null;
        case "customer_inquiry":
          return agent instanceof CustomerServiceAgent
            ? await agent.handleInquiry(
                task.data.inquiry || "",
                task.data.customer || {},
              )
            : null;
        case "product_pricing":
          return agent instanceof ProductAgent
            ? await agent.analyzePricing(task.data)
            : null;
        case "supplier_risk_assessment":
          return agent instanceof SupplierAgent
            ? await agent.predictReliability(
                task.data.supplier || {},
                task.data.orders || [],
              )
            : null;
        case "satisfaction_analysis":
          return agent instanceof CustomerServiceAgent
            ? await agent.analyzeSatisfaction(
                task.data.customer || {},
                task.data.orders || [],
              )
            : null;
        default:
          console.warn(`No handler for task type: ${task.type}`);
          return null;
      }
    } catch (error) {
      console.error(
        `Error getting department insight for ${task.type}:`,
        error,
      );
      return null;
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
      },
    };
  }
}
