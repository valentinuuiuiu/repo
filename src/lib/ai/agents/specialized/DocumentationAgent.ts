import { BaseAgent } from '../../core/BaseAgent';
import { AgentConfig, AgentMessage, AgentResponse, Task } from '../../types';

export class DocumentationAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({
      ...config,
      capabilities: [
        ...(config.capabilities || []),
        'documentation_management',
        'content_creation',
        'content_organization',
        'technical_writing'
      ]
    });
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    try {
      // Specialized documentation processing logic
      const result: AgentResponse = {
        success: true,
        data: `Documentation processed: ${task.type}`,
        metadata: {
          confidence: 0.95,
          processingTime: 500,
          modelUsed: 'documentation-specialist-v1'
        }
      };

      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          confidence: 0,
          processingTime: 0,
          modelUsed: 'documentation-specialist-v1'
        }
      };
    }
  }

  async handleMessage(message: AgentMessage): Promise<AgentResponse> {
    try {
      // Prepare a documentation-focused response
      let response = '';

      // Check the content of the message to determine the appropriate response
      const content = message.content as string;

      if (content.includes('how') || content.includes('documentation')) {
        response = `Here's the documentation information you requested:
        
1. **Documentation Structure**: Our documentation is organized by features, with getting started guides and advanced tutorials.
2. **API Documentation**: All API endpoints are documented with examples and parameter descriptions.
3. **User Guides**: Step-by-step instructions for common tasks are provided.
4. **Troubleshooting**: Common issues and their solutions are listed in the FAQ section.

Is there a specific part of the documentation you'd like me to help with?`;
      } else if (content.includes('update') || content.includes('create')) {
        response = `I can help you update or create documentation. Please provide:

1. The topic or feature you want to document
2. The target audience (developers, end-users, etc.)
3. Any specific sections you want to include

Once you provide this information, I can draft the documentation for your review.`;
      } else {
        response = `I'm the Documentation Agent, ready to help with:
        
- Creating new documentation
- Updating existing documentation
- Organizing documentation structure
- Converting technical details into user-friendly guides
- Generating API documentation

What documentation task would you like assistance with today?`;
      }

      return {
        success: true,
        data: response,
        metadata: {
          confidence: 0.9,
          processingTime: 350,
          modelUsed: 'documentation-specialist-v1'
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          confidence: 0,
          processingTime: 0,
          modelUsed: 'documentation-specialist-v1'
        }
      };
    }
  }
}