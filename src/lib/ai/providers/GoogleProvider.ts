import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ModelConfig, ModelType } from './types';
import { RateLimiter } from './RateLimiter';

export class GoogleProvider {
  static async getModel(config: ModelConfig, apiKey: string, rateLimiter: RateLimiter) {
    const genAI = new GoogleGenerativeAI(apiKey);

    switch (config.type) {
      case ModelType.CHAT: {
        const model = genAI.getGenerativeModel({
          model: config.modelName,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE
            }
          ]
        });
        return model;
      }

      case ModelType.EMBEDDING: {
        // For Gemini embeddings
        const model = genAI.getGenerativeModel({ 
          model: config.modelName || 'embedding-001'
        });
        return model;
      }

      default:
        throw new Error(`Unsupported model type: ${config.type}`);
    }
  }

  static getSupportedModels(): string[] {
    return [
      'gemini-pro',
      'gemini-pro-vision',
      'embedding-001'
    ];
  }
}