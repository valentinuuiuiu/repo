import { AgentType } from '@/types/agent';

export enum DepartmentType {
  PRODUCT_MANAGEMENT = 'PRODUCT_MANAGEMENT',
  SALES_MARKETING = 'SALES_MARKETING',
  CUSTOMER_EXPERIENCE = 'CUSTOMER_EXPERIENCE',
  MARKET_INTELLIGENCE = 'MARKET_INTELLIGENCE',
  OPERATIONS = 'OPERATIONS',
  FINANCE = 'FINANCE',
  TECHNOLOGY = 'TECHNOLOGY',
  ECOMMERCE = 'ECOMMERCE',
  DOCUMENTATION = 'DOCUMENTATION',
  BLOG = 'BLOG'
}

export interface DepartmentAgentConfig {
  type: AgentType;
  capabilities: string[];
  priority: 'low' | 'medium' | 'high';
  requiredSkills: string[];
  performanceMetrics: {
    successRate: number;
    averageResponseTime: number;
  };
}

export interface DepartmentConfig {
  id: string;
  name: string;
  type: DepartmentType;
  agents: DepartmentAgentConfig[];
  workflows: string[];
  objectives: string[];
  keyPerformanceIndicators: string[];
}

export const departmentConfigurations: Record<DepartmentType, DepartmentConfig> = {
  [DepartmentType.PRODUCT_MANAGEMENT]: {
    id: 'dept_product_mgmt',
    name: 'Product Management',
    type: DepartmentType.PRODUCT_MANAGEMENT,
    agents: [
      {
        type: AgentType.PRICING_OPTIMIZATION,
        capabilities: [
          'product_analysis', 
          'market_research', 
          'pricing_strategy'
        ],
        priority: 'high',
        requiredSkills: ['data_analysis', 'market_trends', 'product_lifecycle'],
        performanceMetrics: {
          successRate: 0.85,
          averageResponseTime: 3600
        }
      }
    ],
    workflows: [
      'new_product_launch',
      'product_lifecycle_management',
      'market_opportunity_analysis'
    ],
    objectives: [
      'Identify and develop innovative products',
      'Optimize product portfolio',
      'Align product strategy with market demands'
    ],
    keyPerformanceIndicators: [
      'Time to market',
      'Product success rate',
      'Market share growth'
    ]
  },
  [DepartmentType.SALES_MARKETING]: {
    id: 'dept_sales_marketing',
    name: 'Sales and Marketing',
    type: DepartmentType.SALES_MARKETING,
    agents: [
      {
        type: AgentType.MARKET_ANALYSIS,
        capabilities: [
          'campaign_analysis', 
          'customer_segmentation', 
          'marketing_strategy'
        ],
        priority: 'high',
        requiredSkills: ['digital_marketing', 'data_analysis', 'customer_insights'],
        performanceMetrics: {
          successRate: 0.8,
          averageResponseTime: 7200
        }
      }
    ],
    workflows: [
      'marketing_campaign_planning',
      'customer_acquisition',
      'brand_positioning'
    ],
    objectives: [
      'Increase customer acquisition',
      'Improve marketing ROI',
      'Develop targeted marketing strategies'
    ],
    keyPerformanceIndicators: [
      'Customer acquisition cost',
      'Conversion rate',
      'Marketing campaign ROI'
    ]
  },
  [DepartmentType.CUSTOMER_EXPERIENCE]: {
    id: 'dept_customer_exp',
    name: 'Customer Experience',
    type: DepartmentType.CUSTOMER_EXPERIENCE,
    agents: [
      {
        type: AgentType.CUSTOMER_SERVICE,
        capabilities: [
          'support_ticket_management', 
          'customer_feedback_analysis', 
          'personalized_support'
        ],
        priority: 'high',
        requiredSkills: ['empathy', 'problem_solving', 'communication'],
        performanceMetrics: {
          successRate: 0.9,
          averageResponseTime: 1800
        }
      }
    ],
    workflows: [
      'customer_satisfaction_improvement',
      'support_process_optimization',
      'feedback_loop_management'
    ],
    objectives: [
      'Improve customer satisfaction',
      'Reduce support response times',
      'Create personalized customer experiences'
    ],
    keyPerformanceIndicators: [
      'Net Promoter Score',
      'Customer Satisfaction Score',
      'First Response Time'
    ]
  },
  [DepartmentType.MARKET_INTELLIGENCE]: {
    id: 'dept_market_intel',
    name: 'Market Intelligence',
    type: DepartmentType.MARKET_INTELLIGENCE,
    agents: [
      {
        type: AgentType.MARKET_ANALYSIS,
        capabilities: [
          'trend_analysis', 
          'competitive_intelligence', 
          'market_forecasting'
        ],
        priority: 'medium',
        requiredSkills: ['data_analysis', 'research_methodology', 'strategic_thinking'],
        performanceMetrics: {
          successRate: 0.75,
          averageResponseTime: 10800
        }
      }
    ],
    workflows: [
      'market_trend_analysis',
      'competitive_landscape_mapping',
      'strategic_opportunity_identification'
    ],
    objectives: [
      'Provide actionable market insights',
      'Identify emerging market trends',
      'Support strategic decision-making'
    ],
    keyPerformanceIndicators: [
      'Insight accuracy',
      'Strategic recommendation impact',
      'Market trend prediction success'
    ]
  },
  [DepartmentType.OPERATIONS]: {
    id: 'dept_operations',
    name: 'Operations',
    type: DepartmentType.OPERATIONS,
    agents: [
      {
        type: AgentType.INVENTORY_MANAGEMENT,
        capabilities: [
          'stock_optimization', 
          'supply_chain_analysis', 
          'logistics_planning'
        ],
        priority: 'high',
        requiredSkills: ['logistics', 'data_analysis', 'supply_chain_management'],
        performanceMetrics: {
          successRate: 0.85,
          averageResponseTime: 5400
        }
      }
    ],
    workflows: [
      'inventory_optimization',
      'supply_chain_efficiency',
      'logistics_process_improvement'
    ],
    objectives: [
      'Optimize inventory levels',
      'Improve supply chain efficiency',
      'Reduce operational costs'
    ],
    keyPerformanceIndicators: [
      'Inventory turnover rate',
      'Order fulfillment time',
      'Supply chain cost reduction'
    ]
  },
  [DepartmentType.FINANCE]: {
    id: 'dept_finance',
    name: 'Finance',
    type: DepartmentType.FINANCE,
    agents: [
      {
        type: AgentType.PRICING_OPTIMIZATION,
        capabilities: [
          'financial_forecasting', 
          'risk_assessment', 
          'budget_optimization'
        ],
        priority: 'high',
        requiredSkills: ['financial_modeling', 'risk_management', 'strategic_planning'],
        performanceMetrics: {
          successRate: 0.8,
          averageResponseTime: 7200
        }
      }
    ],
    workflows: [
      'financial_planning',
      'budget_allocation',
      'investment_strategy'
    ],
    objectives: [
      'Optimize financial performance',
      'Manage financial risks',
      'Support strategic financial decisions'
    ],
    keyPerformanceIndicators: [
      'ROI',
      'Cost savings',
      'Budget accuracy'
    ]
  },
  [DepartmentType.TECHNOLOGY]: {
    id: 'dept_technology',
    name: 'Technology',
    type: DepartmentType.TECHNOLOGY,
    agents: [
      {
        type: AgentType.CODE_MAINTENANCE,
        capabilities: [
          'system_optimization', 
          'technical_problem_solving', 
          'infrastructure_management'
        ],
        priority: 'high',
        requiredSkills: ['system_architecture', 'troubleshooting', 'infrastructure_design'],
        performanceMetrics: {
          successRate: 0.9,
          averageResponseTime: 3600
        }
      }
    ],
    workflows: [
      'system_maintenance',
      'technology_innovation',
      'infrastructure_upgrade'
    ],
    objectives: [
      'Maintain technological infrastructure',
      'Drive technological innovation',
      'Ensure system reliability'
    ],
    keyPerformanceIndicators: [
      'System uptime',
      'Innovation index',
      'Technical debt reduction'
    ]
  },
  [DepartmentType.ECOMMERCE]: {
    id: 'dept_ecommerce',
    name: 'E-Commerce',
    type: DepartmentType.ECOMMERCE,
    agents: [
      {
        type: AgentType.ORDER_PROCESSING,
        capabilities: [
          'conversion_optimization', 
          'user_experience_improvement', 
          'sales_funnel_analysis'
        ],
        priority: 'high',
        requiredSkills: ['ux_design', 'conversion_strategy', 'data_analysis'],
        performanceMetrics: {
          successRate: 0.85,
          averageResponseTime: 5400
        }
      }
    ],
    workflows: [
      'checkout_process_optimization',
      'cart_abandonment_reduction',
      'personalized_shopping_experience'
    ],
    objectives: [
      'Improve conversion rates',
      'Reduce cart abandonment',
      'Enhance user shopping experience'
    ],
    keyPerformanceIndicators: [
      'Conversion rate',
      'Average order value',
      'Cart abandonment rate'
    ]
  },
  [DepartmentType.DOCUMENTATION]: {
    id: 'dept_documentation',
    name: 'Documentation',
    type: DepartmentType.DOCUMENTATION,
    agents: [
      {
        type: AgentType.CODE_MAINTENANCE,
        capabilities: [
          'documentation_management',
          'content_creation',
          'technical_writing'
        ],
        priority: 'high',
        requiredSkills: ['technical_writing', 'content_organization', 'api_documentation'],
        performanceMetrics: {
          successRate: 0.9,
          averageResponseTime: 2500
        }
      }
    ],
    workflows: [
      'documentation_creation',
      'documentation_review',
      'documentation_update'
    ],
    objectives: [
      'Maintain comprehensive product documentation',
      'Ensure documentation clarity and accuracy',
      'Support users through detailed guides'
    ],
    keyPerformanceIndicators: [
      'Documentation completeness',
      'User satisfaction with docs',
      'Documentation update frequency'
    ]
  },

  [DepartmentType.BLOG]: {
    id: 'dept_blog',
    name: 'Blog',
    type: DepartmentType.BLOG,
    agents: [
      {
        type: AgentType.MARKET_ANALYSIS,
        capabilities: [
          'content_creation',
          'seo_optimization',
          'audience_engagement'
        ],
        priority: 'medium',
        requiredSkills: ['copywriting', 'seo_knowledge', 'content_strategy'],
        performanceMetrics: {
          successRate: 0.85,
          averageResponseTime: 3600
        }
      }
    ],
    workflows: [
      'blog_content_creation',
      'content_calendar_management',
      'seo_optimization'
    ],
    objectives: [
      'Create engaging blog content',
      'Drive traffic through SEO-optimized articles',
      'Establish thought leadership in the industry'
    ],
    keyPerformanceIndicators: [
      'Blog traffic',
      'Conversion rate from blog',
      'Social media shares'
    ]
  }
};

export function getDepartmentConfig(type: DepartmentType): DepartmentConfig {
  return departmentConfigurations[type];
}

export function getAllDepartmentTypes(): DepartmentType[] {
  return Object.values(DepartmentType);
}

// Update collaboration rules to use correct agent types
export const collaborationRules = {
  [AgentType.MARKET_ANALYSIS]: [AgentType.PRICING_OPTIMIZATION, AgentType.CUSTOMER_SERVICE],
  [AgentType.QUALITY_CONTROL]: [AgentType.INVENTORY_MANAGEMENT, AgentType.SUPPLIER_COMMUNICATION],
  [AgentType.CODE_MAINTENANCE]: [AgentType.QUALITY_CONTROL, AgentType.ORDER_PROCESSING]
};

// Department initialization configuration
export const departmentInitConfig = {
  [AgentType.MARKET_ANALYSIS]: {
    tools: ['market-analyzer', 'trend-forecaster'],
    requiredCapabilities: ['data-analysis', 'report-generation']
  },
  [AgentType.QUALITY_CONTROL]: {
    tools: ['quality-checker', 'compliance-validator'],
    requiredCapabilities: ['inspection', 'compliance-checking']
  }
  // Add configs for other departments as needed
};