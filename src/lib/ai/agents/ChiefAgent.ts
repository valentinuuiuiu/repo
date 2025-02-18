import { BaseAgent } from "../core/BaseAgent";
import { Task, AgentResponse } from "../types";

export class ChiefAgent extends BaseAgent {
  async execute(task: Task): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // Analyze task and decide delegation strategy
      const strategy = await this.analyzeTask(task);

      // Execute strategy
      const result = await this.executeStrategy(strategy, task);

      return {
        success: true,
        data: result,
        metadata: {
          agentId: this.config.id,
          taskId: task.id,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          delegatedTo: strategy.delegatedTo,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        metadata: {
          agentId: this.config.id,
          taskId: task.id,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
        },
      };
    }
  }

  private async analyzeTask(task: Task) {
    const analysis = await this.think({
      type: "task_analysis",
      task,
      availableAgents: Array.from(this.subordinates.keys()),
    });

    return JSON.parse(analysis || "{}");
  }

  private async executeStrategy(strategy: any, task: Task) {
    if (strategy.parallel) {
      // Execute subtasks in parallel
      const promises = strategy.delegations.map(({ agentId, subtask }) =>
        this.delegate(subtask, agentId),
      );
      const results = await Promise.all(promises);
      return this.consolidateResults(results);
    } else {
      // Execute subtasks sequentially
      let result = {};
      for (const { agentId, subtask } of strategy.delegations) {
        const subtaskResult = await this.delegate(subtask, agentId);
        result = { ...result, ...subtaskResult };
      }
      return result;
    }
  }

  private consolidateResults(results: any[]) {
    return results.reduce((acc, result) => {
      if (result.success) {
        Object.assign(acc, result.data);
      }
      return acc;
    }, {});
  }
}
