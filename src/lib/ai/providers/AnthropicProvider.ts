import { Anthropic } from '@anthropic-ai/sdk'
import { BaseProvider, ProviderConfig, ChatMessage, ChatCompletionResponse, ProviderType } from './BaseProvider'
import { ModelConfig, ModelType } from './types';
import { RateLimiter } from './RateLimiter';

export class AnthropicProvider extends BaseProvider {
  private client: Anthropic

  constructor(config: ProviderConfig) {
    super(config)
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeout
    })
  }

  async chat(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    try {
      // Convert OpenAI-style messages to Anthropic format
      const anthropicMessages = messages.map(msg => {
        if (msg.role === 'system') {
          return { role: 'user', content: msg.content }
        }
        return { 
          role: msg.role === 'assistant' ? 'assistant' : 'user', 
          content: msg.content 
        }
      })

      const response = await this.client.messages.create({
        model: this.config.model || 'claude-3-opus-20240229',
        messages: anthropicMessages as Anthropic.MessageParam[],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens || 4096
      })

      // Get the text content from the response
      const content = response.content.filter(block => block.type === 'text')[0]?.text || ''

      return {
        content,
        tokenUsage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        },
        finishReason: response.stop_reason || undefined,
        metadata: {
          model: response.model,
          provider: ProviderType.ANTHROPIC
        }
      }
    } catch (error) {
      console.error('Anthropic Chat Error:', error)
      throw error
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Anthropic doesn't have a direct embedding API
    // This is a placeholder - you might want to use a different service for embeddings
    console.warn('Anthropic does not support direct embeddings. Using a placeholder.')
    return texts.map(() => Array(1536).fill(0).map(() => Math.random()))
  }

  async listAvailableModels(): Promise<string[]> {
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ]
  }

  // Streaming chat implementation
  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    try {
      // Convert OpenAI-style messages to Anthropic format
      const anthropicMessages = messages.map(msg => {
        if (msg.role === 'system') {
          return { role: 'user', content: msg.content }
        }
        return { 
          role: msg.role === 'assistant' ? 'assistant' : 'user', 
          content: msg.content 
        }
      })

      const stream = await this.client.messages.stream({
        model: this.config.model || 'claude-3-opus-20240229',
        messages: anthropicMessages as Anthropic.MessageParam[],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens || 4096
      })

      for await (const message of stream) {
        if (message.type === 'content_block_delta' && message.delta.type === 'text_delta') {
          yield message.delta.text
        }
      }
    } catch (error) {
      console.error('Anthropic Streaming Chat Error:', error)
      throw error
    }
  }

  static async getModel(config: ModelConfig, apiKey: string, rateLimiter: RateLimiter) {
    const baseURL = config.baseUrl || 'https://api.anthropic.com';

    switch (config.type) {
      case ModelType.CHAT:
        const anthropic = new Anthropic({
          apiKey,
          baseURL
        });
        return anthropic;

      case ModelType.EMBEDDING:
        throw new Error('Anthropic does not currently support embeddings');

      default:
        throw new Error(`Unsupported model type: ${config.type}`);
    }
  }
}

export class AnthropicProviderFactory {
  static createProvider(config: ProviderConfig): AnthropicProvider {
    return new AnthropicProvider(config)
  }

  static getSupportedModels(): string[] {
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ]
  }
}