import yaml from "js-yaml";
import { ChiefAgent } from "./agents/ChiefAgent";
import { AgentConfig, Task, AgentResponse } from "./types";
import { ProductAgent } from "./agents/ProductAgent";
import { SupplierAgent } from "./agents/SupplierAgent";
import { MarketingAgent } from "./agents/MarketingAgent";
import { CustomerAgent } from "./agents/CustomerAgent";

export class AgentManager {
  private chief: ChiefAgent;
  private config: any;
  private agents: Map<string, any> = new Map();

  constructor() {
    this.loadConfig();
    this.initializeAgents();
  }

  private loadConfig() {
    try {
      // Load the YAML config
      const configFile = require("./config/agents.yaml");
      this.config = yaml.load(configFile);
    } catch (error) {
      console.error("Failed to load agent configuration:", error);
      throw error;
    }
  }

  private initializeAgents() {
    // Initialize chief agent
    this.chief = new ChiefAgent(this.config.agents.chief);

    // Initialize department agents
    Object.entries(this.config.agents.departments).forEach(([dept, config]) => {
      const agent = this.createDepartmentAgent(dept, config as AgentConfig);
      this.agents.set(dept, agent);
      this.chief.addSubordinate(dept, agent);
    });

    // Initialize subordinate agents
    Object.entries(this.config.agents.subordinates).forEach(([id, config]) => {
      const agent = this.createSubordinateAgent(id, config as AgentConfig);
      this.agents.set(id, agent);

      // Assign to department if specified
      const department = this.findDepartmentForSubordinate(id);
      if (department) {
        const deptAgent = this.agents.get(department);
        deptAgent?.addSubordinate(id, agent);
      }
    });
  }

  private createDepartmentAgent(department: string, config: AgentConfig) {
    switch (department) {
      case "product":
        return new ProductAgent(config);
      case "supplier":
        return new SupplierAgent(config);
      case "marketing":
        return new MarketingAgent(config);
      case "customer":
        return new CustomerAgent(config);
      default:
        throw new Error(`Unknown department: ${department}`);
    }
  }

  private createSubordinateAgent(id: string, config: AgentConfig) {
    // Create specific subordinate agents based on their role
    const AgentClass = this.getAgentClassForRole(config.role);
    return new AgentClass(config);
  }

  private findDepartmentForSubordinate(subordinateId: string) {
    for (const [dept, config] of Object.entries(
      this.config.agents.departments,
    )) {
      if ((config as any).subordinates?.includes(subordinateId)) {
        return dept;
      }
    }
    return null;
  }

  private getAgentClassForRole(role: string) {
    // Map roles to agent classes
    const agentClasses: Record<string, any> = {
      "Inventory Manager": require("./agents/InventoryAgent").default,
      "Pricing Specialist": require("./agents/PricingAgent").default,
      "Sourcing Specialist": require("./agents/SourcingAgent").default,
      "Quality Control Specialist": require("./agents/QualityAgent").default,
      // Add more role-to-class mappings
    };

    const AgentClass = agentClasses[role];
    if (!AgentClass) throw new Error(`No agent class found for role: ${role}`);
    return AgentClass;
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    return this.chief.execute(task);
  }

  getAgentStatus(agentId: string) {
    const agent = this.agents.get(agentId);
    return agent?.getStatus() || null;
  }

  getAllAgentStatuses() {
    const statuses: Record<string, any> = {};
    this.agents.forEach((agent, id) => {
      statuses[id] = agent.getStatus();
    });
    return statuses;
  }
}
