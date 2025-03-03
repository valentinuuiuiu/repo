export type TaskPriority = 'low' | 'medium' | 'high';

export interface WorkflowStep {
  id: string;
  departmentId: string;
  taskType: string;
  priority: TaskPriority;
  data: Record<string, any>;
  dependsOn?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export interface WorkflowProgress {
  workflowId: string;
  completedSteps: number;
  totalSteps: number;
  stepId: string;
  result: any;
}

export interface WorkflowResult {
  workflowId: string;
  success: boolean;
  results: Record<string, any>;
  analytics?: {
    totalDuration: number;
    stepDurations: Record<string, number>;
    agentUtilization: Record<string, number>;
  };
}

export interface StepResult {
  success: boolean;
  data: any;
  metadata: {
    agentId: string;
    processingTime: number;
    retries?: number;
    confidence?: number;
  };
}