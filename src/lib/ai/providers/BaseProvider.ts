import { z } from 'zod'

// Validation schema for provider configuration
export const ProviderConfigSchema = z.object({
  apiKey: z.string(),
  baseUrl: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().optional(),
  timeout: z.number().optional().default(60000)
})

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>

// Message type for chat completions
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  name?: string
}

// Response type for chat completions
export interface ChatCompletionResponse {
  content: string
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason?: string
  metadata?: Record<string, any>
}

// Abstract base class for AI providers
export abstract class BaseProvider {
  protected config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = ProviderConfigSchema.parse(config)
  }

  // Abstract methods to be implemented by each provider
  abstract chat(messages: ChatMessage[]): Promise<ChatCompletionResponse>
  abstract generateEmbeddings(texts: string[]): Promise<number[][]>
  abstract listAvailableModels(): Promise<string[]>

  // Optional method for streaming responses
  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    const response = await this.chat(messages)
    yield response.content
  }

  // Utility method to validate configuration
  validateConfig(config: ProviderConfig): void {
    ProviderConfigSchema.parse(config)
  }
}

// Enum for supported providers
export enum ProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  OLLAMA = 'ollama',
  MISTRALAI = 'mistralai',
  GROQ = 'groq',
  HUGGINGFACE = 'huggingface',
  DEEPSEEK = 'deepseek',
  OPENROUTER = 'openrouter',
  SAMBANOVA = 'sambanova'
}

// Interface for provider factory
export interface ProviderFactory {
  createProvider(config: ProviderConfig): BaseProvider
  getSupportedModels(): string[]
}