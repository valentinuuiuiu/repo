import { AgentManager } from "./core/AgentManager";

export class AIService {
  public manager: AgentManager;

  constructor() {
    this.manager = new AgentManager();
  }

  async executeTask(task: { type: string; data: any; departments: string[] }) {
    return await this.manager.coordinateTask(task);
  }

  async getAgentStatuses() {
    return await this.manager.getAgentStatuses();
  }
}

export const aiService = new AIService();
