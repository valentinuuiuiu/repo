/**
 * HumanAgent
 * 
 * A specialized agent that represents human users in the system.
 * It has enhanced capabilities for self-improvement and function generation,
 * inspired by BabyAGI's approach to continuous learning.
 */

import { BaseAgent } from '../core/BaseAgent';
import { AgentEvolution, GeneratedFunction, ExecutionResult } from '../tools/AgentEvolution';
import { ReasoningEngine } from '../tools/ReasoningEngine';
import { AgentSmithMemory } from '../tools/AgentSmithMemory';
import { GraphManager } from '../tools/GraphManager';
import { DDGSSearchTool } from '../tools/ddgsSearch';

export interface HumanProfile {
  name: string;
  expertise: string[];
  interests: string[];
  learningGoals: string[];
  preferences: Record<string, any>;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  goals: string[];
  progress: number;
  functions: string[];
  created: string;
  updated: string;
}

export class HumanAgent extends BaseAgent {
  private profile: HumanProfile;
  private evolution: AgentEvolution;
  private reasoningEngine: ReasoningEngine;
  private memory: AgentSmithMemory;
  private knowledgeGraph: GraphManager;
  private searchTool: DDGSSearchTool;
  private learningPaths: Map<string, LearningPath>;
  private customFunctions: Map<string, Function>;
  
  constructor(
    id: string,
    name: string,
    profile: HumanProfile
  ) {
    super(id, name);
    
    this.profile = profile;
    this.reasoningEngine = new ReasoningEngine();
    this.memory = new AgentSmithMemory(id);
    this.knowledgeGraph = new GraphManager();
    this.searchTool = new DDGSSearchTool();
    this.evolution = new AgentEvolution(
      id,
      this.reasoningEngine,
      this.memory,
      this.knowledgeGraph
    );
    this.learningPaths = new Map();
    this.customFunctions = new Map();
    
    // Initialize with enhanced capabilities
    this.capabilities.push(
      'self_improvement',
      'function_generation',
      'adaptive_learning',
      'web_search',
      'knowledge_management'
    );
    
    // Initialize profile in knowledge graph
    this.initializeProfile();
  }
  
  /**
   * Initialize the agent's profile in the knowledge graph
   */
  private initializeProfile(): void {
    // Create profile node
    this.knowledgeGraph.addNode({
      id: `profile:${this.id}`,
      type: 'profile',
      properties: {
        name: this.name,
        expertise: this.profile.expertise,
        interests: this.profile.interests
      }
    });
    
    // Create nodes for expertise areas
    for (const expertise of this.profile.expertise) {
      const expertiseId = `expertise:${expertise.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      
      this.knowledgeGraph.addNode({
        id: expertiseId,
        type: 'expertise',
        properties: {
          name: expertise,
          description: `Knowledge area: ${expertise}`
        }
      });
      
      // Connect profile to expertise
      this.knowledgeGraph.addEdge({
        source: `profile:${this.id}`,
        target: expertiseId,
        type: 'has_expertise',
        properties: {
          level: 'advanced'
        }
      });
    }
    
    // Create nodes for interests
    for (const interest of this.profile.interests) {
      const interestId = `interest:${interest.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      
      this.knowledgeGraph.addNode({
        id: interestId,
        type: 'interest',
        properties: {
          name: interest,
          description: `Interest area: ${interest}`
        }
      });
      
      // Connect profile to interest
      this.knowledgeGraph.addEdge({
        source: `profile:${this.id}`,
        target: interestId,
        type: 'has_interest',
        properties: {
          level: 'high'
        }
      });
    }
    
    // Initialize memory with profile information
    this.memory.storeSemantic(
      'self_profile',
      `Profile for ${this.name}`,
      this.profile.expertise.map(exp => ({ concept: exp, relationship: 'expertise' })),
      0.9,
      ['profile', 'self']
    );
  }
  
  /**
   * Create a new function based on requirements
   */
  async createFunction(description: string, requirements: string[]): Promise<string> {
    // Create a function generation task
    const task = this.evolution.createFunctionGenerationTask(description, requirements);
    
    // Execute the task
    const result = await this.evolution.executeTask(task.id);
    
    if (!result || result.status !== 'completed' || !result.result?.functionId) {
      throw new Error('Function generation failed');
    }
    
    // Store the function ID in a learning path
    this.addFunctionToLearningPath(result.result.functionId);
    
    return result.result.functionId;
  }
  
  /**
   * Execute a generated function
   */
  async executeFunction(functionId: string, params: Record<string, any>): Promise<ExecutionResult> {
    return this.evolution.executeFunction(functionId, params);
  }
  
  /**
   * Improve an existing function
   */
  async improveFunction(functionId: string, improvements: string[]): Promise<string> {
    const func = this.evolution.getFunction(functionId);
    
    if (!func) {
      throw new Error(`Function with ID ${functionId} not found`);
    }
    
    // Create a function improvement task
    const task = this.evolution.createFunctionImprovementTask(functionId, improvements);
    
    if (!task) {
      throw new Error(`Could not create improvement task for function ${functionId}`);
    }
    
    // Execute the task
    const result = await this.evolution.executeTask(task.id);
    
    if (!result || result.status !== 'completed' || !result.result?.functionId) {
      throw new Error('Function improvement failed');
    }
    
    return result.result.functionId;
  }
  
  /**
   * Create a new learning path
   */
  createLearningPath(name: string, description: string, goals: string[]): LearningPath {
    const id = `path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const path: LearningPath = {
      id,
      name,
      description,
      goals,
      progress: 0,
      functions: [],
      created: timestamp,
      updated: timestamp
    };
    
    this.learningPaths.set(id, path);
    
    // Add to knowledge graph
    this.knowledgeGraph.addNode({
      id: `learning_path:${id}`,
      type: 'learning_path',
      properties: {
        name,
        description,
        goals
      }
    });
    
    // Connect profile to learning path
    this.knowledgeGraph.addEdge({
      source: `profile:${this.id}`,
      target: `learning_path:${id}`,
      type: 'pursues',
      properties: {
        priority: 'high'
      }
    });
    
    return path;
  }
  
  /**
   * Add a function to a learning path
   */
  addFunctionToLearningPath(functionId: string, pathId?: string): boolean {
    const func = this.evolution.getFunction(functionId);
    
    if (!func) {
      return false;
    }
    
    // If no path ID specified, add to the most recent path
    let path: LearningPath | undefined;
    
    if (pathId) {
      path = this.learningPaths.get(pathId);
    } else {
      // Get the most recent path
      const paths = Array.from(this.learningPaths.values())
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      
      if (paths.length > 0) {
        path = paths[0];
      } else {
        // Create a default path if none exists
        path = this.createLearningPath(
          'Default Learning Path',
          'Automatically created learning path',
          ['Improve agent capabilities']
        );
      }
    }
    
    if (!path) {
      return false;
    }
    
    // Add function to path if not already present
    if (!path.functions.includes(functionId)) {
      path.functions.push(functionId);
      path.updated = new Date().toISOString();
      
      // Update progress
      this.updateLearningPathProgress(path.id);
      
      // Connect function to learning path in knowledge graph
      this.knowledgeGraph.addEdge({
        source: `learning_path:${path.id}`,
        target: `function:${functionId}`,
        type: 'includes',
        properties: {
          added: path.updated
        }
      });
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Update learning path progress
   */
  private updateLearningPathProgress(pathId: string): void {
    const path = this.learningPaths.get(pathId);
    
    if (!path) {
      return;
    }
    
    // Simple progress calculation based on number of functions
    // In a real system, this would be more sophisticated
    const targetFunctionCount = path.goals.length * 2; // Assume 2 functions per goal
    const progress = Math.min(1, path.functions.length / targetFunctionCount);
    
    path.progress = Math.round(progress * 100) / 100;
    path.updated = new Date().toISOString();
  }
  
  /**
   * Search for information and generate functions based on results
   */
  async searchAndGenerateFunction(query: string): Promise<string> {
    // Search for information
    const searchResults = await this.searchTool.search(query);
    
    if (searchResults.length === 0) {
      throw new Error('No search results found');
    }
    
    // Extract requirements from search results
    const requirements: string[] = [];
    
    for (const result of searchResults.slice(0, 3)) {
      requirements.push(result.title);
    }
    
    // Create a function based on search results
    return this.createFunction(
      `Function generated from search: ${query}`,
      requirements
    );
  }
  
  /**
   * Get all learning paths
   */
  getLearningPaths(): LearningPath[] {
    return Array.from(this.learningPaths.values());
  }
  
  /**
   * Get a learning path by ID
   */
  getLearningPath(id: string): LearningPath | undefined {
    return this.learningPaths.get(id);
  }
  
  /**
   * Get all functions in a learning path
   */
  getLearningPathFunctions(pathId: string): GeneratedFunction[] {
    const path = this.learningPaths.get(pathId);
    
    if (!path) {
      return [];
    }
    
    const functions: GeneratedFunction[] = [];
    
    for (const functionId of path.functions) {
      const func = this.evolution.getFunction(functionId);
      if (func) {
        functions.push(func);
      }
    }
    
    return functions;
  }
  
  /**
   * Get agent profile
   */
  getProfile(): HumanProfile {
    return this.profile;
  }
  
  /**
   * Update agent profile
   */
  updateProfile(updates: Partial<HumanProfile>): HumanProfile {
    this.profile = {
      ...this.profile,
      ...updates
    };
    
    // Update profile in knowledge graph
    this.knowledgeGraph.updateNode(`profile:${this.id}`, {
      ...updates
    });
    
    return this.profile;
  }
  
  /**
   * Get a visualization of the agent's knowledge and capabilities
   */
  getKnowledgeVisualization() {
    return this.knowledgeGraph.getVisualizationData();
  }
  
  /**
   * Get memory statistics
   */
  getMemoryStats() {
    return this.memory.getStats();
  }
  
  /**
   * Suggest next learning steps
   */
  suggestNextSteps(): string[] {
    // This is a simplified implementation
    // In a real system, this would use more sophisticated techniques
    
    const suggestions: string[] = [];
    
    // Suggest based on learning goals
    for (const goal of this.profile.learningGoals) {
      suggestions.push(`Learn more about ${goal}`);
      suggestions.push(`Create a function related to ${goal}`);
    }
    
    // Suggest improving existing functions
    const functions = this.evolution.getAllFunctions();
    if (functions.length > 0) {
      const oldestFunction = functions.sort((a, b) => 
        new Date(a.updated).getTime() - new Date(b.updated).getTime()
      )[0];
      
      suggestions.push(`Improve function ${oldestFunction.template.name}`);
    }
    
    // Suggest based on interests
    for (const interest of this.profile.interests) {
      suggestions.push(`Search for information about ${interest}`);
      suggestions.push(`Create a learning path for ${interest}`);
    }
    
    return suggestions;
  }
  
  /**
   * Register a custom JavaScript function
   */
  registerCustomFunction(name: string, fn: Function): void {
    this.customFunctions.set(name, fn);
  }
  
  /**
   * Execute a custom function
   */
  executeCustomFunction(name: string, ...args: any[]): any {
    const fn = this.customFunctions.get(name);
    
    if (!fn) {
      throw new Error(`Custom function ${name} not found`);
    }
    
    return fn(...args);
  }
}

export default HumanAgent;