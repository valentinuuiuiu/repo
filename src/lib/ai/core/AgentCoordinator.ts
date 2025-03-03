import { BaseAgent } from "./BaseAgent";
import { TaskHistory } from "./TaskHistory";
import { AgentOptimizer } from "./AgentOptimizer";
import { AgentRecoveryManager } from "./AgentRecoveryManager";
import { SwarmCoordinator } from "./SwarmCoordinator";
import type { Task, AgentMessage } from "../types";

interface AgentHierarchy {
  level: number;
  subordinates: string[];
  supervisor?: string;
}

export class AgentCoordinator {
  private agents: Map<string, BaseAgent> = new Map();
  private hierarchy: Map<string, AgentHierarchy> = new Map();
  private messageQueue: AgentMessage[] = [];
  private swarmCoordinator: SwarmCoordinator;
  
  constructor(
    private taskHistory: TaskHistory,
    private optimizer: AgentOptimizer,
    private recoveryManager: AgentRecoveryManager
  ) {
    this.swarmCoordinator = new SwarmCoordinator(this.agents);
  }

  registerAgent(agent: BaseAgent, level: number, supervisor?: string) {
    this.agents.set(agent.name, agent);
    this.hierarchy.set(agent.name, {
      level,
      subordinates: [],
      supervisor
    });

    if (supervisor) {
      const supervisorHierarchy = this.hierarchy.get(supervisor);
      if (supervisorHierarchy) {
        supervisorHierarchy.subordinates.push(agent.name);
      }
    }
  }

  async broadcastMessage(message: AgentMessage, sourceAgent: string) {
    const senderHierarchy = this.hierarchy.get(sourceAgent);
    if (!senderHierarchy) return;

    // Use swarm intelligence for message propagation
    const swarmDecision = await this.swarmCoordinator.calculateSwarmConsensus({
      id: `msg-${Date.now()}`,
      type: 'message_broadcast',
      content: message,
      priority: message.priority || 1,
      departments: [sourceAgent],
      status: 'pending',
      created_at: new Date()
    });

    // Broadcast based on swarm decision
    const messageDistribution = swarmDecision.taskDistribution;
    for (const [agentId, task] of messageDistribution) {
      const agent = this.agents.get(agentId);
      if (agent) {
        await agent.receiveMessage({
          ...message,
          from: sourceAgent,
          to: agentId,
          metadata: {
            ...message.metadata,
            swarmConfidence: swarmDecision.confidenceScore
          }
        });
      }
    }
  }

  async distributeTask(task: Task) {
    // Get swarm consensus for task distribution
    const swarmDecision = await this.swarmCoordinator.calculateSwarmConsensus(task);
    
    // Apply optimizer suggestions to task distribution
    const optimizedDistribution = new Map<string, Task>();
    for (const [agentId, subtask] of swarmDecision.taskDistribution) {
      const agent = this.agents.get(agentId);
      if (!agent) continue;

      const optimizedParameters = await this.optimizer.optimizeAgent(
        agentId,
        subtask.type
      );

      optimizedDistribution.set(agentId, {
        ...subtask,
        parameters: {
          ...subtask.parameters,
          ...optimizedParameters
        }
      });
    }

    // Execute distributed tasks with recovery management
    for (const [agentId, subtask] of optimizedDistribution) {
      const agent = this.agents.get(agentId);
      if (!agent) continue;

      try {
        await agent.assignTask(subtask);
      } catch (error) {
        // Attempt recovery if task assignment fails
        const recovered = await this.recoveryManager.attemptRecovery(agent);
        if (recovered) {
          await agent.assignTask(subtask);
        }
      }

      // Update swarm knowledge with task result
      const result = await agent.getTaskResult(subtask.id);
      await this.swarmCoordinator.updateSwarmKnowledge(result, agentId);
    }

    // Record task history
    this.taskHistory.addEntry(task);
  }

  getAgentStatus(agentName: string) {
    const agent = this.agents.get(agentName);
    if (!agent) return null;

    const hierarchy = this.hierarchy.get(agentName);
    if (!hierarchy) return null;

    return {
      status: agent.getStatus(),
      hierarchy: {
        level: hierarchy.level,
        supervisor: hierarchy.supervisor,
        subordinates: hierarchy.subordinates
      },
      swarmMetrics: this.swarmCoordinator.getSwarmMetrics?.(agentName)
    };
  }
}