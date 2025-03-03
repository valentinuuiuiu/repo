export interface Department {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  expertise: string[];
}

export interface DepartmentContextType {
  currentDepartment: Department | null;
  currentAgent: Agent | null;
  selectDepartment: (departmentId: string) => void;
  selectAgent: (departmentId: string, agentId: string) => void;
  getAssistantContext: () => {
    departmentName?: string;
    departmentDescription?: string;
    agentName?: string;
    agentDescription?: string;
    agentExpertise?: string;
  };
}