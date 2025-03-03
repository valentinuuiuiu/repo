import { AgentType, AgentStatus } from '@prisma/client';
import { ProviderManager } from './providers/ProviderManager';

export interface AgentInsight {
  id: string;
  name: string;
  result: string;
}

interface AgentState {
  agentId: string;
  status: AgentStatus;
  lastError?: string;
}

interface AgentConnection {
  agentType: AgentType;
  departmentId?: string;
}

class AgentService {
  private initialized = false;

  async initialize() {
    if (this.initialized) {
      return;
    }

    await ProviderManager.initializeProviders({
      openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY
    });

    this.initialized = true;
  }

  async connectAgent(agentType: AgentType, departmentId: string) {
    try {
      await this.initialize();
      const provider = ProviderManager.getPrimaryProvider();

      // Test the connection by sending a simple message
      await provider.chat([{
        role: 'system',
        content: `You are now initializing as a ${agentType} agent.`
      }]);

      return {
        success: true,
        agent: {
          type: agentType,
          status: AgentStatus.BUSY,
          departmentId
        }
      };
    } catch (error) {
      console.error('Failed to connect agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async disconnectAgent(agentId: string) {
    try {
      // Simply mark the agent as available since there's no actual connection to close
      return {
        success: true
      };
    } catch (error) {
      console.error('Failed to disconnect agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async sendMessage(agentType: AgentType, message: string, context?: any) {
    try {
      await this.initialize();
      const provider = ProviderManager.getPrimaryProvider();

      const response = await provider.chat([
        {
          role: 'system',
          content: `You are a ${agentType} agent. ${context ? JSON.stringify(context) : ''}`
        },
        {
          role: 'user',
          content: message
        }
      ]);

      return {
        success: true,
        response: response.content
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getAllAgents() {
    try {
      // This would typically fetch from a database, but for now return an empty array
      return {
        success: true,
        agents: []
      };
    } catch (error) {
      console.error('Failed to get agents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const agentService = new AgentService();
