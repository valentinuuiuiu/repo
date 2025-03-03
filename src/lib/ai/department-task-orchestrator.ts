import { AgentCategory } from '@/config/agents';
import { AgentManager } from './core/AgentManager';
import { departmentWorkflows } from './department-workflows';
import { AgentAnalytics } from './core/AgentAnalytics';

export interface TaskDefinition {
  id: string;
  action: string;
  agentType: string;
  dependsOn: string[];
  validationRules?: string[];
}

interface WorkflowProgress {
  stepId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: any;
  startTime?: Date;
  endTime?: Date;
}

export class DepartmentTaskOrchestrator {
  private departmentId: string;
  private agentManager: AgentManager;
  private analytics: AgentAnalytics;
  private workflowProgress: Map<string, WorkflowProgress[]>;

  constructor(departmentId: string) {
    this.departmentId = departmentId;
    this.agentManager = new AgentManager();
    this.analytics = new AgentAnalytics();
    this.workflowProgress = new Map();
  }

  async executeTask(workflow: any, initialData: any) {
    const workflowId = workflow.id;
    const progress: WorkflowProgress[] = workflow.steps.map(step => ({
      stepId: step.id,
      status: 'pending'
    }));
    
    this.workflowProgress.set(workflowId, progress);

    try {
      const results = {};
      
      // Execute steps in order, respecting dependencies
      for (const step of workflow.steps) {
        // Check if dependencies are met
        const canExecute = this.checkDependencies(step, results);
        if (!canExecute) {
          throw new Error(`Dependencies not met for step ${step.id}`);
        }

        // Update step status
        const stepProgress = progress.find(p => p.stepId === step.id);
        if (stepProgress) {
          stepProgress.status = 'in-progress';
          stepProgress.startTime = new Date();
        }

        // Execute step
        try {
          const result = await this.executeWorkflowStep(
            step,
            {
              ...initialData,
              previousResults: results
            }
          );

          // Store result
          results[step.id] = result;

          // Update progress
          if (stepProgress) {
            stepProgress.status = 'completed';
            stepProgress.result = result;
            stepProgress.endTime = new Date();
          }

          // Track analytics
          this.analytics.trackAgentResponse(
            step.agentType,
            { type: step.action, data: initialData, departments: [this.departmentId] },
            { success: true, data: result }
          );

        } catch (error) {
          if (stepProgress) {
            stepProgress.status = 'failed';
            stepProgress.endTime = new Date();
          }
          throw error;
        }
      }

      return {
        workflowId,
        success: true,
        results,
        analytics: this.getWorkflowAnalytics(workflowId)
      };

    } catch (error) {
      console.error(`Workflow ${workflowId} failed:`, error);
      return {
        workflowId,
        success: false,
        error: error.message,
        analytics: this.getWorkflowAnalytics(workflowId)
      };
    }
  }

  private async executeWorkflowStep(step: any, context: any) {
    const agent = await this.agentManager.getAgent(step.agentType);
    if (!agent) {
      throw new Error(`Agent ${step.agentType} not found`);
    }

    return await agent.sendMessage(step.action, context);
  }

  private checkDependencies(step: any, results: Record<string, any>): boolean {
    if (!step.dependsOn.length) return true;
    return step.dependsOn.every(depId => results[depId] !== undefined);
  }

  getWorkflowProgress(workflowId: string): WorkflowProgress[] | undefined {
    return this.workflowProgress.get(workflowId);
  }

  private getWorkflowAnalytics(workflowId: string) {
    const progress = this.workflowProgress.get(workflowId);
    if (!progress) return null;

    const completedSteps = progress.filter(p => p.status === 'completed').length;
    const totalSteps = progress.length;
    const failedSteps = progress.filter(p => p.status === 'failed').length;

    const totalDuration = progress.reduce((total, step) => {
      if (step.startTime && step.endTime) {
        return total + (step.endTime.getTime() - step.startTime.getTime());
      }
      return total;
    }, 0);

    return {
      progress: (completedSteps / totalSteps) * 100,
      successRate: ((completedSteps - failedSteps) / totalSteps) * 100,
      averageStepDuration: totalDuration / completedSteps,
      completedSteps,
      totalSteps,
      failedSteps
    };
  }
}