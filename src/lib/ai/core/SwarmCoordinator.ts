import { BaseAgent } from './BaseAgent';
import { Task, AgentResponse } from '../types';
import { EventEmitter } from 'events';

interface SwarmDecision {
  confidenceScore: number;
  selectedAgents: string[];
  strategy: 'parallel' | 'sequential' | 'consensus';
}

export class SwarmCoordinator {
  private agents: Map<string, BaseAgent>;
  private eventBus: EventEmitter;
  private activeRequests: Map<string, AbortController>;
  private taskHistory: Map<string, Task[]>;
  
  constructor(initialAgents?: Map<string, BaseAgent>) {
    this.agents = initialAgents || new Map();
    this.eventBus = new EventEmitter();
    this.activeRequests = new Map();
    this.taskHistory = new Map();
    
    // Set max listeners to avoid memory leak warnings
    this.eventBus.setMaxListeners(100);
  }

  /**
   * Add an agent to the swarm
   */
  addAgent(agentId: string, agent: BaseAgent): void {
    this.agents.set(agentId, agent);
    this.taskHistory.set(agentId, []);
    
    // Subscribe to agent events
    this.eventBus.on(`agent:${agentId}:task_complete`, this.handleTaskComplete.bind(this));
    this.eventBus.on(`agent:${agentId}:error`, this.handleAgentError.bind(this));
  }

  /**
   * Remove an agent from the swarm
   */
  async removeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    try {
      // Cancel any active requests for this agent
      const controller = this.activeRequests.get(agentId);
      if (controller) {
        controller.abort();
        this.activeRequests.delete(agentId);
      }

      // Clean up agent-specific resources
      await agent.cleanup?.();

      // Remove event listeners
      this.eventBus.removeAllListeners(`agent:${agentId}:task_complete`);
      this.eventBus.removeAllListeners(`agent:${agentId}:error`);

      // Clean up agent data
      this.agents.delete(agentId);
      this.taskHistory.delete(agentId);
    } catch (error) {
      console.error(`Error removing agent ${agentId}:`, error);
    }
  }

  /**
   * Get the current number of agents in the swarm
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Calculate swarm consensus on how to handle a task
   */
  async calculateSwarmConsensus(task: Task): Promise<SwarmDecision> {
    const availableAgents = Array.from(this.agents.entries())
      .filter(([_, agent]) => agent.canHandle?.(task))
      .map(([id]) => id);

    if (availableAgents.length === 0) {
      throw new Error('No agents available to handle task');
    }

    // Simple decision for now - use all available agents in parallel if more than one
    return {
      confidenceScore: availableAgents.length > 1 ? 0.9 : 0.7,
      selectedAgents: availableAgents,
      strategy: availableAgents.length > 1 ? 'parallel' : 'sequential'
    };
  }

  /**
   * Process a task according to the swarm decision
   */
  async processTask(task: Task, decision: SwarmDecision): Promise<void> {
    switch (decision.strategy) {
      case 'parallel':
        await this.processTaskInParallel(task, decision.selectedAgents);
        break;
      case 'sequential':
        await this.processTaskSequentially(task, decision.selectedAgents);
        break;
      case 'consensus':
        await this.processTaskWithConsensus(task, decision.selectedAgents);
        break;
      default:
        throw new Error(`Unknown processing strategy: ${decision.strategy}`);
    }
  }

  /**
   * Clean up all resources
   */
  async cleanup(): Promise<void> {
    // Cancel all active requests
    for (const controller of this.activeRequests.values()) {
      controller.abort();
    }
    this.activeRequests.clear();

    // Clean up all agents
    const cleanupPromises = Array.from(this.agents.values())
      .map(agent => agent.cleanup?.());
    await Promise.all(cleanupPromises);

    // Clear all data structures
    this.agents.clear();
    this.taskHistory.clear();
    this.eventBus.removeAllListeners();
  }

  private async processTaskInParallel(task: Task, agentIds: string[]): Promise<void> {
    const taskPromises = agentIds.map(async (agentId) => {
      const agent = this.agents.get(agentId);
      if (!agent) return;

      const controller = new AbortController();
      this.activeRequests.set(agentId, controller);

      try {
        const result = await agent.executeTask(task);
        this.eventBus.emit(`agent:${agentId}:task_complete`, { agentId, task, result });
      } catch (error) {
        this.eventBus.emit(`agent:${agentId}:error`, { agentId, task, error });
      } finally {
        this.activeRequests.delete(agentId);
      }
    });

    await Promise.all(taskPromises);
  }

  private async processTaskSequentially(task: Task, agentIds: string[]): Promise<void> {
    for (const agentId of agentIds) {
      const agent = this.agents.get(agentId);
      if (!agent) continue;

      const controller = new AbortController();
      this.activeRequests.set(agentId, controller);

      try {
        const result = await agent.executeTask(task);
        this.eventBus.emit(`agent:${agentId}:task_complete`, { agentId, task, result });
        // If successful, we can stop here
        break;
      } catch (error) {
        this.eventBus.emit(`agent:${agentId}:error`, { agentId, task, error });
        // Continue to next agent if this one fails
      } finally {
        this.activeRequests.delete(agentId);
      }
    }
  }

  private async processTaskWithConsensus(task: Task, agentIds: string[]): Promise<void> {
    const results = new Map<string, AgentResponse>();
    
    // Get results from all agents
    await this.processTaskInParallel(task, agentIds);
    
    // Calculate consensus (can be enhanced with more sophisticated logic)
    const successfulResults = Array.from(results.values())
      .filter(result => result.success);
    
    if (successfulResults.length > 0) {
      // Use the result with highest confidence
      const bestResult = successfulResults.reduce((prev, current) => {
        const prevConfidence = prev.metadata?.confidence || 0;
        const currentConfidence = current.metadata?.confidence || 0;
        return currentConfidence > prevConfidence ? current : prev;
      });
      
      // Update task with consensus result
      task.result = bestResult.data;
    }
  }

  private handleTaskComplete(data: { agentId: string; task: Task; result: AgentResponse }): void {
    const { agentId, task } = data;
    const history = this.taskHistory.get(agentId) || [];
    history.push(task);
    this.taskHistory.set(agentId, history);
  }

  private handleAgentError(data: { agentId: string; task: Task; error: Error }): void {
    const { agentId, error } = data;
    console.error(`Error in agent ${agentId}:`, error);
  }
}