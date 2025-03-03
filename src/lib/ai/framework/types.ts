import { Task, AgentType } from '../types';

export enum AgentCapability {
  PRODUCT_ANALYSIS = 'product_analysis',
  PRICING_STRATEGY = 'pricing_strategy',
  MARKET_RESEARCH = 'market_research',
  INVENTORY_MANAGEMENT = 'inventory_management',
  CUSTOMER_SERVICE = 'customer_service',
  MARKETING_OPTIMIZATION = 'marketing_optimization',
  SUPPLIER_COORDINATION = 'supplier_coordination'
}

export interface AgentConfig {
  name: string;
  type: AgentType;
  defaultModel?: string;
  capabilities?: AgentCapability[];
  failureThreshold?: number;
  resetTimeout?: number;
}

export interface AgentStatus {
  name: string;
  type: AgentType;
  health: 'healthy' | 'degraded' | 'critical';
  capabilities: AgentCapability[];
  metrics: {
    taskCount: number;
    successRate: number;
    averageResponseTime: number;
    lastActive: number;
  };
  circuitBreakerState: {
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
  };
}

export interface CircuitBreakerConfig {
  failureThreshold?: number;
  resetTimeout?: number;
}

export interface AgentMemoryEntry {
  id: string;
  type: 'task_result' | 'knowledge';
  content: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AgentMonitorConfig {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  enablePersistence?: boolean;
}