import type { Task, AgentResponse, AgentMessage } from '../types';
import { AgentMonitor } from './AgentMonitor';
import { CircuitBreaker } from './CircuitBreaker';
import type { AgentType } from '@prisma/client';
import OpenAI from 'openai';
import { EventEmitter } from 'events';

export interface AgentConfig {
  name: string;
  type: AgentType;
  maxRetries?: number;
  baseDelay?: number;
  capabilities?: string[];
  description?: string;
  group?: string;
}

export interface AgentStatus {
  level: number;
  points: number;
  achievements: string[];
  availableRewards: string[];
  circuitBreakerMetrics?: {
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
  };
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected name: string;
  private taskQueue: Task[] = [];
  private currentTask: Task | null = null;
  protected readonly circuitBreaker: CircuitBreaker;
  protected readonly monitor: AgentMonitor;
  protected messageHandlers: Map<string, (message: AgentMessage) => Promise<void>>;
  protected openai: OpenAI;
  protected knowledgeBase: Map<string, any>;
  protected collaborators: Set<string>;
  protected taskResults: Map<string, AgentResponse>;
  protected eventBus: EventEmitter;
  private isInitialized: boolean = false;
  private abortController: AbortController | null = null;
  canHandle: any;

  /**
   * Handle a message from a user or another agent
   */
  abstract handleMessage(message: AgentMessage): Promise<AgentResponse>;

  constructor(config: AgentConfig) {
    this.config = {
      ...config,
      maxRetries: config.maxRetries || 3,
      baseDelay: config.baseDelay || 1000
    };
    this.name = config.name;
    this.circuitBreaker = new CircuitBreaker();
    this.monitor = new AgentMonitor();
    this.messageHandlers = new Map();
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true
    });
    this.knowledgeBase = new Map();
    this.collaborators = new Set();
    this.taskResults = new Map();
    this.eventBus = new EventEmitter();
    this.eventBus.setMaxListeners(100);
  }

  /**
   * Initialize the agent
   */
  async initialize(context?: Record<string, any>): Promise<void> {
    if (this.isInitialized) {
      await this.cleanup();
    }

    try {
      // Create new abort controller
      this.abortController = new AbortController();

      // Reset state
      this.taskQueue = [];
      this.currentTask = null;
      this.taskResults.clear();
      this.collaborators.clear();
      
      // Initialize monitoring
      this.monitor.monitorAgent(this.config.name, this.config.type);
      
      // Register message handlers
      this.initializeMessageHandlers();

      // Load initial context if provided
      if (context) {
        for (const [key, value] of Object.entries(context)) {
          this.knowledgeBase.set(key, value);
        }
      }

      this.isInitialized = true;
      this.monitor.recordEvent(this.config.name, 'agent_initialized', { timestamp: Date.now() });
    } catch (error) {
      this.monitor.recordError(this.config.name, error as Error);
      throw error;
    }
  }

  /**
   * Clean up agent resources
   */
  async cleanup(): Promise<void> {
    try {
      // Cancel any ongoing operations
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }

      // Clear task queue and current task
      this.taskQueue = [];
      this.currentTask = null;

      // Clean up event listeners
      this.eventBus.removeAllListeners();

      // Save any pending state
      await this.saveState();

      // Clear all internal state
      this.taskResults.clear();
      this.knowledgeBase.clear();
      this.collaborators.clear();
      this.messageHandlers.clear();

      this.isInitialized = false;
      this.monitor.recordEvent(this.config.name, 'agent_cleanup_completed', { timestamp: Date.now() });
    } catch (error) {
      this.monitor.recordError(this.config.name, error as Error);
      console.error(`Error during cleanup for agent ${this.name}:`, error);
    }
  }

  /**
   * Cancel ongoing tasks
   */
  async cancelTasks(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.taskQueue = [];
    this.currentTask = null;
  }

  /**
   * Save agent state
   */
  async saveState(): Promise<void> {
    try {
      const state = {
        knowledgeBase: Array.from(this.knowledgeBase.entries()),
        taskResults: Array.from(this.taskResults.entries()),
        collaborators: Array.from(this.collaborators),
        timestamp: new Date().toISOString()
      };

      // Store state in monitor for recovery
      this.monitor.recordState(this.config.name, state);
    } catch (error) {
      this.monitor.recordError(this.config.name, error as Error);
      console.error(`Error saving state for agent ${this.name}:`, error);
    }
  }

  abstract executeTask(task: Task): Promise<AgentResponse>;

  /**
   * Analyze a task to determine if this agent can handle it
   */
  async analyzeTask(task: Task): Promise<AgentResponse> {
    if (!this.circuitBreaker.canPass()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const analysis = await this.executeTaskAnalysis(task);
      this.circuitBreaker.recordSuccess();
      this.monitor.recordSuccess(this.config.name);
      return analysis;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      this.monitor.recordError(this.config.name, error as Error);
      throw error;
    }
  }

  /**
   * Receive a message from another agent
   */
  async receiveMessage(message: AgentMessage): Promise<void> {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      try {
        await handler(message);
        this.monitor.recordSuccess(this.config.name);
        
        // Add sender to collaborators
        if (message.agentId && message.agentId !== this.name) {
          this.collaborators.add(message.agentId);
        }
      } catch (error) {
        this.monitor.recordError(this.config.name, error as Error);
        throw error;
      }
    }
  }

  /**
   * Send a chat message to the LLM
   */
  protected async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }>, 
    options?: { model?: string, temperature?: number }
  ): Promise<string> {
    if (!this.circuitBreaker.canPass()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        messages,
        model: options?.model ?? "gpt-4",
        temperature: options?.temperature ?? 0.7
      });
      
      const responseText = completion.choices[0]?.message?.content ?? '';
      
      if (!responseText) {
        throw new Error('No response from AI');
      }
      
      this.circuitBreaker.recordSuccess();
      this.monitor.recordSuccess(this.config.name);
      
      return responseText;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      this.monitor.recordError(this.config.name, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Handle an error during task execution
   */
  protected handleError(error: Error | unknown): AgentResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    this.monitor.recordError(this.config.name, error instanceof Error ? error : new Error(errorMessage));
    
    return {
      success: false,
      data: null,
      error: errorMessage,
      metadata: {
        confidence: 0,
        processingTime: 0,
        modelUsed: this.config.name
      }
    };
  }

  /**
   * Assign a task to this agent
   */
  async assignTask(task: Task): Promise<void> {
    this.taskQueue.push(task);
    if (!this.currentTask) {
      await this.processNextTask();
    }
  }

  /**
   * Get the result of a completed task
   */
  async getTaskResult(taskId: string): Promise<AgentResponse> {
    const result = this.taskResults.get(taskId);
    if (!result) {
      return {
        success: false,
        data: null,
        error: `Task ${taskId} not found or not completed`,
        metadata: {
          confidence: 0,
          processingTime: 0,
          modelUsed: this.config.name
        }
      };
    }
    return result;
  }

  /**
   * Get the agent's current status
   */
  getStatus(): AgentStatus {
    return {
      level: 1,
      points: 0,
      achievements: [],
      availableRewards: [],
      circuitBreakerMetrics: this.circuitBreaker.getMetrics()
    };
  }

  /**
   * Get the agent's name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get the agent's configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Get the agent's capabilities
   */
  getCapabilities(): string[] {
    return this.config.capabilities || [];
  }

  /**
   * Get the agent's type
   */
  getType(): AgentType {
    return this.config.type;
  }

  /**
   * Get the agent's group
   */
  getGroup(): string {
    return this.config.group || 'default';
  }

  /**
   * Get the agent's collaborators
   */
  getCollaborators(): string[] {
    return Array.from(this.collaborators);
  }

  /**
   * Process the next task in the queue
   */
  protected async processNextTask(): Promise<void> {
    if (this.taskQueue.length === 0 || this.currentTask) {
      return;
    }

    this.currentTask = this.taskQueue.shift() || null;
    if (!this.currentTask) return;

    try {
      if (this.circuitBreaker.canPass()) {
        const result = await this.executeTask(this.currentTask);
        this.taskResults.set(this.currentTask.id, result);
        this.circuitBreaker.recordSuccess();
        this.monitor.recordSuccess(this.config.name);
      } else {
        throw new Error('Circuit breaker is open');
      }
    } catch (error) {
      this.circuitBreaker.recordFailure();
      this.monitor.recordError(this.config.name, error as Error);
      
      // Store the error result
      if (this.currentTask) {
        this.taskResults.set(this.currentTask.id, this.handleError(error));
      }
    } finally {
      this.currentTask = null;
      await this.processNextTask();
    }
  }

  /**
   * Execute task analysis
   */
  private async executeTaskAnalysis(task: Task): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      const analysisPrompt = [
        {
          role: 'system' as const,
          content: `You are ${this.config.name}, a specialized AI agent with the following capabilities: ${this.config.capabilities?.join(', ') || 'general assistance'}. 
                   Analyze the following task and provide your assessment of whether you can handle it, and if so, how confident you are.
                   Respond with a JSON object containing: { "canHandle": boolean, "confidence": number (0-1), "reasoning": string }`
        },
        {
          role: 'user' as const,
          content: JSON.stringify(task)
        }
      ];

      const response = await this.chat(analysisPrompt);
      let parsedResponse;
      
      try {
        parsedResponse = response ? JSON.parse(response) : null;
      } catch (e) {
        // If response is not valid JSON, create a structured response
        parsedResponse = {
          canHandle: response?.includes('yes') || response?.includes('can handle') || false,
          confidence: response?.includes('high confidence') ? 0.9 : 
                     response?.includes('medium confidence') ? 0.6 : 0.3,
          reasoning: response || 'No reasoning provided'
        };
      }
      
      return {
        success: true,
        data: parsedResponse,
        metadata: {
          confidence: parsedResponse?.confidence || 0.5,
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4'
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Initialize message handlers
   */
  private initializeMessageHandlers(): void {
    this.messageHandlers.set('knowledge_update', async (message: AgentMessage) => {
      // Handle knowledge updates from other agents
      try {
        const content = typeof message.content === 'string' ? 
          JSON.parse(message.content) : message.content;
        
        // Store in knowledge base
        const key = `knowledge:${message.agentId}:${Date.now()}`;
        this.knowledgeBase.set(key, {
          source: message.agentId,
          timestamp: message.timestamp,
          data: content
        });
        
        // Process the knowledge
        const analysisPrompt = [
          {
            role: 'system' as const,
            content: `You are ${this.config.name}. Process this knowledge update from ${message.agentId} and determine its relevance to your tasks.`
          },
          {
            role: 'user' as const,
            content: JSON.stringify(content)
          }
        ];

        await this.chat(analysisPrompt);
      } catch (error) {
        console.error('Error processing knowledge update:', error);
      }
    });

    this.messageHandlers.set('collaboration_request', async (message: AgentMessage) => {
      // Handle collaboration requests
      try {
        const content = typeof message.content === 'string' ? 
          JSON.parse(message.content) : message.content;
        
        // Add to collaborators
        if (message.agentId) {
          this.collaborators.add(message.agentId);
        }
        
        // Process the request
        const analysisPrompt = [
          {
            role: 'system' as const,
            content: `You are ${this.config.name}. ${message.agentId} is requesting collaboration on a task. Evaluate if you can assist.`
          },
          {
            role: 'user' as const,
            content: JSON.stringify(content)
          }
        ];

        await this.chat(analysisPrompt);
      } catch (error) {
        console.error('Error processing collaboration request:', error);
      }
    });

    // Add more message handlers as needed
  }

  /**
   * Process a message with the LLM
   */
  protected async processMessage(message: string, context?: Record<string, unknown>): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: `You are ${this.config.name}, an AI agent with the following capabilities: ${this.config.capabilities?.join(', ') || 'general assistance'}.` +
                    (context ? ` Context: ${JSON.stringify(context)}` : '')
          },
          { role: "user", content: message }
        ],
        model: "gpt-3.5-turbo"
      });
      
      const responseText = completion.choices[0]?.message?.content || '';
      return responseText;
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }
}
