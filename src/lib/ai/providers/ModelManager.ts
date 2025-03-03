import { ModelType, ModelProvider, ModelConfig } from './types';
import { RateLimiter } from './RateLimiter';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { OpenAI } from 'openai';

export class ModelManager {
  private static instance: ModelManager;
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private apiKeys: Map<string, string> = new Map();

  private constructor() {
    this.loadApiKeys();
  }

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  private loadApiKeys(): void {
    // Load API keys from environment variables
    Object.values(ModelProvider).forEach(provider => {
      const key = process.env[`API_KEY_${provider.toUpperCase().replace(' ', '_')}`] 
        || process.env[`${provider.toUpperCase().replace(' ', '_')}_API_KEY`];
      if (key) {
        this.apiKeys.set(provider, key);
      }
    });
  }

  private getRateLimiter(provider: ModelProvider, modelName: string): RateLimiter {
    const key = `${provider}\\${modelName}`;
    if (!this.rateLimiters.has(key)) {
      this.rateLimiters.set(key, new RateLimiter());
    }
    return this.rateLimiters.get(key)!;
  }

  public async getModel(config: ModelConfig) {
    const rateLimiter = this.getRateLimiter(config.provider, config.modelName);
    const apiKey = config.apiKey || this.apiKeys.get(config.provider);

    if (!apiKey && config.provider !== ModelProvider.OLLAMA && config.provider !== ModelProvider.LMSTUDIO) {
      throw new Error(`No API key found for provider ${config.provider}`);
    }

    switch (config.provider) {
      case ModelProvider.ANTHROPIC:
        return this.getAnthropicModel(config, apiKey!, rateLimiter);
      case ModelProvider.OPENAI:
        return this.getOpenAIModel(config, apiKey!, rateLimiter);
      case ModelProvider.GOOGLE:
        return this.getGoogleModel(config, apiKey!, rateLimiter);
      case ModelProvider.OLLAMA:
        return this.getOllamaModel(config, rateLimiter);
      // Add more providers here
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  private async getAnthropicModel(config: ModelConfig, apiKey: string, rateLimiter: RateLimiter) {
    if (config.type === ModelType.CHAT) {
      const anthropic = new Anthropic({
        apiKey,
        baseURL: config.baseUrl || 'https://api.anthropic.com'
      });
      return this.wrapWithRateLimiter(anthropic, rateLimiter);
    }
    throw new Error('Anthropic does not support embeddings yet');
  }

  private async getOpenAIModel(config: ModelConfig, apiKey: string, rateLimiter: RateLimiter) {
    const openai = new OpenAI({
      apiKey,
      baseURL: config.baseUrl,
      maxRetries: 3,
    });
    return this.wrapWithRateLimiter(openai, rateLimiter);
  }

  private async getGoogleModel(config: ModelConfig, apiKey: string, rateLimiter: RateLimiter) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: config.modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    return this.wrapWithRateLimiter(model, rateLimiter);
  }

  private async getOllamaModel(config: ModelConfig, rateLimiter: RateLimiter) {
    const baseUrl = config.baseUrl || 'http://localhost:11434';
    // Implement Ollama specific logic here
    return this.wrapWithRateLimiter({}, rateLimiter);
  }

  private wrapWithRateLimiter<T extends object>(model: T, rateLimiter: RateLimiter): T {
    return new Proxy(model, {
      get(target: any, prop: string) {
        if (typeof target[prop] === 'function') {
          return async (...args: any[]) => {
            const canProceed = await rateLimiter.checkLimit('requests');
            if (!canProceed) {
              throw new Error('Rate limit exceeded');
            }
            return target[prop](...args);
          };
        }
        return target[prop];
      }
    });
  }
}