
import { jest } from '@jest/globals';

const mockLLM = {
  chat: jest.fn().mockImplementation((messages) => 
    Promise.resolve(JSON.stringify({
      response: "Mock response",
      confidence: 0.9
    }))
  ),
  generateCompletion: jest.fn().mockResolvedValue("Mock generated text")
};

export const mockLLMResponse = mockLLM.chat;
export default mockLLM;
