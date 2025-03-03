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
      const { agentType, context } = req.body;
      
      if (!agentType) {
        return res.status(400).json({ error: 'Missing agentType' });
      }

      // Find an available agent and lock it
      const agent = await prisma.agent.findFirst({
        where: {
          type: agentType as AgentType,
          status: AgentStatus.AVAILABLE,
        },
      });

      if (!agent) {
        return res.status(404).json({ 
          error: `No available agents found for type: ${agentType}`
        });
      }

      // Update agent status atomically
      const updatedAgent = await prisma.agent.update({
        where: {
          id: agent.id,
          status: AgentStatus.AVAILABLE // Ensure agent is still available
        },
        data: {
          status: AgentStatus.BUSY, // Using BUSY instead of CONNECTED
          updatedAt: new Date()
        },
        include: {
          department: true,
          metrics: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          }
        }
      });

      // Get the department type
      let departmentType: DepartmentType;
      try {
        departmentType = getDepartmentTypeForAgent(agentType as AgentType);
      } catch (error) {
        // Revert agent status if department lookup fails
        await prisma.agent.update({
          where: { id: agent.id },
          data: { status: AgentStatus.AVAILABLE }
        });
        return res.status(404).json({ 
          error: 'Invalid agent type',
          details: error instanceof Error ? error.message : String(error)
        });
      }

      // Initialize department and agent
      try {
        await departmentManager.initializeDepartment(departmentType);
        const departmentAgent = departmentManager.getDepartmentAgents(departmentType)
          .find(a => a.getType() === agentType);

        if (!departmentAgent) {
          throw new Error('Failed to initialize department agent');
        }

        // Initialize agent with context if provided
        if (context) {
          await departmentAgent.initialize(context);
        }

        // Update metrics
        if (updatedAgent.metrics && updatedAgent.metrics.length > 0) {
          await prisma.agentMetrics.update({
            where: { id: updatedAgent.metrics[0].id },
            data: { lastActive: new Date() }
          });
        } else {
          // Create initial metrics if none exist
          await prisma.agentMetrics.create({
            data: {
              agentId: updatedAgent.id,
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
          message: `Agent ${agentType} connected successfully.`,
          agent: updatedAgent,
          department: {
            type: departmentType,
            name: updatedAgent.department.name,
            id: updatedAgent.department.id
          }
        });

      } catch (error) {
        // Revert agent status if initialization fails
        await prisma.agent.update({
          where: { id: agent.id },
          data: { status: AgentStatus.AVAILABLE }
        });
        throw error;
      }

    } catch (error) {
      console.error('Error connecting agent:', error);
      return res.status(500).json({ 
        error: 'Failed to connect agent', 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

function getDepartmentTypeForAgent(agentType: AgentType): DepartmentType {
  // Map agent types to their departments
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