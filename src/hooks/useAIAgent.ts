import { useState, useCallback } from 'react';
import { Agent, AgentCategory, useAgent } from '../config/agents';

export interface AgentInteraction {
  id: string;
  agentId: string;
  timestamp: number;
  prompt: string;
  response: string;
  category: AgentCategory;
}

export interface UseAIAgentReturn {
  agent: Agent;
  isLoading: boolean;
  error: Error | null;
  interactions: AgentInteraction[];
  getAgentResponse: (prompt: string, context?: Record<string, unknown>) => Promise<string>;
  clearInteractions: () => void;
}

// Simple in-memory interaction storage (can be replaced with persistent storage)
const agentInteractionsStore: { [key: string]: AgentInteraction[] } = {};

export const useAIAgent = (agentId: string): UseAIAgentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [interactions, setInteractions] = useState<AgentInteraction[]>(
    agentInteractionsStore[agentId] || []
  );
  
  const { agent, getResponse } = useAgent(agentId);

  const getAgentResponse = useCallback(async (
    prompt: string, 
    context?: Record<string, unknown>
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getResponse(prompt, context);
      
      // Create interaction record
      const interaction: AgentInteraction = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        agentId,
        timestamp: Date.now(),
        prompt,
        response,
        category: agent.category
      };

      // Update interactions
      const updatedInteractions = [...interactions, interaction];
      setInteractions(updatedInteractions);
      
      // Store in memory
      agentInteractionsStore[agentId] = updatedInteractions;

      return response;
    } catch (err) {
      const error = err instanceof Error 
        ? err 
        : new Error('Unknown agent interaction error');
      
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [agentId, interactions, agent, getResponse]);

  const clearInteractions = useCallback(() => {
    setInteractions([]);
    agentInteractionsStore[agentId] = [];
  }, [agentId]);

  return {
    agent,
    isLoading,
    error,
    interactions,
    getAgentResponse,
    clearInteractions
  };
};