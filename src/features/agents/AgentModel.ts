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
  performanceMetrics?: {
    completedTasks: number;
    customerSatisfactionScore: number;
    responseTime: number;
  };
  accessibleTools: string[];
}

// Department interface
export interface Department {
  id: string;
  name: string;
  description: string;
  requiredCapabilities: string[];
  agents: Agent[];
}

// Agent management class
export class AgentManager {
  private departments: Map<string, Department> = new Map();
  private agents: Map<string, Agent> = new Map();

  // Add a new department
  addDepartment(department: Department) {
    this.departments.set(department.id, department);
  }

  // Add an agent to a department
  addAgentToDepartment(agent: Agent, departmentId: string) {
    const department = this.departments.get(departmentId);
    if (!department) {
      throw new Error(`Department with ID ${departmentId} does not exist`);
    }

    // Validate agent capabilities against department requirements
    const missingCapabilities = department.requiredCapabilities.filter(
      cap => !agent.capabilities.some(agentCap => agentCap.id === cap)
    );

    if (missingCapabilities.length > 0) {
      throw new Error(`Agent is missing required capabilities: ${missingCapabilities.join(', ')}`);
    }

    // Add agent to department
    department.agents.push(agent);
    agent.departmentId = departmentId;
    this.agents.set(agent.id, agent);
  }

  // Find an agent with specific capabilities
  findAgentWithCapabilities(requiredCapabilities: string[]): Agent | null {
    // Convert Map values to an array and then iterate
    const agentsArray = Array.from(this.agents.values());
    
    for (const agent of agentsArray) {
      const hasAllCapabilities = requiredCapabilities.every(cap => 
        agent.capabilities.some((agentCap: AgentCapability) => agentCap.id === cap)
      );

      if (hasAllCapabilities) {
        return agent;
      }
    }
    return null;
  }

  // Get agents by department
  getAgentsByDepartment(departmentId: string): Agent[] {
    // Convert Map values to an array and filter
    return Array.from(this.agents.values()).filter(
      agent => agent.departmentId === departmentId
    );
  }

  // Assign a task to the most suitable agent
  assignTask(task: {
    departmentId: string;
    requiredCapabilities: string[];
  }) {
    const department = this.departments.get(task.departmentId);
    if (!department) {
      throw new Error(`Department ${task.departmentId} not found`);
    }

    // Find the most suitable agent in the department
    const suitableAgent = department.agents.find(agent => 
      task.requiredCapabilities.every(cap => 
        agent.capabilities.some(agentCap => agentCap.id === cap)
      )
    );

    if (!suitableAgent) {
      throw new Error(`No agent found in ${department.name} with required capabilities`);
    }

    return suitableAgent;
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