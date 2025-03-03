import { ProviderManager, ProviderType } from '../src/lib/ai/providers/ProviderManager';
import { ChatMessage } from '../src/lib/ai/providers/BaseProvider';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('Initializing AI providers...');

  // Test Ollama connection and pull model if needed
  try {
    console.log('Testing Ollama connection...');
    const response = await axios.get('http://localhost:11434/api/list');
    
    // Check if our model is available
    const models = response.data.models || [];
    const hasModel = models.some(
      (model: any) => model.name === 'sisaai/sisaai-tulu3-llama3.1'
    );
    
    if (!hasModel) {
      console.log('Pulling sisaai/sisaai-tulu3-llama3.1 model...');
      await axios.post('http://localhost:11434/api/pull', {
        name: 'sisaai/sisaai-tulu3-llama3.1',
        tag: 'latest'
      });
      console.log('Model pulled successfully');
    } else {
      console.log('Required model is already available');
    }
  } catch (error) {
    console.error('Error connecting to Ollama:', error.message);
  } // Added missing closing brace here

  // Test primary provider (OpenAI)
  try {
    const response = await ProviderManager.getPrimaryProvider().chat([
      { role: 'user', content: 'Test message' }
    ]);
    console.log('Primary provider (OpenAI) test successful');
  } catch (error) {
    console.warn('Primary provider test failed:', error);
  }

  // Test fallback provider (Ollama)
  try {
    const response = await ProviderManager.getFallbackProvider().chat([
      { role: 'user', content: 'Test message' }
    ]);
    console.log('Fallback provider (Ollama) test successful');
  } catch (error) {
    console.error('Fallback provider test failed:', error);
    process.exit(1);
  }

  console.log('AI providers initialized successfully');
}

main().catch(console.error);