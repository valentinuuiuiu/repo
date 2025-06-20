

import type { AgentConfig } from '../../framework/types';

export const testAgentConfig: AgentConfig = {
  name: 'test-agent',
  type: 'TEST',
  defaultModel: 'gpt-4',
  failureThreshold: 3,
  resetTimeout: 10000,
  capabilities: ['test_capability']
};

export const mockTask = {
  id: 'task-123',
  type: 'test_task',
  data: { test: 'data' },
  priority: 1
};

