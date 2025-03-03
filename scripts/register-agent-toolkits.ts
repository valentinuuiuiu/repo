// Register agent toolkits and ensure proper connection between database agents and the AgentManager service
import { PrismaClient, AgentType, AgentStatus } from '@prisma/client';
import { AgentManager } from '../src/services/AgentManager';
import { AgentType } from '../src/types/agent';
import { AgentToolkit } from '../src/types/agent';
import { registerToolkits } from '../src/lib/ai/tools/toolkitRegistry';

interface AgentData {
  type: AgentType;
  name: string;
  description: string;
  departmentId: string;
  capabilities: string[];
}

const prisma = new PrismaClient();
const agentManager = AgentManager.getInstance();

async function registerAgentToolkits(): Promise<void> {
  try {
    console.log('Starting agent toolkit registration...');
    
    // Get all agents from the database
    const agents = await prisma.agent.findMany({
      include: {
        department: true
      }
    });
    
    console.log(`Found ${agents.length} agents in the database`);
    
    // Map of department names to IDs for easy lookup
    const departments: Record<string, string> = {};
    
    // Create any missing departments if needed
    const requiredDepartments = [
      { name: 'Blog Department', code: 'BLOG_DEPT', description: 'Blog Department responsible for blog department tasks.' },
      { name: 'Documentation Department', code: 'DOC_DEPT', description: 'Documentation Department responsible for documentation department tasks.' },
      { name: 'Customer Support Department', code: 'SUPPORT_DEPT', description: 'Customer Support Department responsible for customer support department tasks.' }
    ];
    
    for (const deptInfo of requiredDepartments) {
      let dept = await prisma.department.findFirst({
        where: { code: deptInfo.code }
      });
      
      if (!dept) {
        console.log(`Creating missing department: ${deptInfo.name}`);
        dept = await prisma.department.create({
          data: {
            name: deptInfo.name,
            code: deptInfo.code,
            description: deptInfo.description
          }
        });
      }
      
      departments[deptInfo.name] = dept.id;
    }
    
    // Register Content Creator agent if it doesn't exist
    await ensureAgentExists({
      type: AgentType.MARKET_ANALYSIS, // Using MARKET_ANALYSIS for content creation
      name: "Content Creator",
      description: "Creates engaging blog content for the company website",
      departmentId: departments['Blog Department'],
      capabilities: [
        "Blog post creation",
        "SEO optimization",
        "Content summarization",
        "Editorial calendar planning"
      ]
    });
    
    // Register Documentation Specialist agent if it doesn't exist
    await ensureAgentExists({
      type: AgentType.QUALITY_CONTROL, // Using QUALITY_CONTROL for documentation
      name: "Documentation Specialist",
      description: "Creates and maintains technical documentation for products and APIs",
      departmentId: departments['Documentation Department'],
      capabilities: [
        "API documentation",
        "Technical writing",
        "Documentation SEO optimization",
        "User guide creation"
      ]
    });
    
    // Register Customer Support Agent if it doesn't exist
    await ensureAgentExists({
      type: AgentType.CUSTOMER_SERVICE,
      name: "Customer Support Leader",
      description: "Handles customer inquiries and provides support",
      departmentId: departments['Customer Support Department'],
      capabilities: [
        "Customer inquiry handling",
        "Troubleshooting assistance",
        "Product usage guidance",
        "Customer satisfaction monitoring"
      ]
    });
    
    // Connect the agents to their toolkits in the AgentManager
    console.log('Ensuring toolkits are registered for all agents');
    
    // The AgentManager already registers default toolkits in its constructor,
    // but we'll make sure any custom tools are added here
    
    // Add custom tools to Content Creator's toolkit if needed
    const contentToolkit = agentManager.getToolkit(AgentType.MARKET_ANALYSIS);
    console.log(`Content Creator toolkit has ${contentToolkit?.tools.length || 0} tools`);
    
    // Add custom tools to Documentation Specialist's toolkit if needed
    const docToolkit = agentManager.getToolkit(AgentType.QUALITY_CONTROL);
    console.log(`Documentation Specialist toolkit has ${docToolkit?.tools.length || 0} tools`);
    
    // Add custom tools to Customer Support's toolkit if needed
    const supportToolkit = agentManager.getToolkit(AgentType.CUSTOMER_SERVICE);
    console.log(`Customer Support toolkit has ${supportToolkit?.tools.length || 0} tools`);
    
    console.log('Agent toolkit registration complete!');
  } catch (error) {
    console.error('Error registering agent toolkits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function ensureAgentExists(agentData: AgentData) {
  // Check if agent already exists
  let agent = await prisma.agent.findFirst({
    where: { type: agentData.type }
  });
  
  if (agent) {
    console.log(`Agent ${agentData.name} (${agentData.type}) already exists, updating capabilities`);
    // Update agent with latest capabilities
    agent = await prisma.agent.update({
      where: { id: agent.id },
      data: {
        capabilities: agentData.capabilities,
        status: AgentStatus.AVAILABLE
      }
    });
  } else {
    console.log(`Creating new agent: ${agentData.name} (${agentData.type})`);
    // Create new agent
    agent = await prisma.agent.create({
      data: {
        name: agentData.name,
        type: agentData.type,
        description: agentData.description,
        departmentId: agentData.departmentId,
        capabilities: agentData.capabilities,
        status: AgentStatus.AVAILABLE
      }
    });
    
    // Create initial metrics
    await prisma.agentMetrics.create({
      data: {
        agentId: agent.id,
        totalInteractions: 0,
        successfulInteractions: 0,
        averageResponseTime: 0,
        errorRate: 0,
        lastActive: new Date()
      }
    });
  }
  
  return agent;
}

export async function registerToolkits() {
  await registerToolkit(AgentType.MARKET_ANALYSIS, {
    // toolkit implementation
  });

  await registerToolkit(AgentType.QUALITY_CONTROL, {
    // toolkit implementation  
  });

  await registerToolkit(AgentType.CUSTOMER_SERVICE, {
    // toolkit implementation
  });
}

// Create toolkits for each agent type
const marketAnalysisToolkit: AgentToolkit = {
  agentType: AgentType.MARKET_ANALYSIS,
  tools: [
    // ...existing tools...
  ]
};

const qualityControlToolkit: AgentToolkit = {
  agentType: AgentType.QUALITY_CONTROL,
  tools: [
    // ...existing tools...
  ]
};

const customerServiceToolkit: AgentToolkit = {
  agentType: AgentType.CUSTOMER_SERVICE,
  tools: [
    // ...existing tools...
  ]
};

// Register all toolkits
registerToolkits([
  marketAnalysisToolkit,
  qualityControlToolkit,  
  customerServiceToolkit
]);

// Run the registration process
registerAgentToolkits()
  .then(() => console.log('Agent toolkit registration script completed successfully'))
  .catch(e => console.error('Error during agent toolkit registration:', e));