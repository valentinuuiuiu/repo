import { TaskPriority } from '../types';

// Standard workflow definitions that showcase department coordination
export const standardWorkflows = {
  // Product onboarding workflow
  productOnboarding: {
    id: 'workflow-product-onboard',
    name: 'Product Onboarding',
    description: 'Complete product onboarding workflow from market analysis to listing',
    steps: [
      {
        id: 'market-analysis',
        departmentId: 'dept-intel',
        taskType: 'market_analysis',
        priority: 'medium' as TaskPriority,
        data: {
          analysisType: 'product_viability',
          requiredInsights: ['market_demand', 'competition', 'pricing_range']
        }
      },
      {
        id: 'pricing-strategy',
        departmentId: 'dept-commerce',
        taskType: 'pricing_optimization',
        priority: 'high' as TaskPriority,
        dependsOn: ['market-analysis'],
        data: {
          optimizationType: 'initial_pricing',
          marginTarget: 0.3
        }
      },
      {
        id: 'inventory-setup',
        departmentId: 'dept-commerce',
        taskType: 'inventory_management',
        priority: 'high' as TaskPriority,
        dependsOn: ['pricing-strategy'],
        data: {
          setupType: 'new_product',
          stockThreshold: 20
        }
      },
      {
        id: 'supplier-setup',
        departmentId: 'dept-supply',
        taskType: 'supplier_communication',
        priority: 'high' as TaskPriority,
        dependsOn: ['inventory-setup'],
        data: {
          communicationType: 'onboarding',
          requirements: ['pricing', 'delivery_terms', 'quality_standards']
        }
      },
      {
        id: 'quality-check',
        departmentId: 'dept-supply',
        taskType: 'quality_control',
        priority: 'high' as TaskPriority,
        dependsOn: ['supplier-setup'],
        data: {
          checkType: 'initial_validation',
          standards: ['product_specs', 'compliance', 'safety']
        }
      }
    ]
  },

  // Order fulfillment workflow
  orderFulfillment: {
    id: 'workflow-order-fulfill',
    name: 'Order Fulfillment',
    description: 'End-to-end order processing and fulfillment workflow',
    steps: [
      {
        id: 'order-validation',
        departmentId: 'dept-cx',
        taskType: 'order_processing',
        priority: 'high' as TaskPriority,
        data: {
          validationType: 'new_order',
          checks: ['payment', 'fraud', 'inventory']
        }
      },
      {
        id: 'inventory-check',
        departmentId: 'dept-commerce',
        taskType: 'inventory_management',
        priority: 'high' as TaskPriority,
        dependsOn: ['order-validation'],
        data: {
          checkType: 'availability',
          updateStock: true
        }
      },
      {
        id: 'supplier-notification',
        departmentId: 'dept-supply',
        taskType: 'supplier_communication',
        priority: 'medium' as TaskPriority,
        dependsOn: ['inventory-check'],
        data: {
          notificationType: 'order_placed',
          includeDetails: ['products', 'quantities', 'delivery_requirements']
        }
      },
      {
        id: 'customer-communication',
        departmentId: 'dept-cx',
        taskType: 'customer_service',
        priority: 'high' as TaskPriority,
        dependsOn: ['supplier-notification'],
        data: {
          communicationType: 'order_confirmation',
          includeDetails: ['order_summary', 'tracking_info', 'estimated_delivery']
        }
      }
    ]
  },

  // Platform optimization workflow
  platformOptimization: {
    id: 'workflow-platform-optimize',
    name: 'Platform Optimization',
    description: 'Regular platform maintenance and optimization workflow',
    steps: [
      {
        id: 'performance-analysis',
        departmentId: 'dept-optimize',
        taskType: 'code_maintenance',
        priority: 'medium' as TaskPriority,
        data: {
          analysisType: 'performance_audit',
          metrics: ['response_times', 'error_rates', 'resource_usage']
        }
      },
      {
        id: 'market-impact',
        departmentId: 'dept-intel',
        taskType: 'market_analysis',
        priority: 'low' as TaskPriority,
        dependsOn: ['performance-analysis'],
        data: {
          analysisType: 'performance_impact',
          metrics: ['user_satisfaction', 'conversion_impact', 'competitive_position']
        }
      },
      {
        id: 'optimization-execution',
        departmentId: 'dept-optimize',
        taskType: 'code_maintenance',
        priority: 'high' as TaskPriority,
        dependsOn: ['market-impact'],
        data: {
          optimizationType: 'performance_improvement',
          targets: ['identified_bottlenecks', 'user_experience', 'resource_efficiency']
        }
      }
    ]
  }
};