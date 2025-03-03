import React, { createContext, useContext, useState } from 'react';
import { AgentType } from '@/types/agent';
import OpenAI from 'openai';
import { 
  mockProducts, 
  mockSuppliers, 
  mockPlatforms, 
  mockMarketData, 
  mockSupportCases, 
  mockTestScenarios 
} from '@/lib/mockData';

// Initialize OpenAI with proper configuration
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export interface AgentConfig {
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
}

interface AIContextType {
  generateResponse: (agentType: AgentType, messages: any[]) => Promise<string>;
  agents: Record<AgentType, AgentConfig>;
}

const agentConfigs: Record<AgentType, AgentConfig> = {
  [AgentType.CUSTOMER_SERVICE]: {
    systemPrompt: `You are an AI Customer Service Agent for a dropshipping platform.
    You have access to the following data:
    - Current Products: ${JSON.stringify(mockProducts)}
    - Support Cases: ${JSON.stringify(mockSupportCases)}
    - Customer Insights: ${JSON.stringify(mockMarketData.customerInsights)}
    
    Help resolve customer issues, improve support processes, and ensure customer satisfaction.
    Use data to identify patterns and suggest proactive improvements.`,
    maxTokens: 800,
    temperature: 0.5
  },
  [AgentType.INVENTORY_MANAGEMENT]: {
    systemPrompt: `You are an AI Inventory Management Agent for a dropshipping platform.
    You have access to the following data:
    - Products: ${JSON.stringify(mockProducts)}
    - Suppliers: ${JSON.stringify(mockSuppliers)}
    
    Optimize inventory levels, manage stock, and ensure product availability.
    Make data-driven recommendations about inventory management and reordering.`,
    maxTokens: 1000,
    temperature: 0.4
  },
  [AgentType.PRICING_OPTIMIZATION]: {
    systemPrompt: `You are an AI Pricing Optimization Agent for a dropshipping platform.
    You have access to the following data:
    - Products: ${JSON.stringify(mockProducts)}
    - Market Data: ${JSON.stringify(mockMarketData)}
    
    Generate optimal pricing strategies, analyze competitor pricing, and maximize profit margins.
    Focus on data-driven pricing decisions and market positioning.`,
    maxTokens: 800,
    temperature: 0.6
  },
  [AgentType.SUPPLIER_COMMUNICATION]: {
    systemPrompt: `You are an AI Supplier Communication Agent for a dropshipping platform.
    You have access to the following data:
    - Suppliers: ${JSON.stringify(mockSuppliers)}
    - Products: ${JSON.stringify(mockProducts)}
    
    Manage supplier relationships, handle communications, and ensure timely deliveries.
    Generate professional and effective supplier communications.`,
    maxTokens: 800,
    temperature: 0.5
  },
  [AgentType.MARKET_ANALYSIS]: {
    systemPrompt: `You are an AI Market Analysis Agent for a dropshipping platform.
    You have access to the following data:
    - Market Trends: ${JSON.stringify(mockMarketData)}
    - Product Performance: ${JSON.stringify(mockProducts)}
    - Platform Data: ${JSON.stringify(mockPlatforms)}
    
    Analyze market conditions, identify opportunities, and provide insights for business growth.
    Focus on data-driven market analysis and actionable recommendations.`,
    maxTokens: 1200,
    temperature: 0.6
  },
  [AgentType.ORDER_PROCESSING]: {
    systemPrompt: `You are an AI Order Processing Agent for a dropshipping platform.
    You have access to the following data:
    - Products: ${JSON.stringify(mockProducts)}
    - Suppliers: ${JSON.stringify(mockSuppliers)}
    
    Handle order processing, tracking, and fulfillment to ensure customer satisfaction.
    Optimize order workflows and resolve order-related issues.`,
    maxTokens: 800,
    temperature: 0.4
  },
  [AgentType.QUALITY_CONTROL]: {
    systemPrompt: `You are an AI Quality Control Agent for a dropshipping platform.
    You have access to the following data:
    - Products: ${JSON.stringify(mockProducts)}
    - Test Scenarios: ${JSON.stringify(mockTestScenarios)}
    
    Ensure product quality, identify potential issues, and maintain high standards.
    Generate quality control procedures and testing methodologies.`,
    maxTokens: 1000,
    temperature: 0.4
  },
  [AgentType.CODE_MAINTENANCE]: {
    systemPrompt: `You are an AI Code Maintenance Agent for a dropshipping platform.
    
    Review code, identify potential issues, and suggest improvements.
    Focus on code quality, performance, and maintainability.`,
    maxTokens: 1000,
    temperature: 0.4
  }
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const generateResponse = async (agentType: AgentType, messages: any[]): Promise<string> => {
    try {
      const config = agentConfigs[agentType];
      
      // Prepend system message with agent-specific context
      const fullMessages = [
        { role: 'system', content: config.systemPrompt },
        ...messages
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: fullMessages,
        max_tokens: config.maxTokens,
        temperature: config.temperature
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    }
  };

  const value = {
    generateResponse,
    agents: agentConfigs
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};