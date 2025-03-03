import { Department, Agent } from './types';

const departments: Record<string, Department> = {
  engineering: {
    id: 'engineering',
    name: 'Engineering',
    description: 'Technical development and implementation of platform features',
    agents: [
      {
        id: 'tech-lead',
        name: 'Tech Lead',
        description: 'Oversees technical architecture and engineering decisions',
        expertise: ['architecture', 'code review', 'technical planning']
      },
      {
        id: 'frontend-dev',
        name: 'Frontend Developer',
        description: 'Specializes in user interface and experience development',
        expertise: ['React', 'CSS', 'UI/UX implementation']
      },
      {
        id: 'backend-dev',
        name: 'Backend Developer',
        description: 'Handles server-side logic and database operations',
        expertise: ['API development', 'database design', 'server management']
      }
    ]
  },
  
  product: {
    id: 'product',
    name: 'Product Management',
    description: 'Product strategy, roadmap planning, and feature prioritization',
    agents: [
      {
        id: 'product-manager',
        name: 'Product Manager',
        description: 'Defines product vision and coordinates development efforts',
        expertise: ['product strategy', 'user stories', 'roadmap planning']
      },
      {
        id: 'ux-researcher',
        name: 'UX Researcher',
        description: 'Conducts user research and provides insights for product development',
        expertise: ['user interviews', 'usability testing', 'user personas']
      }
    ]
  },
  
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    description: 'Promotion, branding, and user acquisition strategies',
    agents: [
      {
        id: 'marketing-strategist',
        name: 'Marketing Strategist',
        description: 'Develops marketing campaigns and growth strategies',
        expertise: ['campaign planning', 'market analysis', 'brand development']
      },
      {
        id: 'content-creator',
        name: 'Content Creator',
        description: 'Creates engaging content for various marketing channels',
        expertise: ['copywriting', 'content strategy', 'social media']
      }
    ]
  },
  
  operations: {
    id: 'operations',
    name: 'Operations',
    description: 'Day-to-day operations, process optimization, and resource management',
    agents: [
      {
        id: 'operations-manager',
        name: 'Operations Manager',
        description: 'Oversees operational processes and resource allocation',
        expertise: ['process optimization', 'resource management', 'operational planning']
      },
      {
        id: 'data-analyst',
        name: 'Data Analyst',
        description: 'Analyzes platform data to provide operational insights',
        expertise: ['data analysis', 'reporting', 'metrics tracking']
      }
    ]
  }
};

// Helper functions to work with departments and agents
const getAllDepartments = (): Department[] => {
  return Object.values(departments);
};

const getDepartmentById = (departmentId: string): Department | null => {
  return departments[departmentId] || null;
};

const getAgentsByDepartment = (departmentId: string): Agent[] => {
  const department = departments[departmentId];
  return department ? department.agents : [];
};

const getAgentById = (departmentId: string, agentId: string): Agent | null => {
  const department = departments[departmentId];
  if (!department) return null;
  
  return department.agents.find(agent => agent.id === agentId) || null;
};

export {
  departments,
  getAllDepartments,
  getDepartmentById,
  getAgentsByDepartment,
  getAgentById
};