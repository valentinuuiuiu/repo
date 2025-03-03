import { Agent, AgentCategory, AgentRole } from './types';
import { predefinedAgents } from './predefined';

/**
 * Get all available agents
 */
export function getAgents(): Agent[] {
  return [...predefinedAgents];
}

/**
 * Get an agent by its ID
 */
export function getAgentById(id: string): Agent | undefined {
  return predefinedAgents.find((agent) => agent.id === id);
}

/**
 * Get agents by category
 */
export function getAgentsByCategory(category: AgentCategory): Agent[] {
  return predefinedAgents.filter((agent) => agent.category === category);
}

/**
 * Get agents by role
 */
export function getAgentsByRole(role: AgentRole): Agent[] {
  return predefinedAgents.filter((agent) => agent.role === role);
}

/**
 * Create a custom agent
 */
export function createCustomAgent(agentConfig: Omit<Agent, 'id'>): Agent {
  const id = `custom-${Date.now()}`;
  return {
    id,
    ...agentConfig,
  };
}

/**
 * Get default agent (first assistant agent)
 */
export function getDefaultAgent(): Agent | undefined {
  return predefinedAgents.find(
    (agent) => agent.category === AgentCategory.ASSISTANT
  );
}