
import { PrismaClient, AgentType, AgentStatus } from '@prisma/client';
import { agentService } from '../src/lib/ai/agentService';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Override import.meta.env with process.env for compatibility
const env = {
  VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY,
  VITE_OPENAI_MODEL: process.env.VITE_OPENAI_MODEL,
  VITE_OPENAI_EMBEDDING_MODEL: process.env.VITE_OPENAI_EMBEDDING_MODEL
};

// Make env available globally
globalThis.import = { meta: { env } };

const prisma = new PrismaClient();

async function initializeAgentSystem() {
  try {
    // Initialize the agent service first
    await agentService.initialize();
    
    // Get or create required departments
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { code: 'CX' },
        update: {},
        create: {
          name: 'Customer Experience',
          description: 'Handles customer support and satisfaction',
          code: 'CX'
        }
      }),
      prisma.department.upsert({
        where: { code: 'OPS' },
        update: {},
        create: {
          name: 'Operations',
          description: 'Manages inventory and logistics',
          code: 'OPS'
        }
      }),
      prisma.department.upsert({
        where: { code: 'MKT' },
        update: {},
        create: {
          name: 'Market Intelligence',
          description: 'Analyzes market trends and opportunities',
          code: 'MKT'
        }
      })
    ]);

    // Register core agents
    const coreAgents = [
      {
        name: 'Customer Service Agent',
        type: AgentType.CUSTOMER_SERVICE,
        description: 'Handles customer inquiries and support',
        departmentId: departments[0].id,
        capabilities: [
          'customer_support',
          'issue_resolution',
          'inquiry_handling'
        ]
      },
      {
        name: 'Inventory Manager',
        type: AgentType.INVENTORY_MANAGEMENT,
        description: 'Manages inventory levels and stock',
        departmentId: departments[1].id,
        capabilities: [
          'inventory_tracking',
          'stock_management',
          'reorder_optimization'
        ]
      },
      {
        name: 'Market Analyst',
        type: AgentType.MARKET_ANALYSIS,
        description: 'Analyzes market trends and opportunities',
        departmentId: departments[2].id,
        capabilities: [
          'market_analysis',
          'trend_tracking',
          'competitor_monitoring'
        ]
      }
    ];

    // Register each agent
    for (const agent of coreAgents) {
      // Check if agent already exists
      const existing = await prisma.agent.findFirst({
        where: { type: agent.type }
      });

      if (!existing) {
        // Create new agent
        const created = await prisma.agent.create({
          data: {
            ...agent,
            status: AgentStatus.AVAILABLE
          }
        });

        // Initialize metrics
        await prisma.agentMetrics.create({
          data: {
            agentId: created.id,
            totalInteractions: 0,
            successfulInteractions: 0,
            averageResponseTime: 0,
            errorRate: 0,
            lastActive: new Date()
          }
        });

        console.log(`Created agent: ${created.name}`);
      } else {
        console.log(`Agent already exists: ${agent.name}`);
      }
    }

    console.log('Agent system initialization complete');
  } catch (error) {
    console.error('Failed to initialize agent system:', error);
    throw error;
  }
}

// Run initialization
initializeAgentSystem()
  .catch(console.error)
  .finally(() => prisma.$disconnect());