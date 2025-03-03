export enum ModelType {
  CHAT = 'Chat',
  EMBEDDING = 'Embedding'
}

export enum ModelProvider {
  ANTHROPIC = 'Anthropic',
  DEEPSEEK = 'DeepSeek',
  GOOGLE = 'Google',
  GROQ = 'Groq',
  HUGGINGFACE = 'HuggingFace',
  LMSTUDIO = 'LM Studio',
  MISTRALAI = 'Mistral AI',
  OLLAMA = 'Ollama',
  OPENAI = 'OpenAI',
  OPENAI_AZURE = 'OpenAI Azure',
  OPENROUTER = 'OpenRouter',
  SAMBANOVA = 'Sambanova',
  OTHER = 'Other'
}

export interface RateLimits {
  requests: number;
  input: number;
  output: number;
}

export interface ModelConfig {
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  provider: ModelProvider;
  type: ModelType;
}