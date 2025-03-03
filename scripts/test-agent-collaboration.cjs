const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAgentCollaboration() {
  try {
    // Test scenario: New product launch requiring multiple department coordination
    console.log('\nTesting cross-department product launch collaboration...');
    
    // 1. Get participating departments
    const departments = await prisma.department.findMany({
      where: {
        id: {
          in: ['dept-commerce', 'dept-intel', 'dept-supply']
        }
      },
      include: {
        agents: {
          include: {
            metrics: true,
            specializations: true
          }
        }
      }
    });

    console.log('\nParticipating Departments:');
    departments.forEach(dept => {
      console.log(`\n${dept.name}:`);
      dept.agents.forEach(agent => {
        console.log(`- ${agent.name} (${agent.capabilities.join(', ')})`);
      });
    });

    // 2. Create collaboration task
    const collaborationTask = {
      id: 'collab-product-launch-001',
      taskId: 'product-launch-001',
      agentIds: departments.map(d => d.agents[0].id),
      timestamp: new Date()
    };

    // 3. Record collaboration
    const collaborationPromises = collaborationTask.agentIds.map(agentId =>
      prisma.agentCollaboration.create({
        data: {
          agentId,
          collaboratorId: collaborationTask.agentIds.find(id => id !== agentId) || '',
          taskId: collaborationTask.taskId,
          successRate: 0.8 + (Math.random() * 0.15), // Initial success rate 80-95%
          frequency: 1,
          lastCollaborated: new Date()
        }
      })
    );

    await Promise.all(collaborationPromises);

    // 4. Verify collaboration records
    const collaborations = await prisma.agentCollaboration.findMany({
      where: { taskId: collaborationTask.taskId },
      include: {
        agent: true
      }
    });

    console.log('\nCollaboration Metrics:');
    collaborations.forEach(collab => {
      console.log(`${collab.agent.name}:`, {
        successRate: `${(collab.successRate * 100).toFixed(1)}%`,
        frequency: collab.frequency,
        lastCollaborated: collab.lastCollaborated
      });
    });

    // 5. Calculate overall collaboration effectiveness
    const avgSuccessRate = collaborations.reduce((sum, c) => sum + c.successRate, 0) / collaborations.length;
    console.log('\nOverall Collaboration Effectiveness:', {
      successRate: `${(avgSuccessRate * 100).toFixed(1)}%`,
      participatingAgents: collaborations.length,
      departments: departments.length
    });

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAgentCollaboration()
  .then(() => console.log('\nAgent collaboration test completed'))
  .catch(console.error);