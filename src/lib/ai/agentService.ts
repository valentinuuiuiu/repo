export interface AgentInsight {
  id: string;
  name: string;
  result: string;
}

/**
 * Simulates fetching AI-generated insights for agents associated with a specific department.
 * In a production scenario, this could be replaced by an API call or complex computation.
 *
 * @param departmentId - The unique identifier of the department
 * @returns A promise that resolves to an array of AgentInsight objects
 */
export async function getAgentInsights(departmentId: string): Promise<AgentInsight[]> {
  // Dummy data for simulation
  return Promise.resolve([
    { id: '1', name: 'Customer Service', result: 'All systems operational.' },
    { id: '2', name: 'Inventory Management', result: 'Stock levels are normal.' },
    { id: '3', name: 'Pricing Optimization', result: 'Prices are competitive.' }
  ]);
}

// Added aiService to provide dummy agent statuses
export const aiService = {
  getAgentStatuses: async (): Promise<Array<{ agentId: string; status: 'active' | 'inactive' | 'degraded'; lastError?: string }>> => {
    return Promise.resolve([
      { agentId: '1', status: 'active', lastError: '' },
      { agentId: '2', status: 'active' },
      { agentId: '3', status: 'active' }
    ]);
  }
};
