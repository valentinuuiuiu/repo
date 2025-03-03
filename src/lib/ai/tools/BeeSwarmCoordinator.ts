/**
 * BeeSwarmCoordinator
 * 
 * Inspired by the Bee Framework, this tool coordinates multiple agents
 * in a swarm intelligence pattern. It enables collaborative problem-solving,
 * task distribution, and consensus building.
 */

import { EventEmitter } from 'events';

export interface SwarmAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'offline';
  performance?: {
    successRate: number;
    averageTaskTime: number;
    specializations: string[];
  };
}

export interface SwarmTask {
  id: string;
  title: string;
  description: string;
  priority: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string;
  dependencies?: string[];
  requiredCapabilities: string[];
  created: string;
  updated: string;
  deadline?: string;
  result?: any;
}

export interface SwarmSolution {
  taskId: string;
  agentId: string;
  solution: any;
  confidence: number;
  reasoning: string;
  timestamp: string;
}

export interface ConsensusProcess {
  id: string;
  taskId: string;
  status: 'collecting' | 'voting' | 'complete';
  solutions: SwarmSolution[];
  votes: Record<string, string>; // agentId -> solutionId
  winningId?: string;
  created: string;
  updated: string;
}

export class BeeSwarmCoordinator {
  private agents: Map<string, SwarmAgent>;
  private tasks: Map<string, SwarmTask>;
  private consensusProcesses: Map<string, ConsensusProcess>;
  private eventBus: EventEmitter;
  private taskHistory: Map<string, SwarmTask[]>;
  
  constructor() {
    this.agents = new Map();
    this.tasks = new Map();
    this.consensusProcesses = new Map();
    this.eventBus = new EventEmitter();
    this.taskHistory = new Map();
    
    // Set max listeners to avoid warnings
    this.eventBus.setMaxListeners(100);
  }
  
  /**
   * Register an agent with the swarm
   */
  registerAgent(agent: Omit<SwarmAgent, 'status'>): SwarmAgent {
    const newAgent: SwarmAgent = {
      ...agent,
      status: 'idle'
    };
    
    this.agents.set(agent.id, newAgent);
    
    // Initialize task history
    this.taskHistory.set(agent.id, []);
    
    return newAgent;
  }
  
  /**
   * Create a new task
   */
  createTask(task: Omit<SwarmTask, 'id' | 'status' | 'created' | 'updated'>): SwarmTask {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const newTask: SwarmTask = {
      ...task,
      id,
      status: 'pending',
      created: timestamp,
      updated: timestamp
    };
    
    this.tasks.set(id, newTask);
    
    // Notify about new task
    this.eventBus.emit('task:created', newTask);
    
    // Auto-assign if possible
    this.assignTask(id);
    
    return newTask;
  }
  
  /**
   * Assign a task to the most suitable agent
   */
  assignTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    
    if (!task || task.status !== 'pending') {
      return false;
    }
    
    // Check dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      for (const depId of task.dependencies) {
        const depTask = this.tasks.get(depId);
        if (!depTask || depTask.status !== 'completed') {
          return false; // Dependency not met
        }
      }
    }
    
    // Find suitable agents
    const candidates: Array<{ agent: SwarmAgent; score: number }> = [];
    
    for (const [, agent] of this.agents) {
      if (agent.status !== 'idle') {
        continue;
      }
      
      // Check if agent has all required capabilities
      const hasAllCapabilities = task.requiredCapabilities.every(cap => 
        agent.capabilities.includes(cap)
      );
      
      if (!hasAllCapabilities) {
        continue;
      }
      
      // Calculate suitability score
      let score = 0;
      
      // Performance-based scoring
      if (agent.performance) {
        score += agent.performance.successRate * 3;
        
        // Specialization bonus
        for (const specialization of agent.performance.specializations) {
          if (task.requiredCapabilities.includes(specialization)) {
            score += 2;
          }
        }
      }
      
      candidates.push({ agent, score });
    }
    
    if (candidates.length === 0) {
      return false; // No suitable agents
    }
    
    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score);
    
    // Assign to best candidate
    const bestCandidate = candidates[0].agent;
    
    task.assignedTo = bestCandidate.id;
    task.status = 'assigned';
    task.updated = new Date().toISOString();
    
    // Update agent status
    bestCandidate.status = 'busy';
    
    // Notify about assignment
    this.eventBus.emit('task:assigned', { task, agentId: bestCandidate.id });
    
    return true;
  }
  
  /**
   * Start a task (agent acknowledges and begins work)
   */
  startTask(taskId: string, agentId: string): boolean {
    const task = this.tasks.get(taskId);
    const agent = this.agents.get(agentId);
    
    if (!task || !agent || task.assignedTo !== agentId || task.status !== 'assigned') {
      return false;
    }
    
    task.status = 'in_progress';
    task.updated = new Date().toISOString();
    
    // Notify about task start
    this.eventBus.emit('task:started', { task, agentId });
    
    return true;
  }
  
  /**
   * Complete a task with a result
   */
  completeTask(taskId: string, agentId: string, result: any): boolean {
    const task = this.tasks.get(taskId);
    const agent = this.agents.get(agentId);
    
    if (!task || !agent || task.assignedTo !== agentId || task.status !== 'in_progress') {
      return false;
    }
    
    task.status = 'completed';
    task.result = result;
    task.updated = new Date().toISOString();
    
    // Update agent status
    agent.status = 'idle';
    
    // Add to task history
    this.taskHistory.get(agentId)?.push({ ...task });
    
    // Notify about task completion
    this.eventBus.emit('task:completed', { task, agentId });
    
    // Check if any pending tasks can now be assigned
    for (const [id, pendingTask] of this.tasks) {
      if (pendingTask.status === 'pending' && 
          pendingTask.dependencies?.includes(taskId)) {
        this.assignTask(id);
      }
    }
    
    return true;
  }
  
  /**
   * Mark a task as failed
   */
  failTask(taskId: string, agentId: string, reason: string): boolean {
    const task = this.tasks.get(taskId);
    const agent = this.agents.get(agentId);
    
    if (!task || !agent || task.assignedTo !== agentId || 
        (task.status !== 'assigned' && task.status !== 'in_progress')) {
      return false;
    }
    
    task.status = 'failed';
    task.result = { error: reason };
    task.updated = new Date().toISOString();
    
    // Update agent status
    agent.status = 'idle';
    
    // Add to task history
    this.taskHistory.get(agentId)?.push({ ...task });
    
    // Notify about task failure
    this.eventBus.emit('task:failed', { task, agentId, reason });
    
    return true;
  }
  
  /**
   * Start a consensus process for a task
   */
  startConsensus(taskId: string): ConsensusProcess | null {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      return null;
    }
    
    const id = `consensus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const process: ConsensusProcess = {
      id,
      taskId,
      status: 'collecting',
      solutions: [],
      votes: {},
      created: timestamp,
      updated: timestamp
    };
    
    this.consensusProcesses.set(id, process);
    
    // Notify about consensus start
    this.eventBus.emit('consensus:started', { process, task });
    
    return process;
  }
  
  /**
   * Submit a solution to a consensus process
   */
  submitSolution(
    consensusId: string, 
    agentId: string, 
    solution: any, 
    confidence: number, 
    reasoning: string
  ): boolean {
    const process = this.consensusProcesses.get(consensusId);
    const agent = this.agents.get(agentId);
    
    if (!process || !agent || process.status !== 'collecting') {
      return false;
    }
    
    const timestamp = new Date().toISOString();
    
    const swarmSolution: SwarmSolution = {
      taskId: process.taskId,
      agentId,
      solution,
      confidence,
      reasoning,
      timestamp
    };
    
    process.solutions.push(swarmSolution);
    process.updated = timestamp;
    
    // Notify about solution submission
    this.eventBus.emit('consensus:solution', { process, solution: swarmSolution });
    
    return true;
  }
  
  /**
   * Start voting phase of consensus
   */
  startVoting(consensusId: string): boolean {
    const process = this.consensusProcesses.get(consensusId);
    
    if (!process || process.status !== 'collecting' || process.solutions.length === 0) {
      return false;
    }
    
    process.status = 'voting';
    process.updated = new Date().toISOString();
    
    // Notify about voting start
    this.eventBus.emit('consensus:voting', { process });
    
    return true;
  }
  
  /**
   * Submit a vote in a consensus process
   */
  submitVote(consensusId: string, agentId: string, solutionAgentId: string): boolean {
    const process = this.consensusProcesses.get(consensusId);
    const agent = this.agents.get(agentId);
    
    if (!process || !agent || process.status !== 'voting') {
      return false;
    }
    
    // Check if the solution exists
    const solutionExists = process.solutions.some(s => s.agentId === solutionAgentId);
    
    if (!solutionExists) {
      return false;
    }
    
    // Record vote
    process.votes[agentId] = solutionAgentId;
    process.updated = new Date().toISOString();
    
    // Notify about vote
    this.eventBus.emit('consensus:vote', { 
      process, 
      voter: agentId, 
      votedFor: solutionAgentId 
    });
    
    return true;
  }
  
  /**
   * Complete consensus process and determine winning solution
   */
  completeConsensus(consensusId: string): SwarmSolution | null {
    const process = this.consensusProcesses.get(consensusId);
    
    if (!process || process.status !== 'voting') {
      return null;
    }
    
    // Count votes
    const voteCounts: Record<string, number> = {};
    
    for (const votedFor of Object.values(process.votes)) {
      voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
    }
    
    // Find solution with most votes
    let maxVotes = 0;
    let winnerId: string | null = null;
    
    for (const [id, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = id;
      }
    }
    
    if (!winnerId) {
      // If no votes, use solution with highest confidence
      let maxConfidence = -1;
      
      for (const solution of process.solutions) {
        if (solution.confidence > maxConfidence) {
          maxConfidence = solution.confidence;
          winnerId = solution.agentId;
        }
      }
    }
    
    if (!winnerId) {
      return null;
    }
    
    // Mark winning solution
    process.winningId = winnerId;
    process.status = 'complete';
    process.updated = new Date().toISOString();
    
    // Find winning solution
    const winningSolution = process.solutions.find(s => s.agentId === winnerId);
    
    if (!winningSolution) {
      return null;
    }
    
    // Update task with consensus result
    const task = this.tasks.get(process.taskId);
    
    if (task) {
      task.result = {
        solution: winningSolution.solution,
        consensusId: process.id,
        confidence: winningSolution.confidence
      };
      task.updated = process.updated;
      
      if (task.status === 'in_progress') {
        task.status = 'completed';
      }
    }
    
    // Notify about consensus completion
    this.eventBus.emit('consensus:completed', { 
      process, 
      winningSolution 
    });
    
    return winningSolution;
  }
  
  /**
   * Subscribe to swarm events
   */
  subscribe(event: string, callback: (data: any) => void): () => void {
    this.eventBus.on(event, callback);
    
    // Return unsubscribe function
    return () => {
      this.eventBus.off(event, callback);
    };
  }
  
  /**
   * Get agent by ID
   */
  getAgent(id: string): SwarmAgent | undefined {
    return this.agents.get(id);
  }
  
  /**
   * Get task by ID
   */
  getTask(id: string): SwarmTask | undefined {
    return this.tasks.get(id);
  }
  
  /**
   * Get consensus process by ID
   */
  getConsensusProcess(id: string): ConsensusProcess | undefined {
    return this.consensusProcesses.get(id);
  }
  
  /**
   * Get all agents
   */
  getAllAgents(): SwarmAgent[] {
    return Array.from(this.agents.values());
  }
  
  /**
   * Get all tasks
   */
  getAllTasks(): SwarmTask[] {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get task history for an agent
   */
  getAgentTaskHistory(agentId: string): SwarmTask[] {
    return this.taskHistory.get(agentId) || [];
  }
  
  /**
   * Update agent performance metrics
   */
  updateAgentPerformance(agentId: string, performance: SwarmAgent['performance']): boolean {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      return false;
    }
    
    agent.performance = performance;
    return true;
  }
  
  /**
   * Get agents with specific capability
   */
  getAgentsWithCapability(capability: string): SwarmAgent[] {
    const result: SwarmAgent[] = [];
    
    for (const [, agent] of this.agents) {
      if (agent.capabilities.includes(capability)) {
        result.push(agent);
      }
    }
    
    return result;
  }
  
  /**
   * Get idle agents
   */
  getIdleAgents(): SwarmAgent[] {
    const result: SwarmAgent[] = [];
    
    for (const [, agent] of this.agents) {
      if (agent.status === 'idle') {
        result.push(agent);
      }
    }
    
    return result;
  }
}

export default BeeSwarmCoordinator;