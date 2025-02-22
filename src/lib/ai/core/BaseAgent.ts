import OpenAI from "openai";
import { CircuitBreaker, CircuitState } from "./CircuitBreaker";
import { AgentResponse } from "../types"; // Import AgentResponse

export interface AgentConfig {
  name: string;
  description: string;
  maxRetries?: number;
  baseDelay?: number;
  circuitBreakerConfig?: {
    failureThreshold?: number;
    resetTimeout?: number;
    halfOpenSuccessThreshold?: number;
  };
}

export abstract class BaseAgent {
  protected openai: OpenAI;
  protected config: AgentConfig;
  private status: 'active' | 'inactive' | 'degraded' = 'active';
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private circuitBreaker: CircuitBreaker;

  constructor(config: AgentConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
    this.maxRetries = config.maxRetries || 3;
    this.baseDelay = config.baseDelay || 1000;
    this.circuitBreaker = new CircuitBreaker(
      config.circuitBreakerConfig?.failureThreshold,
      config.circuitBreakerConfig?.resetTimeout,
      config.circuitBreakerConfig?.halfOpenSuccessThreshold
    );
  }

  protected async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      let lastError: unknown = null;
      const startTime = Date.now();
      
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          const result = await operation();
          this.updateStatus('active');
          return result;
        } catch (err) {
          lastError = err;
          console.warn(`Retry attempt ${attempt + 1}/${this.maxRetries} failed:`, err);
          const delay = this.calculateBackoff(attempt);
          await this.delay(delay);
        }
      }
      
      this.updateStatus('degraded');
      throw lastError instanceof Error ? lastError : new Error(`Operation failed after ${this.maxRetries} retries`);
    });
  }

  protected async chat(
    messages: Array<OpenAI.Chat.ChatCompletionMessageParam>,
  ) {
    return await this.withRetry(async () => {
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages,
        });
        return response.choices[0].message.content;
      } catch (error) {
        console.error(`Agent ${this.config.name} chat error:`, error);
        throw error;
      }
    });
  }

  private calculateBackoff(attempt: number): number {
    return Math.min(this.baseDelay * Math.pow(2, attempt), 30000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateStatus(newStatus?: 'active' | 'inactive' | 'degraded') {
    if (newStatus) {
      this.status = newStatus;
      return;
    }

    // Update status based on circuit breaker state
    switch (this.circuitBreaker.getState()) {
      case CircuitState.OPEN:
        this.status = 'inactive';
        break;
      case CircuitState.HALF_OPEN:
        this.status = 'degraded';
        break;
      case CircuitState.CLOSED:
        this.status = 'active';
        break;
    }
  }

  getStatus(): { 
    status: 'active' | 'inactive' | 'degraded'; 
    lastError?: string;
    circuitBreakerMetrics?: ReturnType<CircuitBreaker['getMetrics']>;
  } {
    return { 
      status: this.status,
      circuitBreakerMetrics: this.circuitBreaker.getMetrics()
    };
  }

  protected setStatus(status: 'active' | 'inactive' | 'degraded') {
    this.status = status;
  }

  protected async validateResponse(response: any): Promise<boolean> {
    if (!response) return false;
    
    // Basic validation
    if (typeof response !== 'object') return false;
    if (!response.hasOwnProperty('data')) return false;
    
    // Additional validation logic can be added here
    return true;
  }

  protected handleError(error: unknown, context: string = ''): AgentResponse {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error in ${this.config.name} ${context ? `(${context})` : ''}:`, error);
    this.setStatus('degraded');
    return {
      success: false,
      data: null,
      error: context ? `${context}: ${errorMessage}` : errorMessage,
      metadata: {
        confidence: 0,
        processingTime: 0,
        modelUsed: this.config.name
      }
    };
  }

  async initialize(): Promise<void> {
    try {
      // Implement initialization logic here
      this.setStatus('active');
    } catch (err) {
      this.handleError(err, 'initialization');
    }
  }

  async shutdown(): Promise<void> {
    try {
      // Implement cleanup logic here
      this.setStatus('inactive');
    } catch (error) {
      console.error(`Shutdown error in ${this.config.name}:`, error);
    }
  }

  getParameters(): Record<string, any> {
    return {
      maxRetries: this.maxRetries,
      baseDelay: this.baseDelay,
      circuitBreakerState: this.circuitBreaker.getState(),
      status: this.status
    };
  }
}
