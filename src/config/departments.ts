import { DepartmentType, AgentType } from '@prisma/client';

export interface DepartmentConfig {
  name: string;
  description: string;
  agents: Array<{
    type: AgentType;
    capabilities: string[];
    config: Record<string, any>;
  }>;
}

export const departmentConfigs: Record<DepartmentType, DepartmentConfig> = {
  [DepartmentType.ECOMMERCE]: {
    name: 'E-commerce Operations',
    description: 'Manages core e-commerce platform operations',
    agents: [
      {
        type: AgentType.INVENTORY_MANAGEMENT,
        capabilities: ['inventory_tracking', 'stock_optimization', 'reorder_management'],
        config: {
          restockThreshold: 20,
          automaticReorder: true,
          stockAnalysis: true
        }
      },
      {
        type: AgentType.PRICING_OPTIMIZATION,
        capabilities: ['price_analysis', 'competitive_monitoring', 'margin_optimization'],
        config: {
          updateFrequency: 'hourly',
          marginTargets: { min: 0.2, target: 0.35, max: 0.6 },
          competitorTracking: true
        }
      }
    ]
  },
  [DepartmentType.MARKET_INTELLIGENCE]: {
    name: 'Market Research',
    description: 'Market analysis and competitive intelligence',
    agents: [
      {
        type: AgentType.MARKET_ANALYSIS,
        capabilities: ['trend_analysis', 'market_research', 'competitor_tracking'],
        config: {
          dataFeeds: ['market_trends', 'competitor_data', 'consumer_insights'],
          analysisFrequency: 'daily',
          reportGeneration: true
        }
      }
    ]
  },
  [DepartmentType.CUSTOMER_EXPERIENCE]: {
    name: 'Customer Support',
    description: 'Customer service and support operations',
    agents: [
      {
        type: AgentType.CUSTOMER_SERVICE,
        capabilities: ['ticket_management', 'customer_communication', 'issue_resolution'],
        config: {
          responseTime: 300, // seconds
          autoResponse: true,
          satisfactionTracking: true
        }
      }
    ]
  },
  [DepartmentType.LOGISTICS]: {
    name: 'Logistics Management',
    description: 'Supply chain and logistics operations',
    agents: [
      {
        type: AgentType.ORDER_PROCESSING,
        capabilities: ['order_tracking', 'shipping_management', 'delivery_optimization'],
        config: {
          automatedChecks: true,
          priorityRouting: true,
          batchProcessing: true
        }
      },
      {
        type: AgentType.SUPPLIER_COMMUNICATION,
        capabilities: ['supplier_coordination', 'inventory_alerts', 'order_automation'],
        config: {
          communicationChannels: ['email', 'api'],
          autoFollowUp: true,
          performanceTracking: true
        }
      }
    ]
  }
};

export function getDepartmentConfig(type: DepartmentType): DepartmentConfig {
  const config = departmentConfigs[type];
  if (!config) {
    throw new Error(`No configuration found for department type: ${type}`);
  }
  return config;
}

export function getAllDepartmentTypes(): DepartmentType[] {
  return Object.keys(departmentConfigs) as DepartmentType[];
}