

process.env.VITE_OPENAI_API_KEY = 'test-api-key';
process.env.NODE_ENV = 'test';

const { mockLLMResponse } = require('./src/lib/ai/agents/__mocks__/llm');
const { mockPublish, mockSubscribe } = require('./src/lib/ai/agents/__mocks__/messageBus');

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
  mockLLMResponse.mockReset();
  mockPublish.mockReset();
  mockSubscribe.mockReset();
  
  // Reset environment variables
  process.env.VITE_OPENAI_API_KEY = 'test-api-key';
});

module.exports = {};

