import { AgentManager } from "./core/AgentManager";
import { PrismaClient } from '@prisma/client';
import { TaskType, Task as BaseTask, AgentResponse } from './types';
import { semanticSearch, upsertToCollection } from './db/embeddings';
import { HandymanAgent } from './agents/HandymanAgent';

// Import from generated types
const prisma = new PrismaClient();
export type AgentType = 'CUSTOMER_SERVICE' | 'INVENTORY_MANAGEMENT' | 'PRICING_OPTIMIZATION' | 'SUPPLIER_COMMUNICATION' | 'ORDER_PROCESSING' | 'QUALITY_CONTROL';

export interface AgentInsight {
  agentId: string;
  type: AgentType;
  name: string;
  result: string;
  performance: AgentPerformance;
  lastActive?: Date;
  status: 'active' | 'idle' | 'error';
}

export interface AgentPerformance {
  successRate: number;
  averageConfidence: number;
  averageProcessingTime: number;
  tasksByType: Record<string, number>;
  errorRate: number;
  processingTime?: number;
}

export interface Task {
  type: TaskType;
  data: any;
  departments: string[];
  priority?: 'low' | 'medium' | 'high';
}

export class AIService {
  public manager: AgentManager;
  private handymanAgent: HandymanAgent;
  
  constructor() {
    this.manager = new AgentManager();
    this.handymanAgent = new HandymanAgent();
  }

  async executeTask(task: Task): Promise<any> {
    // Handle code maintenance tasks
    if (task.type === 'code_maintenance') {
      switch (task.data.action) {
        case 'analyze':
          return await this.handymanAgent.analyzeCodingStyle();
        case 'fix':
          return await this.handymanAgent.fixTypescriptErrors(task.data.file);
        case 'optimize':
          return await this.handymanAgent.suggestOptimizations(task.data.file);
        default:
          throw new Error('Unknown code maintenance action');
      }
    }

    // Handle existing task types
    if (task.type === 'product_optimization' || task.type === 'market_research') {
      const searchResults = await semanticSearch('products', JSON.stringify(task.data), 5);
      task.data.similarItems = searchResults;
    }

    return await this.manager.coordinateTask({
      type: task.type,
      data: task.data,
      departments: task.departments,
      priority: task.priority
    });
  }

  async indexProduct(product: any) {
    await upsertToCollection('products', [{
      id: product.id,
      text: `${product.title} ${product.description || ''} ${product.category || ''} ${product.tags?.join(' ') || ''}`,
      metadata: {
        title: product.title,
        category: product.category,
        price: product.price,
        inventory: product.inventory
      }
    }]);
  }

  async findSimilarProducts(productId: string, limit: number = 5) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        // Only include relations that are defined in your Prisma schema
        // Remove 'tags' if it's not a defined relation
      }
    });

    if (!product) return [];

    const searchText = `${product.title} ${product.description || ''} ${product.category || ''}`;
    const results = await semanticSearch('products', searchText, limit);
    
    return results;
  }

  async getAgentStatuses(): Promise<Array<{
    agentId: string;
    type: AgentType;
    status: 'active' | 'idle' | 'error';
    lastResult?: string;
    lastActive?: Date;
  }>> {
    // Return a default array if no statuses are found
    try {
      const statuses = await this.manager.getAgentStatuses();
      
      // Comprehensive type guard and extraction functions
      const safeGet = <T>(obj: any, path: string[], defaultValue: T): T => {
        return path.reduce((acc, key) => 
          acc && typeof acc === 'object' ? acc[key] : undefined, obj) || defaultValue;
      };

      const extractStatus = (statusObj: any): 'active' | 'idle' | 'error' => {
        const possibleStatuses = [
          safeGet(statusObj, ['status'], ''),
          safeGet(statusObj, ['product', 'status'], ''),
          safeGet(statusObj, ['state', 'status'], ''),
          safeGet(statusObj, ['circuitBreakerMetrics', 'state'], '')
        ];

        // Map external status values to AgentInsight status values
        const statusMap: Record<string, 'active' | 'idle' | 'error'> = {
          'active': 'active',
          'inactive': 'idle',
          'degraded': 'error'
        };

        const foundStatus = possibleStatuses.find(
          status => ['active', 'inactive', 'degraded'].includes(status as string)
        );

        return statusMap[foundStatus as string] || 'idle';
      };

      const extractType = (statusObj: any): AgentType => {
        const possibleTypes: AgentType[] = [
          'CUSTOMER_SERVICE', 
          'INVENTORY_MANAGEMENT', 
          'PRICING_OPTIMIZATION', 
          'SUPPLIER_COMMUNICATION', 
          'ORDER_PROCESSING', 
          'QUALITY_CONTROL'
        ];

        const detectedType = possibleTypes.find(type => 
          safeGet(statusObj, ['type'], null) === type ||
          safeGet(statusObj, ['product', 'type'], null) === type
        );

        return detectedType || 'CUSTOMER_SERVICE';
      };

      // Normalize statuses to consistent array format
      const normalizeStatuses = (input: any): Array<{
        agentId: string;
        type: AgentType;
        status: 'active' | 'idle' | 'error';
        lastResult?: string;
        lastActive?: Date;
      }> => {
        const getDateOrUndefined = (dateValue: any): Date | undefined => {
          if (!dateValue) return undefined;
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? undefined : date;
        };

        // Handle object input
        if (input && typeof input === 'object' && !Array.isArray(input)) {
          return Object.entries(input).map(([agentId, statusObj]) => {
            const lastActiveDate = getDateOrUndefined(
              safeGet(statusObj, ['lastActive'], undefined) || 
              safeGet(statusObj, ['product', 'lastActive'], undefined)
            );

            return {
              agentId,
              type: extractType(statusObj || {}),
              status: extractStatus(statusObj || {}),
              lastResult: safeGet(statusObj, ['lastResult'], '') || 
                         safeGet(statusObj, ['product', 'lastResult'], '') || 
                         safeGet(statusObj, ['lastError'], ''),
              ...(lastActiveDate && { lastActive: lastActiveDate })
            };
          });
        }

        // Handle array input
        if (Array.isArray(input)) {
          return input.map(statusObj => {
            const lastActiveDate = getDateOrUndefined(
              safeGet(statusObj, ['lastActive'], undefined) || 
              safeGet(statusObj, ['product', 'lastActive'], undefined)
            );

            return {
              agentId: safeGet(statusObj, ['agentId'], '') || 
                       safeGet(statusObj, ['id'], ''),
              type: extractType(statusObj || {}),
              status: extractStatus(statusObj || {}),
              lastResult: safeGet(statusObj, ['lastResult'], '') || 
                         safeGet(statusObj, ['product', 'lastResult'], '') || 
                         safeGet(statusObj, ['lastError'], ''),
              ...(lastActiveDate && { lastActive: lastActiveDate })
            };
          });
        }

        // Return empty array for invalid input
        return [];
      };

      // Return normalized statuses
      return normalizeStatuses(statuses);
    } catch (error) {
      console.error('Error fetching agent statuses:', error);
      return [];
    }
  }

  async getAgentInsights(): Promise<AgentInsight[]> {
    const statuses = await this.getAgentStatuses();
    const handymanInsights = await this.getHandymanAgentInsights();
    
    const baseInsights = statuses.map(status => {
      const performance = this.manager.getAgentPerformance(status.agentId);
      
      return {
        agentId: status.agentId || '',
        type: status.type as AgentType,
        name: `Agent ${status.agentId?.slice(0, 6) || ''}`,
        result: status.lastResult || 'No recent activity',
        performance: performance ? {
          successRate: performance.successRate || 0,
          averageConfidence: performance.averageConfidence || 0,
          averageProcessingTime: performance.averageProcessingTime || 0,
          tasksByType: performance.tasksByType || {},
          errorRate: performance.errorRate || 0
        } : {
          successRate: 0,
          averageConfidence: 0,
          averageProcessingTime: 0,
          tasksByType: {},
          errorRate: 0
        },
        lastActive: status.lastActive,
        status: status.status || 'idle'
      };
    });

    return [...baseInsights, ...handymanInsights];
  }

  private async getHandymanAgentInsights(): Promise<AgentInsight[]> {
    try {
      const departments = ['engineering', 'product', 'design'];
      const insights: AgentInsight[] = [];

      for (const department of departments) {
        const result = await this.handymanAgent.generateDepartmentInsights(department);

        if (result.success) {
          const insight: AgentInsight = {
            agentId: 'handyman-agent',
            type: 'QUALITY_CONTROL' as AgentType,
            name: `Handyman AI Agent (${department})`,
            result: JSON.stringify(result.data),
            performance: {
              successRate: result.metadata.confidence * 100,
              averageConfidence: result.metadata.confidence || 0,
              averageProcessingTime: result.metadata.processingTime || 0,
              tasksByType: {},
              errorRate: 0
            },
            lastActive: new Date(),
            status: 'active' as const
          };
          insights.push(insight);
        }
      }

      return insights;
    } catch (error) {
      console.error('Error generating Handyman Agent insights:', error);
      return [];
    }
  }
}

export const aiService = new AIService();

export type { TaskType };
export type { Task as AITask };

// Export local implementation of getAgentInsights
export const getAgentInsights = async (departmentId: string): Promise<AgentInsight[]> => {
  return await aiService.getAgentInsights();
};
