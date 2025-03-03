import OpenAI from 'openai';
import { BaseProvider, ProviderConfig, ChatMessage, ChatCompletionResponse, ProviderType } from './BaseProvider';
import { ModelConfig, ModelType } from './types';
import { RateLimiter } from './RateLimiter';

export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;

  constructor(config: ProviderConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000
    });
  }

  async chat(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000,
      });

      const content = completion.choices[0]?.message?.content || '';

      return {
        content,
        tokenUsage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0
        },
        finishReason: completion.choices[0]?.finish_reason || undefined,
        metadata: {
          model: completion.model,
          provider: ProviderType.OPENAI
        }
      };
    } catch (error) {
      console.error('OpenAI Chat Error:', error);
      throw error;
    }
  }

  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000,
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          yield chunk.choices[0].delta.content;
        }
      }
    } catch (error) {
      console.error('OpenAI Stream Chat Error:', error);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: texts,
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('OpenAI Embeddings Error:', error);
      throw error;
    }
  }

  static getSupportedModels(): string[] {
    return [
      'gpt-4-0125-preview',
      'gpt-4-turbo-preview',
      'gpt-4-1106-preview',
      'gpt-4-vision-preview',
      'gpt-4',
      'gpt-3.5-turbo-0125',
      'gpt-3.5-turbo',
      'text-embedding-3-small',
      'text-embedding-3-large',
      'text-embedding-ada-002'
    ];
  }
}

export class OpenAIProviderFactory {
  static createProvider(config: ProviderConfig): OpenAIProvider {
    return new OpenAIProvider(config);
  }

  static getSupportedModels(): string[] {
    return OpenAIProvider.getSupportedModels();
  }
}