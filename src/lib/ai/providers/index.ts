import { ModelType, ModelProvider, ModelConfig } from './types';
import { AnthropicProvider } from './AnthropicProvider';
import { GoogleProvider } from './GoogleProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { OllamaProvider } from './OllamaProvider';
import { RateLimiter } from './RateLimiter';
import { BaseProvider, ProviderType, ChatMessage, ChatCompletionResponse } from './BaseProvider';

// Singleton instance to manage providers
export class AIProviderManager {
  private static instance: AIProviderManager;
  private rateLimiters: Map<string, RateLimiter> = new Map();

  private constructor() {}

  public static getInstance(): AIProviderManager {
    if (!AIProviderManager.instance) {
      AIProviderManager.instance = new AIProviderManager();
    }
    return AIProviderManager.instance;
  }

  async getProvider(config: ModelConfig) {
    const rateLimiter = this.getRateLimiter(config.provider, config.modelName);

    switch (config.provider) {
      case ModelProvider.ANTHROPIC:
        return AnthropicProvider.getModel(config, config.apiKey!, rateLimiter);

      case ModelProvider.OPENAI:
        return OpenAIProvider.getModel(config, config.apiKey!, rateLimiter);

      case ModelProvider.OPENAI_AZURE:
        return OpenAIProvider.getAzureModel(config, config.apiKey!, rateLimiter);

      case ModelProvider.GOOGLE:
        return GoogleProvider.getModel(config, config.apiKey!, rateLimiter);

      case ModelProvider.OLLAMA:
        return OllamaProvider.getModel(config, rateLimiter);

      // Add more providers as they are implemented
      default:
        throw new Error(`Provider ${config.provider} not implemented`);
    }
  }

  private getRateLimiter(provider: ModelProvider, modelName: string): RateLimiter {
    const key = `${provider}\\${modelName}`;
    if (!this.rateLimiters.has(key)) {
      this.rateLimiters.set(key, new RateLimiter());
    }
    return this.rateLimiters.get(key)!;
  }

  public getSupportedModels(provider: ModelProvider): string[] {
    switch (provider) {
      case ModelProvider.ANTHROPIC:
        return AnthropicProvider.getSupportedModels();
      case ModelProvider.OPENAI:
      case ModelProvider.OPENAI_AZURE:
        return OpenAIProvider.getSupportedModels();
      case ModelProvider.GOOGLE:
        return GoogleProvider.getSupportedModels();
      case ModelProvider.OLLAMA:
        return OllamaProvider.getSupportedModels();
      default:
        return [];
    }
  }
}

// Export everything needed for public use
export {
  ModelType,
  ModelProvider,
  ModelConfig,
  BaseProvider,
  ProviderType,
  ChatMessage,
  ChatCompletionResponse,
  RateLimiter
};

// Create and export the singleton instance
export const aiProvider = AIProviderManager.getInstance();