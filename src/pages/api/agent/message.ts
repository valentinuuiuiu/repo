import { NextApiRequest, NextApiResponse } from 'next';
import { AgentType, AgentResponse as ApiAgentResponse } from '../../../types/agent';
import { DepartmentManager } from '../../../lib/ai/framework/departments/DepartmentManager';
import { SwarmManager } from '../../../lib/ai/framework/swarm/SwarmManager';
import { AgentMessage, AgentResponse as LibAgentResponse } from '../../../lib/ai/types';
import { DepartmentType } from '../../../lib/ai/framework/departments/DepartmentConfig';
import { getCorrectDepartmentType, localToPrismaAgentType } from '../../../lib/ai/adapters/AgentTypeAdapter';

const swarmManager = new SwarmManager();
const departmentManager = new DepartmentManager(swarmManager);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { agentType, message, context } = req.body;
      
      if (!agentType || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Get the department type for this agent
      let departmentType: DepartmentType;
      try {
        const depType = getCorrectDepartmentType(agentType as AgentType);
        departmentType = DepartmentType[depType as keyof typeof DepartmentType];
      } catch (error) {
        return res.status(404).json({ 
          error: 'Invalid agent type',
          details: error instanceof Error ? error.message : String(error)
        });
      }
      
      // Initialize department if not already initialized
      try {
        await departmentManager.initializeDepartment(departmentType);
      } catch (error) {
        console.warn('Department initialization warning:', error);
      }
      
      // Get agents for the department
      const agents = departmentManager.getDepartmentAgents(departmentType);
      
      // Convert local agent type to Prisma agent type for proper matching
      const prismaAgentType = localToPrismaAgentType(agentType as AgentType);
      
      // Find agent that matches the type
      let agent = agents.find(a => a.getType() === prismaAgentType);
      
      // If no exact match but agents exist, use first available (fallback)
      if (!agent && agents.length > 0) {
        console.warn(`No exact match for agent type: ${agentType}, using first available agent of type: ${agents[0].getType()}`);
        agent = agents[0];
      }
      
      if (!agent) {
        return res.status(404).json({ 
          error: `No agent found for type: ${agentType}`,
          department: departmentType,
          availableTypes: agents.map(a => a.getType())
        });
      }
      
      const agentMessage: AgentMessage = {
        id: `msg-${Date.now()}`,
        type: 'user_message',
        from: agentType as string,
        content: message,
        timestamp: new Date(),
        context: context || {}
      };
      
      // Handle the message
      const response = await agent.handleMessage(agentMessage) as LibAgentResponse;
      
      // Map the response to API format
      const agentApiResponse: ApiAgentResponse = {
        id: (response.metadata as any)?.id?.toString() || `resp-${Date.now()}`,
        timestamp: Date.now(),
        message: typeof response.data === 'string' ? response.data : 
                (response.data as { response?: string, message?: string })?.response ||
                (response.data as { response?: string, message?: string })?.message ||
                (response as any)?.error || 
                'No message returned from agent',
        agentType: agentType as AgentType,
        status: response.success ? 'success' : 'error',
        context: context || {},
        metadata: {
          ...(response.metadata as any) || {},
          departmentType,
          originalAgentType: prismaAgentType
        },
      };
      
      return res.status(200).json(agentApiResponse);
    } catch (error) {
      console.error('Error processing agent message:', error);
      const errorResponse: ApiAgentResponse = {
        id: `error-${Date.now()}`,
        timestamp: Date.now(),
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        agentType: req.body.agentType as AgentType,
        status: 'error',
        error: true,
        context: req.body.context || {},
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
      
      return res.status(500).json(errorResponse);
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}