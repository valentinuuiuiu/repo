import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { 
  AgentType, 
  AgentFunctionType, 
  AgentToolkit, 
  AgentTool, 
  AgentMemory,
  AgentResponse, 
  AgentContext,
  AgentMetrics,
  ThoughtChain
} from '../types/agent';
import { useAI } from '../providers/AIProvider';

const prisma = new PrismaClient();

/**
 * AgentManager handles all agent operations including:
 * - Tool execution
 * - Memory management
 * - Collaboration between agents
 * - Performance tracking and metrics
 * - Thought chain tracking
 */
export class AgentManager {
  private static instance: AgentManager;
  private toolkits: Map<AgentType, AgentToolkit> = new Map();
  private memories: Map<string, AgentMemory> = new Map();
  private metrics: Map<AgentType, AgentMetrics> = new Map();
  private thoughtChains: Map<string, ThoughtChain> = new Map(); // Store thought chains
  private tokenPrices: Record<string, number> = {
    'gpt-4o-mini': 0.00015, // price per token
    'gpt-4o': 0.00030,
  };

  private constructor() {
    this.initializeDefaultToolkits();
  }

  /**
   * Get singleton instance of AgentManager
   */
  public static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  /**
   * Initialize default toolkits for each agent type
   */
  private initializeDefaultToolkits() {
    this.registerToolkit(AgentType.PRODUCT_LEADER, this.createProductLeaderToolkit());
    this.registerToolkit(AgentType.CUSTOMER_SUPPORT_LEADER, this.createCustomerSupportToolkit());
    this.registerToolkit(AgentType.MARKET_RESEARCH_LEADER, this.createMarketResearchToolkit());
    this.registerToolkit(AgentType.OPERATIONS_LEADER, this.createOperationsToolkit());
    this.registerToolkit(AgentType.SALES_LEADER, this.createSalesToolkit());
    this.registerToolkit(AgentType.DOCUMENTATION_SPECIALIST, this.createDocumentationToolkit());
    this.registerToolkit(AgentType.BLOG_CONTENT_CREATOR, this.createContentCreatorToolkit());
  }

  /**
   * Register a toolkit for an agent type
   */
  public registerToolkit(agentType: AgentType, toolkit: AgentToolkit): void {
    // Make sure 'initialize' tool exists in the toolkit
    if (!toolkit.tools.some(tool => tool.id === 'initialize')) {
      toolkit.tools.push(this.createInitializeTool(agentType));
    }
    this.toolkits.set(agentType, toolkit);
  }

  /**
   * Create the initialization tool for agent connection
   */
  private createInitializeTool(agentType: AgentType): AgentTool {
    return {
      id: 'initialize',
      name: 'Agent Initialization',
      description: 'Initializes the agent and establishes connection',
      functionType: AgentFunctionType.SYSTEM,
      requiresAuth: false,
      allowedAgentTypes: [agentType],
      execute: async (params) => {
        // Return basic agent info on initialization
        return {
          status: 'connected',
          agentType,
          timestamp: new Date().toISOString(),
          capabilities: this.getAgentCapabilities(agentType),
          availableTools: this.getAgentToolNames(agentType)
        };
      }
    };
  }

  /**
   * Get capabilities for an agent type
   */
  private getAgentCapabilities(agentType: AgentType): string[] {
    switch (agentType) {
      case AgentType.BLOG_CONTENT_CREATOR:
        return ["Blog post creation", "SEO optimization", "Content summarization", "Editorial calendar planning"];
      case AgentType.DOCUMENTATION_SPECIALIST:
        return ["API documentation", "Technical writing", "Documentation SEO optimization", "User guide creation"];
      case AgentType.CUSTOMER_SUPPORT_LEADER:
        return ["Customer inquiry handling", "Troubleshooting assistance", "Product usage guidance", "Customer satisfaction monitoring"];
      case AgentType.PRODUCT_LEADER:
        return ["Roadmap planning", "Feature prioritization", "Product strategy", "User experience optimization"];
      case AgentType.MARKET_RESEARCH_LEADER:
        return ["Market analysis", "Competitor tracking", "Trend identification", "Data-driven recommendations"];
      case AgentType.SALES_LEADER:
        return ["Sales strategy", "Pitch creation", "Cross-platform analysis", "Customer relationship management"];
      case AgentType.OPERATIONS_LEADER:
        return ["Process optimization", "Resource allocation", "Workflow management", "Operational efficiency"];
      default:
        return ["Basic capability"];
    }
  }

  /**
   * Get tool names for an agent type
   */
  private getAgentToolNames(agentType: AgentType): string[] {
    const toolkit = this.toolkits.get(agentType);
    if (!toolkit) {
      return [];
    }
    return toolkit.tools.map(tool => tool.id);
  }

  /**
   * Get the toolkit for a specific agent type
   */
  public getToolkit(agentType: AgentType): AgentToolkit | undefined {
    return this.toolkits.get(agentType);
  }

  /**
   * Create a new thought chain for tracking agent reasoning
   */
  public createThoughtChain(agentType: AgentType, input: string): string {
    const id = uuidv4();
    const thoughtChain: ThoughtChain = {
      id,
      timestamp: Date.now(),
      agentType,
      input,
      steps: [],
      conclusion: '',
      confidence: 0
    };
    
    this.thoughtChains.set(id, thoughtChain);
    return id;
  }

  /**
   * Add a step to an existing thought chain
   */
  public addThoughtStep(
    thoughtChainId: string, 
    thought: string, 
    reasoning: string, 
    action?: string,
    actionResult?: any
  ): void {
    const thoughtChain = this.thoughtChains.get(thoughtChainId);
    if (!thoughtChain) {
      throw new Error(`Thought chain not found: ${thoughtChainId}`);
    }
    
    const stepNumber = thoughtChain.steps.length + 1;
    thoughtChain.steps.push({
      step: stepNumber,
      thought,
      reasoning,
      action,
      actionResult
    });
    
    this.thoughtChains.set(thoughtChainId, thoughtChain);
  }

  /**
   * Complete a thought chain with conclusion and confidence
   */
  public completeThoughtChain(
    thoughtChainId: string,
    conclusion: string,
    confidence: number
  ): ThoughtChain {
    const thoughtChain = this.thoughtChains.get(thoughtChainId);
    if (!thoughtChain) {
      throw new Error(`Thought chain not found: ${thoughtChainId}`);
    }
    
    thoughtChain.conclusion = conclusion;
    thoughtChain.confidence = Math.max(0, Math.min(1, confidence)); // Ensure confidence is between 0-1
    
    this.thoughtChains.set(thoughtChainId, thoughtChain);
    return thoughtChain;
  }

  /**
   * Get a thought chain by ID
   */
  public getThoughtChain(thoughtChainId: string): ThoughtChain | undefined {
    return this.thoughtChains.get(thoughtChainId);
  }

  /**
   * Execute a specific tool for an agent
   */
  public async executeTool(
    agentType: AgentType,
    toolId: string,
    params: Record<string, any>,
    thoughtChainId?: string
  ): Promise<any> {
    const toolkit = this.toolkits.get(agentType);
    if (!toolkit) {
      throw new Error(`No toolkit found for agent type: ${agentType}`);
    }

    const tool = toolkit.tools.find(tool => tool.id === toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId} for agent type: ${agentType}`);
    }

    // Check if agent is allowed to use this tool
    if (!tool.allowedAgentTypes.includes(agentType)) {
      throw new Error(`Agent type ${agentType} is not authorized to use tool: ${toolId}`);
    }

    const startTime = Date.now();
    try {
      // Add thought step if thoughtChainId is provided
      if (thoughtChainId) {
        this.addThoughtStep(
          thoughtChainId,
          `Executing tool: ${tool.name}`,
          `The agent has determined that using the ${tool.name} tool will help accomplish the task. Parameters: ${JSON.stringify(params)}`,
          `Execute ${toolId}`
        );
      }
      
      const result = await tool.execute(params);
      
      // Update metrics for tool usage
      this.updateToolUsageMetrics(agentType, toolId, Date.now() - startTime, true);
      
      // Update thought chain with result if thoughtChainId is provided
      if (thoughtChainId) {
        const thoughtChain = this.thoughtChains.get(thoughtChainId);
        if (thoughtChain && thoughtChain.steps.length > 0) {
          const lastStep = thoughtChain.steps[thoughtChain.steps.length - 1];
          lastStep.actionResult = result;
          this.thoughtChains.set(thoughtChainId, thoughtChain);
        }
      }
      
      return result;
    } catch (error) {
      // Update metrics for failed tool usage
      this.updateToolUsageMetrics(agentType, toolId, Date.now() - startTime, false);
      
      // Update thought chain with error if thoughtChainId is provided
      if (thoughtChainId) {
        this.addThoughtStep(
          thoughtChainId,
          `Tool execution failed: ${tool.name}`,
          `The tool execution encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          `Error executing ${toolId}`,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
      
      throw error;
    }
  }

  /**
   * Add a memory for an agent
   */
  public addMemory(memory: Omit<AgentMemory, 'id' | 'createdAt'>, thoughtChainId?: string): string {
    const id = uuidv4();
    const fullMemory: AgentMemory = {
      ...memory,
      id,
      createdAt: Date.now()
    };

    this.memories.set(id, fullMemory);
    
    // Add thought step if thoughtChainId is provided
    if (thoughtChainId) {
      this.addThoughtStep(
        thoughtChainId,
        `Creating memory`,
        `The agent is storing information for future reference. Memory type: ${memory.memoryType}`,
        `Add memory`,
        { memoryId: id, tags: memory.tags }
      );
    }
    
    return id;
  }

  /**
   * Get a memory by its ID
   */
  public getMemory(id: string): AgentMemory | undefined {
    return this.memories.get(id);
  }

  /**
   * Get all memories for a specific agent
   */
  public getMemoriesForAgent(agentType: AgentType): AgentMemory[] {
    return Array.from(this.memories.values())
      .filter(memory => memory.agentType === agentType)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Remove expired memories
   */
  public cleanupExpiredMemories(): void {
    const now = Date.now();
    for (const [id, memory] of this.memories.entries()) {
      if (memory.expiresAt && memory.expiresAt < now) {
        this.memories.delete(id);
      }
    }
  }

  /**
   * Enable collaboration between agents with thought process tracking
   */
  public async collaborateWithAgents(
    sourceAgentType: AgentType,
    targetAgentTypes: AgentType[],
    message: string,
    context?: AgentContext,
    thoughtChainId?: string
  ): Promise<Record<AgentType, string>> {
    const results: Record<AgentType, string> = {};
    const { generateResponse } = useAI();
    
    // Add thought step if thoughtChainId is provided
    if (thoughtChainId) {
      this.addThoughtStep(
        thoughtChainId,
        `Collaborating with ${targetAgentTypes.join(', ')}`,
        `The agent is seeking input from other agent types to enhance its response quality. Message: ${message}`,
        `Collaborate`
      );
    }

    for (const targetAgent of targetAgentTypes) {
      try {
        // Create a new thought chain for the collaborating agent
        const collaborationThoughtChainId = this.createThoughtChain(
          targetAgent,
          `[COLLABORATION REQUEST] ${message}`
        );
        
        const collaborationMessage = `[COLLABORATIVE REQUEST FROM ${sourceAgentType}]: ${message}`;
        
        const response = await generateResponse(
          targetAgent, 
          [{ role: 'user', content: collaborationMessage }]
        );
        
        // Complete thought chain for collaboration
        this.completeThoughtChain(
          collaborationThoughtChainId,
          response,
          0.8 // Default confidence for collaborative responses
        );
        
        results[targetAgent] = response;
        
        // Track collaboration metrics
        this.updateCollaborationMetrics(sourceAgentType, targetAgent);
        
        // Update source agent thought chain with the collaboration result
        if (thoughtChainId) {
          const collaborationThoughtChain = this.getThoughtChain(collaborationThoughtChainId);
          if (collaborationThoughtChain) {
            this.addThoughtStep(
              thoughtChainId,
              `Received response from ${targetAgent}`,
              `The ${targetAgent} agent has provided insights that can be incorporated into the final response.`,
              `Process collaboration`,
              {
                collaboratorType: targetAgent,
                response,
                thoughtProcess: collaborationThoughtChain
              }
            );
          }
        }
      } catch (error) {
        results[targetAgent] = `Error: Failed to collaborate with ${targetAgent}`;
        
        // Update source agent thought chain with the collaboration failure
        if (thoughtChainId) {
          this.addThoughtStep(
            thoughtChainId,
            `Collaboration with ${targetAgent} failed`,
            `There was an error when attempting to collaborate with the ${targetAgent} agent.`,
            `Handle collaboration error`,
            { error: error instanceof Error ? error.message : 'Unknown error' }
          );
        }
      }
    }

    return results;
  }

  /**
   * Track agent metrics and update statistics
   */
  private updateToolUsageMetrics(
    agentType: AgentType, 
    toolId: string, 
    executionTime: number,
    successful: boolean
  ): void {
    const metrics = this.getMetricsForAgent(agentType);
    
    if (!metrics.metadata?.toolUsage) {
      metrics.metadata = {
        ...metrics.metadata,
        toolUsage: {}
      };
    }
    
    if (!metrics.metadata.toolUsage[toolId]) {
      metrics.metadata.toolUsage[toolId] = {
        totalExecutions: 0,
        successfulExecutions: 0,
        averageExecutionTime: 0,
        totalExecutionTime: 0
      };
    }
    
    const toolMetrics = metrics.metadata.toolUsage[toolId];
    toolMetrics.totalExecutions += 1;
    
    if (successful) {
      toolMetrics.successfulExecutions += 1;
    }
    
    toolMetrics.totalExecutionTime += executionTime;
    toolMetrics.averageExecutionTime = 
      toolMetrics.totalExecutionTime / toolMetrics.totalExecutions;
    
    this.metrics.set(agentType, metrics);
  }

  /**
   * Update collaboration metrics between agents
   */
  private updateCollaborationMetrics(sourceAgent: AgentType, targetAgent: AgentType): void {
    const sourceMetrics = this.getMetricsForAgent(sourceAgent);
    
    if (!sourceMetrics.metadata?.collaborations) {
      sourceMetrics.metadata = {
        ...sourceMetrics.metadata,
        collaborations: {}
      };
    }
    
    if (!sourceMetrics.metadata.collaborations[targetAgent]) {
      sourceMetrics.metadata.collaborations[targetAgent] = 0;
    }
    
    sourceMetrics.metadata.collaborations[targetAgent] += 1;
    this.metrics.set(sourceAgent, sourceMetrics);
  }

  /**
   * Get metrics for a specific agent
   */
  private getMetricsForAgent(agentType: AgentType): AgentMetrics {
    if (!this.metrics.has(agentType)) {
      this.metrics.set(agentType, {
        totalInteractions: 0,
        successfulInteractions: 0,
        averageResponseTime: 0,
        errorRate: 0,
        lastActive: new Date().toISOString(),
        tokenUsage: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          total: 0
        },
        costEstimate: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          total: 0
        },
        popularTopics: [],
        metadata: {
          toolUsage: {},
          collaborations: {}
        }
      });
    }
    
    return this.metrics.get(agentType)!;
  }

  /**
   * Update cost and token usage statistics for an agent
   */
  public updateTokenUsage(
    agentType: AgentType,
    model: string,
    promptTokens: number,
    responseTokens: number
  ): void {
    const metrics = this.getMetricsForAgent(agentType);
    const totalTokens = promptTokens + responseTokens;
    
    // Update token usage
    metrics.tokenUsage.daily += totalTokens;
    metrics.tokenUsage.weekly += totalTokens;
    metrics.tokenUsage.monthly += totalTokens;
    metrics.tokenUsage.total += totalTokens;
    
    // Calculate cost if price for model is known
    const tokenPrice = this.tokenPrices[model] || 0.00015; // default to gpt-4o-mini price
    const cost = totalTokens * tokenPrice;
    
    // Update cost estimates
    metrics.costEstimate.daily += cost;
    metrics.costEstimate.weekly += cost;
    metrics.costEstimate.monthly += cost;
    metrics.costEstimate.total += cost;
    
    this.metrics.set(agentType, metrics);
  }

  /**
   * Reset daily usage statistics (should be called at the end of each day)
   */
  public resetDailyStats(): void {
    for (const [agentType, metrics] of this.metrics.entries()) {
      metrics.tokenUsage.daily = 0;
      metrics.costEstimate.daily = 0;
      this.metrics.set(agentType, metrics);
    }
  }

  /**
   * Reset weekly usage statistics (should be called at the end of each week)
   */
  public resetWeeklyStats(): void {
    for (const [agentType, metrics] of this.metrics.entries()) {
      metrics.tokenUsage.weekly = 0;
      metrics.costEstimate.weekly = 0;
      this.metrics.set(agentType, metrics);
    }
  }

  /**
   * Reset monthly usage statistics (should be called at the end of each month)
   */
  public resetMonthlyStats(): void {
    for (const [agentType, metrics] of this.metrics.entries()) {
      metrics.tokenUsage.monthly = 0;
      metrics.costEstimate.monthly = 0;
      this.metrics.set(agentType, metrics);
    }
  }

  /**
   * Get all thought chains for a specific agent
   */
  public getThoughtChainsForAgent(agentType: AgentType): ThoughtChain[] {
    return Array.from(this.thoughtChains.values())
      .filter(chain => chain.agentType === agentType)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear old thought chains to prevent memory bloat
   * Keeps only the most recent chains up to a specified limit
   */
  public pruneThoughtChains(maxChainsPerAgent: number = 20): void {
    // Group chains by agent type
    const chainsByAgent = new Map<AgentType, ThoughtChain[]>();
    
    for (const chain of this.thoughtChains.values()) {
      if (!chainsByAgent.has(chain.agentType)) {
        chainsByAgent.set(chain.agentType, []);
      }
      chainsByAgent.get(chain.agentType)!.push(chain);
    }
    
    // For each agent type, sort by timestamp and keep only the most recent ones
    for (const [agentType, chains] of chainsByAgent.entries()) {
      if (chains.length > maxChainsPerAgent) {
        // Sort by timestamp (newest first)
        chains.sort((a, b) => b.timestamp - a.timestamp);
        
        // Remove older chains
        const chainsToRemove = chains.slice(maxChainsPerAgent);
        for (const chain of chainsToRemove) {
          this.thoughtChains.delete(chain.id);
        }
      }
    }
  }

  /**
   * Create toolkit for Product Leader agent
   */
  private createProductLeaderToolkit(): AgentToolkit {
    return {
      agentType: AgentType.PRODUCT_LEADER,
      tools: [
        {
          id: 'product-roadmap-generator',
          name: 'Product Roadmap Generator',
          description: 'Generates product roadmap based on market trends and business goals',
          functionType: AgentFunctionType.REPORT_GENERATION,
          requiresAuth: true,
          allowedAgentTypes: [AgentType.PRODUCT_LEADER, AgentType.OPERATIONS_LEADER],
          execute: async (params) => {
            // Implementation for generating product roadmap
            return {
              roadmap: 'Generated roadmap would go here',
              timeline: 'Q1 2023 - Q4 2024',
              key_milestones: ['Milestone 1', 'Milestone 2']
            };
          }
        },
        {
          id: 'feature-prioritization',
          name: 'Feature Prioritization Framework',
          description: 'Analyzes and prioritizes features based on impact vs effort',
          functionType: AgentFunctionType.DATA_ANALYSIS,
          requiresAuth: true,
          allowedAgentTypes: [AgentType.PRODUCT_LEADER],
          execute: async (params) => {
            // Implementation for feature prioritization
            return {
              high_impact_low_effort: ['Feature A', 'Feature B'],
              high_impact_high_effort: ['Feature C'],
              low_impact_low_effort: ['Feature D'],
              low_impact_high_effort: ['Feature E']
            };
          }
        }
      ]
    };
  }

  /**
   * Create toolkit for Customer Support agent
   */
  private createCustomerSupportToolkit(): AgentToolkit {
    return {
      agentType: AgentType.CUSTOMER_SUPPORT_LEADER,
      tools: [
        {
          id: 'customer-sentiment-analyzer',
          name: 'Customer Sentiment Analyzer',
          description: 'Analyzes customer feedback to determine sentiment and key issues',
          functionType: AgentFunctionType.SENTIMENT_ANALYSIS,
          requiresAuth: true,
          allowedAgentTypes: [AgentType.CUSTOMER_SUPPORT_LEADER, AgentType.SALES_LEADER],
          execute: async (params) => {
            // Implementation for sentiment analysis
            return {
              sentiment: 'positive',
              score: 0.8,
              key_topics: ['ease of use', 'responsive support', 'pricing']
            };
          }
        },
        {
          id: 'support-response-generator',
          name: 'Support Response Generator',
          description: 'Generates helpful customer support responses based on query and context',
          functionType: AgentFunctionType.CONTENT_CREATION,
          requiresAuth: false,
          allowedAgentTypes: [AgentType.CUSTOMER_SUPPORT_LEADER],
          execute: async (params) => {
            // Implementation for response generation
            return {
              response: 'Thank you for reaching out. I understand your concern about...',
              suggested_actions: ['Follow up in 24 hours', 'Escalate to tier 2 if no resolution']
            };
          }
        }
      ]
    };
  }

  /**
   * Create toolkit for Market Research agent
   */
  private createMarketResearchToolkit(): AgentToolkit {
    return {
      agentType: AgentType.MARKET_RESEARCH_LEADER,
      tools: [
        {
          id: 'market-trend-analyzer',
          name: 'Market Trend Analyzer',
          description: 'Analyzes current market trends based on available data',
          functionType: AgentFunctionType.MARKET_RESEARCH,
          requiresAuth: true,
          allowedAgentTypes: [AgentType.MARKET_RESEARCH_LEADER, AgentType.PRODUCT_LEADER],
          execute: async (params) => {
            // Implementation for market trend analysis
            return {
              trends: ['Remote work tools', 'AI integration', 'Security focus'],
              growth_rates: {
                'Remote work tools': '12% YoY',
                'AI integration': '32% YoY',
                'Security focus': '18% YoY'
              }
            };
          }
        },
        {
          id: 'competitor-analysis',
          name: 'Competitor Analysis Tool',
          description: 'Analyzes competitor strengths, weaknesses, and market positioning',
          functionType: AgentFunctionType.DATA_ANALYSIS,
          requiresAuth: true,
          allowedAgentTypes: [AgentType.MARKET_RESEARCH_LEADER],
          execute: async (params) => {
            // Implementation for competitor analysis
            return {
              competitors: [
                {
                  name: 'Competitor A',
                  strengths: ['Market leader', 'Strong brand'],
                  weaknesses: ['High pricing', 'Poor customer support']
                },
                {
                  name: 'Competitor B',
                  strengths: ['Innovative features', 'Low pricing'],
                  weaknesses: ['Limited market reach', 'New entrant']
                }
              ]
            };
          }
        }
      ]
    };
  }

  /**
   * Create toolkit for Operations agent
   */
  private createOperationsToolkit(): AgentToolkit {
    return {
      agentType: AgentType.OPERATIONS_LEADER,
      tools: [
        {
          id: 'process-optimization',
          name: 'Process Optimization Tool',
          description: 'Identifies bottlenecks and suggests process improvements',
          functionType: AgentFunctionType.PROCESS_OPTIMIZATION,
          requiresAuth: true,
          allowedAgentTypes: [AgentType.OPERATIONS_LEADER],
          execute: async (params) => {
            // Implementation for process optimization
            return {
              bottlenecks: ['Customer onboarding', 'Support ticket routing'],
              recommendations: [
                'Automate customer onboarding with guided setup wizard',
                'Implement AI-based ticket categorization and routing'
              ]
            };
          }
        }
      ]
    };
  }

  /**
   * Create toolkit for Sales agent
   */
  private createSalesToolkit(): AgentToolkit {
    return {
      agentType: AgentType.SALES_LEADER,
      tools: [
        {
          id: 'sales-pitch-generator',
          name: 'Sales Pitch Generator',
          description: 'Creates personalized sales pitches based on client data',
          functionType: AgentFunctionType.CONTENT_CREATION,
          requiresAuth: false,
          allowedAgentTypes: [AgentType.SALES_LEADER],
          execute: async (params) => {
            // Implementation for sales pitch generation
            return {
              pitch: 'Based on your company\'s focus on scalability and security...',
              key_selling_points: [
                'Enterprise-grade security with SOC2 compliance',
                'Scales to 100,000+ users without performance degradation'
              ]
            };
          }
        },
        {
          id: 'cross-platform-analysis',
          name: 'Cross-Platform Analysis Tool',
          description: 'Analyzes e-commerce platform differences to provide sales guidance',
          functionType: AgentFunctionType.CROSS_PLATFORM_ANALYSIS,
          requiresAuth: true,
          allowedAgentTypes: [AgentType.SALES_LEADER, AgentType.MARKET_RESEARCH_LEADER],
          execute: async (params) => {
            // Implementation for cross-platform analysis
            return {
              platform_comparison: {
                'Shopify': { strengths: ['Ease of use', 'App ecosystem'], weaknesses: ['Enterprise limitations', 'Transaction fees'] },
                'WooCommerce': { strengths: ['Customizability', 'One-time cost'], weaknesses: ['Technical complexity', 'Self-hosting'] },
                'DropConnect': { strengths: ['Cross-platform integration', 'Advanced analytics'], weaknesses: ['New platform', 'Limited integrations'] }
              },
              recommended_pitch_focus: 'Emphasize DropConnect\'s cross-platform capabilities and analytics'
            };
          }
        }
      ]
    };
  }

  /**
   * Create toolkit for Documentation Specialist
   */
  private createDocumentationToolkit(): AgentToolkit {
    return {
      agentType: AgentType.DOCUMENTATION_SPECIALIST,
      tools: [
        {
          id: 'documentation-generator',
          name: 'Documentation Generator',
          description: 'Creates technical documentation from provided specifications',
          functionType: AgentFunctionType.DOCUMENTATION_CREATION,
          requiresAuth: false,
          allowedAgentTypes: [AgentType.DOCUMENTATION_SPECIALIST],
          execute: async (params) => {
            // Implementation for documentation generation
            return {
              documentation: '# API Documentation\n\n## Endpoints\n\n### GET /api/v1/products\n\n...',
              sections: ['Introduction', 'API Reference', 'Examples', 'Troubleshooting']
            };
          }
        },
        {
          id: 'docs-seo-optimizer',
          name: 'Documentation SEO Optimizer',
          description: 'Optimizes documentation content for search engines',
          functionType: AgentFunctionType.SEO_OPTIMIZATION,
          requiresAuth: false,
          allowedAgentTypes: [AgentType.DOCUMENTATION_SPECIALIST, AgentType.BLOG_CONTENT_CREATOR],
          execute: async (params) => {
            // Implementation for SEO optimization
            return {
              optimized_keywords: ['DropConnect API integration', 'e-commerce platform integration'],
              meta_description: 'Learn how to integrate DropConnect with your e-commerce platform easily using our well-documented API.',
              recommended_headings: ['Getting Started with DropConnect API', 'Step-by-Step Integration Guide']
            };
          }
        }
      ]
    };
  }

  /**
   * Create toolkit for Blog Content Creator
   */
  private createContentCreatorToolkit(): AgentToolkit {
    return {
      agentType: AgentType.BLOG_CONTENT_CREATOR,
      tools: [
        {
          id: 'blog-post-generator',
          name: 'Blog Post Generator',
          description: 'Creates engaging blog content on specified topics',
          functionType: AgentFunctionType.CONTENT_CREATION,
          requiresAuth: false,
          allowedAgentTypes: [AgentType.BLOG_CONTENT_CREATOR],
          execute: async (params) => {
            // Implementation for blog post generation
            return {
              title: '5 Ways DropConnect Transforms Cross-Platform E-commerce',
              sections: [
                { heading: 'Introduction', content: 'In today\'s fragmented e-commerce landscape...' },
                { heading: 'Challenge 1: Inventory Synchronization', content: '...' }
              ],
              suggested_tags: ['e-commerce', 'integration', 'inventory management']
            };
          }
        },
        {
          id: 'content-summarizer',
          name: 'Content Summarizer',
          description: 'Summarizes long-form content into concise snippets',
          functionType: AgentFunctionType.SUMMARIZATION,
          requiresAuth: false,
          allowedAgentTypes: [
            AgentType.BLOG_CONTENT_CREATOR, 
            AgentType.DOCUMENTATION_SPECIALIST,
            AgentType.MARKET_RESEARCH_LEADER
          ],
          execute: async (params) => {
            // Implementation for content summarization
            return {
              summary: 'This article explores how DropConnect solves key e-commerce challenges across multiple platforms, focusing on inventory synchronization, order management, and data analytics.',
              key_points: [
                'Unified inventory management across platforms',
                'Centralized order processing',
                'Cross-platform analytics'
              ]
            };
          }
        }
      ]
    };
  }
}

// Replace hardcoded agent type checks with enum values
const leadershipRoles = new Map<AgentType, AgentType[]>([
  [AgentType.QUALITY_CONTROL, [AgentType.INVENTORY_MANAGEMENT, AgentType.SUPPLIER_COMMUNICATION]],
  [AgentType.MARKET_ANALYSIS, [AgentType.PRICING_OPTIMIZATION, AgentType.CUSTOMER_SERVICE]],
  [AgentType.CODE_MAINTENANCE, [AgentType.QUALITY_CONTROL, AgentType.ORDER_PROCESSING]]
]);

// Fix system function types
const systemFunctions: Record<AgentFunctionType, (params: Record<string, any>) => Promise<any>> = {
  [AgentFunctionType.DATA_ANALYSIS]: async (params: Record<string, any>) => {
    // Implementation
    return {};
  },
  // Add other system functions as needed
};

// Fix metrics update 
const updateMetrics = async (agentId: string, metrics: AgentMetrics): Promise<void> => {
  const toolUsage = metrics.metadata?.toolUsage ?? {};
  const collaborations = metrics.metadata?.collaborations ?? {};
  
  await prisma.agentMetrics.update({
    where: { agentId },
    data: {
      totalInteractions: metrics.totalInteractions,
      successfulInteractions: metrics.successfulInteractions,
      averageResponseTime: metrics.averageResponseTime,
      errorRate: metrics.errorRate,
      metadata: {
        toolUsage,
        collaborations
      }
    }
  });
};

// Fix collaboration tracking
const trackCollaboration = (sourceMetrics: AgentMetrics, targetAgentType: AgentType): void => {
  if (!sourceMetrics.metadata) {
    sourceMetrics.metadata = {
      toolUsage: {},
      collaborations: {}
    };
  }

  if (!sourceMetrics.metadata.collaborations) {
    sourceMetrics.metadata.collaborations = {};
  }
  
  sourceMetrics.metadata.collaborations[targetAgentType] = 
    (sourceMetrics.metadata.collaborations[targetAgentType] ?? 0) + 1;
};

export { AgentManager };