import { AgentType, AgentStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HealthCheck {
  lastPing: number;
  status: AgentStatus;
  heartbeatCount: number;
  reconnectAttempts: number;
}

/**
 * Monitors agent health and automatically reconnects failed agents
 * Uses a gentle approach to reconnection with care for the agent system
 */
export class AgentHealthMonitor {
  private healthChecks: Map<AgentType, HealthCheck> = new Map();
  private interval: NodeJS.Timeout | null = null;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly RECONNECT_THRESHOLD = 3; // Missing 3 health checks triggers reconnection
  private readonly MAX_RECONNECT_ATTEMPTS = 2; // Maximum reconnection attempts

  // Callback function for reconnecting agents
  private reconnectAgent: ((agentType: AgentType) => Promise<boolean>) | null = null;

  constructor() {
    // Initialize health checks for all agent types
    Object.values(AgentType).forEach(agentType => {
      this.healthChecks.set(agentType, {
        lastPing: Date.now(),
        status: AgentStatus.AVAILABLE,
        heartbeatCount: 0,
        reconnectAttempts: 0
      });
    });
  }

  /**
   * Register a reconnect function to be called when an agent needs reconnection
   */
  registerReconnectFunction(reconnectFn: (agentType: AgentType) => Promise<boolean>) {
    this.reconnectAgent = reconnectFn;
  }

  /**
   * Start monitoring agent health
   */
  startMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => this.checkAgentHealth(), this.HEALTH_CHECK_INTERVAL);
    console.log('Agent health monitoring started');
    return () => this.stopMonitoring();
  }

  /**
   * Stop monitoring agent health
   */
  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('Agent health monitoring stopped');
  }

  /**
   * Record a heartbeat for an agent, updating its health status
   */
  recordHeartbeat(agentType: AgentType) {
    const health = this.healthChecks.get(agentType);
    if (health) {
      health.lastPing = Date.now();
      health.status = AgentStatus.BUSY;
      health.heartbeatCount++;
      health.reconnectAttempts = 0; // Reset reconnect attempts on successful heartbeat
      this.healthChecks.set(agentType, health);
    }
  }

  /**
   * Check the health of all connected agents
   */
  private async checkAgentHealth() {
    // Get all currently BUSY agents from database
    const busyAgents = await prisma.agent.findMany({
      where: { 
        status: AgentStatus.BUSY 
      }
    });

    // Check each busy agent
    for (const agent of busyAgents) {
      const health = this.healthChecks.get(agent.type as AgentType);
      
      if (health) {
        const timeSinceLastPing = Date.now() - health.lastPing;
        
        // If agent hasn't pinged in a while, consider it potentially disconnected
        if (timeSinceLastPing > this.HEALTH_CHECK_INTERVAL * this.RECONNECT_THRESHOLD) {
          console.warn(`Agent ${agent.type} may be disconnected. Last ping: ${new Date(health.lastPing).toISOString()}`);
          
          // Only attempt reconnection if we haven't reached the maximum attempts
          if (health.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS && this.reconnectAgent) {
            console.log(`Attempting to reconnect agent ${agent.type} (Attempt ${health.reconnectAttempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})`);
            
            try {
              // First try to update the agent status in the database to AVAILABLE
              await prisma.agent.update({
                where: { id: agent.id },
                data: { status: AgentStatus.AVAILABLE }
              });
              
              // Then attempt reconnection
              const success = await this.reconnectAgent(agent.type as AgentType);
              
              if (success) {
                console.log(`Successfully reconnected agent ${agent.type}`);
                health.reconnectAttempts = 0;
                health.lastPing = Date.now();
              } else {
                console.error(`Failed to reconnect agent ${agent.type}`);
                health.reconnectAttempts++;
              }
            } catch (error) {
              console.error(`Error reconnecting agent ${agent.type}:`, error);
              health.reconnectAttempts++;
            }
            
            this.healthChecks.set(agent.type as AgentType, health);
          } else if (health.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.error(`Maximum reconnection attempts reached for agent ${agent.type}. Manual intervention required.`);
            
            // Update agent status to OFFLINE in the database
            try {
              await prisma.agent.update({
                where: { id: agent.id },
                data: { status: AgentStatus.OFFLINE }
              });
            } catch (error) {
              console.error(`Error updating agent status for ${agent.type}:`, error);
            }
          }
        }
      }
    }
  }

  /**
   * Get the health status of an agent
   */
  getAgentHealth(agentType: AgentType): HealthCheck | undefined {
    return this.healthChecks.get(agentType);
  }

  /**
   * Get the health status of all agents
   */
  getAllAgentHealth(): Map<AgentType, HealthCheck> {
    return new Map(this.healthChecks);
  }
}

// Export a singleton instance
export const agentHealthMonitor = new AgentHealthMonitor();