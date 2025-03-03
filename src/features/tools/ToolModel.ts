import { AgentCapability } from '../agents/AgentModel';

// Tool permission levels
export enum ToolPermissionLevel {
  READ = 'read',
  WRITE = 'write',
  EXECUTE = 'execute',
  ADMIN = 'admin'
}

// Tool interface
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  requiredCapabilities: string[];
  requiredPermissions: ToolPermissionLevel[];
  version: string;
  usage: {
    documentation: string;
    examples: string[];
  };
}

// Tool categories
export enum ToolCategory {
  DATA_ANALYSIS = 'data_analysis',
  COMMUNICATION = 'communication',
  CONTENT_CREATION = 'content_creation',
  CUSTOMER_SUPPORT = 'customer_support',
  DEVELOPMENT = 'development',
  SALES = 'sales',
  MARKETING = 'marketing',
  OPERATIONS = 'operations'
}

// Tool registry to manage all available tools
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  // Register a new tool
  registerTool(tool: Tool): void {
    if (this.tools.has(tool.id)) {
      throw new Error(`Tool with ID ${tool.id} already exists`);
    }
    this.tools.set(tool.id, tool);
  }

  // Get a tool by ID
  getTool(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  // Get all tools
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  // Get tools by category
  getToolsByCategory(category: ToolCategory): Tool[] {
    return this.getAllTools().filter(tool => tool.category === category);
  }

  // Get tools that an agent can access based on their capabilities
  getAccessibleTools(agentCapabilities: AgentCapability[]): Tool[] {
    const capabilityIds = agentCapabilities.map(cap => cap.id);
    
    return this.getAllTools().filter(tool => 
      tool.requiredCapabilities.every(capId => 
        capabilityIds.includes(capId)
      )
    );
  }
}

// Predefined tools
export const PREDEFINED_TOOLS: Tool[] = [
  {
    id: 'customer_ticket_manager',
    name: 'Customer Ticket Manager',
    description: 'Manage and respond to customer support tickets',
    category: ToolCategory.CUSTOMER_SUPPORT,
    requiredCapabilities: ['customer_support'],
    requiredPermissions: [ToolPermissionLevel.READ, ToolPermissionLevel.WRITE],
    version: '1.0.0',
    usage: {
      documentation: 'Use this tool to view, update, and resolve customer support tickets',
      examples: [
        'View all open tickets',
        'Respond to ticket #12345',
        'Escalate ticket to technical support'
      ]
    }
  },
  {
    id: 'technical_diagnostic',
    name: 'Technical Diagnostic Tool',
    description: 'Diagnose and troubleshoot technical issues',
    category: ToolCategory.CUSTOMER_SUPPORT,
    requiredCapabilities: ['technical_support'],
    requiredPermissions: [ToolPermissionLevel.READ, ToolPermissionLevel.EXECUTE],
    version: '1.0.0',
    usage: {
      documentation: 'Use this tool to run diagnostics and identify technical problems',
      examples: [
        'Run system diagnostics for user account',
        'Check integration status',
        'Verify API connection health'
      ]
    }
  },
  {
    id: 'sales_pipeline',
    name: 'Sales Pipeline Manager',
    description: 'Manage sales leads and opportunities',
    category: ToolCategory.SALES,
    requiredCapabilities: ['sales_management'],
    requiredPermissions: [ToolPermissionLevel.READ, ToolPermissionLevel.WRITE],
    version: '1.0.0',
    usage: {
      documentation: 'Use this tool to track and manage sales opportunities',
      examples: [
        'View current pipeline',
        'Update lead status',
        'Generate sales forecast'
      ]
    }
  },
  {
    id: 'product_roadmap',
    name: 'Product Roadmap Tool',
    description: 'Plan and track product development',
    category: ToolCategory.DEVELOPMENT,
    requiredCapabilities: ['product_development'],
    requiredPermissions: [ToolPermissionLevel.READ, ToolPermissionLevel.WRITE, ToolPermissionLevel.ADMIN],
    version: '1.0.0',
    usage: {
      documentation: 'Use this tool to manage product features and development timeline',
      examples: [
        'View current roadmap',
        'Add new feature request',
        'Update feature status'
      ]
    }
  },
  {
    id: 'market_analysis',
    name: 'Market Analysis Tool',
    description: 'Analyze market trends and competition',
    category: ToolCategory.MARKETING,
    requiredCapabilities: ['market_research'],
    requiredPermissions: [ToolPermissionLevel.READ, ToolPermissionLevel.EXECUTE],
    version: '1.0.0',
    usage: {
      documentation: 'Use this tool to gather and analyze market data',
      examples: [
        'Generate competitor analysis',
        'Track industry trends',
        'Create market opportunity report'
      ]
    }
  },
  {
    id: 'content_generator',
    name: 'Content Generator',
    description: 'Generate marketing and support content',
    category: ToolCategory.CONTENT_CREATION,
    requiredCapabilities: ['content_creation'],
    requiredPermissions: [ToolPermissionLevel.EXECUTE, ToolPermissionLevel.WRITE],
    version: '1.0.0',
    usage: {
      documentation: 'Use this tool to create various types of content',
      examples: [
        'Generate product description',
        'Create email template',
        'Draft knowledge base article'
      ]
    }
  },
  {
    id: 'data_analyzer',
    name: 'Data Analysis Tool',
    description: 'Analyze platform and business data',
    category: ToolCategory.DATA_ANALYSIS,
    requiredCapabilities: ['data_analysis'],
    requiredPermissions: [ToolPermissionLevel.READ, ToolPermissionLevel.EXECUTE],
    version: '1.0.0',
    usage: {
      documentation: 'Use this tool to analyze data and generate insights',
      examples: [
        'Analyze user engagement metrics',
        'Generate sales performance report',
        'Identify usage patterns'
      ]
    }
  },
  {
    id: 'operations_dashboard',
    name: 'Operations Dashboard',
    description: 'Monitor and manage platform operations',
    category: ToolCategory.OPERATIONS,
    requiredCapabilities: ['operations_management'],
    requiredPermissions: [ToolPermissionLevel.READ, ToolPermissionLevel.ADMIN],
    version: '1.0.0',
    usage: {
      documentation: 'Use this tool to monitor and manage platform operations',
      examples: [
        'View system health metrics',
        'Manage resource allocation',
        'Monitor service uptime'
      ]
    }
  }
];

// Create and initialize the tool registry
export function createToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  
  // Register all predefined tools
  PREDEFINED_TOOLS.forEach(tool => {
    registry.registerTool(tool);
  });
  
  return registry;
}