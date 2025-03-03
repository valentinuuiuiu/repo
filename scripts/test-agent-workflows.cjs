const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAgentWorkflows() {
  try {
    // Test product onboarding workflow
    console.log('\nTesting commerce department agents...');
    const commerceAgents = await prisma.agent.findMany({
      where: { departmentId: 'dept-commerce' },
      include: { 
        metrics: true,
        specializations: true
      }
    });
    console.log('Commerce agents:', commerceAgents.map(a => ({
      name: a.name,
      type: a.type,
      status: a.status,
      capabilities: a.capabilities
    })));

    // Test customer experience workflow
    console.log('\nTesting CX department agents...');
    const cxAgents = await prisma.agent.findMany({
      where: { departmentId: 'dept-cx' },
      include: {
        metrics: true,
        specializations: true
      }
    });
    console.log('CX agents:', cxAgents.map(a => ({
      name: a.name,
      type: a.type,
      status: a.status,
      capabilities: a.capabilities
    })));

    // Test platform optimization
    console.log('\nTesting platform optimization agents...');
    const platformAgents = await prisma.agent.findMany({
      where: { departmentId: 'dept-optimize' },
      include: {
        metrics: true,
        specializations: true
      }
    });
    console.log('Platform agents:', platformAgents.map(a => ({
      name: a.name,
      type: a.type,
      status: a.status,
      capabilities: a.capabilities
    })));

    // Check agent metrics
    const allMetrics = await prisma.agentMetrics.findMany({
      include: {
        agent: true
      }
    });
    console.log('\nAgent performance metrics:');
    allMetrics.forEach(m => {
      console.log(`${m.agent.name}:`, {
        successRate: `${((m.successfulInteractions / m.totalInteractions) * 100).toFixed(1)}%`,
        avgResponseTime: `${m.averageResponseTime.toFixed(0)}ms`,
        totalTasks: m.totalInteractions
      });
    });

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAgentWorkflows()
  .then(() => console.log('\nAgent workflow tests completed'))
  .catch(console.error);