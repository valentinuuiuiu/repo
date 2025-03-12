import { AgentManager } from "./core/AgentManager";

export class AIService {
  public manager: AgentManager;

  constructor() {
    this.manager = new AgentManager();
  }

  async executeTask(task: { type: string; data: any; departments: string[] }) {
    console.log(
      "Executing task:",
      task.type,
      "with departments:",
      task.departments,
    );
    try {
      const result = await this.manager.coordinateTask(task);
      console.log("Task result:", result);
      return result;
    } catch (error) {
      console.error("Error executing task:", error);
      // Return a mock task result for testing purposes
      return {
        id: crypto.randomUUID(),
        type: task.type,
        departments: task.departments,
        data: task.data,
        status: "needs_review",
        result: {
          recommendation: "Mock recommendation for " + task.type,
          analysis:
            "This is a mock analysis since the real task execution failed",
          nextSteps: ["Step 1", "Step 2", "Step 3"],
        },
        created_at: new Date(),
        updated_at: new Date(),
      };
    }
  }

  async getAgentStatuses() {
    return await this.manager.getAgentStatuses();
  }
}

export const aiService = new AIService();
