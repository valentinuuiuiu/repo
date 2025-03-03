import { 
  DepartmentType, 
  DepartmentConfig, 
  getDepartmentConfig, 
  getAllDepartmentTypes 
} from './DepartmentConfig';
import { SwarmManager } from '../swarm/SwarmManager';
import { BaseAgent } from '../../core/BaseAgent';
import { AgentType } from '@prisma/client';
import { Task } from '../../types';

export class DepartmentManager {
  private swarmManager: SwarmManager;
  private departmentAgents: Map<DepartmentType, BaseAgent[]>;

  constructor(swarmManager: SwarmManager) {
    this.swarmManager = swarmManager;
    this.departmentAgents = new Map();
  }

  /**
   * Initialize departments and their agents
   */
  async initializeDepartments(): Promise<void> {
    const departmentTypes = getAllDepartmentTypes();

    for (const departmentType of departmentTypes) {
      await this.initializeDepartment(departmentType);
    }
  }

  /**
   * Initialize a specific department
   */
  async initializeDepartment(departmentType: DepartmentType): Promise<void> {
    const config = getDepartmentConfig(departmentType);
    const departmentAgents: BaseAgent[] = [];

    for (const agentConfig of config.agents) {
      const agent = await this.createDepartmentAgent(departmentType, agentConfig);
      departmentAgents.push(agent);
      
      // Register agent with swarm manager
      this.swarmManager.registerAgent(agent, this.mapDepartmentToAgentGroup(departmentType));
    }

    this.departmentAgents.set(departmentType, departmentAgents);
  }

  /**
   * Create an agent for a specific department
   */
  private async createDepartmentAgent(
    departmentType: DepartmentType, 
    agentConfig: { type: AgentType; capabilities: string[] }
  ): Promise<BaseAgent> {
    // This is a placeholder. In a real implementation, you'd dynamically 
    // create the appropriate agent type based on the configuration
    const baseAgentConfig = {
      name: `${departmentType}_${agentConfig.type}_Agent`,
      type: agentConfig.type,
      maxRetries: 3,
      baseDelay: 1000,
      capabilities: agentConfig.capabilities,
      group: this.mapDepartmentToAgentGroup(departmentType)
    };

    // Dynamically import and create the appropriate agent
    switch (agentConfig.type) {
      case AgentType.PRODUCT_OPTIMIZATION:
        const { ProductManagementAgent } = await import('../../agents/ecommerce/ProductManagementAgent');
        return new ProductManagementAgent(baseAgentConfig);
      
      case AgentType.MARKET_RESEARCH:
        const { MarketResearchAgent } = await import('../../agents/analytics/MarketResearchAgent');
        return new MarketResearchAgent(baseAgentConfig);
      
      case AgentType.CUSTOMER_SERVICE:
        // Use different agent implementations based on department
        if (departmentType === DepartmentType.DOCUMENTATION) {
          const { DocumentationAgent } = await import('../../agents/specialized/DocumentationAgent');
          return new DocumentationAgent(baseAgentConfig);
        } else {
          const { CustomerSupportAgent } = await import('../../agents/support/CustomerSupportAgent');
          return new CustomerSupportAgent(baseAgentConfig);
        }
      
      case AgentType.CHECKOUT_OPTIMIZATION:
        const { CheckoutOptimizationAgent } = await import('../../agents/ecommerce/CheckoutOptimizationAgent');
        return new CheckoutOptimizationAgent(baseAgentConfig);
      
      case AgentType.MARKETING_OPTIMIZATION:
        // Use different agent implementations based on department
        if (departmentType === DepartmentType.BLOG) {
          const { BlogAgent } = await import('../../agents/specialized/BlogAgent');
          return new BlogAgent(baseAgentConfig);
        } else {
          const { MarketingAgent } = await import('../../agents/marketing/MarketingAgent');
          return new MarketingAgent(baseAgentConfig);
        }
      
      default:
        throw new Error(`No agent implementation for type: ${agentConfig.type}`);
    }
  }

  /**
   * Map department type to agent group
   */
  private mapDepartmentToAgentGroup(departmentType: DepartmentType): string {
    const groupMap = {
      [DepartmentType.PRODUCT_MANAGEMENT]: 'ecommerce',
      [DepartmentType.SALES_MARKETING]: 'marketing',
      [DepartmentType.CUSTOMER_EXPERIENCE]: 'support',
      [DepartmentType.MARKET_INTELLIGENCE]: 'analytics',
      [DepartmentType.OPERATIONS]: 'inventory',
      [DepartmentType.FINANCE]: 'analytics',
      [DepartmentType.TECHNOLOGY]: 'support',
      [DepartmentType.ECOMMERCE]: 'ecommerce',
      [DepartmentType.DOCUMENTATION]: 'content',
      [DepartmentType.BLOG]: 'content'
    };

    return groupMap[departmentType] || 'default';
  }

  /**
   * Execute a task for a specific department
   */
  async executeDepartmentTask(
    departmentType: DepartmentType, 
    task: Task
  ): Promise<any> {
    // Get agents for this department
    const agents = this.departmentAgents.get(departmentType);
    
    if (!agents || agents.length === 0) {
      throw new Error(`No agents found for department: ${departmentType}`);
    }

    // Select the most appropriate agent based on task type
    const selectedAgent = this.selectBestAgent(agents, task);

    // Process the task using the selected agent
    return this.swarmManager.processTask(task);
  }

  /**
   * Select the best agent for a given task
   */
  private selectBestAgent(agents: BaseAgent[], task: Task): BaseAgent {
    // Simple selection strategy - first agent that can handle the task
    for (const agent of agents) {
      const capabilities = agent.getCapabilities();
      
      // Check if agent's capabilities match task requirements
      if (capabilities.some(cap => task.type.toLowerCase().includes(cap.toLowerCase()))) {
        return agent;
      }
    }

    // If no specific match, return the first agent
    return agents[0];
  }

  /**
   * Get all agents for a specific department
   */
  getDepartmentAgents(departmentType: DepartmentType): BaseAgent[] {
    return this.departmentAgents.get(departmentType) || [];
  }

  /**
   * Get department configuration
   */
  getDepartmentConfig(departmentType: DepartmentType): DepartmentConfig {
    return getDepartmentConfig(departmentType);
  }
}