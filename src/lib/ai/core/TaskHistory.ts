import type { Task } from "../types";

interface TaskHistoryEntry extends Task {
  validationScore?: number;
  humanFeedbackSentiment?: 'positive' | 'negative' | 'neutral';
  learningPoints?: string[];
}

export class TaskHistory {
  private history: TaskHistoryEntry[] = [];

  addEntry(task: Task, validationScore?: number) {
    const entry: TaskHistoryEntry = {
      ...task,
      validationScore,
      humanFeedbackSentiment: this.analyzeFeedbackSentiment(task.humanFeedback),
      learningPoints: this.extractLearningPoints(task)
    };
    
    this.history.push(entry);
    this.pruneHistory();
  }

  getTasksByType(type: string, limit: number = 10): TaskHistoryEntry[] {
    return this.history
      .filter(entry => entry.type === type)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }

  getSuccessfulStrategies(type: string): { strategy: string; successRate: number }[] {
    const typeEntries = this.history.filter(entry => entry.type === type);
    const strategies = new Map<string, { success: number; total: number }>();

    typeEntries.forEach(entry => {
      const key = this.identifyStrategy(entry);
      if (!key) return;

      const stats = strategies.get(key) || { success: 0, total: 0 };
      stats.total++;
      if (entry.status === 'completed') stats.success++;
      strategies.set(key, stats);
    });

    return Array.from(strategies.entries())
      .map(([strategy, stats]) => ({
        strategy,
        successRate: stats.success / stats.total
      }))
      .sort((a, b) => b.successRate - a.successRate);
  }

  getDepartmentPerformance(department: string): {
    taskCount: number;
    successRate: number;
    averageValidationScore: number;
  } {
    const deptTasks = this.history.filter(entry => 
      entry.departments.includes(department)
    );

    if (deptTasks.length === 0) {
      return { taskCount: 0, successRate: 0, averageValidationScore: 0 };
    }

    const successful = deptTasks.filter(task => task.status === 'completed').length;
    const validationScores = deptTasks
      .filter(task => task.validationScore !== undefined)
      .map(task => task.validationScore!);

    return {
      taskCount: deptTasks.length,
      successRate: successful / deptTasks.length,
      averageValidationScore: validationScores.length > 0
        ? validationScores.reduce((sum, score) => sum + score, 0) / validationScores.length
        : 0
    };
  }

  getRecentLearningPoints(limit: number = 10): string[] {
    return Array.from(new Set(
      this.history
        .flatMap(entry => entry.learningPoints || [])
        .slice(0, limit)
    ));
  }

  private analyzeFeedbackSentiment(feedback?: string): 'positive' | 'negative' | 'neutral' {
    if (!feedback) return 'neutral';
    
    const positiveKeywords = ['good', 'great', 'excellent', 'perfect', 'well done'];
    const negativeKeywords = ['bad', 'poor', 'incorrect', 'wrong', 'improve'];
    
    const lowercaseFeedback = feedback.toLowerCase();
    const positiveCount = positiveKeywords.filter(word => lowercaseFeedback.includes(word)).length;
    const negativeCount = negativeKeywords.filter(word => lowercaseFeedback.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractLearningPoints(task: Task): string[] {
    const learningPoints: string[] = [];
    
    if (task.status === 'failed' && task.humanFeedback) {
      learningPoints.push(`Failure feedback: ${task.humanFeedback}`);
    }

    if (task.result?.insights) {
      const uniqueInsights = new Set(
        task.result.insights
          .filter((insight: any) => insight.confidence > 0.8)
          .map((insight: any) => insight.recommendation)
      );
      learningPoints.push(...uniqueInsights);
    }

    return learningPoints;
  }

  private identifyStrategy(task: TaskHistoryEntry): string | null {
    // Extract key characteristics that define the strategy used
    const departments = task.departments.sort().join('-');
    const resultType = task.result?.type || 'unknown';
    
    return `${departments}:${resultType}`;
  }

  private pruneHistory() {
    // Keep last 1000 entries to manage memory
    const MAX_HISTORY = 1000;
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(-MAX_HISTORY);
    }
  }
}