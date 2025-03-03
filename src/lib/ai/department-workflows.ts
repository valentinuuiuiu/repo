import { AgentType } from '@prisma/client'
import type { TaskDefinition } from './department-task-orchestrator'
import { AgentCategory, AgentRole } from '@/config/agents';
import { AgentManager } from './core/AgentManager';
import type { Task, TaskType } from './types';

interface DepartmentWorkflow {
  id: string;
  name: string;
  description: string;
  department: AgentCategory;
  steps: WorkflowStep[];
  requiredAgents: string[];
}

interface WorkflowStep {
  id: string;
  action: string;
  agentType: string;
  dependsOn: string[];
  validationRules?: string[];
}

export const departmentWorkflows: Record<AgentCategory, DepartmentWorkflow[]> = {
  [AgentCategory.PRODUCT_MANAGEMENT]: [
    {
      id: 'new-product-launch',
      name: 'New Product Launch',
      description: 'Complete workflow for launching a new product',
      department: AgentCategory.PRODUCT_MANAGEMENT,
      requiredAgents: ['product-leader', 'pricing-specialist', 'market-research-leader'],
      steps: [
        {
          id: 'market-analysis',
          action: 'Analyze market opportunity',
          agentType: 'market-research-leader',
          dependsOn: []
        },
        {
          id: 'pricing-strategy',
          action: 'Develop pricing strategy',
          agentType: 'pricing-specialist',
          dependsOn: ['market-analysis']
        },
        {
          id: 'product-strategy',
          action: 'Finalize product strategy',
          agentType: 'product-leader',
          dependsOn: ['market-analysis', 'pricing-strategy']
        }
      ]
    }
  ],

  [AgentCategory.CUSTOMER_EXPERIENCE]: [
    {
      id: 'customer-satisfaction-improvement',
      name: 'Customer Satisfaction Improvement',
      description: 'Workflow for improving customer satisfaction metrics',
      department: AgentCategory.CUSTOMER_EXPERIENCE,
      requiredAgents: ['customer-support-leader', 'satisfaction-analyst', 'support-specialist'],
      steps: [
        {
          id: 'satisfaction-analysis',
          action: 'Analyze current satisfaction metrics',
          agentType: 'satisfaction-analyst',
          dependsOn: []
        },
        {
          id: 'support-optimization',
          action: 'Optimize support processes',
          agentType: 'support-specialist',
          dependsOn: ['satisfaction-analysis']
        },
        {
          id: 'implementation',
          action: 'Implement improvements',
          agentType: 'customer-support-leader',
          dependsOn: ['support-optimization']
        }
      ]
    }
  ],

  [AgentCategory.MARKET_INTELLIGENCE]: [
    {
      id: 'market-trend-analysis',
      name: 'Market Trend Analysis',
      description: 'Comprehensive market trend analysis workflow',
      department: AgentCategory.MARKET_INTELLIGENCE,
      requiredAgents: ['market-research-leader', 'analytics-specialist'],
      steps: [
        {
          id: 'data-collection',
          action: 'Collect market data',
          agentType: 'analytics-specialist',
          dependsOn: []
        },
        {
          id: 'trend-analysis',
          action: 'Analyze trends',
          agentType: 'market-research-leader',
          dependsOn: ['data-collection']
        }
      ]
    }
  ],

  [AgentCategory.OPERATIONS]: [
    {
      id: 'inventory-optimization',
      name: 'Inventory Optimization',
      description: 'Workflow for optimizing inventory levels',
      department: AgentCategory.OPERATIONS,
      requiredAgents: ['operations-leader', 'inventory-manager', 'supplier-coordinator'],
      steps: [
        {
          id: 'inventory-analysis',
          action: 'Analyze current inventory',
          agentType: 'inventory-manager',
          dependsOn: []
        },
        {
          id: 'supplier-coordination',
          action: 'Coordinate with suppliers',
          agentType: 'supplier-coordinator',
          dependsOn: ['inventory-analysis']
        },
        {
          id: 'optimization-implementation',
          action: 'Implement optimization strategy',
          agentType: 'operations-leader',
          dependsOn: ['inventory-analysis', 'supplier-coordination']
        }
      ]
    },
    {
      id: 'logistics-documentation',
      name: 'Logistics Documentation Management',
      description: 'Workflow for managing logistics documentation and invoicing',
      department: AgentCategory.OPERATIONS,
      requiredAgents: ['logger-agent', 'inventory-manager', 'supplier-coordinator'],
      steps: [
        {
          id: 'document-processing',
          action: 'Process incoming documents',
          agentType: 'logger-agent',
          dependsOn: []
        },
        {
          id: 'inventory-update',
          action: 'Update inventory based on documents',
          agentType: 'inventory-manager',
          dependsOn: ['document-processing']
        },
        {
          id: 'supplier-notification',
          action: 'Notify suppliers of document processing',
          agentType: 'supplier-coordinator',
          dependsOn: ['document-processing']
        },
        {
          id: 'report-generation',
          action: 'Generate documentation report',
          agentType: 'logger-agent',
          dependsOn: ['inventory-update', 'supplier-notification']
        }
      ]
    }
  ],

  [AgentCategory.SALES_MARKETING]: [
    {
      id: 'sales-campaign',
      name: 'Sales Campaign Launch',
      description: 'End-to-end sales campaign workflow',
      department: AgentCategory.SALES_MARKETING,
      requiredAgents: ['sales-leader', 'marketing-specialist', 'market-research-leader'],
      steps: [
        {
          id: 'market-research',
          action: 'Research target market',
          agentType: 'market-research-leader',
          dependsOn: []
        },
        {
          id: 'campaign-planning',
          action: 'Plan campaign strategy',
          agentType: 'marketing-specialist',
          dependsOn: ['market-research']
        },
        {
          id: 'campaign-launch',
          action: 'Launch and monitor campaign',
          agentType: 'sales-leader',
          dependsOn: ['campaign-planning']
        }
      ]
    }
  ],
  
  [AgentCategory.LOGISTICS]: [
    {
      id: 'invoice-processing-workflow',
      name: 'Invoice Processing Workflow',
      description: 'End-to-end workflow for processing invoices and updating inventory',
      department: AgentCategory.LOGISTICS,
      requiredAgents: ['logger-agent', 'inventory-agent'],
      steps: [
        {
          id: 'invoice-receipt',
          action: 'processInvoice',
          agentType: 'logger-agent',
          dependsOn: []
        },
        {
          id: 'inventory-update',
          action: 'updateInventory',
          agentType: 'inventory-agent',
          dependsOn: ['invoice-receipt']
        },
        {
          id: 'documentation-filing',
          action: 'manageDocument',
          agentType: 'logger-agent',
          dependsOn: ['inventory-update']
        },
        {
          id: 'report-generation',
          action: 'generateReport',
          agentType: 'logger-agent',
          dependsOn: ['documentation-filing']
        }
      ]
    },
    {
      id: 'inventory-audit-workflow',
      name: 'Inventory Audit Workflow',
      description: 'Comprehensive inventory audit and documentation process',
      department: AgentCategory.LOGISTICS,
      requiredAgents: ['logger-agent', 'inventory-agent'],
      steps: [
        {
          id: 'inventory-check',
          action: 'updateInventory',
          agentType: 'inventory-agent',
          dependsOn: []
        },
        {
          id: 'discrepancy-analysis',
          action: 'analyzeDiscrepancies',
          agentType: 'logger-agent',
          dependsOn: ['inventory-check']
        },
        {
          id: 'documentation-update',
          action: 'manageDocument',
          agentType: 'logger-agent',
          dependsOn: ['discrepancy-analysis']
        },
        {
          id: 'audit-report',
          action: 'generateReport',
          agentType: 'logger-agent',
          dependsOn: ['documentation-update']
        }
      ]
    }
  ]
};