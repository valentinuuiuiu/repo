import { GoogleGenerativeAI } from '@google/generative-ai'
import { BaseProvider, ProviderConfig, ChatMessage, ChatCompletionResponse, ProviderType } from './BaseProvider'

export class GeminiProvider extends BaseProvider {
  private client: GoogleGenerativeAI
  private generativeModel: any

  constructor(config: ProviderConfig) {
    super(config)
    this.client = new GoogleGenerativeAI(config.apiKey)
    this.generativeModel = this.client.getGenerativeModel({ 
      model: config.model || 'gemini-pro',
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens
      }
    })
  }

  async chat(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    try {
      // Convert OpenAI-style messages to Gemini format
      const geminiMessages = messages.map(msg => {
        switch (msg.role) {
          case 'system':
            return { role: 'user', parts: [{ text: msg.content }] }
          case 'user':
            return { role: 'user', parts: [{ text: msg.content }] }
          case 'assistant':
            return { role: 'model', parts: [{ text: msg.content }] }
          default:
            return { role: 'user', parts: [{ text: msg.content }] }
        }
      })

      const chatSession = this.generativeModel.startChat({
        history: geminiMessages.slice(0, -1)
      })

      const lastMessage = geminiMessages[geminiMessages.length - 1]
      const response = await chatSession.sendMessage(lastMessage.parts[0].text)

      return {
        content: response.response.text(),
        tokenUsage: {
          promptTokens: 0, // Gemini doesn't provide detailed token usage
          completionTokens: 0,
          totalTokens: 0
        },
        finishReason: 'stop', // Default finish reason
        metadata: {
          model: this.config.model || 'gemini-pro',
          provider: ProviderType.GEMINI
        }
      }
    } catch (error) {
      console.error('Gemini Chat Error:', error)
      throw error
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const embeddingModel = this.client.getGenerativeModel({ model: 'embedding-001' })
      
      const embeddingPromises = texts.map(async (text) => {
        const result = await embeddingModel.embedContent(text)
        return result.embedding.values
      })

      return await Promise.all(embeddingPromises)
    } catch (error) {
      console.error('Gemini Embedding Error:', error)
      throw error
    }
  }

  async listAvailableModels(): Promise<string[]> {
    return [
      'gemini-pro',
      'gemini-pro-vision',
      'embedding-001'
    ]
  }

  // Streaming chat implementation
  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    try {
      // Convert OpenAI-style messages to Gemini format
      const geminiMessages = messages.map(msg => {
        switch (msg.role) {
          case 'system':
            return { role: 'user', parts: [{ text: msg.content }] }
          case 'user':
            return { role: 'user', parts: [{ text: msg.content }] }
          case 'assistant':
            return { role: 'model', parts: [{ text: msg.content }] }
          default:
            return { role: 'user', parts: [{ text: msg.content }] }
        }
      })

      const chatSession = this.generativeModel.startChat({
        history: geminiMessages.slice(0, -1)
      })

      const lastMessage = geminiMessages[geminiMessages.length - 1]
      const stream = await chatSession.sendMessageStream(lastMessage.parts[0].text)

      for await (const chunk of stream) {
        const chunkText = chunk.text()
        if (chunkText) {
          yield chunkText
        }
      }
    } catch (error) {
      console.error('Gemini Streaming Chat Error:', error)
      throw error
    }
  }
}

export class GeminiProviderFactory {
  static createProvider(config: ProviderConfig): GeminiProvider {
    return new GeminiProvider(config)
  }

  static getSupportedModels(): string[] {
    return [
      'gemini-pro',
      'gemini-pro-vision',
      'embedding-001'
    ]
  }
}