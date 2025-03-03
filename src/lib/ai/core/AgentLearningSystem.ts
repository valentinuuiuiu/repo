import type { Task, AgentResponse } from '../types';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

interface LearningPattern {
  taskType: string;
  successPatterns: Record<string, number>;
  failurePatterns: Record<string, number>;
  lastUpdated: Date;
}

interface OptimizationSuggestion {
  type: 'prompt_improvement' | 'parameter_adjustment' | 'workflow_change';
  description: string;
  confidence: number;
  implementationDetails: Record<string, any>;
}

export class AgentLearningSystem {
  private learningPatterns: Map<string, Map<string, LearningPattern>>;
  private openai: OpenAI;
  private optimizationSuggestions: Map<string, OptimizationSuggestion[]>;
  private knowledgeBase: Map<string, any[]>;
  private feedbackHistory: Map<string, Array<{taskId: string, feedback: string, applied: boolean}>>;

  constructor() {
    this.learningPatterns = new Map();
    this.openai = new OpenAI();
    this.optimizationSuggestions = new Map();
    this.knowledgeBase = new Map();
    this.feedbackHistory = new Map();
  }

  async learnFromExecution(agentId: string, task: Task, result: AgentResponse): Promise<void> {
    // Initialize learning patterns for this agent if they don't exist
    if (!this.learningPatterns.has(agentId)) {
      this.learningPatterns.set(agentId, new Map());
    }
    
    const agentPatterns = this.learningPatterns.get(agentId)!;
    
    // Initialize learning pattern for this task type if it doesn't exist
    if (!agentPatterns.has(task.type)) {
      agentPatterns.set(task.type, {
        taskType: task.type,
        successPatterns: {},
        failurePatterns: {},
        lastUpdated: new Date()
      });
    }
    
    const pattern = agentPatterns.get(task.type)!;
    
    // Extract features from the task
    const features = this.extractTaskFeatures(task);
    
    // Update pattern based on result
    if (result.success) {
      for (const [feature, value] of Object.entries(features)) {
        pattern.successPatterns[feature] = (pattern.successPatterns[feature] || 0) + 1;
      }
    } else {
      for (const [feature, value] of Object.entries(features)) {
        pattern.failurePatterns[feature] = (pattern.failurePatterns[feature] || 0) + 1;
      }
    }
    
    pattern.lastUpdated = new Date();
    agentPatterns.set(task.type, pattern);
    
    // Store execution in knowledge base
    this.storeInKnowledgeBase(agentId, task, result);
    
    // Generate optimization suggestions if needed
    if (this.shouldGenerateOptimizations(agentId, task.type)) {
      await this.generateOptimizationSuggestions(agentId, task.type);
    }
  }
  
  async optimizeAgent(
    agentId: string, 
    performanceHistory: Array<{task: Task, result: AgentResponse, timestamp: Date}>
  ): Promise<OptimizationSuggestion[]> {
    // Get current optimization suggestions
    const currentSuggestions = this.optimizationSuggestions.get(agentId) || [];
    
    // Analyze performance patterns
    const taskTypePerformance = new Map<string, { success: number, total: number }>();
    
    for (const { task, result } of performanceHistory) {
      const taskType = task.type;
      const current = taskTypePerformance.get(taskType) || { success: 0, total: 0 };
      
      current.total++;
      if (result.success) {
        current.success++;
      }
      
      taskTypePerformance.set(taskType, current);
    }
    
    // Identify underperforming task types
    const underperformingTaskTypes: string[] = [];
    
    for (const [taskType, { success, total }] of taskTypePerformance.entries()) {
      if (total >= 5 && success / total < 0.7) {
        underperformingTaskTypes.push(taskType);
      }
    }
    
    // Generate new optimization suggestions for underperforming task types
    const newSuggestions: OptimizationSuggestion[] = [];
    
    for (const taskType of underperformingTaskTypes) {
      const suggestions = await this.generateOptimizationSuggestions(agentId, taskType);
      newSuggestions.push(...suggestions);
    }
    
    // Combine with existing suggestions, removing duplicates
    const allSuggestions = [...currentSuggestions];
    
    for (const suggestion of newSuggestions) {
      if (!allSuggestions.some(s => s.description === suggestion.description)) {
        allSuggestions.push(suggestion);
      }
    }
    
    // Sort by confidence
    allSuggestions.sort((a, b) => b.confidence - a.confidence);
    
    // Keep only top 10 suggestions
    const topSuggestions = allSuggestions.slice(0, 10);
    
    // Update stored suggestions
    this.optimizationSuggestions.set(agentId, topSuggestions);
    
    return topSuggestions;
  }
  
  async applyFeedback(agentId: string, taskId: string, feedback: string): Promise<boolean> {
    // Initialize feedback history for this agent if it doesn't exist
    if (!this.feedbackHistory.has(agentId)) {
      this.feedbackHistory.set(agentId, []);
    }
    
    const agentFeedback = this.feedbackHistory.get(agentId)!;
    
    // Store feedback
    agentFeedback.push({
      taskId,
      feedback,
      applied: false
    });
    
    // Apply feedback to learning patterns
    try {
      // Analyze feedback using LLM
      const feedbackAnalysis = await this.analyzeFeedback(feedback);
      
      // Get agent's learning patterns
      const agentPatterns = this.learningPatterns.get(agentId);
      if (!agentPatterns) {
        return false;
      }
      
      // Apply feedback to relevant task types
      for (const [taskType, pattern] of agentPatterns.entries()) {
        if (feedbackAnalysis.relevantTaskTypes.includes(taskType)) {
          // Adjust success patterns based on feedback
          for (const feature of feedbackAnalysis.positiveFeatures) {
            pattern.successPatterns[feature] = (pattern.successPatterns[feature] || 0) + 1;
          }
          
          // Adjust failure patterns based on feedback
          for (const feature of feedbackAnalysis.negativeFeatures) {
            pattern.failurePatterns[feature] = (pattern.failurePatterns[feature] || 0) + 1;
          }
          
          pattern.lastUpdated = new Date();
          agentPatterns.set(taskType, pattern);
        }
      }
      
      // Mark feedback as applied
      const feedbackIndex = agentFeedback.findIndex(f => f.taskId === taskId && f.feedback === feedback);
      if (feedbackIndex >= 0) {
        agentFeedback[feedbackIndex].applied = true;
      }
      
      return true;
    } catch (error) {
      console.error('Error applying feedback:', error);
      return false;
    }
  }
  
  async getOptimizationSuggestions(agentId: string): Promise<OptimizationSuggestion[]> {
    return this.optimizationSuggestions.get(agentId) || [];
  }
  
  private extractTaskFeatures(task: Task): Record<string, any> {
    const features: Record<string, any> = {
      taskType: task.type,
      priority: task.priority || 'medium',
      departmentCount: task.departments.length,
    };
    
    // Extract features from task data if it's an object
    if (task.data && typeof task.data === 'object') {
      for (const [key, value] of Object.entries(task.data)) {
        // Only include primitive values or array lengths as features
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          features[`data_${key}`] = value;
        } else if (Array.isArray(value)) {
          features[`data_${key}_length`] = value.length;
        }
      }
    }
    
    return features;
  }
  
  private storeInKnowledgeBase(agentId: string, task: Task, result: AgentResponse): void {
    // Initialize knowledge base for this agent if it doesn't exist
    if (!this.knowledgeBase.has(agentId)) {
      this.knowledgeBase.set(agentId, []);
    }
    
    const agentKnowledge = this.knowledgeBase.get(agentId)!;
    
    // Store execution in knowledge base
    agentKnowledge.push({
      taskId: task.id,
      taskType: task.type,
      timestamp: new Date(),
      success: result.success,
      confidence: result.metadata.confidence,
      processingTime: result.metadata.processingTime,
      data: task.data,
      result: result.data
    });
    
    // Keep only the last 1000 entries to prevent memory bloat
    if (agentKnowledge.length > 1000) {
      agentKnowledge.shift();
    }
  }
  
  private shouldGenerateOptimizations(agentId: string, taskType: string): boolean {
    const agentPatterns = this.learningPatterns.get(agentId);
    if (!agentPatterns) {
      return false;
    }
    
    const pattern = agentPatterns.get(taskType);
    if (!pattern) {
      return false;
    }
    
    // Generate optimizations if we have enough data and haven't updated recently
    const successCount = Object.values(pattern.successPatterns).reduce((sum, count) => sum + count, 0);
    const failureCount = Object.values(pattern.failurePatterns).reduce((sum, count) => sum + count, 0);
    
    const totalCount = successCount + failureCount;
    const lastUpdated = pattern.lastUpdated;
    
    // Generate optimizations if we have at least 10 executions and haven't updated in the last day
    return totalCount >= 10 && (new Date().getTime() - lastUpdated.getTime() > 86400000);
  }
  
  private async generateOptimizationSuggestions(agentId: string, taskType: string): Promise<OptimizationSuggestion[]> {
    const agentPatterns = this.learningPatterns.get(agentId);
    if (!agentPatterns) {
      return [];
    }
    
    const pattern = agentPatterns.get(taskType);
    if (!pattern) {
      return [];
    }
    
    try {
      // Get relevant knowledge from knowledge base
      const agentKnowledge = this.knowledgeBase.get(agentId) || [];
      const relevantKnowledge = agentKnowledge
        .filter(k => k.taskType === taskType)
        .slice(-20); // Use the 20 most recent examples
      
      // Generate optimization suggestions using LLM
      const messages = [
        {
          role: 'system' as const,
          content: `You are an AI optimization expert. Analyze the following learning patterns and knowledge base entries for an AI agent handling tasks of type "${taskType}". 
                   Identify patterns that lead to success or failure and suggest optimizations to improve performance.
                   Provide your suggestions in JSON format with the following structure:
                   [
                     {
                       "type": "prompt_improvement" | "parameter_adjustment" | "workflow_change",
                       "description": "Detailed description of the suggestion",
                       "confidence": 0.0-1.0,
                       "implementationDetails": { ... }
                     }
                   ]`
        },
        {
          role: 'user' as const,
          content: JSON.stringify({
            learningPattern: pattern,
            knowledgeBase: relevantKnowledge
          })
        }
      ];

      const response = await this.openai.chat.completions.create({
        messages,
        model: "gpt-4",
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }
      
      try {
        const parsedResponse = JSON.parse(content);
        const suggestions = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.suggestions || [];
        
        // Validate and clean suggestions
        return suggestions
          .filter(s => s.type && s.description && typeof s.confidence === 'number')
          .map(s => ({
            type: s.type as 'prompt_improvement' | 'parameter_adjustment' | 'workflow_change',
            description: s.description,
            confidence: Math.max(0, Math.min(1, s.confidence)),
            implementationDetails: s.implementationDetails || {}
          }));
      } catch (error) {
        console.error('Error parsing optimization suggestions:', error);
        return [];
      }
    } catch (error) {
      console.error('Error generating optimization suggestions:', error);
      return [];
    }
  }
  
  private async analyzeFeedback(feedback: string): Promise<{
    relevantTaskTypes: string[];
    positiveFeatures: string[];
    negativeFeatures: string[];
  }> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: `You are an AI feedback analyzer. Analyze the following feedback for an AI agent and extract:
                   1. Relevant task types that this feedback applies to
                   2. Positive features mentioned in the feedback
                   3. Negative features mentioned in the feedback
                   
                   Provide your analysis in JSON format with the following structure:
                   {
                     "relevantTaskTypes": ["task_type1", "task_type2"],
                     "positiveFeatures": ["feature1", "feature2"],
                     "negativeFeatures": ["feature3", "feature4"]
                   }`
        },
        {
          role: 'user' as const,
          content: feedback
        }
      ];

      const response = await this.openai.chat.completions.create({
        messages,
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { relevantTaskTypes: [], positiveFeatures: [], negativeFeatures: [] };
      }
      
      try {
        const parsedResponse = JSON.parse(content);
        return {
          relevantTaskTypes: Array.isArray(parsedResponse.relevantTaskTypes) ? parsedResponse.relevantTaskTypes : [],
          positiveFeatures: Array.isArray(parsedResponse.positiveFeatures) ? parsedResponse.positiveFeatures : [],
          negativeFeatures: Array.isArray(parsedResponse.negativeFeatures) ? parsedResponse.negativeFeatures : []
        };
      } catch (error) {
        console.error('Error parsing feedback analysis:', error);
        return { relevantTaskTypes: [], positiveFeatures: [], negativeFeatures: [] };
      }
    } catch (error) {
      console.error('Error analyzing feedback:', error);
      return { relevantTaskTypes: [], positiveFeatures: [], negativeFeatures: [] };
    }
  }
}