import { AgentConfig, AgentStatus, AgentCapability } from './types';
import { CircuitBreaker } from './CircuitBreaker';
import { AgentMonitor } from './AgentMonitor';
import { AgentMemory } from './AgentMemory';
import { MessageBus } from './MessageBus';
import { Task, AgentMessage, AgentResponse } from '../types';
import OpenAI from 'openai';
import { LLMProvider } from './LLMProvider';

/**
 * Base Agent class that provides core functionality for all agents
 */
export abstract class Agent {
  protected readonly config: AgentConfig;
  protected readonly circuitBreaker: CircuitBreaker;
  protected readonly monitor: AgentMonitor;
  protected readonly memory: AgentMemory;
  protected readonly messageBus: MessageBus;
  protected readonly llmProvider: LLMProvider;
  
  private taskQueue: Task[] = [];
  private currentTask: Task | null = null;
  private messageHandlers: Map<string, Function> = new Map();
  private capabilities: Set<AgentCapability> = new Set();

  constructor(config: AgentConfig, messageBus: MessageBus) {
    this.config = config;
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: config.failureThreshold || 5,
      resetTimeout: config.resetTimeout || 30000
    });
    this.monitor = new AgentMonitor(config.name);
    this.memory = new AgentMemory(config.name);
    this.messageBus = messageBus;
    this.llmProvider = new LLMProvider(config.defaultModel || 'gpt-4');
    
    // Register capabilities
    if (config.capabilities) {
      config.capabilities.forEach(capability => this.capabilities.add(capability));
    }
    
    // Register for messages
    this.messageBus.subscribe(this.config.name, this.handleMessage.bind(this));
    this.registerDefaultMessageHandlers();
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    await this.memory.initialize();
    this.monitor.recordEvent('agent_initialized', { agentName: this.config.name });
    console.log(`Agent ${this.config.name} initialized`);
  }

  /**
   * Execute a task - must be implemented by derived classes
   */
  abstract executeTask(task: Task): Promise<AgentResponse>;

  /**
   * Check if the agent has a specific capability
   */
  hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.has(capability);
  }

  /**
   * Add a capability to the agent
   */
  addCapability(capability: AgentCapability): void {
    this.capabilities.add(capability);
  }

  /**
   * Get the agent's current status
   */
  getStatus(): AgentStatus {
    return {
      name: this.config.name,
      type: this.config.type,
      health: this.circuitBreaker.isOpen() ? 'degraded' : 'healthy',
      capabilities: Array.from(this.capabilities),
      metrics: {
        taskCount: this.monitor.getMetric('taskCount') || 0,
        successRate: this.monitor.getMetric('successRate') || 100,
        averageResponseTime: this.monitor.getMetric('averageResponseTime') || 0,
        lastActive: this.monitor.getMetric('lastActive') || Date.now()
      },
      circuitBreakerState: this.circuitBreaker.getState()
    };
  }

  /**
   * Assign a task to the agent
   */
  async assignTask(task: Task): Promise<void> {
    this.taskQueue.push(task);
    this.monitor.recordEvent('task_assigned', { taskId: task.id });
    
    if (!this.currentTask) {
      await this.processNextTask();
    }
  }

  /**
   * Send a message to another agent
   */
  async sendMessage(targetAgent: string, type: string, content: any, metadata?: Record<string, any>): Promise<void> {
    const message: AgentMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      content,
      metadata: metadata || {},
      sender: this.config.name,
      timestamp: Date.now()
    };
    
    await this.messageBus.publish(targetAgent, message);
    this.monitor.recordEvent('message_sent', { 
      targetAgent, 
      messageType: type 
    });
  }

  /**
   * Broadcast a message to all agents
   */
  async broadcastMessage(type: string, content: any, metadata?: Record<string, any>): Promise<void> {
    const message: AgentMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      content,
      metadata: metadata || {},
      sender: this.config.name,
      timestamp: Date.now()
    };
    
    await this.messageBus.broadcast(message);
    this.monitor.recordEvent('message_broadcast', { messageType: type });
  }

  /**
   * Register a message handler
   */
  registerMessageHandler(messageType: string, handler: (message: AgentMessage) => Promise<void>): void {
    this.messageHandlers.set(messageType, handler);
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

    const startTime = Date.now();
    this.monitor.recordEvent('task_started', { 
      taskId: this.currentTask.id,
      taskType: this.currentTask.type 
    });

    try {
      if (!this.circuitBreaker.canPass()) {
        throw new Error(`Circuit breaker is open for agent ${this.config.name}`);
      }

      const result = await this.executeTask(this.currentTask);
      
      this.circuitBreaker.recordSuccess();
      this.monitor.recordEvent('task_completed', {
        taskId: this.currentTask.id,
        success: result.success,
        duration: Date.now() - startTime
      });
      
      // Store task result in memory if successful
      if (result.success) {
        await this.memory.storeTaskResult(this.currentTask.id, result);
      }
      
    } catch (error) {
      this.circuitBreaker.recordFailure();
      this.monitor.recordEvent('task_failed', {
        taskId: this.currentTask.id,
        error: (error as Error).message,
        duration: Date.now() - startTime
      });
    } finally {
      this.currentTask = null;
      await this.processNextTask();
    }
  }

  /**
   * Handle an incoming message
   */
  private async handleMessage(message: AgentMessage): Promise<void> {
    const handler = this.messageHandlers.get(message.type);
    
    if (handler) {
      try {
        this.monitor.recordEvent('message_received', { 
          messageType: message.type,
          sender: message.sender 
        });
        
        await handler(message);
        
        this.monitor.recordEvent('message_processed', { 
          messageType: message.type,
          sender: message.sender 
        });
      } catch (error) {
        this.monitor.recordEvent('message_processing_failed', {
          messageType: message.type,
          sender: message.sender,
          error: (error as Error).message
        });
      }
    } else {
      this.monitor.recordEvent('unknown_message_type', { 
        messageType: message.type,
        sender: message.sender 
      });
    }
  }

  /**
   * Register default message handlers
   */
  private registerDefaultMessageHandlers(): void {
    // Handle knowledge updates
    this.registerMessageHandler('knowledge_update', async (message: AgentMessage) => {
      await this.memory.storeKnowledge(message.content);
    });
    
    // Handle status requests
    this.registerMessageHandler('status_request', async (message: AgentMessage) => {
      const status = this.getStatus();
      await this.sendMessage(message.sender, 'status_response', status);
    });
    
    // Handle capability queries
    this.registerMessageHandler('capability_query', async (message: AgentMessage) => {
      const capabilities = Array.from(this.capabilities);
      await this.sendMessage(message.sender, 'capability_response', capabilities);
    });
  }

  /**
   * Generate a response using the LLM
   */
  protected async generateResponse(
    messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }>,
    options?: { temperature?: number, model?: string }
  ): Promise<string | null> {
    if (!this.circuitBreaker.canPass()) {
      throw new Error(`Circuit breaker is open for agent ${this.config.name}`);
    }

    try {
      const startTime = Date.now();
      const response = await this.llmProvider.generateCompletion(messages, options);
      
      this.circuitBreaker.recordSuccess();
      this.monitor.recordEvent('llm_request_success', {
        model: options?.model || this.config.defaultModel,
        duration: Date.now() - startTime
      });
      
      return response;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      this.monitor.recordEvent('llm_request_failed', {
        model: options?.model || this.config.defaultModel,
        error: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Create a standard error response
   */
  protected createErrorResponse(error: Error): AgentResponse {
    return {
      success: false,
      data: null,
      error: error.message,
      metadata: {
        confidence: 0,
        processingTime: 0,
        modelUsed: this.config.defaultModel
      }
    };
  }
}