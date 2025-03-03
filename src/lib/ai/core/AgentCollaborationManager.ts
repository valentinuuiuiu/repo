import { EventEmitter } from 'events';
import { prisma } from '@/lib/prisma';
import { AgentManager } from './AgentManager';
import type { Prisma } from '@prisma/client';

export class AgentCollaborationManager {
  private eventBus: EventEmitter;
  private agentManager: AgentManager;

  constructor() {
    this.eventBus = new EventEmitter();
    this.agentManager = new AgentManager();
  }

  async initiateCollaboration(taskData: {
    id: string;
    title: string;
    description: string;
    departments: string[];
    requiredCapabilities: string[];
    priority: 'low' | 'medium' | 'high';
    data: any;
  }): Promise<string> {
    // Find agents that match the required capabilities
    const agents = await prisma.agent.findMany({
      where: {
        departmentId: { in: taskData.departments },
        capabilities: {
          hasSome: taskData.requiredCapabilities
        },
        status: 'AVAILABLE'
      },
      include: {
        metrics: true,
        specializations: true
      }
    });

    if (agents.length === 0) {
      throw new Error('No suitable agents found for collaboration');
    }

    // Create collaboration record
    const collaboration = await prisma.agentCollaboration.create({
      data: {
        id: taskData.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: 'PENDING',
        successRate: 0,
        frequency: 0,
        lastCollaborated: new Date(),
        metadata: taskData.data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Add participating agents
    for (const agent of agents) {
      await prisma.agentCollaboration.update({
        where: { id: collaboration.id },
        data: {
          successRate: agent.metrics[0]?.successfulInteractions 
            ? Number((agent.metrics[0].successfulInteractions / agent.metrics[0].totalInteractions).toFixed(2))
            : 0,
          frequency: agent.metrics[0]?.totalInteractions || 0
        }
      });
    }

    // Find the most effective collaborators based on past performance
    const topCollaborators = await prisma.agent.findMany({
      where: {
        id: { in: agents.map(a => a.id) }
      },
      orderBy: {
        metrics: {
          _count: 'desc'
        }
      },
      take: 3
    });

    // Emit collaboration initiated event
    this.eventBus.emit('collaboration:initiated', {
      collaborationId: collaboration.id,
      agents: topCollaborators.map(a => a.id)
    });

    return collaboration.id;
  }

  async trackCollaborationOutcome(
    collaborationId: string,
    success: boolean,
    metrics: {
      consensusScore: number;
      completionTime: number;
      resourceUsage: number;
    }
  ): Promise<void> {
    const collaboration = await prisma.agentCollaboration.findUnique({
      where: { id: collaborationId },
      include: { agents: true }
    });

    if (!collaboration) {
      throw new Error('Collaboration not found');
    }

    // Update collaboration metrics
    await prisma.agentCollaboration.update({
      where: { id: collaborationId },
      data: {
        status: success ? 'COMPLETED' : 'FAILED',
        successRate: success 
          ? (collaboration.successRate * collaboration.frequency + metrics.consensusScore) / (collaboration.frequency + 1)
          : collaboration.successRate,
        frequency: { increment: 1 },
        lastCollaborated: new Date(),
        metadata: {
          ...collaboration.metadata,
          lastOutcome: {
            success,
            metrics
          }
        }
      }
    });

    // Emit collaboration completed event
    this.eventBus.emit('collaboration:completed', {
      collaborationId,
      success,
      metrics
    });
  }

  async getCollaborationMetrics(agentId: string): Promise<any> {
    const results = await prisma.agentCollaboration.findMany({
      where: {
        agents: {
          some: {
            id: agentId
          }
        }
      },
      include: {
        agents: true
      }
    });

    return {
      totalCollaborations: results.length,
      successRate: results.reduce((acc, curr) => acc + curr.successRate, 0) / results.length,
      frequentCollaborators: this.findFrequentCollaborators(results, agentId)
    };
  }

  private findFrequentCollaborators(collaborations: any[], agentId: string) {
    const collaboratorFrequency = new Map<string, number>();
    
    for (const collab of collaborations) {
      const otherAgents = collab.agents.filter((a: any) => a.id !== agentId);
      for (const agent of otherAgents) {
        collaboratorFrequency.set(
          agent.id, 
          (collaboratorFrequency.get(agent.id) || 0) + 1
        );
      }
    }
    
    return Array.from(collaboratorFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, frequency]) => ({ id, frequency }));
  }

  onCollaborationComplete(callback: (result: any) => void): () => void {
    this.eventBus.on('collaboration:completed', callback);
    return () => this.eventBus.off('collaboration:completed', callback);
  }
}