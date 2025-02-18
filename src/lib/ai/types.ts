export interface AgentConfig {
  id: string;
  role: string;
  expertise: string[];
  instructions: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  memory?: boolean;
  subordinates?: string[];
}

export interface Task {
  id: string;
  type: string;
  priority: number;
  data: any;
  context?: any;
  requiredCapabilities?: string[];
  deadline?: Date;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    agentId: string;
    taskId: string;
    timestamp: string;
    processingTime: number;
    delegatedTo?: string[];
  };
}

export interface AgentMetrics {
  tasksProcessed: number;
  successRate: number;
  averageProcessingTime: number;
  errorRate: number;
  lastActive: Date;
}
