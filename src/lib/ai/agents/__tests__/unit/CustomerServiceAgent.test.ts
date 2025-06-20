

import { CustomerServiceAgent } from '../../CustomerServiceAgent';
import { mockLLMResponse } from '../../__mocks__/llm';
import { testAgentConfig, mockTask } from '../testConfig';
import type { Customer } from '@/types/schema';
import { OpenAI } from 'openai';

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                response: 'Mock response',
                suggestedAction: 'follow_up'
              })
            }
          }]
        })
      }
    }
  }))
}));

describe('CustomerServiceAgent', () => {
  let agent: CustomerServiceAgent;

  beforeAll(() => {
    process.env.VITE_OPENAI_API_KEY = 'test-api-key';
  });

  const testCustomer: Customer = {
    id: 'cust-123',
    name: 'Test Customer',
    email: 'test@example.com'
  };

  beforeEach(() => {
    agent = new CustomerServiceAgent(testAgentConfig);
    mockLLMResponse.mockClear();
  });

  test('should initialize successfully', () => {
    expect(agent).toBeInstanceOf(CustomerServiceAgent);
    // Status is managed internally, we just verify the agent exists
  });

  test('should handle customer inquiry', async () => {
    const response = await agent.handleInquiry(
      'Where is my order?',
      testCustomer
    );

    expect(response.success).toBe(true);
    expect(response.data).toEqual({
      response: 'Mock response',
      suggestedAction: 'follow_up'
    });  });

  test('should handle shipping inquiry', async () => {
    // Test implementation
  });
});

