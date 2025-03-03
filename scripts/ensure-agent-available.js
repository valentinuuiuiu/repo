// Script to ensure CUSTOMER_SERVICE agent is available
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for CUSTOMER_SERVICE agent in the database...');

  // Check if we have a department for customer service
  let department = await prisma.department.findFirst({
    where: {
      code: 'CUSTOMER_EXP'
    }
  });

  // Create department if it doesn't exist
  if (!department) {
    console.log('Creating customer experience department...');
    department = await prisma.department.create({
      data: {
        name: 'Customer Experience',
        description: 'Department responsible for customer service and support',
        code: 'CUSTOMER_EXP'
      }
    });
    console.log(`Created department with ID: ${department.id}`);
  }

  // Check if we have a CUSTOMER_SERVICE agent
  const existingAgent = await prisma.agent.findFirst({
    where: {
      type: 'CUSTOMER_SERVICE'
    }
  });

  if (existingAgent) {
    // Update the agent to AVAILABLE status if it exists
    console.log(`Found existing agent ${existingAgent.name} (${existingAgent.id})`);
    const updatedAgent = await prisma.agent.update({
      where: { id: existingAgent.id },
      data: { status: 'AVAILABLE' }
    });
    console.log(`Updated agent status to AVAILABLE: ${updatedAgent.name}`);
  } else {
    // Create a new CUSTOMER_SERVICE agent if none exists
    const newAgent = await prisma.agent.create({
      data: {
        name: 'Customer Service Agent',
        type: 'CUSTOMER_SERVICE',
        description: 'AI agent for customer support and satisfaction optimization',
        departmentId: department.id,
        status: 'AVAILABLE',
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
      }
    });
    console.log(`Created new CUSTOMER_SERVICE agent with ID: ${newAgent.id}`);

    // Create initial metrics for the agent
    await prisma.agentMetrics.create({
      data: {
        agentId: newAgent.id,
        totalInteractions: 0,
        successfulInteractions: 0,
        averageResponseTime: 0,
        errorRate: 0,
        lastActive: new Date()
      }
    });
    console.log('Created initial metrics for the new agent');
  }

  // Check for any BUSY agents that should be reset
  const busyAgents = await prisma.agent.findMany({
    where: {
      status: 'BUSY'
    }
  });

  if (busyAgents.length > 0) {
    console.log(`Found ${busyAgents.length} agents stuck in BUSY status. Resetting...`);
    
    for (const agent of busyAgents) {
      await prisma.agent.update({
        where: { id: agent.id },
        data: { status: 'AVAILABLE' }
      });
      console.log(`Reset agent ${agent.name} to AVAILABLE status`);
    }
  }

  console.log('Agent availability check complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });