import { BaseAgent } from "../../core/BaseAgent";
import { AgentConfig, AgentResponse, Task } from "../../types";
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

export class InventoryManagementAgent extends BaseAgent {
  private openai: OpenAI;
  private inventoryTemplate: PromptTemplate;

  constructor(config: AgentConfig) {
    super({
      ...config,
      capabilities: [
        'inventory_tracking',
        'stock_optimization',
        'reorder_management',
        'inventory_forecasting',
        'supplier_coordination'
      ]
    });

    this.openai = new OpenAI({
      modelName: 'gpt-4o-mini'
    });

    this.inventoryTemplate = PromptTemplate.fromTemplate(`
      Analyze the following inventory situation:
      Stock Data: {stockData}
      Current Action: {action}
      Historical Data: {historicalData}

      Provide recommendations for:
      1. Stock level adjustments
      2. Reordering requirements
      3. Storage optimization
      4. Risk assessment

      Format response as structured data with:
      - analysisResults
      - recommendations
      - riskFactors
      - actionItems
    `);
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    try {
      const chain = RunnableSequence.from([
        this.inventoryTemplate,
        this.openai,
        (response) => {
          try {
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : this.formatResponse(response.text);
          } catch (error) {
            return this.formatResponse(response.text);
          }
        }
      ]);

      const result = await chain.invoke({
        stockData: JSON.stringify(task.data?.stock || {}),
        action: task.action,
        historicalData: JSON.stringify(task.data?.history || [])
      });

      return {
        success: true,
        data: result,
        metadata: {
          confidence: this.calculateConfidence(result),
          processingTime: Date.now() - task.timestamp
        }
      };
    } catch (error) {
      console.error('Error in InventoryManagementAgent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          confidence: 0,
          processingTime: Date.now() - task.timestamp
        }
      };
    }
  }

  private calculateConfidence(result: any): number {
    // Calculate confidence based on data completeness and quality
    let confidence = 0.5; // Base confidence
    
    if (result.analysisResults && Object.keys(result.analysisResults).length > 0) {
      confidence += 0.1;
    }
    if (result.recommendations && result.recommendations.length > 0) {
      confidence += 0.2;
    }
    if (result.riskFactors && result.riskFactors.length > 0) {
      confidence += 0.1;
    }
    if (result.actionItems && result.actionItems.length > 0) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private formatResponse(text: string) {
    // Format unstructured response into structured data
    const sections = text.split('\n\n');
    return {
      analysisResults: this.extractSection(sections, 'Stock level adjustments'),
      recommendations: this.extractSection(sections, 'Reordering requirements'),
      riskFactors: this.extractSection(sections, 'Risk assessment'),
      actionItems: sections
        .filter(s => s.includes('- '))
        .map(s => s.replace('- ', '').trim())
    };
  }

  private extractSection(sections: string[], keyword: string): string[] {
    const section = sections.find(s => s.toLowerCase().includes(keyword.toLowerCase()));
    return section
      ? section
          .split('\n')
          .filter(line => line.includes('- '))
          .map(line => line.replace('- ', '').trim())
      : [];
  }
}