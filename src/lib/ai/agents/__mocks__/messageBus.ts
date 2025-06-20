

import { jest } from '@jest/globals';

const mockMessageBus = {
  publish: jest.fn().mockResolvedValue(true),
  subscribe: jest.fn().mockImplementation((topic, handler) => {
    handler({ test: 'message' });
    return Promise.resolve();
  }),
  broadcast: jest.fn().mockResolvedValue(true),
  unsubscribe: jest.fn()
};

export const mockPublish = mockMessageBus.publish;
export const mockSubscribe = mockMessageBus.subscribe;
export default mockMessageBus;

