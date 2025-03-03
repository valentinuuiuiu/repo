import axios from 'axios'
import { BaseProvider, ProviderConfig, ChatMessage, ChatCompletionResponse, ProviderType } from './BaseProvider'

export class OpenAICompatibleProvider extends BaseProvider {
  private baseURL: string

  constructor(config: ProviderConfig) {
    super(config)
    if (!config.baseUrl) {
      throw new Error('Base URL is required for OpenAI-compatible providers')
    }
    this.baseURL = config.baseUrl
  }

  async chat(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/chat/completions`,
        {
          model: this.config.model || 'sisaai/sisaai-tulu3-llama3.1:latest',
          messages: messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
          },
          timeout: this.config.timeout || 30000
        }
      )

      return {
        content: response.data.choices[0]?.message?.content || '',
        tokenUsage: {
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0,
          totalTokens: response.data.usage?.total_tokens || 0
        },
        finishReason: response.data.choices[0]?.finish_reason,
        metadata: {
          model: response.data.model,
          provider: ProviderType.OLLAMA
        }
      }
    } catch (error) {
      console.error('Ollama Chat Error:', error)
      throw error
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/embeddings`,
        {
          model: this.config.model || 'sisaai/sisaai-tulu3-llama3.1:latest',
          input: texts
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
          },
          timeout: this.config.timeout || 30000
        }
      )

      return response.data.data.map((item: any) => item.embedding)
    } catch (error) {
      console.error('Ollama Embedding Error:', error)
      throw error
    }
  }

  async listAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/v1/models`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
          },
          timeout: this.config.timeout || 30000
        }
      )

      return response.data.data.map((model: any) => model.id)
    } catch (error) {
      console.error('Error fetching Ollama models:', error)
      return ['sisaai/sisaai-tulu3-llama3.1:latest']
    }
  }

  // Streaming chat implementation
  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/chat/completions`,
        {
          model: this.config.model || 'sisaai/sisaai-tulu3-llama3.1:latest',
          messages: messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
          stream: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
          },
          responseType: 'stream',
          timeout: this.config.timeout || 30000
        }
      )

      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n').filter(Boolean)
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.choices?.[0]?.delta?.content) {
              yield data.choices[0].delta.content
            }
          }
        }
      }
    } catch (error) {
      console.error('Ollama Streaming Error:', error)
      throw error
    }
  }
}

export class OpenAICompatibleProviderFactory {
  static createProvider(config: ProviderConfig): OpenAICompatibleProvider {
    // Set default timeout if not provided
    const completeConfig = {
      ...config,
      timeout: config.timeout || 30000,
      apiKey: config.apiKey || ''
    };
    return new OpenAICompatibleProvider(completeConfig)
  }

  static getSupportedModels(): string[] {
    return ['sisaai/sisaai-tulu3-llama3.1:latest']
  }
}