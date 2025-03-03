import { PrismaClient, AgentType } from '@prisma/client';
import { agentApi } from '../src/api/agent';

const prisma = new PrismaClient();

// Define all the agents we want to register in the system
const agentsToRegister = [
  {
    name: 'Customer Service Agent',
    type: AgentType.CUSTOMER_SERVICE,
    description: 'AI agent for customer support and satisfaction optimization',
    departmentId: 'CUSTOMER_EXP', // Will be looked up or created
    capabilities: [
      'customer_inquiry_handling',
      'order_assistance',
      'product_assistance',
      'returns_processing',
      'complaint_resolution'
    ],
    config: {
      responseTime: 300,
      autoResponse: true,
      satisfactionTracking: true
    }
  },
  {
    name: 'Inventory Manager',
    type: AgentType.INVENTORY_MANAGEMENT,
    description: 'Manages inventory levels and stock optimization',
    departmentId: 'OPERATIONS', // Will be looked up or created
    capabilities: [
      'inventory_tracking',
      'stock_forecasting',
      'reorder_optimization',
      'inventory_reporting',
      'supplier_coordination'
    ],
    config: {
      stockThreshold: 20,
      autoReorder: true,
      notificationEnabled: true
    }
  },
  {
    name: 'Sales Specialist',
    type: AgentType.PRICING_OPTIMIZATION,
    description: 'Drives sales growth and customer acquisition',
    departmentId: 'SALES_MARKETING', // Will be looked up or created
    capabilities: [
      'sales_forecasting',
      'customer_segmentation',
      'upselling_recommendations',
      'discount_optimization',
      'sales_reporting'
    ],
    config: {
      targetRevenue: 10000,
      commissionRate: 0.05,
      prioritizeReturningCustomers: true
    }
  },
  {
    name: 'Product Manager',
    type: AgentType.QUALITY_CONTROL,
    description: 'Oversees product strategy and development',
    departmentId: 'PRODUCT_MANAGEMENT', // Will be looked up or created
    capabilities: [
      'product_roadmap_planning',
      'feature_prioritization',
      'competitive_analysis',
      'product_performance_tracking',
      'user_feedback_analysis'
    ],
    config: {
      releaseFrequency: 'monthly',
      betaTestingEnabled: true,
      userResearchBudget: 5000
    }
  },
  {
    name: 'Market Researcher',
    type: AgentType.MARKET_ANALYSIS,
    description: 'Conducts market research and competitor analysis',
    departmentId: 'MARKET_INTELLIGENCE', // Will be looked up or created
    capabilities: [
      'market_trend_analysis',
      'competitor_tracking',
      'consumer_insight_generation',
      'opportunity_identification',
      'research_reporting'
    ],
    config: {
      researchMethodology: 'mixed-methods',
      dataUpdateFrequency: 'weekly',
      competitiveTrackingEnabled: true
    }
  }
];

// Ensure departments exist
async function ensureDepartmentExists(departmentCode: string): Promise<string> {
  // Try to find department
  let department = await prisma.department.findFirst({
    where: {
      code: departmentCode
    }
  });

  // If department doesn't exist, create it
  if (!department) {
    const departmentNames: Record<string, string> = {
      'CUSTOMER_EXP': 'Customer Experience',
      'OPERATIONS': 'Operations',
      'SALES_MARKETING': 'Sales and Marketing',
      'PRODUCT_MANAGEMENT': 'Product Management',
      'MARKET_INTELLIGENCE': 'Market Intelligence'
    };

    department = await prisma.department.create({
      data: {
        name: departmentNames[departmentCode] || departmentCode,
        description: `Department for ${departmentNames[departmentCode] || departmentCode} activities`,
        code: departmentCode
      }
    });
    console.log(`Created department: ${department.name} (${department.id})`);
  }

  return department.id;
}

async function registerAllAgents() {
  console.log('Starting agent registration process...');
  let registeredCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const agent of agentsToRegister) {
    try {
      // Ensure department exists
      const departmentId = await ensureDepartmentExists(agent.departmentId);
      
      // Register agent
      const result = await agentApi.registerAgent({
        ...agent,
        departmentId
      });

      if (result.success) {
        if (result.agent.id.startsWith('agent')) {
          registeredCount++;
        } else {
          updatedCount++;
        }
        console.log(`✅ Registered/updated agent: ${agent.name} (${agent.type})`);
      } else {
        errorCount++;
        console.error(`❌ Failed to register agent ${agent.name}: ${result.error}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error registering ${agent.name}:`, error);
    }
  }

  console.log(`\nRegistration complete: ${registeredCount} new agents, ${updatedCount} updated, ${errorCount} errors`);
}

// Run the registration
registerAllAgents()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Done!');
  })
  .catch(async (e) => {
    console.error('Fatal error during registration:', e);
    await prisma.$disconnect();
    process.exit(1);
  });