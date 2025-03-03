import { EventEmitter } from 'events';
import { prisma } from '@/lib/prisma';
import { GraphManager, GraphNode, GraphEdge } from '../tools/GraphManager';
import { AgentManager } from './AgentManager';
import { WorkflowOrchestrator } from './WorkflowOrchestrator';
import { AgentCollaborationManager } from './AgentCollaborationManager';

interface AgentGraphNode extends GraphNode {
  type: 'agent';
  properties: {
    agentId: string;
    name: string;
    type: string;
    departmentId: string;
    capabilities: string[];
    performanceScore?: number;
    lastActive?: string;
  };
}

interface DepartmentGraphNode extends GraphNode {
  type: 'department';
  properties: {
    departmentId: string;
    name: string;
    agentCount: number;
  };
}

interface TaskGraphNode extends GraphNode {
  type: 'task';
  properties: {
    taskId: string;
    name: string;
    status: string;
    priority: string;
    createdAt: string;
  };
}

interface WorkflowGraphNode extends GraphNode {
  type: 'workflow';
  properties: {
    workflowId: string;
    name: string;
    status: string;
    progress: number;
    startedAt: string;
  };
}

interface CollaborationGraphEdge extends GraphEdge {
  type: 'collaborates_with';
  properties: {
    successRate: number;
    frequency: number;
    lastCollaborated: string;
  };
}

interface AssignmentGraphEdge extends GraphEdge {
  type: 'assigned_to';
  properties: {
    assignedAt: string;
    status: string;
  };
}

interface MembershipGraphEdge extends GraphEdge {
  type: 'member_of';
  properties: {
    joinedAt: string;
    role: string;
  };
}

interface WorkflowStepGraphEdge extends GraphEdge {
  type: 'workflow_step';
  properties: {
    stepId: string;
    order: number;
    dependsOn: string[];
  };
}

export type TaskPriority = 'low' | 'medium' | 'high';

class GraphManager {
  // ...existing code...
  
  updateEdge(edgeId: string, properties: Record<string, any>): void {
    const edge = this.getEdge(edgeId);
    if (!edge) return;
    
    const updatedEdge = {
      ...edge,
      properties: {
        ...edge.properties,
        ...properties
      },
      updated: new Date().toISOString()
    };
    
    this.edges.set(edgeId, updatedEdge);
  }
}

export class AgentGraphOrchestrator {
  private graphManager: GraphManager;
  private agentManager: AgentManager;
  private workflowOrchestrator: WorkflowOrchestrator;
  private collaborationManager: AgentCollaborationManager;
  private eventBus: EventEmitter;
  private initialized: boolean = false;

  constructor() {
    this.graphManager = new GraphManager();
    this.agentManager = new AgentManager();
    this.workflowOrchestrator = new WorkflowOrchestrator();
    this.collaborationManager = new AgentCollaborationManager();
    this.eventBus = new EventEmitter();
    
    // Register event listeners
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Listen for collaboration events
    this.collaborationManager.onCollaborationComplete((result) => {
      this.updateCollaborationEdges(
        result.participatingAgents, 
        result.success, 
        result.metrics.consensusScore
      );
    });

    // Listen for workflow progress
    this.workflowOrchestrator.onWorkflowProgress((update) => {
      this.updateWorkflowProgress(update.workflowId, update.completedSteps / update.totalSteps);
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load all departments
    await this.loadDepartmentsToGraph();
    
    // Load all agents
    await this.loadAgentsToGraph();
    
    // Load agent collaborations
    await this.loadCollaborationsToGraph();
    
    this.initialized = true;
  }

  private async loadDepartmentsToGraph(): Promise<void> {
    const departments = await prisma.department.findMany();
    
    for (const dept of departments) {
      const agentCount = await prisma.agent.count({
        where: { departmentId: dept.id }
      });

      // Add department node to graph
      this.graphManager.addNode({
        id: `dept:${dept.id}`,
        type: 'department',
        properties: {
          departmentId: dept.id,
          name: dept.name,
          agentCount
        }
      });
    }
  }

  private async loadAgentsToGraph(): Promise<void> {
    const agents = await prisma.agent.findMany({
      include: {
        metrics: true,
        department: true
      }
    });
    
    for (const agent of agents) {
      // Calculate performance score
      const metrics = agent.metrics[0];
      const successRate = metrics ? metrics.successfulInteractions / metrics.totalInteractions : 0;
      
      // Add agent node to graph
      const agentNode = this.graphManager.addNode({
        id: `agent:${agent.id}`,
        type: 'agent',
        properties: {
          agentId: agent.id,
          name: agent.name,
          type: agent.type,
          departmentId: agent.departmentId,
          capabilities: agent.capabilities,
          performanceScore: successRate,
          lastActive: metrics?.lastActive.toISOString() || new Date().toISOString()
        }
      });

      // Add edge connecting agent to department
      this.graphManager.addEdge({
        source: `agent:${agent.id}`,
        target: `dept:${agent.departmentId}`,
        type: 'member_of',
        properties: {
          joinedAt: agent.createdAt.toISOString(),
          role: agent.type
        }
      });
    }
  }

  private async loadCollaborationsToGraph(): Promise<void> {
    const collaborations = await prisma.agentCollaboration.findMany({
      where: {
        collaboratorId: { not: '' }
      }
    });
    
    for (const collab of collaborations) {
      // Add edge connecting collaborating agents
      this.graphManager.addEdge({
        source: `agent:${collab.agentId}`,
        target: `agent:${collab.collaboratorId}`,
        type: 'collaborates_with',
        properties: {
          successRate: collab.successRate,
          frequency: collab.frequency,
          lastCollaborated: collab.lastCollaborated.toISOString()
        }
      });
    }
  }

  async addTaskToGraph(
    taskId: string, 
    name: string, 
    priority: string, 
    assignedAgentId: string | null = null
  ): Promise<string> {
    // Add task node to graph
    const taskNodeId = `task:${taskId}`;
    this.graphManager.addNode({
      id: taskNodeId,
      type: 'task',
      properties: {
        taskId,
        name,
        status: 'pending',
        priority,
        createdAt: new Date().toISOString()
      }
    });

    // If assigned to an agent, create edge
    if (assignedAgentId) {
      this.graphManager.addEdge({
        source: taskNodeId,
        target: `agent:${assignedAgentId}`,
        type: 'assigned_to',
        properties: {
          assignedAt: new Date().toISOString(),
          status: 'pending'
        }
      });
    }

    return taskNodeId;
  }

  async addWorkflowToGraph(workflowId: string, name: string, steps: any[]): Promise<string> {
    // Add workflow node to graph
    const workflowNodeId = `workflow:${workflowId}`;
    this.graphManager.addNode({
      id: workflowNodeId,
      type: 'workflow',
      properties: {
        workflowId,
        name,
        status: 'pending',
        progress: 0,
        startedAt: new Date().toISOString()
      }
    });

    // Add workflow steps as task nodes
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepId = `task:${workflowId}:${step.id}`;
      
      // Add task node
      this.graphManager.addNode({
        id: stepId,
        type: 'task',
        properties: {
          taskId: step.id,
          name: step.taskType,
          status: 'pending',
          priority: step.priority,
          createdAt: new Date().toISOString()
        }
      });
      
      // Add edge connecting workflow to task
      this.graphManager.addEdge({
        source: workflowNodeId,
        target: stepId,
        type: 'workflow_step',
        properties: {
          stepId: step.id,
          order: i,
          dependsOn: step.dependsOn || []
        }
      });
      
      // Add dependencies between steps
      if (step.dependsOn?.length) {
        for (const depId of step.dependsOn) {
          this.graphManager.addEdge({
            source: `task:${workflowId}:${depId}`,
            target: stepId,
            type: 'depends_on',
            properties: {
              createdAt: new Date().toISOString()
            }
          });
        }
      }
    }

    return workflowNodeId;
  }

  // Update collaboration edges with new success rates
  private async updateCollaborationEdges(
    agentIds: string[], 
    success: boolean, 
    consensusScore: number
  ): Promise<void> {
    for (let i = 0; i < agentIds.length; i++) {
      for (let j = i + 1; j < agentIds.length; j++) {
        const sourceId = `agent:${agentIds[i]}`;
        const targetId = `agent:${agentIds[j]}`;
        
        const results = this.graphManager.query({
          startNodeId: sourceId,
          edgeTypes: ['collaborates_with'],
          maxDepth: 1
        });
        
        const existingEdge = results.edges.find(edge => 
          (edge.source === sourceId && edge.target === targetId) || 
          (edge.source === targetId && edge.target === sourceId)
        );
        
        if (existingEdge) {
          const newSuccessRate = success 
            ? existingEdge.properties.successRate * 0.9 + consensusScore * 0.1
            : existingEdge.properties.successRate * 0.9;
            
          this.graphManager.updateEdge(existingEdge.id, {
            successRate: newSuccessRate,
            frequency: existingEdge.properties.frequency + 1,
            lastCollaborated: new Date().toISOString()
          });
        } else {
          this.graphManager.addEdge({
            source: sourceId,
            target: targetId,
            type: 'collaborates_with',
            properties: {
              successRate: success ? consensusScore : 0.5,
              frequency: 1,
              lastCollaborated: new Date().toISOString()
            }
          });
        }
      }
    }
  }

  private updateWorkflowProgress(workflowId: string, progress: number): void {
    const workflowNodeId = `workflow:${workflowId}`;
    const workflowNode = this.graphManager.getNode(workflowNodeId);
    
    if (workflowNode) {
      this.graphManager.updateNode(workflowNodeId, {
        progress,
        status: progress >= 1 ? 'completed' : 'in_progress'
      });
    }
  }

  async findOptimalAgentForTask(taskType: string, departmentId?: string): Promise<string | null> {
    // Look for agents with matching capabilities
    const agents = await prisma.agent.findMany({
      where: {
        capabilities: {
          hasSome: [taskType]
        },
        departmentId: departmentId ? departmentId : undefined,
        status: 'AVAILABLE'
      },
      include: {
        metrics: true,
        specializations: {
          where: {
            taskType: taskType
          }
        }
      },
      orderBy: {
        specializations: {
          _count: 'desc'
        }
      }
    });
    
    if (agents.length === 0) return null;
    
    return agents[0].id;
  }

  async recommendCollaboratingAgents(taskType: string, count: number = 3): Promise<string[]> {
    // Use graph to find agents with strong collaboration patterns
    const communities = this.graphManager.findCommunities();
    const centrality = this.graphManager.calculateCentrality();
    
    // Find community with highest average centrality containing agents with required capability
    const communityScores = await Promise.all(communities.map(async (community) => {
      const agentIds = community
        .filter(id => id.startsWith('agent:'))
        .map(id => id.replace('agent:', ''));
      
      const agents = await prisma.agent.findMany({
        where: {
          id: { in: agentIds },
          capabilities: {
            hasSome: [taskType]
          }
        }
      });
      
      // Calculate community score based on capability match and centrality
      const avgCentrality = community.reduce(
        (sum, id) => sum + (centrality[id]?.betweenness || 0), 
        0
      ) / community.length;
      
      return {
        community: agentIds,
        capabilityMatch: agents.length / agentIds.length,
        avgCentrality,
        score: agents.length * avgCentrality
      };
    }));
    
    // Sort by score and take the best community
    const bestCommunity = communityScores.sort((a, b) => b.score - a.score)[0];
    
    if (!bestCommunity || bestCommunity.community.length === 0) {
      // Fallback to finding agents with the capability
      const agents = await prisma.agent.findMany({
        where: {
          capabilities: {
            hasSome: [taskType]
          },
          status: 'AVAILABLE'
        },
        orderBy: {
          specializations: {
            proficiencyScore: 'desc'
          }
        },
        take: count
      });
      
      return agents.map(a => a.id);
    }
    
    // Return up to count agents from the best community
    return bestCommunity.community.slice(0, count);
  }

  async getAgentNetworkVisualization(): Promise<any> {
    // Get visualization data from graph manager
    return this.graphManager.getVisualizationData();
  }
  
  // Method to find potential bottlenecks in workflows
  async analyzeWorkflowBottlenecks(): Promise<any> {
    const workflows = this.graphManager.query({
      nodeTypes: ['workflow'],
      maxDepth: 0
    }).nodes;
    
    const bottlenecks = [];
    
    for (const workflow of workflows) {
      // Get all tasks in this workflow
      const tasks = this.graphManager.query({
        startNodeId: workflow.id,
        edgeTypes: ['workflow_step'],
        maxDepth: 1
      }).nodes.filter(n => n.type === 'task');
      
      // Find tasks with high dependency count (potential bottlenecks)
      for (const task of tasks) {
        // Count how many tasks depend on this one
        const dependents = this.graphManager.query({
          nodeTypes: ['task'],
          edgeTypes: ['depends_on'],
          maxDepth: 1
        }).nodes.filter(n => 
          n.type === 'task' && 
          this.graphManager.findPaths(n.id, task.id, 1).length > 0
        );
        
        if (dependents.length > 2) {
          bottlenecks.push({
            workflowId: workflow.properties.workflowId,
            taskId: task.properties.taskId,
            dependentCount: dependents.length,
            importance: 'high'
          });
        }
      }
    }
    
    return bottlenecks;
  }
  
  // Update the GraphManager's updateEdge method
  private updateEdge(edgeId: string, properties: Record<string, any>): GraphEdge | undefined {
    const edge = this.graphManager.getEdge(edgeId);
    
    if (!edge) {
      return undefined;
    }
    
    const updatedEdge: GraphEdge = {
      ...edge,
      properties: {
        ...edge.properties,
        ...properties
      },
      updated: new Date().toISOString()
    };
    
    // Since GraphManager doesn't have an updateEdge method, we'll simulate it
    this.graphManager.addEdge({
      id: updatedEdge.id,
      source: updatedEdge.source,
      target: updatedEdge.target,
      type: updatedEdge.type,
      properties: updatedEdge.properties
    } as any);
    
    return updatedEdge;
  }
}