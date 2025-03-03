export enum AgentStatus {
  AVAILABLE = 'AVAILABLE',
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  PROCESSING = 'PROCESSING',
  DISCONNECTING = 'DISCONNECTING',
  ERROR = 'ERROR'
}

export enum AgentType {
  // Core business operations
  PRICING_OPTIMIZATION = 'PRICING_OPTIMIZATION',
  MARKET_ANALYSIS = 'MARKET_ANALYSIS',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  INVENTORY_MANAGEMENT = 'INVENTORY_MANAGEMENT',
  ORDER_PROCESSING = 'ORDER_PROCESSING',
  SUPPLIER_COMMUNICATION = 'SUPPLIER_COMMUNICATION',
  QUALITY_CONTROL = 'QUALITY_CONTROL',
  
  // Leadership roles
  PRODUCT_LEADER = 'PRODUCT_LEADER',
  CUSTOMER_SUPPORT_LEADER = 'CUSTOMER_SUPPORT_LEADER',
  MARKET_RESEARCH_LEADER = 'MARKET_RESEARCH_LEADER',
  OPERATIONS_LEADER = 'OPERATIONS_LEADER',
  SALES_LEADER = 'SALES_LEADER',
  
  // Specialized roles
  DOCUMENTATION_SPECIALIST = 'DOCUMENTATION_SPECIALIST',
  BLOG_CONTENT_CREATOR = 'BLOG_CONTENT_CREATOR',
  CODE_MAINTENANCE = 'CODE_MAINTENANCE'
}

// New enum for agent function types
export enum AgentFunctionType {
  DATA_ANALYSIS = 'DATA_ANALYSIS',
  REPORT_GENERATION = 'REPORT_GENERATION',
  SUMMARIZATION = 'SUMMARIZATION',
  CONTENT_CREATION = 'CONTENT_CREATION',
  SENTIMENT_ANALYSIS = 'SENTIMENT_ANALYSIS',
  MARKET_RESEARCH = 'MARKET_RESEARCH',
  CUSTOMER_INTERACTION = 'CUSTOMER_INTERACTION',
  PROCESS_OPTIMIZATION = 'PROCESS_OPTIMIZATION',
  DOCUMENTATION_CREATION = 'DOCUMENTATION_CREATION',
  SEO_OPTIMIZATION = 'SEO_OPTIMIZATION',
  CROSS_PLATFORM_ANALYSIS = 'CROSS_PLATFORM_ANALYSIS'
}

// New interface to track agent thought process
export interface ThoughtChain {
  id: string;
  timestamp: number;
  agentType: AgentType;
  input: string;
  steps: Array<{
    step: number;
    thought: string;
    reasoning: string;
    action?: string;
    actionResult?: any;
  }>;
  conclusion: string;
  confidence: number; // 0-1 scale
}

// Define specialized toolkit functions each agent can use
export interface AgentTool {
  id: string;
  name: string;
  description: string;
  functionType: AgentFunctionType;
  requiresAuth: boolean;
  execute: (params: Record<string, any>) => Promise<any>;
  allowedAgentTypes: AgentType[];
}

export interface AgentToolkit {
  agentType: AgentType;
  tools: AgentTool[];
}

// Memory system for agent interactions
export interface AgentMemory {
  id: string;
  agentType: AgentType;
  memoryType: 'short_term' | 'long_term';
  data: Record<string, any>;
  createdAt: number;
  expiresAt?: number;
  priority: number;
  tags: string[];
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
}

// Enhanced agent configuration
export interface AgentConfig {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  capabilities: string[];
  contextSchema?: Record<string, unknown>;
  allowedFunctions: AgentFunctionType[];
  maxTokens: number;
  temperature: number;
  model: string;
  systemPrompt: string;
  collaborativeAgents?: AgentType[];
  memorySettings?: {
    useMemory: boolean;
    maxShortTermMemories: number;
    shortTermExpiryMinutes: number;
  };
}

// Enhanced agent response with tool usage tracking
export interface AgentResponse {
  id: string;
  timestamp: number;
  message: string;
  agentType: AgentType;
  status: 'success' | 'error';
  context?: Record<string, any>;
  error?: boolean;
  metadata?: Record<string, unknown>;
  toolsUsed?: Array<{
    toolId: string;
    executionTime: number;
    successful: boolean;
  }>;
  suggestions?: Array<{
    type: 'action' | 'question' | 'follow_up';
    content: string;
  }>;
  collaborativeInputs?: Record<AgentType, string>;
  thoughtProcess?: ThoughtChain; // Added thought chain to track agent reasoning
}

export interface AgentError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface AgentContext {
  sessionId: string;
  userId?: string;
  metadata: Record<string, unknown>;
  previousInteractions?: number;
  currentMemoryIds?: string[];
}

export interface AgentInteraction {
  id: string;
  timestamp: string;
  prompt: string;
  response: string;
  context?: AgentContext;
  error?: AgentError;
  performanceMetrics?: {
    responseTimeMs: number;
    tokenCount: {
      prompt: number;
      response: number;
      total: number;
    };
    cost: number;
  };
}

// Enhanced metrics for better analytics
export interface AgentMetrics {
  totalInteractions: number;
  successfulInteractions: number;
  averageResponseTime: number;
  errorRate: number;
  lastActive: string;
  tokenUsage: {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
  };
  costEstimate: {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
  };
  popularTopics: string[];
  metadata?: {
    toolUsage?: Record<string, {
      totalExecutions: number;
      successfulExecutions: number;
      averageExecutionTime: number;
      totalExecutionTime: number;
    }>;
    collaborations?: Record<string, number>;
  };
}

// Agent state management types
export interface AgentState {
  status: AgentStatus;
  context: AgentContext;
  history: AgentInteraction[];
  metrics: AgentMetrics;
  error: AgentError | null;
  memory?: AgentMemory[];
}

// Enhanced agent action types
export type AgentAction = 
  | { type: 'CONNECT' }
  | { type: 'DISCONNECT' }
  | { type: 'SET_STATUS'; payload: AgentStatus }
  | { type: 'SET_CONTEXT'; payload: Partial<AgentContext> }
  | { type: 'ADD_INTERACTION'; payload: AgentInteraction }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_ERROR'; payload: AgentError | null }
  | { type: 'UPDATE_METRICS'; payload: Partial<AgentMetrics> }
  | { type: 'ADD_MEMORY'; payload: AgentMemory }
  | { type: 'REMOVE_MEMORY'; payload: string }
  | { type: 'EXECUTE_TOOL'; payload: { toolId: string; params: Record<string, any> } }
  | { type: 'COLLABORATE'; payload: { targetAgents: AgentType[]; message: string } };

// Enhanced agent hook return type
export interface UseAgentReturn {
  state: AgentState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (message: string, context?: Partial<AgentContext>) => Promise<AgentResponse>;
  clearHistory: () => void;
  updateContext: (context: Partial<AgentContext>) => void;
  executeFunction: (functionType: AgentFunctionType, params: Record<string, any>) => Promise<any>;
  collaborate: (targetAgents: AgentType[], message: string) => Promise<Record<AgentType, string>>;
  getMemory: (memoryId: string) => AgentMemory | undefined;
  addMemory: (memory: Omit<AgentMemory, 'id' | 'createdAt'>) => string;
}

// Department interface matching our Prisma schema
export interface Department {
  id: string;
  name: string;
  description: string;
  code: string;
  agents?: Agent[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Agent interface matching our Prisma schema and seed data
export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  departmentId: string;
  department?: Department;
  status: AgentStatus;
  capabilities: string[];
  config: {
    [key: string]: any;
    successRate: number;
    responseTime: number;
  };
  level: number;
  experiencePoints: number;
  metrics?: AgentMetrics;
  specializations?: AgentSpecialization[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AgentSpecialization {
  id?: string;
  agentId: string;
  taskType: string;
  proficiencyScore: number;
  tasksCompleted: number;
  successRate: number;
  createdAt?: Date;
  updatedAt?: Date;
}