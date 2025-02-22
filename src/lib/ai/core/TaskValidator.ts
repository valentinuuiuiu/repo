import type { Task, AgentInsight } from "../types";

interface ValidationRule {
  name: string;
  validate: (task: Task) => Promise<ValidationResult>;
  weight: number;
}

interface ValidationResult {
  passed: boolean;
  score: number;
  message: string;
  details?: any;
}

export class TaskValidator {
  private rules: ValidationRule[] = [
    {
      name: "Confidence Check",
      validate: async (task: Task) => {
        const insights = task.result?.departmentInsights || [];
        const avgConfidence = insights.reduce((sum: number, i: AgentInsight) => sum + (i.confidence || 0), 0) / (insights.length || 1);
        
        return {
          passed: avgConfidence >= 0.7,
          score: avgConfidence,
          message: avgConfidence >= 0.7 
            ? "Confidence levels are acceptable" 
            : "Low confidence in results"
        };
      },
      weight: 0.3
    },
    {
      name: "Department Coverage",
      validate: async (task: Task) => {
        const requestedDepts = new Set(task.departments);
        const respondedDepts = new Set(
          (task.result?.departmentInsights || []).map(i => i.department)
        );
        
        const coverage = [...requestedDepts].every(dept => respondedDepts.has(dept));
        return {
          passed: coverage,
          score: coverage ? 1 : 0,
          message: coverage 
            ? "All requested departments provided insights" 
            : "Missing insights from some departments"
        };
      },
      weight: 0.2
    },
    {
      name: "Result Completeness",
      validate: async (task: Task) => {
        const result = task.result || {};
        const requiredFields = ['analysis', 'recommendations', 'risks'];
        const completeness = requiredFields.filter(field => field in result).length / requiredFields.length;
        
        return {
          passed: completeness >= 0.8,
          score: completeness,
          message: completeness >= 0.8 
            ? "Result contains all required components" 
            : "Result is missing some required components"
        };
      },
      weight: 0.25
    },
    {
      name: "Processing Time",
      validate: async (task: Task) => {
        const processingTime = task.updated_at.getTime() - task.created_at.getTime();
        const maxAllowedTime = 30000; // 30 seconds
        const score = Math.max(0, 1 - (processingTime / maxAllowedTime));
        
        return {
          passed: score >= 0.5,
          score,
          message: score >= 0.5 
            ? "Processing time within acceptable range" 
            : "Processing time exceeded recommended threshold"
        };
      },
      weight: 0.25
    }
  ];

  async validateTask(task: Task): Promise<{
    passed: boolean;
    totalScore: number;
    results: ValidationResult[];
  }> {
    const results = await Promise.all(
      this.rules.map(async rule => ({
        rule: rule.name,
        result: await rule.validate(task),
        weight: rule.weight
      }))
    );

    const totalScore = results.reduce(
      (sum, { result, weight }) => sum + (result.score * weight), 
      0
    );

    const minimumRequiredScore = 0.7;
    const passed = totalScore >= minimumRequiredScore;

    return {
      passed,
      totalScore,
      results: results.map(r => r.result)
    };
  }

  async generateValidationReport(task: Task): Promise<string> {
    const validation = await this.validateTask(task);
    
    return `
Task Validation Report
---------------------
Overall Score: ${(validation.totalScore * 100).toFixed(1)}%
Status: ${validation.passed ? 'PASSED' : 'NEEDS REVIEW'}

Detailed Results:
${validation.results.map(r => `
- ${r.message}
  Score: ${(r.score * 100).toFixed(1)}%
  Status: ${r.passed ? '✓' : '⚠️'}
`).join('\n')}
`;
  }
}