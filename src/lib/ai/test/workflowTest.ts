import { WorkflowOrchestrator } from '../core/WorkflowOrchestrator';
import { standardWorkflows } from '../workflows/StandardWorkflows';
import { prisma } from '@/lib/prisma';

async function testWorkflowOrchestration() {
  const orchestrator = new WorkflowOrchestrator();

  // Subscribe to workflow events
  orchestrator.onWorkflowProgress((update) => {
    console.log('Workflow Progress:', {
      workflowId: update.workflowId,
      completedSteps: update.completedSteps,
      totalSteps: update.totalSteps,
      progress: Math.round((update.completedSteps / update.totalSteps) * 100) + '%'
    });
  });

  orchestrator.onWorkflowComplete((result) => {
    console.log('Workflow Completed:', {
      workflowId: result.workflowId,
      results: result.results
    });
  });

  try {
    // Test Product Onboarding Workflow
    console.log('\n=== Testing Product Onboarding Workflow ===');
    const productData = {
      title: 'Test Product',
      category: 'Electronics',
      targetPrice: 199.99,
      description: 'A test product for workflow validation'
    };
    
    const onboardingResult = await orchestrator.executeWorkflow(
      standardWorkflows.productOnboarding,
      productData
    );
    console.log('Product Onboarding Results:', onboardingResult);

    // Test Order Fulfillment Workflow
    console.log('\n=== Testing Order Fulfillment Workflow ===');
    const orderData = {
      orderId: 'TEST-ORDER-001',
      products: [
        { id: 'PROD-001', quantity: 2, price: 199.99 }
      ],
      customer: {
        id: 'CUST-001',
        email: 'test@example.com'
      },
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        country: 'Test Country'
      }
    };
    
    const fulfillmentResult = await orchestrator.executeWorkflow(
      standardWorkflows.orderFulfillment,
      orderData
    );
    console.log('Order Fulfillment Results:', fulfillmentResult);

    // Test Platform Optimization Workflow
    console.log('\n=== Testing Platform Optimization Workflow ===');
    const platformData = {
      targetMetrics: {
        responseTime: 200, // ms
        errorRate: 0.01,
        resourceUsage: 0.7
      },
      optimizationPriorities: ['performance', 'reliability', 'cost']
    };
    
    const optimizationResult = await orchestrator.executeWorkflow(
      standardWorkflows.platformOptimization,
      platformData
    );
    console.log('Platform Optimization Results:', optimizationResult);

  } catch (error) {
    console.error('Workflow Test Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testWorkflowOrchestration()
  .then(() => console.log('Workflow tests completed'))
  .catch(console.error);