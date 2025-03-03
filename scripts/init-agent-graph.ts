import { AgentGraphOrchestrator } from '../src/lib/ai/core/AgentGraphOrchestrator';
import { prisma } from '../src/lib/prisma';

/**
 * Initialize the agent graph system
 * - Sets up the graph structure
 * - Loads agents and departments
 * - Establishes initial collaboration patterns
 */
async function initAgentGraph() {
  console.log('🔄 Initializing Agent Graph System...');
  
  try {
    const orchestrator = new AgentGraphOrchestrator();
    console.log('✅ Created graph orchestrator instance');
    
    await orchestrator.initialize();
    console.log('✅ Initialized graph structure with agents and departments');
    
    // Test connection to the database
    const agentCount = await prisma.agent.count();
    const departmentCount = await prisma.department.count();
    console.log(`📊 Found ${departmentCount} departments and ${agentCount} agents in the system`);
    
    if (agentCount === 0 || departmentCount === 0) {
      console.log('⚠️  No agents or departments found. Please run the seed script first:');
      console.log('   pnpm prisma db seed');
      return;
    }
    
    // Load a test workflow to visualize
    const workflowId = "workflow-product-onboard";
    const workflowName = "Product Onboarding";
    const workflowSteps = [
      {
        id: 'market-analysis',
        departmentId: 'dept-intel',
        taskType: 'market_analysis',
        priority: 'medium',
        data: {
          analysisType: 'product_viability',
          requiredInsights: ['market_demand', 'competition', 'pricing_range']
        }
      },
      {
        id: 'pricing-strategy',
        departmentId: 'dept-commerce',
        taskType: 'pricing_optimization',
        priority: 'high',
        dependsOn: ['market-analysis'],
        data: {
          optimizationType: 'initial_pricing',
          marginTarget: 0.3
        }
      },
      // Add more steps as needed
    ];
    
    const workflowNodeId = await orchestrator.addWorkflowToGraph(
      workflowId,
      workflowName,
      workflowSteps
    );
    console.log(`✅ Added test workflow to graph: ${workflowNodeId}`);
    
    // Get visualization data
    const visualizationData = await orchestrator.getAgentNetworkVisualization();
    console.log(`✅ Generated graph visualization data: ${visualizationData.nodes.length} nodes and ${visualizationData.edges.length} edges`);
    
    // Find optimal agents for each task type
    const marketAnalysisAgent = await orchestrator.findOptimalAgentForTask('market_analysis');
    console.log(`✅ Optimal agent for market analysis: ${marketAnalysisAgent || 'None found'}`);
    
    const pricingAgent = await orchestrator.findOptimalAgentForTask('pricing_optimization');
    console.log(`✅ Optimal agent for pricing: ${pricingAgent || 'None found'}`);
    
    // Find bottlenecks
    const bottlenecks = await orchestrator.analyzeWorkflowBottlenecks();
    console.log(`✅ Identified ${bottlenecks.length} potential workflow bottlenecks`);
    
    console.log('\n🎉 Agent Graph System initialized successfully!');
    console.log('Use the AgentGraphService to interact with the graph in your application.');
    
  } catch (error) {
    console.error('❌ Error initializing agent graph system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization function
initAgentGraph()
  .then(() => console.log('Done!'))
  .catch((error) => console.error('Failed to initialize agent graph system:', error));