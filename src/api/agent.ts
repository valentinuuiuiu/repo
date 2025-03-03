import { PrismaClient, AgentType, AgentStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface ConnectAgentRequest {
  agentType: AgentType;
  departmentId?: string;
}

interface AgentResponse {
  success: boolean;
  agent?: any;
  error?: string;
}

export const agentApi = {
  connect: async ({ agentType, departmentId }: ConnectAgentRequest): Promise<AgentResponse> => {
    try {
      // Find an available agent of the requested type with department info
      const agent = await prisma.agent.findFirst({
        where: {
          type: agentType,
          status: AgentStatus.AVAILABLE,
          ...(departmentId ? { departmentId } : {})
        },
        include: {
          department: true,
          metrics: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      });

      if (!agent) {
        console.log(`No available agent found for type ${agentType}`);
        return {
          success: false,
          error: `No available agents found for type ${agentType}`
        };
      }

      // Update agent status to BUSY and get updated agent
      const updatedAgent = await prisma.agent.update({
        where: { id: agent.id },
        data: { status: AgentStatus.BUSY },
        include: {
          department: true,
          metrics: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      });

      // Create a new metric entry for this connection
      await prisma.agentMetrics.create({
        data: {
          agentId: agent.id,
          totalInteractions: 0,
          successfulInteractions: 0,
          averageResponseTime: 0,
          errorRate: 0,
          lastActive: new Date()
        }
      });

      console.log(`Successfully connected agent ${agent.name} (${agent.type})`);
      return {
        success: true,
        agent: updatedAgent
      };
    } catch (error) {
      console.error('Error connecting to agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      };
    }
  },

  disconnect: async (agentId: string): Promise<AgentResponse> => {
    try {
      // Find the agent first to check if it exists
      const agent = await prisma.agent.findUnique({
        where: { id: agentId }
      });

      if (!agent) {
        return {
          success: false,
          error: 'Agent not found'
        };
      }

      // Update agent status to AVAILABLE
      const updatedAgent = await prisma.agent.update({
        where: { id: agentId },
        data: { status: AgentStatus.AVAILABLE },
        include: {
          department: true,
          metrics: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      });

      console.log(`Successfully disconnected agent ${agent.name} (${agent.type})`);
      return {
        success: true,
        agent: updatedAgent
      };
    } catch (error) {
      console.error('Error disconnecting agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      };
    }
  },

  getAllAgents: async () => {
    try {
      const agents = await prisma.agent.findMany({
        include: {
          department: true,
          metrics: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      });
      return { success: true, agents };
    } catch (error) {
      console.error('Error fetching agents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      };
    }
  },

  getAgentById: async (id: string) => {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id },
        include: {
          department: true,
          metrics: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      });
      if (!agent) {
        return { success: false, error: 'Agent not found' };
      }
      return { success: true, agent };
    } catch (error) {
      console.error('Error fetching agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      };
    }
  },
  
  // New function to register an agent
  registerAgent: async (agentData: {
    name: string;
    type: AgentType;
    description: string;
    departmentId: string;
    capabilities?: string[];
    config?: Record<string, any>;
  }): Promise<AgentResponse> => {
    try {
      // Check if agent of this type already exists
      const existingAgent = await prisma.agent.findFirst({
        where: { type: agentData.type }
      });
      
      if (existingAgent) {
        // If agent exists but is stuck in BUSY status, reset it
        if (existingAgent.status === AgentStatus.BUSY) {
          const updatedAgent = await prisma.agent.update({
            where: { id: existingAgent.id },
            data: { 
              status: AgentStatus.AVAILABLE,
              name: agentData.name,
              description: agentData.description,
              capabilities: agentData.capabilities || existingAgent.capabilities,
              config: agentData.config || undefined
            },
            include: {
              department: true,
              metrics: {
                orderBy: { timestamp: 'desc' },
                take: 1
              }
            }
          });
          
          console.log(`Reset existing agent ${updatedAgent.name} (${updatedAgent.type}) to AVAILABLE status`);
          return {
            success: true,
            agent: updatedAgent
          };
        }
        
        // If agent exists and is not BUSY, return it
        return {
          success: true,
          agent: existingAgent
        };
      }
      
      // Create new agent
      const newAgent = await prisma.agent.create({
        data: {
          name: agentData.name,
          type: agentData.type,
          description: agentData.description,
          departmentId: agentData.departmentId,
          status: AgentStatus.AVAILABLE,
          capabilities: agentData.capabilities || [],
          config: agentData.config || undefined
        },
        include: {
          department: true
        }
      });
      
      // Create initial metrics
      await prisma.agentMetrics.create({
        data: {
          agentId: newAgent.id,
          totalInteractions: 0,
          successfulInteractions: 0,
          averageResponseTime: 0,
          errorRate: 0,
          lastActive: new Date()
        }
      });
      
      console.log(`Registered new agent ${newAgent.name} (${newAgent.type})`);
      return {
        success: true,
        agent: newAgent
      };
    } catch (error) {
      console.error('Error registering agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      };
    }
  }
};