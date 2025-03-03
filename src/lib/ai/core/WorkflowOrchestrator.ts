import { EventEmitter } from 'events';
import { AgentManager } from './AgentManager';
import { TaskPriority } from '../types';

interface WorkflowStep {
  id: string;
  departmentId: string;
  taskType: string;
  priority: TaskPriority;
  data: any;
  dependsOn?: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export class WorkflowOrchestrator {
  private eventBus: EventEmitter;
  private agentManager: AgentManager;
  private activeWorkflows: Map<string, Workflow>;
  private completedSteps: Map<string, Set<string>>;
  private stepResults: Map<string, Map<string, any>>;

  constructor() {
    this.eventBus = new EventEmitter();
    this.agentManager = new AgentManager();
    this.activeWorkflows = new Map();
    this.completedSteps = new Map();
    this.stepResults = new Map();

    // Listen for task completions
    this.agentManager.subscribeToTaskUpdates(this.handleTaskComplete.bind(this));
  }

  async executeWorkflow(workflow: Workflow, initialData: any = {}): Promise<any> {
    // Initialize tracking for this workflow
    this.activeWorkflows.set(workflow.id, workflow);
    this.completedSteps.set(workflow.id, new Set());
    this.stepResults.set(workflow.id, new Map());

    try {
      // Start with steps that have no dependencies
      const initialSteps = workflow.steps.filter(step => !step.dependsOn?.length);
      await this.executeParallelSteps(workflow.id, initialSteps, initialData);

      // Keep processing until all steps are complete
      while (!this.isWorkflowComplete(workflow.id)) {
        const nextSteps = this.getNextSteps(workflow.id);
        if (nextSteps.length === 0) break;
        await this.executeParallelSteps(workflow.id, nextSteps, initialData);
      }

      return this.getWorkflowResults(workflow.id);
    } finally {
      // Cleanup
      this.cleanupWorkflow(workflow.id);
    }
  }

  private async executeParallelSteps(workflowId: string, steps: WorkflowStep[], contextData: any) {
    const stepPromises = steps.map(async step => {
      try {
        // Prepare task data with results from dependencies
        const taskData = this.prepareTaskData(workflowId, step, contextData);

        // Submit task to agent manager
        const taskId = await this.agentManager.submitTask({
          id: `${workflowId}:${step.id}`,
          type: step.taskType,
          priority: step.priority,
          data: taskData,
          departmentId: step.departmentId
        });

        return { stepId: step.id, taskId };
      } catch (error) {
        console.error(`Error executing step ${step.id}:`, error);
        throw error;
      }
    });

    await Promise.all(stepPromises);
  }

  private prepareTaskData(workflowId: string, step: WorkflowStep, contextData: any) {
    const stepResults = this.stepResults.get(workflowId);
    if (!stepResults) return contextData;

    // Combine initial context with results from dependencies
    const dependencyResults = step.dependsOn?.reduce((acc, depId) => ({
      ...acc,
      [depId]: stepResults.get(depId)
    }), {}) || {};

    return {
      ...contextData,
      ...dependencyResults
    };
  }

  private handleTaskComplete(update: { taskId: string; result: any }) {
    const [workflowId, stepId] = update.taskId.split(':');
    
    // Update tracking
    const completedSteps = this.completedSteps.get(workflowId);
    const stepResults = this.stepResults.get(workflowId);
    
    if (completedSteps && stepResults) {
      completedSteps.add(stepId);
      stepResults.set(stepId, update.result);

      // Emit progress event
      this.eventBus.emit('workflow:progress', {
        workflowId,
        completedSteps: completedSteps.size,
        totalSteps: this.activeWorkflows.get(workflowId)?.steps.length || 0,
        stepId,
        result: update.result
      });

      // Check if workflow is complete
      if (this.isWorkflowComplete(workflowId)) {
        this.eventBus.emit('workflow:complete', {
          workflowId,
          results: this.getWorkflowResults(workflowId)
        });
      }
    }
  }

  private isWorkflowComplete(workflowId: string): boolean {
    const workflow = this.activeWorkflows.get(workflowId);
    const completed = this.completedSteps.get(workflowId);
    
    if (!workflow || !completed) return false;
    return completed.size === workflow.steps.length;
  }

  private getNextSteps(workflowId: string): WorkflowStep[] {
    const workflow = this.activeWorkflows.get(workflowId);
    const completed = this.completedSteps.get(workflowId);
    
    if (!workflow || !completed) return [];

    return workflow.steps.filter(step => {
      // Skip if already completed
      if (completed.has(step.id)) return false;

      // Include if all dependencies are completed
      return !step.dependsOn?.some(depId => !completed.has(depId));
    });
  }

  private getWorkflowResults(workflowId: string): any {
    const results = this.stepResults.get(workflowId);
    if (!results) return {};

    return Array.from(results.entries()).reduce((acc, [stepId, result]) => ({
      ...acc,
      [stepId]: result
    }), {});
  }

  private cleanupWorkflow(workflowId: string) {
    this.activeWorkflows.delete(workflowId);
    this.completedSteps.delete(workflowId);
    this.stepResults.delete(workflowId);
  }

  // Public API for workflow tracking
  onWorkflowProgress(callback: (update: any) => void): () => void {
    this.eventBus.on('workflow:progress', callback);
    return () => this.eventBus.off('workflow:progress', callback);
  }

  onWorkflowComplete(callback: (result: any) => void): () => void {
    this.eventBus.on('workflow:complete', callback);
    return () => this.eventBus.off('workflow:complete', callback);
  }

  getWorkflowProgress(workflowId: string): number {
    const workflow = this.activeWorkflows.get(workflowId);
    const completed = this.completedSteps.get(workflowId);
    
    if (!workflow || !completed) return 0;
    return (completed.size / workflow.steps.length) * 100;
  }
}