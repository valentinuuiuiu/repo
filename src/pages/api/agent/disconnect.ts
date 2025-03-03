import { NextApiRequest, NextApiResponse } from 'next';
import { AgentType } from '@prisma/client';
import { DepartmentManager } from '../../../lib/ai/framework/departments/DepartmentManager';
import { SwarmManager } from '../../../lib/ai/framework/swarm/SwarmManager';
import { DepartmentType } from '../../../lib/ai/framework/departments/DepartmentConfig';
import { prisma } from '@/lib/prisma';
import { AgentStatus } from '@prisma/client';

const swarmManager = new SwarmManager();
const departmentManager = new DepartmentManager(swarmManager);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { agentId } = req.body;
      
      if (!agentId) {
        return res.status(400).json({ error: 'Missing agentId' });
      }

      // Find the connected agent
      const agent = await prisma.agent.findFirst({
        where: {
          id: agentId,
          status: AgentStatus.BUSY, // Using BUSY instead of CONNECTED
        },
        include: {
          department: true,
          metrics: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          }
        }
      });

      if (!agent) {
        return res.status(404).json({ 
          error: `No connected agent found with ID: ${agentId}`
        });
      }

      // Get the department type
      let departmentType: DepartmentType;
      
      try {
        departmentType = getDepartmentTypeForAgent(agent.type);
      } catch (error) {
        console.warn('Department type lookup failed:', error);
        // Continue with disconnect even if department lookup fails
      }

      // Attempt to clean up department agent if possible
      if (departmentType) {
        try {
          const departmentAgent = departmentManager.getDepartmentAgents(departmentType)
            .find(a => a.getType() === agent.type);
          
          if (departmentAgent) {
            // Save any pending state
            await departmentAgent.saveState?.();
            // Cancel any ongoing tasks
            await departmentAgent.cancelTasks?.();
            // Clean up subscriptions and connections
            await departmentAgent.cleanup?.();
          }
        } catch (error) {
          console.warn('Non-critical error during agent cleanup:', error);
        }
      }

      // Update agent status atomically
      const updatedAgent = await prisma.agent.update({
        where: {
          id: agent.id,
          status: AgentStatus.BUSY // Using BUSY instead of CONNECTED
        },
        data: {
          status: AgentStatus.AVAILABLE,
          updatedAt: new Date()
        }
      });

      // Update metrics
      if (agent.metrics && agent.metrics.length > 0) {
        await prisma.agentMetrics.update({
          where: { id: agent.metrics[0].id },
          data: {
            lastActive: new Date()
          }
        });
      } else {
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
      }

      return res.status(200).json({
        success: true,
        message: `Agent ${agent.type} disconnected successfully.`,
        agent: updatedAgent
      });
    } catch (error) {
      console.error('Error disconnecting agent:', error);
      return res.status(500).json({ 
        error: 'Failed to disconnect agent', 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

function getDepartmentTypeForAgent(agentType: AgentType): DepartmentType {
  // Map agent types to their departments - must match connect.ts mapping
  const agentToDepartment = {
    [AgentType.PRICING_OPTIMIZATION]: DepartmentType.PRODUCT_MANAGEMENT,
    [AgentType.CUSTOMER_SERVICE]: DepartmentType.CUSTOMER_EXPERIENCE,
    [AgentType.MARKET_ANALYSIS]: DepartmentType.MARKET_INTELLIGENCE,
    [AgentType.INVENTORY_MANAGEMENT]: DepartmentType.OPERATIONS,
    [AgentType.ORDER_PROCESSING]: DepartmentType.OPERATIONS,
    [AgentType.SUPPLIER_COMMUNICATION]: DepartmentType.OPERATIONS,
    [AgentType.QUALITY_CONTROL]: DepartmentType.OPERATIONS,
    [AgentType.CODE_MAINTENANCE]: DepartmentType.TECHNOLOGY,
  };

  const departmentType = agentToDepartment[agentType];
  
  if (!departmentType) {
    throw new Error(`No department mapping found for agent type: ${agentType}`);
  }
  
  return departmentType;
}