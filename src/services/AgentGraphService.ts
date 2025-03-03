import { AgentGraphOrchestrator } from '@/lib/ai/core/AgentGraphOrchestrator';
import { WorkflowOrchestrator } from '@/lib/ai/core/WorkflowOrchestrator';
import { AgentCollaborationManager } from '@/lib/ai/core/AgentCollaborationManager';
import { standardWorkflows } from '@/lib/ai/workflows/StandardWorkflows';

// Singleton instance of the graph orchestrator
let orchestratorInstance: AgentGraphOrchestrator | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

/**
 * Service for interacting with the Agent Graph Orchestration system
 */
export const AgentGraphService = {
  /**
   * Initialize the agent graph orchestrator
   */
  async initialize(): Promise<void> {
    if (orchestratorInstance) return;
    
    if (isInitializing && initPromise) {
      return initPromise;
    }
    
    isInitializing = true;
    
    initPromise = new Promise(async (resolve) => {
      orchestratorInstance = new AgentGraphOrchestrator();
      await orchestratorInstance.initialize();
      isInitializing = false;
      resolve();
    });
    
    return initPromise;
  },

  /**
   * Get the agent network visualization data
   */
  async getNetworkVisualization(): Promise<any> {
    await this.ensureInitialized();
    return orchestratorInstance!.getAgentNetworkVisualization();
  },
  
  /**
   * Execute a workflow
   * @param workflowId The ID of the workflow to execute
   * @param data Initial data for the workflow
   */
  async executeWorkflow(workflowId: string, data: any = {}): Promise<any> {
    await this.ensureInitialized();
    
    // Get the workflow definition
    const workflow = this.getWorkflowById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    // Add workflow to graph
    await orchestratorInstance!.addWorkflowToGraph(
      workflow.id, 
      workflow.name, 
      workflow.steps
    );
    
    // Create workflow orchestrator
    const workflowOrchestrator = new WorkflowOrchestrator();
    return workflowOrchestrator.executeWorkflow(workflow, data);
  },
  
  /**
   * Initiate a collaboration between agents across departments
   * @param taskData The task data
   */
  async initiateCollaboration(taskData: {
    id: string;
    title: string;
    description: string;
    departments: string[];
    requiredCapabilities: string[];
    priority: 'low' | 'medium' | 'high';
    data: any;
  }): Promise<string> {
    await this.ensureInitialized();
    
    const collaborationManager = new AgentCollaborationManager();
    return collaborationManager.initiateCollaboration(taskData);
  },
  
  /**
   * Find the best agent for a specific task
   * @param taskType The type of task
   * @param departmentId Optional department ID to restrict search
   */
  async findBestAgent(taskType: string, departmentId?: string): Promise<string | null> {
    await this.ensureInitialized();
    return orchestratorInstance!.findOptimalAgentForTask(taskType, departmentId);
  },
  
  /**
   * Recommend agents for a collaboration
   * @param taskType The type of task
   * @param count The number of agents to recommend
   */
  async recommendAgentsForTask(taskType: string, count: number = 3): Promise<string[]> {
    await this.ensureInitialized();
    return orchestratorInstance!.recommendCollaboratingAgents(taskType, count);
  },
  
  /**
   * Analyze potential bottlenecks in workflows
   */
  async analyzeWorkflowBottlenecks(): Promise<any> {
    await this.ensureInitialized();
    return orchestratorInstance!.analyzeWorkflowBottlenecks();
  },
  
  /**
   * Get all available workflows
   */
  getAvailableWorkflows(): any[] {
    return Object.values(standardWorkflows);
  },
  
  /**
   * Get a workflow by ID
   * @param id The workflow ID
   */
  getWorkflowById(id: string): any {
    return Object.values(standardWorkflows).find(wf => wf.id === id);
  },
  
  /**
   * Ensure the orchestrator is initialized
   */
  async ensureInitialized(): Promise<void> {
    if (!orchestratorInstance) {
      await this.initialize();
    }
  }
};