import { BaseAgent } from '../../core/BaseAgent';
import { SwarmCoordinator } from '../../core/SwarmCoordinator';
import { Task, AgentResponse } from '../../types';
import { DepartmentType } from '../departments/DepartmentConfig';

export type AgentGroup = 'ecommerce' | 'analytics' | 'support' | 'marketing' | 'inventory';

interface SwarmConfig {
  name: string;
  description: string;
  maxConcurrentTasks: number;
  priorityThreshold: number;
}

/**
 * SwarmManager manages multiple agent groups and coordinates their activities
 * It provides a higher-level abstraction over SwarmCoordinator
 */
export class SwarmManager {
  private swarms: Map<AgentGroup, SwarmCoordinator>;
  private agents: Map<string, BaseAgent>;
  private agentGroups: Map<string, AgentGroup>;
  private configs: Map<AgentGroup, SwarmConfig>;
  
  constructor() {
    this.swarms = new Map();
    this.agents = new Map();
    this.agentGroups = new Map();
    this.configs = new Map();
  }

  /**
   * Register a new agent with the swarm manager
   */
  registerAgent(agent: BaseAgent, group: AgentGroup): void {
    const agentId = agent.getName();
    this.agents.set(agentId, agent);
    this.agentGroups.set(agentId, group);
    
    // Create swarm coordinator if it doesn't exist
    if (!this.swarms.has(group)) {
      this.createSwarmForGroup(group);
    }
    
    // Add agent to the appropriate swarm
    const swarm = this.swarms.get(group);
    if (swarm) {
      swarm.addAgent(agentId, agent);
    }
  }

  /**
   * Deregister an agent from the swarm manager
   */
  async deregisterAgent(agentId: string, departmentType: DepartmentType): Promise<void> {
    // Get the agent's group
    const group = this.agentGroups.get(agentId);
    if (!group) {
      console.warn(`No group found for agent ${agentId}`);
      return;
    }

    // Remove from swarm if it exists
    const swarm = this.swarms.get(group);
    if (swarm) {
      await swarm.removeAgent(agentId);
      
      // If swarm is empty, clean it up
      if (swarm.getAgentCount() === 0) {
        await swarm.cleanup();
        this.swarms.delete(group);
      }
    }

    // Clean up agent mappings
    this.agents.delete(agentId);
    this.agentGroups.delete(agentId);
  }

  /**
   * Create a new swarm for a specific agent group
   */
  private createSwarmForGroup(group: AgentGroup): void {
    const config = this.getDefaultConfigForGroup(group);
    this.configs.set(group, config);
    
    const groupAgents = new Map<string, BaseAgent>();
    for (const [agentId, agentGroup] of this.agentGroups.entries()) {
      if (agentGroup === group) {
        const agent = this.agents.get(agentId);
        if (agent) {
          groupAgents.set(agentId, agent);
        }
      }
    }
    
    const swarm = new SwarmCoordinator(groupAgents);
    this.swarms.set(group, swarm);
  }

  /**
   * Get default configuration for a specific agent group
   */
  private getDefaultConfigForGroup(group: AgentGroup): SwarmConfig {
    switch (group) {
      case 'ecommerce':
        return {
          name: 'E-Commerce Swarm',
          description: 'Handles all e-commerce related tasks including product management, pricing, and checkout',
          maxConcurrentTasks: 10,
          priorityThreshold: 0.7
        };
      case 'analytics':
        return {
          name: 'Analytics Swarm',
          description: 'Processes data analytics, market research, and business intelligence',
          maxConcurrentTasks: 5,
          priorityThreshold: 0.5
        };
      case 'support':
        return {
          name: 'Customer Support Swarm',
          description: 'Handles customer inquiries, support tickets, and service requests',
          maxConcurrentTasks: 20,
          priorityThreshold: 0.8
        };
      case 'marketing':
        return {
          name: 'Marketing Swarm',
          description: 'Manages marketing campaigns, content creation, and social media',
          maxConcurrentTasks: 8,
          priorityThreshold: 0.6
        };
      case 'inventory':
        return {
          name: 'Inventory Swarm',
          description: 'Manages inventory forecasting, supplier relations, and stock optimization',
          maxConcurrentTasks: 5,
          priorityThreshold: 0.7
        };
      default:
        return {
          name: `${group} Swarm`,
          description: `Generic swarm for ${group} tasks`,
          maxConcurrentTasks: 5,
          priorityThreshold: 0.5
        };
    }
  }

  /**
   * Process a task using the appropriate swarm
   */
  async processTask(task: Task): Promise<AgentResponse> {
    // Determine which group should handle this task
    const group = this.determineTaskGroup(task);
    
    if (!this.swarms.has(group)) {
      return {
        success: false,
        data: null,
        error: `No swarm available for group: ${group}`,
        metadata: {
          confidence: 0,
          processingTime: 0,
          modelUsed: 'none'
        }
      };
    }
    
    const swarm = this.swarms.get(group)!;
    const startTime = Date.now();
    
    try {
      // Get swarm consensus on how to handle the task
      const decision = await swarm.calculateSwarmConsensus(task);
      
      // Process the task according to the decision
      await swarm.processTask(task, decision);
      
      // Return the result
      return {
        success: true,
        data: task.result || { message: 'Task processed successfully' },
        metadata: {
          confidence: decision.confidenceScore,
          processingTime: Date.now() - startTime,
          modelUsed: 'swarm-consensus'
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: (error as Error).message,
        metadata: {
          confidence: 0,
          processingTime: Date.now() - startTime,
          modelUsed: 'none'
        }
      };
    }
  }

  /**
   * Determine which agent group should handle a specific task
   */
  private determineTaskGroup(task: Task): AgentGroup {
    // If task has explicit departments, use the first one that matches our groups
    if (task.departments && task.departments.length > 0) {
      for (const department of task.departments) {
        const group = department.toLowerCase() as AgentGroup;
        if (this.swarms.has(group)) {
          return group;
        }
      }
    }
    
    // Otherwise, determine based on task type
    switch (task.type) {
      case 'pricing_optimization':
      case 'order_processing':
        return 'ecommerce';
      case 'market_analysis':
        return 'analytics';
      case 'customer_inquiry':
        return 'support';
      case 'inventory_forecast':
      case 'supplier_evaluation':
        return 'inventory';
      default:
        // Default to the group with the most agents
        const groupCounts = new Map<AgentGroup, number>();
        for (const group of this.agentGroups.values()) {
          groupCounts.set(group, (groupCounts.get(group) || 0) + 1);
        }
        
        let maxCount = 0;
        let maxGroup: AgentGroup = 'support';
        for (const [group, count] of groupCounts.entries()) {
          if (count > maxCount) {
            maxCount = count;
            maxGroup = group;
          }
        }
        
        return maxGroup;
    }
  }

  /**
   * Get all registered agents
   */
  getAgents(): Map<string, BaseAgent> {
    return new Map(this.agents);
  }

  /**
   * Get all swarm coordinators
   */
  getSwarms(): Map<AgentGroup, SwarmCoordinator> {
    return new Map(this.swarms);
  }

  /**
   * Get configuration for a specific agent group
   */
  getSwarmConfig(group: AgentGroup): SwarmConfig | undefined {
    return this.configs.get(group);
  }

  /**
   * Update configuration for a specific agent group
   */
  updateSwarmConfig(group: AgentGroup, config: Partial<SwarmConfig>): void {
    const currentConfig = this.configs.get(group);
    if (currentConfig) {
      this.configs.set(group, { ...currentConfig, ...config });
    }
  }

  /**
   * Get the group for a specific agent
   */
  getAgentGroup(agentId: string): AgentGroup | undefined {
    return this.agentGroups.get(agentId);
  }
}