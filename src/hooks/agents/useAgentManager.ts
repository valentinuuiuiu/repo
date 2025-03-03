import { useState, useCallback, useEffect, useRef } from 'react';
import { AgentType, AgentStatus, AgentResponse } from '../../types/agent';

interface AgentConfig {
  type: AgentType;
  initialContext?: Record<string, any>;
  autoConnect?: boolean;
  maxRetries?: number;
}

export interface Agent {
  type: AgentType;
  status: AgentStatus;
  context: Record<string, any>;
  retryCount?: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (message: string, context?: Record<string, any>) => Promise<AgentResponse>;
  history: AgentResponse[];
  error: Error | null;
}

/**
 * Hook for managing multiple AI agents
 * Provides centralized agent creation, management, and communication
 */
export const useAgentManager = (initialAgents: AgentConfig[] = []) => {
  const [agents, setAgents] = useState<Map<AgentType, Agent>>(new Map());
  const [isInitializing, setIsInitializing] = useState(initialAgents.length > 0);
  const pendingRequests = useRef<Map<string, AbortController>>(new Map());
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup function for retries
  const cleanupRetry = useCallback((agentType: AgentType) => {
    const timeoutId = retryTimeouts.current.get(agentType);
    if (timeoutId) {
      clearTimeout(timeoutId);
      retryTimeouts.current.delete(agentType);
    }
  }, []);

  // Add new agent
  const addAgent = useCallback(async (config: AgentConfig): Promise<Agent | undefined> => {
    // Check if agent already exists
    if (agents.has(config.type)) {
      return agents.get(config.type);
    }

    // Create a new agent instance
    const agent: Agent = {
      type: config.type,
      status: AgentStatus.IDLE,
      context: config.initialContext || {},
      history: [],
      error: null,
      connect: async () => {
        try {
          // Update agent status
          setAgents(prev => {
            const updated = new Map(prev);
            const existingAgent = updated.get(config.type);
            if (existingAgent) {
              updated.set(config.type, { ...existingAgent, status: AgentStatus.CONNECTING });
            }
            return updated;
          });

          // Create abort controller for this request
          const abortController = new AbortController();
          const requestId = `connect-${config.type}-${Date.now()}`;
          pendingRequests.current.set(requestId, abortController);

          // Call API to connect agent
          const response = await fetch('/api/agent/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agentType: config.type,
              context: agent.context
            }),
            signal: abortController.signal
          });

          // Clean up abort controller
          pendingRequests.current.delete(requestId);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to connect agent: ${response.statusText}`);
          }

          // Update agent status
          setAgents(prev => {
            const updated = new Map(prev);
            const existingAgent = updated.get(config.type);
            if (existingAgent) {
              updated.set(config.type, { ...existingAgent, status: AgentStatus.CONNECTED });
            }
            return updated;
          });

          // Clear any existing retry timeouts
          cleanupRetry(config.type);

        } catch (error) {
          console.error(`Failed to connect agent ${config.type}:`, error);
          
          // Update agent status and error
          setAgents(prev => {
            const updated = new Map(prev);
            const existingAgent = updated.get(config.type);
            if (existingAgent) {
              updated.set(config.type, { 
                ...existingAgent, 
                status: AgentStatus.ERROR,
                error: error as Error
              });
            }
            return updated;
          });

          // Implement retry logic if maxRetries is specified
          if (config.maxRetries && config.maxRetries > 0) {
            const existingAgent = agents.get(config.type);
            const currentRetries = (existingAgent?.retryCount || 0) + 1;
            if (currentRetries <= config.maxRetries) {
              console.log(`Retrying connection for ${config.type} (${currentRetries}/${config.maxRetries})`);
              const timeoutId = setTimeout(async () => {
                try {
                  await agent.connect();
                } catch (retryError) {
                  console.error(`Retry ${currentRetries} failed:`, retryError);
                }
              }, Math.min(1000 * Math.pow(2, currentRetries - 1), 30000));
              
              retryTimeouts.current.set(config.type, timeoutId);
            }
          }
          
          throw error;
        }
      },
      disconnect: async () => {
        try {
          // Clean up any pending retries
          cleanupRetry(config.type);

          // Update agent status
          setAgents(prev => {
            const updated = new Map(prev);
            const existingAgent = updated.get(config.type);
            if (existingAgent) {
              updated.set(config.type, { ...existingAgent, status: AgentStatus.DISCONNECTING });
            }
            return updated;
          });

          // Abort any pending requests for this agent
          for (const [id, controller] of pendingRequests.current.entries()) {
            if (id.includes(`-${config.type}-`)) {
              controller.abort();
              pendingRequests.current.delete(id);
            }
          }

          // Call API to disconnect agent
          const response = await fetch('/api/agent/disconnect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentType: config.type })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to disconnect agent: ${response.statusText}`);
          }

          // Update agent status
          setAgents(prev => {
            const updated = new Map(prev);
            const existingAgent = updated.get(config.type);
            if (existingAgent) {
              updated.set(config.type, { ...existingAgent, status: AgentStatus.IDLE });
            }
            return updated;
          });
        } catch (error) {
          console.error(`Failed to disconnect agent ${config.type}:`, error);
          
          // Update agent status and error
          setAgents(prev => {
            const updated = new Map(prev);
            const existingAgent = updated.get(config.type);
            if (existingAgent) {
              updated.set(config.type, { 
                ...existingAgent, 
                status: AgentStatus.ERROR,
                error: error as Error
              });
            }
            return updated;
          });
          
          throw error;
        }
      },
      sendMessage: async (message: string, context?: Record<string, any>) => {
        try {
          // Update agent status
          setAgents(prev => {
            const updated = new Map(prev);
            const existingAgent = updated.get(config.type);
            if (existingAgent) {
              updated.set(config.type, { ...existingAgent, status: AgentStatus.PROCESSING });
            }
            return updated;
          });

          // Create abort controller for this request
          const abortController = new AbortController();
          const requestId = `message-${config.type}-${Date.now()}`;
          pendingRequests.current.set(requestId, abortController);

          // Call API to send message
          const response = await fetch('/api/agent/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agentType: config.type,
              message,
              context: { ...agent.context, ...context }
            }),
            signal: abortController.signal
          });

          // Clean up abort controller
          pendingRequests.current.delete(requestId);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const data: AgentResponse = await response.json();

          // Update agent state
          setAgents(prev => {
            const updated = new Map(prev);
            const existingAgent = updated.get(config.type);
            if (existingAgent) {
              updated.set(config.type, { 
                ...existingAgent, 
                status: AgentStatus.CONNECTED,
                history: [...existingAgent.history, data],
                context: { ...existingAgent.context, ...context }
              });
            }
            return updated;
          });

          return data;
        } catch (error) {
          console.error(`Failed to send message to agent ${config.type}:`, error);
          
          // Update agent status and error
          setAgents(prev => {
            const updated = new Map(prev);
            const existingAgent = updated.get(config.type);
            if (existingAgent) {
              updated.set(config.type, { 
                ...existingAgent, 
                status: AgentStatus.ERROR,
                error: error as Error
              });
            }
            return updated;
          });
          
          throw error;
        }
      }
    };

    // Update agents state
    setAgents(prev => {
      const updated = new Map(prev);
      updated.set(config.type, agent);
      return updated;
    });

    // Auto-connect if specified
    if (config.autoConnect) {
      try {
        await agent.connect();
      } catch (error) {
        // Error already handled in connect method
      }
    }

    return agent;
  }, [agents, cleanupRetry]);

  // Remove agent
  const removeAgent = useCallback(async (type: AgentType) => {
    const agent = agents.get(type);
    if (agent) {
      try {
        // Clean up any pending retries
        cleanupRetry(type);

        // Disconnect agent if connected
        if (agent.status === AgentStatus.CONNECTED || 
            agent.status === AgentStatus.PROCESSING) {
          await agent.disconnect();
        }
        
        // Remove agent from state
        setAgents(prev => {
          const updated = new Map(prev);
          updated.delete(type);
          return updated;
        });
      } catch (error) {
        console.error(`Error removing agent ${type}:`, error);
        throw error;
      }
    }
  }, [agents, cleanupRetry]);

  // Get agent by type
  const getAgent = useCallback((type: AgentType): Agent | undefined => {
    return agents.get(type);
  }, [agents]);

  // Get all active agents
  const getActiveAgents = useCallback((): Agent[] => {
    return Array.from(agents.values()).filter(
      agent => agent.status === AgentStatus.CONNECTED
    );
  }, [agents]);

  // Broadcast message to all active agents
  const broadcastMessage = useCallback(async (message: string, context?: Record<string, any>): Promise<AgentResponse[]> => {
    const activeAgents = getActiveAgents();
    
    try {
      const responses = await Promise.all(
        activeAgents.map(agent => agent.sendMessage(message, context))
      );
      return responses;
    } catch (error) {
      console.error('Error broadcasting message:', error);
      throw error;
    }
  }, [getActiveAgents]);

  // Disconnect all agents
  const disconnectAll = useCallback(async (): Promise<void> => {
    try {
      // Clean up all retries
      for (const agentType of agents.keys()) {
        cleanupRetry(agentType);
      }

      // Abort all pending requests
      for (const controller of pendingRequests.current.values()) {
        controller.abort();
      }
      pendingRequests.current.clear();
      
      // Disconnect all agents
      const disconnectPromises = Array.from(agents.values())
        .filter(agent => 
          agent.status === AgentStatus.CONNECTED || 
          agent.status === AgentStatus.PROCESSING
        )
        .map(agent => agent.disconnect());
        
      await Promise.all(disconnectPromises);
      
      // Reset agents state
      setAgents(new Map());
    } catch (error) {
      console.error('Error disconnecting all agents:', error);
      throw error;
    }
  }, [agents, cleanupRetry]);

  // Initialize with any initial agents
  useEffect(() => {
    if (initialAgents.length > 0 && isInitializing) {
      const initializeAgents = async () => {
        try {
          await Promise.all(initialAgents.map(addAgent));
        } catch (error) {
          console.error('Error initializing agents:', error);
        } finally {
          setIsInitializing(false);
        }
      };
      
      initializeAgents();
    }
  }, [addAgent, initialAgents, isInitializing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all retries
      for (const agentType of agents.keys()) {
        cleanupRetry(agentType);
      }

      // Abort all pending requests
      for (const controller of pendingRequests.current.values()) {
        controller.abort();
      }
      
      // Note: We don't call disconnectAll here to avoid state updates after unmount
      // The API endpoints will handle cleanup on their side
    };
  }, [agents, cleanupRetry]);

  return {
    agents,
    addAgent,
    removeAgent,
    getAgent,
    getActiveAgents,
    broadcastMessage,
    disconnectAll,
    isInitializing
  };
};