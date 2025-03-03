import React, { createContext, useContext, useState, useCallback } from 'react';
import { Tool, ToolRegistry, createToolRegistry, ToolCategory } from './ToolModel';
import { Agent } from '../agents/AgentModel';

// Define the shape of the ToolContext
interface ToolContextType {
  toolRegistry: ToolRegistry;
  getAccessibleTools: (agent: Agent) => Tool[];
  getToolsByCategory: (category: ToolCategory) => Tool[];
  executeTool: (toolId: string, agent: Agent, params: Record<string, unknown>) => Promise<unknown>;
}

// Create the context
const ToolContext = createContext<ToolContextType | undefined>(undefined);

// Provider component
export const ToolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize the tool registry
  const [toolRegistry] = useState(() => createToolRegistry());

  // Get tools accessible to an agent
  const getAccessibleTools = useCallback((agent: Agent): Tool[] => {
    return toolRegistry.getAccessibleTools(agent.capabilities);
  }, [toolRegistry]);

  // Get tools by category
  const getToolsByCategory = useCallback((category: ToolCategory): Tool[] => {
    return toolRegistry.getToolsByCategory(category);
  }, [toolRegistry]);

  // Execute a tool
  const executeTool = useCallback(async (
    toolId: string, 
    agent: Agent, 
    params: Record<string, unknown>
  ): Promise<unknown> => {
    const tool = toolRegistry.getTool(toolId);
    
    if (!tool) {
      throw new Error(`Tool with ID ${toolId} not found`);
    }
    
    // Check if agent has required capabilities
    const hasRequiredCapabilities = tool.requiredCapabilities.every(capId => 
      agent.capabilities.some(agentCap => agentCap.id === capId)
    );
    
    if (!hasRequiredCapabilities) {
      throw new Error(`Agent ${agent.name} does not have the required capabilities to use ${tool.name}`);
    }
    
    // Check if agent has required permissions
    const hasRequiredPermissions = tool.requiredPermissions.every(permission => 
      agent.accessibleTools.includes(toolId)
    );
    
    if (!hasRequiredPermissions) {
      throw new Error(`Agent ${agent.name} does not have permission to use ${tool.name}`);
    }
    
    // In a real implementation, this would call the actual tool functionality
    console.log(`Executing tool ${tool.name} with params:`, params);
    
    // Mock implementation - in a real app, this would call the actual tool API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          toolId: tool.id,
          result: `${tool.name} executed successfully`,
          timestamp: new Date().toISOString()
        });
      }, 500);
    });
  }, [toolRegistry]);

  // Provide the context value
  const contextValue = {
    toolRegistry,
    getAccessibleTools,
    getToolsByCategory,
    executeTool
  };

  return (
    <ToolContext.Provider value={contextValue}>
      {children}
    </ToolContext.Provider>
  );
};

// Custom hook to use the tool context
export const useToolContext = () => {
  const context = useContext(ToolContext);
  if (context === undefined) {
    throw new Error('useToolContext must be used within a ToolProvider');
  }
  return context;
};