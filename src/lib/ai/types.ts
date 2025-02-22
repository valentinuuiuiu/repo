export type TaskType = 
  | 'product_optimization'
  | 'product_launch'
  | 'marketing_strategy'
  | 'inventory_forecast'
  | 'supplier_evaluation'
  | 'customer_inquiry'
  | 'performance_analysis'
  | 'market_research'
  | 'code_maintenance';

export interface Task {
  id: string;
  type: TaskType;
  data: any;
  departments: string[];
  status: 'pending' | 'in_progress' | 'needs_review' | 'completed' | 'failed';
  result?: any;
  humanFeedback?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AgentInsight {
  department: string;
  confidence: number;
  recommendation: any;
  reasoning: string;
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  data: any;
  error?: string;
  metadata?: {
    confidence: number;
    processingTime: number;
    modelUsed?: string;
  };
}
