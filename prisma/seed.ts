import { PrismaClient, AgentType, AgentStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.agentCollaboration.deleteMany();
  await prisma.agentMetrics.deleteMany();
  await prisma.agentSpecialization.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.department.deleteMany();

  // Create departments from DepartmentType enum
  const departments = [
    {
      id: 'dept-product',
      name: 'Product Management',
      description: 'Product strategy and lifecycle management',
      code: 'PRODUCT_MANAGEMENT'
    },
    {
      id: 'dept-sales',
      name: 'Sales and Marketing',
      description: 'Sales strategy and marketing operations',
      code: 'SALES_MARKETING'
    },
    {
      id: 'dept-customer',
      name: 'Customer Experience',
      description: 'Customer service and support operations',
      code: 'CUSTOMER_EXPERIENCE'
    },
    {
      id: 'dept-market',
      name: 'Market Intelligence',
      description: 'Market analysis and competitive intelligence',
      code: 'MARKET_INTELLIGENCE'
    },
    {
      id: 'dept-ops',
      name: 'Operations',
      description: 'Supply chain and logistics operations',
      code: 'OPERATIONS'
    },
    {
      id: 'dept-finance',
      name: 'Finance',
      description: 'Financial planning and analysis',
      code: 'FINANCE'
    },
    {
      id: 'dept-tech',
      name: 'Technology',
      description: 'Technical infrastructure and development',
      code: 'TECHNOLOGY'
    },
    {
      id: 'dept-ecom',
      name: 'E-commerce',
      description: 'E-commerce platform operations',
      code: 'ECOMMERCE'
    },
    {
      id: 'dept-docs',
      name: 'Documentation',
      description: 'Technical documentation and content management',
      code: 'DOCUMENTATION'
    },
    {
      id: 'dept-blog',
      name: 'Blog',
      description: 'Content creation and blog management',
      code: 'BLOG'
    }
  ];

  console.log('Creating departments...');
  for (const dept of departments) {
    await prisma.department.create({
      data: dept
    });
  }

  // Create agents with department-specific configurations using available AgentTypes
  const agents = [
    // Product Management Agents
    {
      id: 'agent-product',
      name: 'Product Strategy Agent',
      type: AgentType.PRICING_OPTIMIZATION,
      description: 'Manages product strategy and optimization',
      departmentId: 'dept-product',
      status: AgentStatus.AVAILABLE,
      capabilities: ['product_analysis', 'market_research', 'pricing_strategy'],
      config: {
        dataAnalysis: true,
        marketTrends: true,
        productLifecycle: true,
        successRate: 0.85,
        responseTime: 3600
      },
      level: 4,
      experiencePoints: 2200
    },
    {
      id: 'agent-product-research',
      name: 'Product Research Agent',
      type: AgentType.MARKET_ANALYSIS,
      description: 'Researches product opportunities and market fit',
      departmentId: 'dept-product',
      status: AgentStatus.AVAILABLE,
      capabilities: ['market_analysis', 'trend_identification', 'product_gap_analysis'],
      config: {
        dataAnalysis: true,
        marketTrends: true,
        productLifecycle: true,
        successRate: 0.82,
        responseTime: 4800
      },
      level: 3,
      experiencePoints: 1800
    },

    // Sales & Marketing Agents
    {
      id: 'agent-marketing',
      name: 'Marketing Optimization Agent',
      type: AgentType.PRICING_OPTIMIZATION,
      description: 'Handles marketing strategy and campaigns',
      departmentId: 'dept-sales',
      status: AgentStatus.AVAILABLE,
      capabilities: ['campaign_analysis', 'customer_segmentation', 'marketing_strategy'],
      config: {
        digitalMarketing: true,
        customerInsights: true,
        campaignTracking: true,
        successRate: 0.8,
        responseTime: 7200
      },
      level: 3,
      experiencePoints: 1800
    },
    {
      id: 'agent-sales-research',
      name: 'Market Intelligence Agent',
      type: AgentType.MARKET_ANALYSIS,
      description: 'Analyzes market trends for sales optimization',
      departmentId: 'dept-sales',
      status: AgentStatus.AVAILABLE,
      capabilities: ['market_analysis', 'competitor_analysis', 'sales_forecasting'],
      config: {
        dataFeeds: ['sales_data', 'market_trends'],
        analysisFrequency: 'daily',
        successRate: 0.83,
        responseTime: 6400
      },
      level: 3,
      experiencePoints: 1900
    },

    // Customer Experience Agents
    {
      id: 'agent-support',
      name: 'Customer Service Agent',
      type: AgentType.CUSTOMER_SERVICE,
      description: 'Manages customer support and satisfaction',
      departmentId: 'dept-customer',
      status: AgentStatus.AVAILABLE,
      capabilities: ['support_ticket_management', 'customer_feedback_analysis', 'personalized_support'],
      config: {
        ticketPrioritization: true,
        sentimentAnalysis: true,
        responseTemplates: true,
        successRate: 0.9,
        responseTime: 1800
      },
      level: 3,
      experiencePoints: 1600
    },
    {
      id: 'agent-feedback',
      name: 'Customer Feedback Agent',
      type: AgentType.CUSTOMER_SERVICE,
      description: 'Analyzes customer feedback and satisfaction',
      departmentId: 'dept-customer',
      status: AgentStatus.AVAILABLE,
      capabilities: ['sentiment_analysis', 'feedback_processing', 'satisfaction_tracking'],
      config: {
        sentimentAnalysis: true,
        feedbackTracking: true,
        successRate: 0.88,
        responseTime: 2400
      },
      level: 3,
      experiencePoints: 1700
    },

    // Market Intelligence Agents
    {
      id: 'agent-market',
      name: 'Market Research Agent',
      type: AgentType.MARKET_ANALYSIS,
      description: 'Conducts market research and analysis',
      departmentId: 'dept-market',
      status: AgentStatus.AVAILABLE,
      capabilities: ['trend_analysis', 'competitive_intelligence', 'market_forecasting'],
      config: {
        dataFeeds: ['market_trends', 'competitor_data'],
        analysisFrequency: 'daily',
        successRate: 0.75,
        responseTime: 10800
      },
      level: 4,
      experiencePoints: 2200
    },
    {
      id: 'agent-competitor',
      name: 'Competitor Analysis Agent',
      type: AgentType.MARKET_ANALYSIS,
      description: 'Specializes in competitor research and analysis',
      departmentId: 'dept-market',
      status: AgentStatus.AVAILABLE,
      capabilities: ['competitor_monitoring', 'strategy_analysis', 'market_positioning'],
      config: {
        dataFeeds: ['competitor_data', 'industry_news'],
        analysisFrequency: 'daily',
        successRate: 0.78,
        responseTime: 9600
      },
      level: 3,
      experiencePoints: 1600
    },

    // Operations Agents
    {
      id: 'agent-inventory',
      name: 'Inventory Management Agent',
      type: AgentType.INVENTORY_MANAGEMENT,
      description: 'Optimizes inventory and supply chain',
      departmentId: 'dept-ops',
      status: AgentStatus.AVAILABLE,
      capabilities: ['stock_optimization', 'supply_chain_analysis', 'logistics_planning'],
      config: {
        restockThreshold: 20,
        automaticReorder: true,
        successRate: 0.85,
        responseTime: 5400
      },
      level: 3,
      experiencePoints: 1400
    },
    {
      id: 'agent-logistics',
      name: 'Logistics Optimization Agent',
      type: AgentType.ORDER_PROCESSING,
      description: 'Optimizes supply chain and logistics operations',
      departmentId: 'dept-ops',
      status: AgentStatus.AVAILABLE,
      capabilities: ['route_optimization', 'delivery_scheduling', 'warehouse_management'],
      config: {
        routeOptimization: true,
        realTimeTracking: true,
        successRate: 0.86,
        responseTime: 4800
      },
      level: 3,
      experiencePoints: 1500
    },

    // Finance Agents
    {
      id: 'agent-finance',
      name: 'Financial Analysis Agent',
      type: AgentType.PRICING_OPTIMIZATION,
      description: 'Handles financial analysis and optimization',
      departmentId: 'dept-finance',
      status: AgentStatus.AVAILABLE,
      capabilities: ['financial_forecasting', 'risk_assessment', 'budget_optimization'],
      config: {
        riskModeling: true,
        budgetTracking: true,
        successRate: 0.8,
        responseTime: 7200
      },
      level: 4,
      experiencePoints: 2400
    },
    {
      id: 'agent-pricing',
      name: 'Pricing Strategy Agent',
      type: AgentType.PRICING_OPTIMIZATION,
      description: 'Optimizes pricing strategies across products',
      departmentId: 'dept-finance',
      status: AgentStatus.AVAILABLE,
      capabilities: ['price_optimization', 'market_analysis', 'competitor_pricing'],
      config: {
        priceModeling: true,
        marketAnalysis: true,
        successRate: 0.82,
        responseTime: 6400
      },
      level: 3,
      experiencePoints: 1800
    },

    // Technology Agents
    {
      id: 'agent-tech',
      name: 'Technical Support Agent',
      type: AgentType.CODE_MAINTENANCE,
      description: 'Manages technical infrastructure',
      departmentId: 'dept-tech',
      status: AgentStatus.AVAILABLE,
      capabilities: ['system_optimization', 'technical_problem_solving', 'infrastructure_management'],
      config: {
        monitoringInterval: 300,
        autoOptimization: true,
        successRate: 0.9,
        responseTime: 3600
      },
      level: 4,
      experiencePoints: 2000
    },
    {
      id: 'agent-tech-optimization',
      name: 'System Optimization Agent',
      type: AgentType.CODE_MAINTENANCE,
      description: 'Optimizes system performance and infrastructure',
      departmentId: 'dept-tech',
      status: AgentStatus.AVAILABLE,
      capabilities: ['performance_optimization', 'system_monitoring', 'infrastructure_scaling'],
      config: {
        performanceMonitoring: true,
        autoScaling: true,
        successRate: 0.87,
        responseTime: 3200
      },
      level: 3,
      experiencePoints: 1700
    },

    // E-commerce Agents
    {
      id: 'agent-checkout',
      name: 'Checkout Optimization Agent',
      type: AgentType.ORDER_PROCESSING,
      description: 'Optimizes e-commerce checkout process',
      departmentId: 'dept-ecom',
      status: AgentStatus.AVAILABLE,
      capabilities: ['conversion_optimization', 'user_experience_improvement', 'sales_funnel_analysis'],
      config: {
        cartAbandonment: true,
        checkoutAnalytics: true,
        successRate: 0.85,
        responseTime: 5400
      },
      level: 3,
      experiencePoints: 1800
    },
    {
      id: 'agent-product-listing',
      name: 'Product Listing Agent',
      type: AgentType.PRICING_OPTIMIZATION,
      description: 'Optimizes product listings and catalog management',
      departmentId: 'dept-ecom',
      status: AgentStatus.AVAILABLE,
      capabilities: ['catalog_optimization', 'seo_enhancement', 'product_categorization'],
      config: {
        catalogManagement: true,
        seoOptimization: true,
        successRate: 0.84,
        responseTime: 4800
      },
      level: 3,
      experiencePoints: 1600
    },

    // Documentation Agents
    {
      id: 'agent-docs',
      name: 'Documentation Agent',
      type: AgentType.CODE_MAINTENANCE,
      description: 'Manages technical documentation',
      departmentId: 'dept-docs',
      status: AgentStatus.AVAILABLE,
      capabilities: ['documentation_management', 'content_creation', 'technical_writing'],
      config: {
        autoFormatting: true,
        versionControl: true,
        successRate: 0.9,
        responseTime: 2500
      },
      level: 3,
      experiencePoints: 1600
    },
    {
      id: 'agent-docs-optimization',
      name: 'Documentation Quality Agent',
      type: AgentType.CODE_MAINTENANCE,
      description: 'Ensures documentation quality and standards',
      departmentId: 'dept-docs',
      status: AgentStatus.AVAILABLE,
      capabilities: ['quality_assurance', 'style_enforcement', 'documentation_testing'],
      config: {
        qualityChecks: true,
        styleGuide: true,
        successRate: 0.89,
        responseTime: 2800
      },
      level: 3,
      experiencePoints: 1500
    },

    // Blog Agents
    {
      id: 'agent-content',
      name: 'Content Creation Agent',
      type: AgentType.MARKET_ANALYSIS,
      description: 'Creates and optimizes blog content',
      departmentId: 'dept-blog',
      status: AgentStatus.AVAILABLE,
      capabilities: ['content_creation', 'seo_optimization', 'audience_engagement'],
      config: {
        seoTools: true,
        contentCalendar: true,
        successRate: 0.85,
        responseTime: 3600
      },
      level: 3,
      experiencePoints: 1700
    },
    {
      id: 'agent-content-optimization',
      name: 'Content Strategy Agent',
      type: AgentType.MARKET_ANALYSIS,
      description: 'Develops and optimizes content strategy',
      departmentId: 'dept-blog',
      status: AgentStatus.AVAILABLE,
      capabilities: ['content_strategy', 'audience_analysis', 'content_planning'],
      config: {
        contentPlanning: true,
        audienceAnalysis: true,
        successRate: 0.83,
        responseTime: 4200
      },
      level: 3,
      experiencePoints: 1600
    }
  ];

  console.log('Creating agents...');
  for (const agent of agents) {
    const createdAgent = await prisma.agent.create({
      data: agent
    });
    
    // Create initial metrics
    const totalInteractions = Math.floor(Math.random() * 500) + 500;
    const successRate = agent.config.successRate || 0.8;
    await prisma.agentMetrics.create({
      data: {
        agentId: createdAgent.id,
        totalInteractions,
        successfulInteractions: Math.floor(totalInteractions * successRate),
        averageResponseTime: agent.config.responseTime || 3600,
        errorRate: 1 - successRate,
        lastActive: new Date()
      }
    });

    // Create initial specializations
    await prisma.agentSpecialization.create({
      data: {
        agentId: createdAgent.id,
        taskType: agent.capabilities[0],
        proficiencyScore: successRate,
        tasksCompleted: Math.floor(Math.random() * 300) + 200,
        successRate: successRate
      }
    });
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });