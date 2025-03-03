import { BaseProvider, ProviderConfig, ProviderType } from './BaseProvider'
import { OpenAIProvider, OpenAIProviderFactory } from './OpenAIProvider'
import { OpenAICompatibleProvider, OpenAICompatibleProviderFactory } from './OpenAICompatibleProvider'

type ProviderFactoryMap = {
  [key in ProviderType]?: any;
};

export class ProviderManager {
  private static primaryProvider: OpenAIProvider | null = null;
  private static fallbackProvider: OpenAICompatibleProvider | null = null;

  private static providerFactories: ProviderFactoryMap = {
    [ProviderType.OPENAI]: OpenAIProviderFactory,
    [ProviderType.OLLAMA]: OpenAICompatibleProviderFactory
    // Other provider types can be added here as they're implemented
  }

  /**
   * Initialize providers with configuration
   */
  static async initializeProviders(config: {
    openaiApiKey?: string;
    ollamaBaseUrl?: string;
  }) {
    // Initialize OpenAI as primary provider
    if (config.openaiApiKey) {
      try {
        this.primaryProvider = this.createProvider(ProviderType.OPENAI, {
          apiKey: config.openaiApiKey,
          model: 'gpt-4',  // Updated to use the full model name
          temperature: 0.7,
          maxTokens: 1000,
          timeout: 30000
        });
        console.log('Primary provider (OpenAI) initialized successfully');
      } catch (error) {
        console.error('Failed to initialize primary provider:', error);
      }
    }

    // Initialize Ollama as fallback provider
    if (config.ollamaBaseUrl) {
      try {
        this.fallbackProvider = this.createProvider(ProviderType.OLLAMA, {
          baseUrl: config.ollamaBaseUrl,
          model: 'llama2',
          temperature: 0.7,
          maxTokens: 1000,
          timeout: 30000,
          apiKey: '' // Empty key for Ollama
        });
        console.log('Fallback provider (Ollama) initialized successfully');
      } catch (error) {
        console.error('Failed to initialize fallback provider:', error);
      }
    }
  }

  /**
   * Create a provider instance based on the provider type
   * @param type Provider type
   * @param config Provider configuration
   * @returns Provider instance
   */
  static createProvider(type: ProviderType, config: ProviderConfig): BaseProvider {
    const factory = this.providerFactories[type];
    
    if (!factory) {
      throw new Error(`No provider factory found for type: ${type}`);
    }

    return factory.createProvider(config);
  }

  /**
   * Get supported models for a specific provider type
   * @param type Provider type
   * @returns List of supported models
   */
  static getSupportedModels(type: ProviderType): string[] {
    const factory = this.providerFactories[type];
    
    if (!factory) {
      throw new Error(`No provider factory found for type: ${type}`);
    }

    return factory.getSupportedModels();
  }

  /**
   * List all available provider types
   * @returns Array of provider types
   */
  static listProviderTypes(): ProviderType[] {
    return Object.keys(this.providerFactories) as ProviderType[];
  }

  /**
   * Get the primary provider
   */
  static getPrimaryProvider(): BaseProvider {
    if (!this.primaryProvider) {
      throw new Error('Primary provider not initialized');
    }
    return this.primaryProvider;
  }

  /**
   * Get the fallback provider
   */
  static getFallbackProvider(): BaseProvider {
    if (!this.fallbackProvider) {
      throw new Error('Fallback provider not initialized');
    }
    return this.fallbackProvider;
  }

  /**
   * Execute a request with fallback
   */
  static async executeWithFallback<T>(
    request: (provider: BaseProvider) => Promise<T>
  ): Promise<T> {
    try {
      if (this.primaryProvider) {
        return await request(this.primaryProvider);
      }
      throw new Error('Primary provider not available');
    } catch (error) {
      console.warn('Primary provider failed, falling back to Ollama:', error);
      if (this.fallbackProvider) {
        return await request(this.fallbackProvider);
      }
      throw error;
    }
  }
}

// Export types
export type { 
  ProviderConfig, 
  BaseProvider,
  ChatMessage,
  ChatCompletionResponse
} from './BaseProvider';

// Export provider types for type checking
export { ProviderType };

// Export concrete provider implementations
export { 
  OpenAIProvider, 
  OpenAICompatibleProvider
};