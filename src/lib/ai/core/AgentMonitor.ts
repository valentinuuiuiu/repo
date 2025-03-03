import { AgentType } from '@prisma/client';
import { CircuitBreaker } from '../core/CircuitBreaker';

interface MonitorState {
  errors: number;
  consecutiveFailures: number;
  lastCheck: Date;
  status: 'healthy' | 'warning' | 'error';
  events: Array<{ type: string; timestamp: number; data?: any }>;
  persistedState?: any;
}

export class AgentMonitor {
  private states: Map<string, MonitorState>;
  private circuitBreaker: CircuitBreaker;
  
  constructor() {
    this.states = new Map();
    this.circuitBreaker = new CircuitBreaker();
  }

  monitorAgent(agentId: string, type: AgentType) {
    if (!this.states.has(agentId)) {
      this.states.set(agentId, {
        errors: 0,
        consecutiveFailures: 0,
        lastCheck: new Date(),
        status: 'healthy',
        events: []
      });
    }
  }

  recordError(agentId: string, error: Error) {
    const state = this.states.get(agentId);
    if (!state) return;
    state.errors++;
    state.consecutiveFailures++;
    state.lastCheck = new Date();
    if (state.consecutiveFailures >= 5) {
      state.status = 'error';
      this.circuitBreaker.recordFailure();
    } else if (state.consecutiveFailures >= 3) {
      state.status = 'warning';
    }
    this.states.set(agentId, state);

    // Record error event
    this.recordEvent(agentId, 'error', { error: error.message });
  }

  recordSuccess(agentId: string) {
    const state = this.states.get(agentId);
    if (!state) return;
    state.consecutiveFailures = 0;
    state.lastCheck = new Date();
    state.status = 'healthy';
    this.circuitBreaker.recordSuccess();
    this.states.set(agentId, state);

    // Record success event
    this.recordEvent(agentId, 'success');
  }

  recordEvent(agentId: string, eventType: string, data?: any) {
    const state = this.states.get(agentId);
    if (!state) return;

    state.events.push({
      type: eventType,
      timestamp: Date.now(),
      data
    });

    // Keep only last 100 events
    if (state.events.length > 100) {
      state.events = state.events.slice(-100);
    }

    this.states.set(agentId, state);
  }

  recordState(agentId: string, state: any) {
    const monitorState = this.states.get(agentId);
    if (!monitorState) return;

    monitorState.persistedState = state;
    this.states.set(agentId, monitorState);
  }

  getAgentState(agentId: string): MonitorState | null {
    return this.states.get(agentId) || null;
  }

  getCircuitBreakerState() {
    return this.circuitBreaker.getState();
  }

  getEvents(agentId: string) {
    const state = this.states.get(agentId);
    return state?.events || [];
  }

  getPersistedState(agentId: string) {
    const state = this.states.get(agentId);
    return state?.persistedState;
  }
}