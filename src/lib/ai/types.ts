export type TaskType =
  // Product Tasks
  | "product_optimization"
  | "product_launch"
  | "product_pricing"
  | "product_description"
  // Marketing Tasks
  | "marketing_strategy"
  | "campaign_optimization"
  | "ad_performance"
  // Inventory Tasks
  | "inventory_forecast"
  | "stock_optimization"
  | "reorder_planning"
  // Supplier Tasks
  | "supplier_evaluation"
  | "supplier_negotiation"
  | "supplier_risk_assessment"
  // Customer Service Tasks
  | "customer_inquiry"
  | "satisfaction_analysis"
  | "support_optimization";

export interface Task {
  id: string;
  type: TaskType;
  data: any;
  departments: string[];
  status:
    | "pending"
    | "in_progress"
    | "needs_review"
    | "approved"
    | "completed"
    | "rejected";
  humanFeedback?: {
    approved: boolean;
    comments: string;
    modifications: any;
  };
  result?: any;
  created_at: Date;
  updated_at: Date;
}

export interface AgentInsight {
  department: string;
  confidence: number;
  recommendation: any;
  reasoning: string;
}
