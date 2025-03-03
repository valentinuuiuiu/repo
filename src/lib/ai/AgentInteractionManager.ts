import { AgentType, AgentStatus } from '@prisma/client';
import { agentHealthMonitor } from './AgentHealthMonitor';
import { AgentManager } from '../services/AgentManager';
import { 
  AgentMessage,
  AgentResponse,
  AgentTask,
  AgentContext
} from '../types/agent';

interface InteractionQueueItem {
  agentType: AgentType;
  task: AgentTask;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Manages direct interactions with agents, including task assignment and response handling
 */
export class AgentInteractionManager {
  private static instance: AgentInteractionManager;
  private taskQueue: Map<AgentType, InteractionQueueItem[]> = new Map();
  private agentManager: AgentManager | null = null;
  private activeInteractions: Map<string, { startTime: number; context: AgentContext }> = new Map();

  private constructor() {
    // Initialize task queues for each agent type
    Object.values(AgentType).forEach(type => {
      this.taskQueue.set(type, []);
    });
  }

  public static getInstance(): AgentInteractionManager {
    if (!AgentInteractionManager.instance) {
      AgentInteractionManager.instance = new AgentInteractionManager();
    }
    return AgentInteractionManager.instance;
  }

  /**
   * Initialize with AgentManager instance
   */
  public initialize(agentManager: AgentManager) {
    this.agentManager = agentManager;
  }

  /**
   * Send a task to an agent and get response
   */
  public async interactWithAgent(
    agentType: AgentType,
    task: AgentTask,
    context?: AgentContext,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<AgentResponse> {
    try {
      if (!this.agentManager) {
        throw new Error('AgentInteractionManager not initialized');
      }

      // Check agent health first
      const health = agentHealthMonitor.getAgentHealth(agentType);
      if (!health || health.status !== AgentStatus.BUSY) {
        throw new Error(`Agent ${agentType} is not available`);
      }

      // Add task to queue
      const queueItem: InteractionQueueItem = {
        agentType,
        task,
        timestamp: Date.now(),
        priority
      };

      const queue = this.taskQueue.get(agentType) || [];
      queue.push(queueItem);
      this.taskQueue.set(agentType, this.sortQueueByPriority(queue));

      // Generate interaction ID
      const interactionId = `${agentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Track interaction start
      this.activeInteractions.set(interactionId, {
        startTime: Date.now(),
        context: context || {}
      });

      // Process task through agent manager
      const result = await this.agentManager.executeTool(
        agentType,
        task.type,
        task.data,
        context?.thoughtChainId
      );

      // Record successful interaction
      this.recordInteractionComplete(interactionId, true);

      // Update agent health
      agentHealthMonitor.recordHeartbeat(agentType);

      return {
        success: true,
        data: result,
        agentType,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error(`Error in agent interaction (${agentType}):`, error);
      
      // Record failed interaction
      if (error instanceof Error) {
        this.recordInteractionComplete(
          `${agentType}-${Date.now()}`, 
          false, 
          error.message
        );
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        agentType,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Send a message to multiple agents
   */
  public async broadcastToAgents(
    message: AgentMessage,
    targetAgents: AgentType[],
    context?: AgentContext
  ): Promise<Record<AgentType, AgentResponse>> {
    const responses: Record<AgentType, AgentResponse> = {};
    
    await Promise.all(
      targetAgents.map(async (agentType) => {
        try {
          const response = await this.interactWithAgent(
            agentType,
            {
              type: 'process_message',
              data: { message }
            },
            context
          );
          responses[agentType] = response;
        } catch (error) {
          responses[agentType] = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            agentType,
            timestamp: Date.now()
          };
        }
      })
    );

    return responses;
  }

  /**
   * Get the next task for an agent
   */
  public getNextTask(agentType: AgentType): InteractionQueueItem | undefined {
    const queue = this.taskQueue.get(agentType) || [];
    return queue.shift();
  }

  /**
   * Check if an agent has pending tasks
   */
  public hasPendingTasks(agentType: AgentType): boolean {
    const queue = this.taskQueue.get(agentType) || [];
    return queue.length > 0;
  }

  /**
   * Get current agent workload
   */
  public getAgentWorkload(agentType: AgentType): number {
    const queue = this.taskQueue.get(agentType) || [];
    return queue.length;
  }

  /**
   * Record interaction completion
   */
  private recordInteractionComplete(
    interactionId: string,
    success: boolean,
    error?: string
  ) {
    const interaction = this.activeInteractions.get(interactionId);
    if (interaction) {
      const duration = Date.now() - interaction.startTime;
      // Here you could add analytics or logging
      console.log(`Interaction ${interactionId} completed in ${duration}ms`, {
        success,
        error,
        context: interaction.context
      });
      this.activeInteractions.delete(interactionId);
    }
  }

  /**
   * Sort queue by priority
   */
  private sortQueueByPriority(queue: InteractionQueueItem[]): InteractionQueueItem[] {
    const priorityWeight = {
      high: 3,
      medium: 2,
      low: 1
    };

    return queue.sort((a, b) => {
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return a.timestamp - b.timestamp; // If same priority, older tasks first
    });
  }

  /**
   * Clear all task queues
   */
  public clearQueues() {
    this.taskQueue.clear();
    Object.values(AgentType).forEach(type => {
      this.taskQueue.set(type, []);
    });
  }
}

// Export singleton instance
export const agentInteractionManager = AgentInteractionManager.getInstance();