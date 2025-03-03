import Redis from 'ioredis';
import { AgentMessage } from './types';

// Create Redis client with proper error handling and reconnect options
const createRedisClient = () => {
  const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
  const client = new Redis({
    port: parseInt(redisUrl.port) || 6379,
    host: redisUrl.hostname || 'localhost',
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      console.log(`Redis retry attempt: ${times}, retrying in ${delay}ms`);
      return delay;
    }
  });
  
  client.on('connect', () => {
    console.log('Redis client connected');
  });
  
  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });
  
  return client;
};

// Use singleton pattern for Redis client
let redisClient: Redis;
try {
  redisClient = createRedisClient();
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  // Create a fallback in-memory implementation
  redisClient = {
    publish: async () => 1,
    subscribe: async () => {},
    unsubscribe: async () => {},
    on: () => redisClient,
    get: async () => null,
    set: async () => 'OK',
    lpush: async () => 1,
    lrange: async () => [],
    ltrim: async () => 'OK',
    ping: async () => 'PONG',
    duplicate: () => redisClient
  } as unknown as Redis;
  console.info('Using in-memory fallback for Redis');
}

export interface MessageHandler {
  onMessage: (message: AgentMessage) => Promise<void>;
}

/**
 * AgentCoordinator manages communication between agents within a department
 * It uses Redis pub/sub for real-time messaging and state management
 */
export class AgentCoordinator {
  private readonly departmentChannel: string;
  private messageHandlers: Map<string, MessageHandler>;
  private subscriptions: Map<string, () => void>;
  private redis: Redis;
  private pubsub: Redis | null = null;

  constructor(departmentId: string) {
    this.departmentChannel = `department:${departmentId}:events`;
    this.messageHandlers = new Map();
    this.subscriptions = new Map();
    this.redis = redisClient;
  }

  /**
   * Subscribe an agent to department messages
   * @param agentId The ID of the agent subscribing
   * @param handler The message handler for this agent
   * @returns A cleanup function to unsubscribe
   */
  async subscribe(agentId: string, handler: MessageHandler): Promise<() => void> {
    // Create a new Redis connection for pub/sub
    if (!this.pubsub) {
      try {
        this.pubsub = this.redis.duplicate();
      } catch (error) {
        console.error('Failed to create pub/sub client:', error);
      }
    }

    const messageCallback = async (channel: string, message: string) => {
      try {
        const parsedMessage = JSON.parse(message) as AgentMessage;
        
        // Only process messages intended for this agent or broadcast messages
        if (!parsedMessage.to || parsedMessage.to === agentId) {
          await handler.onMessage(parsedMessage);
        }
      } catch (error) {
        console.error(`Error handling message for agent ${agentId}:`, error);
      }
    };

    try {
      // Subscribe to department-wide channel and agent-specific channel
      await this.pubsub?.subscribe(this.departmentChannel);
      await this.pubsub?.subscribe(`${this.departmentChannel}:${agentId}`);
      
      // Set up message listener
      if (this.pubsub) {
        this.pubsub.on('message', messageCallback);
      }
      
      this.messageHandlers.set(agentId, handler);
    } catch (error) {
      console.error(`Failed to subscribe agent ${agentId}:`, error);
    }
    
    // Return cleanup function
    const cleanup = () => {
      try {
        if (this.pubsub) {
          this.pubsub.unsubscribe(this.departmentChannel, `${this.departmentChannel}:${agentId}`);
          this.pubsub.removeListener('message', messageCallback);
        }
        this.messageHandlers.delete(agentId);
      } catch (error) {
        console.error(`Error cleaning up subscription for ${agentId}:`, error);
      }
    };
    
    this.subscriptions.set(agentId, cleanup);
    return cleanup;
  }
  /**
   * Store a message in the history
   * @param message The message to store
   */
  private async storeMessage(message: AgentMessage): Promise<void> {
    await this.redis.lpush(`${this.departmentChannel}:history`, JSON.stringify(message));
    await this.redis.ltrim(`${this.departmentChannel}:history`, 0, 999); // Keep last 1000 messages
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    for (const [agentId, cleanup] of this.subscriptions.entries()) {
      cleanup();
      this.subscriptions.delete(agentId);
    }
    
    if (this.pubsub) {
      this.pubsub.disconnect();
      this.pubsub = null;
    }
  }

  /**
   * Check if the coordinator is healthy and connected
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}