import { User } from '@/types/user';

// Define the core capabilities an agent can have
export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  requiredPermissions: string[];
}

// Agent interface with comprehensive details
export interface Agent extends User {
  departmentId: string;
  role: string;
  specialization: string;
  capabilities: AgentCapability[];
  
  // AI Configuration
  aiConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    tools: string[]; // List of enabled tools
  };

  // Performance Tracking
  performanceMetrics?: {
    completedTasks: number;
    customerSatisfactionScore: number;
    responseTime: number;
    tokenUsage: {
      prompt: number;
      completion: number;
      total: number;
    };
    costEstimate: number;
    collaborationScore: number;
  };

  // Memory System
  memorySettings?: {
    maxContextLength: number;
    memoryRetention: 'short' | 'long' | 'hybrid';
  };

  // Workflow Integration
  currentWorkflowStage?: 'sourcing' | 'supplier_matching' | 'order_processing';
  accessibleTools: string[];
}

// Enhanced Department interface for dropshipping
export interface Department {
  id: string;
  name: string;
  description: string;
  
  // Core capabilities
  requiredCapabilities: string[];
  requiredAICapabilities: string[]; // e.g. 'product_analysis', 'supplier_negotiation'
  
  // Workflow integration
  primaryWorkflowStage: 'sourcing' | 'supplier_matching' | 'inventory' | 'order_processing';
  secondaryWorkflowStages?: string[];
  
  // Department configuration
  defaultAIConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
  
  // Agents
  agents: Agent[];
  
  // Performance thresholds
  minimumPerformanceThresholds: {
    responseTime: number; // ms
    accuracy: number; // 0-1
    costPerTask: number; // USD
  };
}

// Agent management class
export class AgentManager {
  private departments: Map<string, Department> = new Map();
  private agents: Map<string, Agent> = new Map();

  // Add a new department with validation
  addDepartment(department: Department) {
    // Validate workflow stages
    const validStages = ['sourcing', 'supplier_matching', 'inventory', 'order_processing'];
    if (!validStages.includes(department.primaryWorkflowStage)) {
      throw new Error(`Invalid primary workflow stage: ${department.primaryWorkflowStage}`);
    }

    // Validate AI config
    if (!department.defaultAIConfig.model || 
        department.defaultAIConfig.temperature < 0 || 
        department.defaultAIConfig.temperature > 2) {
      throw new Error('Invalid default AI configuration');
    }

    this.departments.set(department.id, department);
  }

  // Add an agent to a department with enhanced validation
  addAgentToDepartment(agent: Agent, departmentId: string) {
    const department = this.departments.get(departmentId);
    if (!department) {
      throw new Error(`Department with ID ${departmentId} does not exist`);
    }

    // Validate standard capabilities
    const missingCapabilities = department.requiredCapabilities.filter(
      cap => !agent.capabilities.some(agentCap => agentCap.id === cap)
    );

    // Validate AI capabilities
    const missingAICapabilities = department.requiredAICapabilities.filter(
      cap => !agent.aiConfig?.tools?.includes(cap)
    );

    if (missingCapabilities.length > 0 || missingAICapabilities.length > 0) {
      const errors = [];
      if (missingCapabilities.length > 0) {
        errors.push(`Missing capabilities: ${missingCapabilities.join(', ')}`);
      }
      if (missingAICapabilities.length > 0) {
        errors.push(`Missing AI tools: ${missingAICapabilities.join(', ')}`);
      }
      throw new Error(errors.join('\n'));
    }

    // Inherit department defaults if not set
    agent.aiConfig = {
      model: agent.aiConfig?.model || department.defaultAIConfig.model,
      temperature: agent.aiConfig?.temperature ?? department.defaultAIConfig.temperature,
      maxTokens: agent.aiConfig?.maxTokens || department.defaultAIConfig.maxTokens,
      systemPrompt: agent.aiConfig?.systemPrompt || '',
      tools: agent.aiConfig?.tools || []
    };

    // Set workflow stage
    agent.currentWorkflowStage = department.primaryWorkflowStage;

    // Add agent to department
    department.agents.push(agent);
    agent.departmentId = departmentId;
    this.agents.set(agent.id, agent);
  }

  // Find an agent with specific capabilities (standard + AI)
  findAgentWithCapabilities(
    requiredCapabilities: string[],
    requiredAICapabilities?: string[]
  ): Agent | null {
    const agentsArray = Array.from(this.agents.values());
    
    return agentsArray.find(agent => {
      const hasStandardCapabilities = requiredCapabilities.every(cap => 
        agent.capabilities.some(agentCap => agentCap.id === cap)
      );
      
      const hasAICapabilities = requiredAICapabilities 
        ? requiredAICapabilities.every(cap => agent.aiConfig?.tools?.includes(cap))
        : true;

      return hasStandardCapabilities && hasAICapabilities;
    }) || null;
  }

  // Get agents by department
  getAgentsByDepartment(departmentId: string): Agent[] {
    // Convert Map values to an array and filter
    return Array.from(this.agents.values()).filter(
      agent => agent.departmentId === departmentId
    );
  }

  // Assign a task to the most suitable agent with workflow awareness
  assignTask(task: {
    departmentId: string;
    requiredCapabilities: string[];
    requiredAICapabilities?: string[];
    workflowStage?: 'sourcing' | 'supplier_matching' | 'inventory' | 'order_processing';
  }) {
    const department = this.departments.get(task.departmentId);
    if (!department) {
      throw new Error(`Department ${task.departmentId} not found`);
    }

    // Find suitable agents considering:
    // 1. Department membership
    // 2. Required capabilities
    // 3. Workflow stage alignment
    // 4. AI capabilities
    const suitableAgents = department.agents.filter(agent => {
      const hasCapabilities = task.requiredCapabilities.every(cap => 
        agent.capabilities.some(agentCap => agentCap.id === cap)
      );
      
      const hasAICapabilities = task.requiredAICapabilities
        ? task.requiredAICapabilities.every(cap => agent.aiConfig?.tools?.includes(cap))
        : true;

      const matchesWorkflow = task.workflowStage
        ? agent.currentWorkflowStage === task.workflowStage
        : true;

      return hasCapabilities && hasAICapabilities && matchesWorkflow;
    });

    if (suitableAgents.length === 0) {
      throw new Error(`No suitable agent found in ${department.name} for:
        ${task.requiredCapabilities.join(', ')}
        ${task.requiredAICapabilities?.join(', ') || ''}
        ${task.workflowStage || ''}`);
    }

    // Select agent with highest performance score
    return suitableAgents.reduce((best, current) => 
      (current.performanceMetrics?.customerSatisfactionScore || 0) > 
      (best.performanceMetrics?.customerSatisfactionScore || 0) 
        ? current 
        : best
    );
  }
}

// Predefined capabilities
export const AGENT_CAPABILITIES = {
  CUSTOMER_SUPPORT: {
    id: 'customer_support',
    name: 'Customer Support',
    description: 'Handling customer inquiries and support tickets',
    requiredPermissions: ['view_tickets', 'respond_tickets']
  },
  TECHNICAL_SUPPORT: {
    id: 'technical_support',
    name: 'Technical Support',
    description: 'Resolving technical issues and providing guidance',
    requiredPermissions: ['diagnose_issues', 'escalate_problems']
  },
  SALES_MANAGEMENT: {
    id: 'sales_management',
    name: 'Sales Management',
    description: 'Managing sales processes and customer relationships',
    requiredPermissions: ['view_sales_pipeline', 'create_quotes']
  },
  PRODUCT_DEVELOPMENT: {
    id: 'product_development',
    name: 'Product Development',
    description: 'Creating and improving platform features',
    requiredPermissions: ['create_features', 'modify_product_roadmap']
  },
  INVENTORY_MANAGEMENT: {
    id: 'inventory_management',
    name: 'Inventory Management',
    description: 'Managing inventory, tracking stock levels, and handling logistics',
    requiredPermissions: ['view_inventory', 'update_inventory', 'create_orders']
  },
  INVOICE_PROCESSING: {
    id: 'invoice_processing',
    name: 'Invoice Processing',
    description: 'Managing invoices, billing, and financial documentation',
    requiredPermissions: ['create_invoices', 'view_financial_records', 'process_payments']
  },
  DOCUMENTATION_MANAGEMENT: {
    id: 'documentation_management',
    name: 'Documentation Management',
    description: 'Handling paperwork, record-keeping, and documentation compliance',
    requiredPermissions: ['manage_documents', 'archive_records', 'generate_reports']
  }
};

// Example of creating a department with agents
export function createDropConnectAgentSystem(): AgentManager {
  const agentManager = new AgentManager();

  // Create departments
  const supportDepartment: Department = {
    id: 'support',
    name: 'Customer Support',
    description: 'Providing comprehensive support to our users',
    requiredCapabilities: ['customer_support', 'technical_support'],
    agents: []
  };

  const salesDepartment: Department = {
    id: 'sales',
    name: 'Sales and Partnerships',
    description: 'Managing sales processes and supplier partnerships',
    requiredCapabilities: ['sales_management'],
    agents: []
  };

  const productDepartment: Department = {
    id: 'product',
    name: 'Product Development',
    description: 'Innovating and improving the DropConnect platform',
    requiredCapabilities: ['product_development'],
    agents: []
  };

  const logisticsDepartment: Department = {
    id: 'logistics',
    name: 'Logistics and Inventory',
    description: 'Managing inventory, invoicing, and documentation',
    requiredCapabilities: ['inventory_management', 'invoice_processing', 'documentation_management'],
    agents: []
  };

  // Add departments
  agentManager.addDepartment(supportDepartment);
  agentManager.addDepartment(salesDepartment);
  agentManager.addDepartment(productDepartment);
  agentManager.addDepartment(logisticsDepartment);

  return agentManager;
}