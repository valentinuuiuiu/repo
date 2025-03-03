import axios from 'axios'
import { BaseProvider, ProviderConfig, ChatMessage, ChatCompletionResponse, ProviderType } from './BaseProvider'

export class DeepSeekProvider extends BaseProvider {
  private baseURL: string

  constructor(config: ProviderConfig) {
    super(config)
    this.baseURL = config.baseUrl || 'https://api.deepseek.com/v1'
  }

  async chat(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`, 
        {
          model: this.config.model || 'deepseek-chat',
          messages: messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.config.timeout
        }
      )

      const responseData = response.data
      const content = responseData.choices[0]?.message?.content || ''

      return {
        content,
        tokenUsage: {
          promptTokens: responseData.usage?.prompt_tokens || 0,
          completionTokens: responseData.usage?.completion_tokens || 0,
          totalTokens: responseData.usage?.total_tokens || 0
        },
        finishReason: responseData.choices[0]?.finish_reason || undefined,
        metadata: {
          model: responseData.model,
          provider: ProviderType.DEEPSEEK
        }
      }
    } catch (error) {
      console.error('DeepSeek Chat Error:', error)
      throw error
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await axios.post(
        `${this.baseURL}/embeddings`,
        {
          model: 'text-embedding-v1',
          input: texts
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.config.timeout
        }
      )

      return response.data.data.map((item: any) => item.embedding)
    } catch (error) {
      console.error('DeepSeek Embedding Error:', error)
      throw error
    }
  }

  async listAvailableModels(): Promise<string[]> {
    return [
      'deepseek-chat',
      'deepseek-coder',
      'text-embedding-v1'
    ]
  }

  // Streaming chat implementation
  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`, 
        {
          model: this.config.model || 'deepseek-chat',
          messages: messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.config.timeout,
          responseType: 'stream'
        }
      )

      const stream = response.data
      let buffer = ''

      for await (const chunk of stream) {
        const chunkStr = chunk.toString()
        buffer += chunkStr

        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.choices && data.choices[0].delta.content) {
                yield data.choices[0].delta.content
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('DeepSeek Streaming Chat Error:', error)
      throw error
    }
  }
}

export class DeepSeekProviderFactory {
  static createProvider(config: ProviderConfig): DeepSeekProvider {
    return new DeepSeekProvider(config)
  }

  static getSupportedModels(): string[] {
    return [
      'deepseek-chat',
      'deepseek-coder',
      'text-embedding-v1'
    ]
  }
}