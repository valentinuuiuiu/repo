import React, { createContext, useContext, useState, useEffect } from 'react';
import { Department, Agent, DepartmentContextType } from './types';
import { departments, getDepartmentById, getAgentById } from './departmentConfig';

// Create context with explicit type
const DepartmentContext = createContext<DepartmentContextType>({
  currentDepartment: null,
  currentAgent: null,
  selectDepartment: () => {},
  selectAgent: () => {},
  getAssistantContext: () => ({})
});

// Provider component
export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  
  // Load from localStorage on initial render
  useEffect(() => {
    const savedDepartment = localStorage.getItem('currentDepartmentId');
    const savedAgent = localStorage.getItem('currentAgentId');
    
    if (savedDepartment) {
      const departmentData = getDepartmentById(savedDepartment);
      setCurrentDepartment(departmentData);
      
      if (savedAgent && departmentData) {
        const agentData = getAgentById(savedDepartment, savedAgent);
        setCurrentAgent(agentData);
      }
    }
  }, []);
  
  // Select a department
  const selectDepartment = (departmentId: string) => {
    const department = getDepartmentById(departmentId);
    setCurrentDepartment(department);
    setCurrentAgent(null); // Reset agent when department changes
    localStorage.setItem('currentDepartmentId', departmentId);
    localStorage.removeItem('currentAgentId');
  };
  
  // Select an agent
  const selectAgent = (departmentId: string, agentId: string) => {
    const agent = getAgentById(departmentId, agentId);
    setCurrentAgent(agent);
    localStorage.setItem('currentAgentId', agentId);
  };
  
  // Get context for AI assistant
  const getAssistantContext = () => {
    if (!currentDepartment || !currentAgent) {
      return {};
    }
    
    return {
      departmentName: currentDepartment.name,
      departmentDescription: currentDepartment.description,
      agentName: currentAgent.name,
      agentDescription: currentAgent.description,
      agentExpertise: currentAgent.expertise.join(', ')
    };
  };
  
  return (
    <DepartmentContext.Provider 
      value={{ 
        currentDepartment, 
        currentAgent, 
        selectDepartment, 
        selectAgent, 
        getAssistantContext 
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};

// Custom hook to use the department context
export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return context;
};