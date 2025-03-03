import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Agent, 
  Department, 
  AgentManager, 
  createDropConnectAgentSystem 
} from './AgentModel';

// Define the shape of the AgentContext
interface AgentContextType {
  agentManager: AgentManager;
  currentDepartment: Department | null;
  currentAgent: Agent | null;
  selectDepartment: (departmentId: string) => void;
  selectAgent: (agentId: string) => void;
  assignTask: (task: {
    departmentId: string;
    requiredCapabilities: string[];
  }) => Agent | null;
}

// Create the context
const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Provider component
export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize the agent management system
  const [agentManager] = useState(() => createDropConnectAgentSystem());
  
  // State for current department and agent
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);

  // Method to select a department
  const selectDepartment = useCallback((departmentId: string) => {
    const department = agentManager.departments.get(departmentId);
    if (department) {
      setCurrentDepartment(department);
      // Reset current agent when department changes
      setCurrentAgent(null);
    }
  }, [agentManager]);

  // Method to select an agent
  const selectAgent = useCallback((agentId: string) => {
    if (!currentDepartment) {
      console.warn('No department selected');
      return;
    }

    const agent = currentDepartment.agents.find(a => a.id === agentId);
    if (agent) {
      setCurrentAgent(agent);
    }
  }, [currentDepartment]);

  // Method to assign a task to an agent
  const assignTask = useCallback((task: {
    departmentId: string;
    requiredCapabilities: string[];
  }) => {
    try {
      return agentManager.assignTask(task);
    } catch (error) {
      console.error('Task assignment failed:', error);
      return null;
    }
  }, [agentManager]);

  // Provide the context value
  const contextValue = {
    agentManager,
    currentDepartment,
    currentAgent,
    selectDepartment,
    selectAgent,
    assignTask
  };

  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  );
};

// Custom hook to use the agent context
export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgentContext must be used within an AgentProvider');
  }
  return context;
};