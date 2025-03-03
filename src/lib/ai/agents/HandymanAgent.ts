import { BaseAgent, AgentConfig } from "../core/BaseAgent";
import type { AgentResponse, Task, AgentMessage } from "../types";
import { AgentType } from "@prisma/client";

/**
 * HandymanAgent is a versatile agent that can handle various tasks
 * It's designed to be a general-purpose agent that can be used for
 * tasks that don't require specialized knowledge
 */
export class HandymanAgent extends BaseAgent {
  constructor(config?: Partial<AgentConfig>) {
    super({
      name: "handyman-agent",
      type: AgentType.CUSTOMER_SERVICE,
      description: "Versatile agent for general-purpose tasks",
      capabilities: [
        "text-analysis",
        "data-summarization",
        "content-generation",
        "insight-extraction",
        "department-analysis"
      ],
      maxRetries: 3,
      baseDelay: 1000,
      ...config
    });
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      // Determine which function to call based on task type
      switch (task.type) {
        case 'analyze-text':
          return await this.analyzeText(task.data as string);
        case 'summarize-data':
          return await this.summarizeData(task.data as Record<string, any>);
        case 'generate-content':
          return await this.generateContent(
            (task.data as any).topic, 
            (task.data as any).format,
            (task.data as any).length
          );
        case 'extract-insights':
          return await this.extractInsights(task.data as Record<string, any>);
        case 'department-insights':
          return await this.generateDepartmentInsights(task.data as string);
        default:
          return await this.handleGenericTask(task);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  async analyzeText(text: string): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a text analysis specialist. Analyze the provided text and extract key information.
                 Respond with a JSON object containing: { "summary": string, "keyPoints": string[], "sentiment": string, "topics": string[] }`
      },
      {
        role: "user" as const,
        content: text
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let analysis;
      
      try {
        analysis = response ? JSON.parse(response) : {};
      } catch (e) {
        // If parsing fails, create a structured response
        analysis = {
          summary: response || "No analysis provided",
          keyPoints: [],
          sentiment: "neutral",
          topics: []
        };
      }
      
      return {
        success: true,
        data: analysis,
        metadata: {
          confidence: 0.85,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async summarizeData(data: Record<string, any>): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a data summarization specialist. Summarize the provided data and extract key insights.
                 Respond with a JSON object containing: { "summary": string, "keyInsights": string[], "recommendations": string[] }`
      },
      {
        role: "user" as const,
        content: JSON.stringify(data)
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let summary;
      
      try {
        summary = response ? JSON.parse(response) : {};
      } catch (e) {
        // If parsing fails, create a structured response
        summary = {
          summary: response || "No summary provided",
          keyInsights: [],
          recommendations: []
        };
      }
      
      return {
        success: true,
        data: summary,
        metadata: {
          confidence: 0.8,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async generateContent(topic: string, format: string, length: string): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a content generation specialist. Generate content on the provided topic in the specified format and length.
                 Respond with a JSON object containing: { "title": string, "content": string, "metadata": { "wordCount": number, "readingTime": string } }`
      },
      {
        role: "user" as const,
        content: JSON.stringify({ topic, format, length })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let content;
      
      try {
        content = response ? JSON.parse(response) : {};
      } catch (e) {
        // If parsing fails, create a structured response
        content = {
          title: topic,
          content: response || "No content generated",
          metadata: {
            wordCount: response ? response.split(/\s+/).length : 0,
            readingTime: "Unknown"
          }
        };
      }
      
      return {
        success: true,
        data: content,
        metadata: {
          confidence: 0.9,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async extractInsights(data: Record<string, any>): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are an insights extraction specialist. Analyze the provided data and extract valuable insights.
                 Respond with a JSON object containing: { "insights": string[], "trends": string[], "anomalies": string[], "opportunities": string[] }`
      },
      {
        role: "user" as const,
        content: JSON.stringify(data)
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let insights;
      
      try {
        insights = response ? JSON.parse(response) : {};
      } catch (e) {
        // If parsing fails, create a structured response
        insights = {
          insights: response ? [response] : [],
          trends: [],
          anomalies: [],
          opportunities: []
        };
      }
      
      return {
        success: true,
        data: insights,
        metadata: {
          confidence: 0.85,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async generateDepartmentInsights(departmentId: string): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a department analysis specialist. Generate insights for the specified department.
                 Consider: performance metrics, team dynamics, resource allocation, and improvement opportunities.
                 Respond with a JSON array of insights, each containing: { "title": string, "description": string, "impact": string, "actionItems": string[], "agentId": string }`
      },
      {
        role: "user" as const,
        content: `Generate insights for the ${departmentId} department.`
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let insights;
      
      try {
        insights = response ? JSON.parse(response) : [];
      } catch (e) {
        // If parsing fails, create a structured response
        insights = [{
          title: "Department Analysis",
          description: response || "No insights generated",
          impact: "Unknown",
          actionItems: [],
          agentId: "handyman-agent"
        }];
      }
      
      return {
        success: true,
        data: insights,
        metadata: {
          confidence: 0.8,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async handleGenericTask(task: Task): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a versatile AI assistant. Handle the following task to the best of your ability.
                 Respond with a JSON object containing your results.`
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          taskType: task.type,
          taskData: task.data,
          taskMetadata: task.metadata
        })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let result;
      
      try {
        result = response ? JSON.parse(response) : {};
      } catch (e) {
        // If parsing fails, create a structured response
        result = {
          response: response || "No response generated",
          taskType: task.type
        };
      }
      
      return {
        success: true,
        data: result,
        metadata: {
          confidence: 0.7,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async handleMessage(message: AgentMessage): Promise<AgentResponse> {
    // Extract the message content from the AgentMessage object.
    const content = message.content;

    // Return a structured AgentResponse.
    return {
      success: true,
      data: {
        response: 'Message received',
        content
      },
      metadata: {
        confidence: 1.0,
         processingTime: 0,
         modelUsed: 'unknown'
      }
     };
  }
}