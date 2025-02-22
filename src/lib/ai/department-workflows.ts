import { AgentType } from '@prisma/client'
import type { TaskDefinition } from './department-task-orchestrator'

export const departmentWorkflows: Record<string, TaskDefinition[]> = {
  FASHION: [
    {
      id: 'new-product-onboarding',
      name: 'New Product Onboarding',
      department: 'FASHION',
      requiredAgents: [
        AgentType.QUALITY_CONTROL,
        AgentType.PRICING_OPTIMIZATION,
        AgentType.INVENTORY_MANAGEMENT
      ],
      steps: [
        {
          id: 'quality-check',
          agentType: AgentType.QUALITY_CONTROL,
          action: 'validateProduct',
          requiredData: ['productDetails', 'supplierInfo'],
          dependsOn: [],
          timeout: 30000
        },
        {
          id: 'pricing-analysis',
          agentType: AgentType.PRICING_OPTIMIZATION,
          action: 'calculateOptimalPrice',
          requiredData: ['productDetails', 'marketData'],
          dependsOn: ['quality-check'],
          timeout: 20000
        },
        {
          id: 'inventory-setup',
          agentType: AgentType.INVENTORY_MANAGEMENT,
          action: 'initializeInventory',
          requiredData: ['productDetails', 'warehousingData'],
          dependsOn: ['pricing-analysis'],
          timeout: 15000
        }
      ]
    },
    {
      id: 'seasonal-collection-planning',
      name: 'Seasonal Collection Planning',
      department: 'FASHION',
      requiredAgents: [
        AgentType.INVENTORY_MANAGEMENT,
        AgentType.PRICING_OPTIMIZATION,
        AgentType.SUPPLIER_COMMUNICATION
      ],
      steps: [
        {
          id: 'trend-analysis',
          agentType: AgentType.PRICING_OPTIMIZATION,
          action: 'analyzeTrends',
          requiredData: ['seasonData', 'historicalSales'],
          dependsOn: [],
          timeout: 40000
        },
        {
          id: 'supplier-negotiation',
          agentType: AgentType.SUPPLIER_COMMUNICATION,
          action: 'negotiateSeasonalPricing',
          requiredData: ['trendReport', 'supplierList'],
          dependsOn: ['trend-analysis'],
          timeout: 60000
        },
        {
          id: 'inventory-planning',
          agentType: AgentType.INVENTORY_MANAGEMENT,
          action: 'planSeasonalStock',
          requiredData: ['negotiationResults', 'warehouseCapacity'],
          dependsOn: ['supplier-negotiation'],
          timeout: 30000
        }
      ]
    }
  ],
  ELECTRONICS: [
    {
      id: 'tech-product-validation',
      name: 'Technical Product Validation',
      department: 'ELECTRONICS',
      requiredAgents: [
        AgentType.QUALITY_CONTROL,
        AgentType.CUSTOMER_SERVICE,
        AgentType.SUPPLIER_COMMUNICATION
      ],
      steps: [
        {
          id: 'specs-verification',
          agentType: AgentType.QUALITY_CONTROL,
          action: 'verifyTechSpecs',
          requiredData: ['productSpecs', 'certifications'],
          dependsOn: [],
          timeout: 45000
        },
        {
          id: 'compatibility-check',
          agentType: AgentType.QUALITY_CONTROL,
          action: 'checkCompatibility',
          requiredData: ['productSpecs', 'marketStandards'],
          dependsOn: ['specs-verification'],
          timeout: 30000
        },
        {
          id: 'support-docs',
          agentType: AgentType.CUSTOMER_SERVICE,
          action: 'prepareSupport',
          requiredData: ['techSpecs', 'userGuides'],
          dependsOn: ['compatibility-check'],
          timeout: 25000
        }
      ]
    }
  ],
  HOME: [
    {
      id: 'furniture-logistics',
      name: 'Furniture Logistics Planning',
      department: 'HOME',
      requiredAgents: [
        AgentType.INVENTORY_MANAGEMENT,
        AgentType.ORDER_PROCESSING
      ],
      steps: [
        {
          id: 'dimension-analysis',
          agentType: AgentType.INVENTORY_MANAGEMENT,
          action: 'analyzeDimensions',
          requiredData: ['productDimensions', 'warehouseLayout'],
          dependsOn: [],
          timeout: 20000
        },
        {
          id: 'shipping-calculation',
          agentType: AgentType.ORDER_PROCESSING,
          action: 'calculateShipping',
          requiredData: ['dimensions', 'shippingZones'],
          dependsOn: ['dimension-analysis'],
          timeout: 15000
        }
      ]
    }
  ],
  BEAUTY: [
    {
      id: 'cosmetic-compliance',
      name: 'Cosmetic Compliance Check',
      department: 'BEAUTY',
      requiredAgents: [
        AgentType.QUALITY_CONTROL,
        AgentType.CUSTOMER_SERVICE,
        AgentType.INVENTORY_MANAGEMENT
      ],
      steps: [
        {
          id: 'ingredient-check',
          agentType: AgentType.QUALITY_CONTROL,
          action: 'validateIngredients',
          requiredData: ['ingredients', 'regulations'],
          dependsOn: [],
          timeout: 30000
        },
        {
          id: 'shelf-life',
          agentType: AgentType.INVENTORY_MANAGEMENT,
          action: 'calculateShelfLife',
          requiredData: ['productInfo', 'storageConditions'],
          dependsOn: ['ingredient-check'],
          timeout: 20000
        },
        {
          id: 'allergen-docs',
          agentType: AgentType.CUSTOMER_SERVICE,
          action: 'prepareAllergenInfo',
          requiredData: ['ingredients', 'allergensData'],
          dependsOn: ['ingredient-check'],
          timeout: 25000
        }
      ]
    }
  ]
}