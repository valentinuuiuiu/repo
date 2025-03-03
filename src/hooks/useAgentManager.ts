import { useState, useEffect, useCallback, useRef } from 'react';
import { AgentManager } from '../services/AgentManager';
import { prisma } from '../lib/prisma';
import { 
  AgentType, 
  AgentStatus,
  AgentResponse,
  ThoughtChain,
  Agent,
  Department
} from '../types/agent';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MAX_RETRIES = 3;
const CONNECTION_TIMEOUT = 15000;

export const useAgentManager = () => {
  const [agentManager, setAgentManager] = useState<AgentManager | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const connectionAttemptsRef = useRef<Map<AgentType, number>>(new Map());
  const connectionTimeoutsRef = useRef<Map<AgentType, NodeJS.Timeout>>(new Map());
  const queryClient = useQueryClient();

  // Type guard to validate agent config
  const hasValidConfig = (config: any): config is { [key: string]: any; successRate: number; responseTime: number } => {
    return typeof config === 'object' && 
           config !== null &&
           'successRate' in config && 
           'responseTime' in config;
  };

  // Convert DB agent type to domain Agent type
  const convertToAgent = (dbAgent: any): Agent => {
    if (!hasValidConfig(dbAgent.config)) {
      throw new Error('Invalid agent config format');
    }

    return {
      id: dbAgent.id,
      type: dbAgent.type as AgentType,
      name: dbAgent.name,
      status: dbAgent.status as AgentStatus,
      config: dbAgent.config,
      metrics: dbAgent.metrics,
      department: dbAgent.department,
      capabilities: dbAgent.capabilities,
      createdAt: dbAgent.createdAt,
      updatedAt: dbAgent.updatedAt
    };
  };

  const { data: agents = [], isLoading } = useQuery<Agent[]>(
    ['agents'],
    async () => {
      const response = await fetch('/api/agents');
      const data = await response.json();
      return data.map(convertToAgent);
    }
  );

  const { mutate: updateAgentStatus } = useMutation(
    async ({ agentId, status }: { agentId: string; status: AgentStatus }) => {
      const response = await fetch(`/api/agents/${agentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['agents']);
      }
    }
  );

  // Initialize AgentManager and load data
  useEffect(() => {
    const initializeAgentManager = async () => {
      setIsInitializing(true);
      try {
        const manager = AgentManager.getInstance();
        
        // Load departments and agents from Prisma with type assertions
        const deptData = await prisma.department.findMany();
        const agentData = await prisma.agent.findMany({
          include: {
            department: true,
            metrics: true,
            specializations: true
          }
        });
        
        // Transform Prisma data to match our interfaces
        const transformedDepts = deptData.map(dept => ({
          ...dept,
          description: dept.description || '' // Handle null case
        })) as Department[];

        const transformedAgents = agentData.map(agent => ({
          ...agent,
          type: agent.type as AgentType,
          status: agent.status as AgentStatus
        })) as Agent[];
        
        setDepartments(transformedDepts);
        setAgentManager(manager);

        // Initialize default toolkits for each agent type
        const allAgentTypes = [...new Set(transformedAgents.map(agent => agent.type))];
        for (const agentType of allAgentTypes) {
          const toolkit = manager.getToolkit(agentType);
          if (!toolkit) {
            console.log(`Initializing toolkit for ${agentType}...`);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } catch (error) {
        console.error('Failed to initialize AgentManager:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAgentManager();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      connectionTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Cleanup function for connection attempts
  const cleanupConnection = useCallback((agentType: AgentType) => {
    const timeout = connectionTimeoutsRef.current.get(agentType);
    if (timeout) {
      clearTimeout(timeout);
      connectionTimeoutsRef.current.delete(agentType);
    }
    connectionAttemptsRef.current.delete(agentType);
  }, []);

  // Connect agent with retries
  const connectAgent = useCallback(async (agentType: AgentType): Promise<AgentResponse> => {
    try {
      if (isInitializing) {
        console.log('AgentManager is still initializing, waiting...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (!agentManager) {
        throw new Error('AgentManager not initialized');
      }

      console.log(`Connecting to agent: ${agentType}...`);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort('New connection attempt'); 
      }
      abortControllerRef.current = new AbortController();

      const timeoutId = setTimeout(() => {
        console.log(`Connection to ${agentType} timed out`);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort('Connection timeout');
        }
      }, CONNECTION_TIMEOUT);
      
      connectionTimeoutsRef.current.set(agentType, timeoutId);

      const connectPromise = new Promise<AgentResponse>(async (resolve, reject) => {
        try {
          const toolkit = agentManager.getToolkit(agentType);
          if (!toolkit) {
            console.warn(`No toolkit found for agent type ${agentType}, using default toolkit`);
          }
          
          const result = await agentManager.executeTool(
            agentType,
            'initialize',
            { agentType }
          );

          // Update agent status in database
          const agent = agents.find(a => a.type === agentType);
          if (agent) {
            await prisma.agent.update({
              where: { id: agent.id },
              data: { status: AgentStatus.AVAILABLE }
            });

            // Update local state
            queryClient.invalidateQueries(['agents']);
          }

          // Create proper AgentResponse
          const response: AgentResponse = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            message: 'Agent connected successfully',
            agentType,
            status: 'success',
            metadata: { executionResult: result }
          };

          resolve(response);
        } catch (error) {
          reject(error);
        }
      });

      const abortPromise = new Promise<never>((_, reject) => {
        abortControllerRef.current?.signal.addEventListener('abort', (event) => {
          const reason = (event.target as any)?.reason || 'Connection aborted';
          reject(new Error(reason));
        });
      });

      const connectResult = await Promise.race([connectPromise, abortPromise]);

      clearTimeout(timeoutId);
      connectionTimeoutsRef.current.delete(agentType);
      connectionAttemptsRef.current.delete(agentType);
      
      console.log(`Agent ${agentType} connected successfully:`, connectResult);

      return connectResult;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to connect agent ${agentType}:`, errorMessage);
      
      const attempts = connectionAttemptsRef.current.get(agentType) || 0;
      
      if (attempts < MAX_RETRIES) {
        const nextAttempt = attempts + 1;
        connectionAttemptsRef.current.set(agentType, nextAttempt);
        
        const backoffDelay = Math.min(Math.pow(2, attempts) * 1000, 10000);
        console.log(`Retrying connection for ${agentType} in ${backoffDelay}ms (attempt ${nextAttempt}/${MAX_RETRIES})`);
        
        return new Promise((resolve, reject) => {
          const retryTimeout = setTimeout(async () => {
            try {
              const result = await connectAgent(agentType);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, backoffDelay);
          
          connectionTimeoutsRef.current.set(agentType, retryTimeout);
        });
      }
      
      // Update agent status in database on final failure
      const agent = agents.find(a => a.type === agentType);
      if (agent) {
        await prisma.agent.update({
          where: { id: agent.id },
          data: { status: AgentStatus.ERROR }
        });

        // Update local state
        queryClient.invalidateQueries(['agents']);
      }
      
      throw new Error(`Failed to connect agent ${agentType} after ${MAX_RETRIES} attempts: ${errorMessage}`);
    }
  }, [agentManager, isInitializing, agents, queryClient]);

  // Disconnect agent
  const disconnectAgent = useCallback(async (agentType: AgentType): Promise<boolean> => {
    try {
      if (!agentManager) {
        throw new Error('AgentManager not initialized');
      }
      
      console.log(`Disconnecting agent ${agentType}...`);
      
      cleanupConnection(agentType);
      
      // Update agent status in database
      const agent = agents.find(a => a.type === agentType);
      if (agent) {
        await prisma.agent.update({
          where: { id: agent.id },
          data: { status: AgentStatus.IDLE }
        });

        // Update local state
        queryClient.invalidateQueries(['agents']);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to disconnect agent ${agentType}:`, error);
      return false;
    }
  }, [agentManager, cleanupConnection, agents, queryClient]);

  // Additional utility functions for thought chains
  const createThoughtChain = useCallback((agentType: AgentType, input: string): string => {
    return agentManager?.createThoughtChain(agentType, input) || '';
  }, [agentManager]);

  const addThoughtStep = useCallback((
    thoughtChainId: string,
    thought: string,
    reasoning: string,
    action?: string,
    actionResult?: any
  ): void => {
    agentManager?.addThoughtStep(thoughtChainId, thought, reasoning, action, actionResult);
  }, [agentManager]);

  const getThoughtChain = useCallback((thoughtChainId: string): ThoughtChain | undefined => {
    return agentManager?.getThoughtChain(thoughtChainId);
  }, [agentManager]);

  const getThoughtChainsForAgent = useCallback((agentType: AgentType): ThoughtChain[] => {
    return agentManager?.getThoughtChainsForAgent(agentType) || [];
  }, [agentManager]);

  const pruneThoughtChains = useCallback((maxChainsPerAgent: number = 20): void => {
    agentManager?.pruneThoughtChains(maxChainsPerAgent);
  }, [agentManager]);

  return {
    connectAgent,
    disconnectAgent,
    departments,
    agents,
    isInitializing,
    createThoughtChain,
    addThoughtStep,
    getThoughtChain,
    getThoughtChainsForAgent,
    pruneThoughtChains,
    isLoading,
    updateAgentStatus
  };
};