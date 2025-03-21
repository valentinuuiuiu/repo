import type { AgentType } from '@prisma/client';

/**
 * Department types for agent organization
 */
export type DepartmentType =
  | 'PRODUCT_MANAGEMENT'
  | 'CUSTOMER_EXPERIENCE'
  | 'MARKET_INTELLIGENCE'
  | 'OPERATIONS'
  | 'SALES_MARKETING';

/**
 * Represents a task to be executed by an agent
 */
export interface Task {
  result: unknown;
  id: string;
  type: string;
  priority: number;
  data: unknown;
  departments: string[];
  deadline?: Date;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Response from an agent after executing a task
 */
export interface AgentResponse {
  success: boolean;
  data: unknown;
  error?: string;
  metadata: {
    confidence: number;
    processingTime: number;
    modelUsed: string;
    [key: string]: unknown;
  };
}

/**
 * Message sent between agents
 */
export interface AgentMessage {
  id: string;
  type: string;
  from: string;
  to?: string;
  content: unknown;
  timestamp: Date;
  agentId?: string;
  context?: Record<string, unknown>;
  agentType?: AgentType;
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for an agent
 */
export interface AgentConfig {
  id: string;
  name: string;
  type: AgentType;
  capabilities: string[];
  description?: string;
  department?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Insight generated by an agent
 */
export interface AgentInsight {
  id: string;
  agentId: string;
  type: string;
  content: string;
  confidence: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Performance metrics for an agent
 */
export interface AgentPerformanceMetrics {
  successRate: number;
  avgResponseTime: number;
  tasksCompleted: number;
  errorRate: number;
  lastActive: Date;
}

/**
 * Status of an agent
 */
export interface AgentStatusInfo {
  id: string;
  status: 'active' | 'inactive' | 'error';
  lastError?: string;
  lastActive: Date;
  performance: AgentPerformanceMetrics;
}

/**
 * Collaboration between agents
 */
export interface AgentCollaboration {
  id: string;
  initiator: string;
  collaborators: string[];
  task: Task;
  status: 'pending' | 'active' | 'completed' | 'failed';
  result?: AgentResponse;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * Decision made by a swarm of agents
 */
export interface SwarmDecision {
  id: string;
  task: Task;
  taskDistribution: Map<string, Task>;
  confidence: number;
  reasoning: string;
  timestamp: Date;
}

/**
 * Optimization parameters for agent execution
 */
export interface OptimizationParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  model: string;
  systemPromptTemplate: string;
}