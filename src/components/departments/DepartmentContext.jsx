import React, { createContext, useState, useContext, useEffect } from 'react';
import { getDepartmentById, getAgentById } from './departmentConfig';

// Create context
const DepartmentContext = createContext();

// Custom hook to use the department context
export const useDepartment = () => useContext(DepartmentContext);

// Provider component
export const DepartmentProvider = ({ children }) => {
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [currentAgent, setCurrentAgent] = useState(null);
  
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
  const selectDepartment = (departmentId) => {
    const department = getDepartmentById(departmentId);
    setCurrentDepartment(department);
    setCurrentAgent(null); // Reset agent when department changes
    localStorage.setItem('currentDepartmentId', departmentId);
    localStorage.removeItem('currentAgentId');
  };
  
  // Select an agent
  const selectAgent = (departmentId, agentId) => {
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
  
  const value = {
    currentDepartment,
    currentAgent,
    selectDepartment,
    selectAgent,
    getAssistantContext
  };
  
  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
};

export default DepartmentContext;