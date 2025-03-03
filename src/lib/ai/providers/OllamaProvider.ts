import { ModelConfig, ModelType } from './types';
import { RateLimiter } from './RateLimiter';

interface OllamaCompletionRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    num_ctx?: number;
  };
}

interface OllamaEmbeddingRequest {
  model: string;
  prompt: string;
}

export class OllamaProvider {
  static async getModel(config: ModelConfig, rateLimiter: RateLimiter) {
    const baseUrl = config.baseUrl || 'http://localhost:11434';
    
    async function fetchFromOllama(endpoint: string, data: any) {
      const response = await fetch(`${baseUrl}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.statusText}`);
      }
      
      return response;
    }

    switch (config.type) {
      case ModelType.CHAT:
        return {
          chat: async (messages: any[]) => {
            const combinedPrompt = messages
              .map(m => `${m.role}: ${m.content}`)
              .join('\n');
              
            const data: OllamaCompletionRequest = {
              model: config.modelName,
              prompt: combinedPrompt,
              options: {
                temperature: config.temperature,
                num_ctx: config.maxTokens
              }
            };
            
            const response = await fetchFromOllama('generate', data);
            const result = await response.json();
            return result;
          },
          
          streamChat: async function*(messages: any[]) {
            const combinedPrompt = messages
              .map(m => `${m.role}: ${m.content}`)
              .join('\n');
              
            const data: OllamaCompletionRequest = {
              model: config.modelName,
              prompt: combinedPrompt,
              stream: true,
              options: {
                temperature: config.temperature,
                num_ctx: config.maxTokens
              }
            };
            
            const response = await fetchFromOllama('generate', data);
            const reader = response.body?.getReader();
            if (!reader) throw new Error('Stream not available');
            
            const decoder = new TextDecoder();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(Boolean);
              for (const line of lines) {
                const json = JSON.parse(line);
                if (json.response) {
                  yield json.response;
                }
              }
            }
          }
        };

      case ModelType.EMBEDDING:
        return {
          embed: async (texts: string[]) => {
            const embeddings = await Promise.all(
              texts.map(async text => {
                const data: OllamaEmbeddingRequest = {
                  model: config.modelName,
                  prompt: text
                };
                
                const response = await fetchFromOllama('embeddings', data);
                const result = await response.json();
                return result.embedding;
              })
            );
            return embeddings;
          }
        };

      default:
        throw new Error(`Unsupported model type: ${config.type}`);
    }
  }

  static getSupportedModels(): string[] {
    return [
      'llama2',
      'codellama',
      'mistral',
      'mixtral',
      'gemma',
      'phi',
      'neural-chat',
      'starling-lm',
      'orca-mini',
      'vicuna'
    ];
  }
}