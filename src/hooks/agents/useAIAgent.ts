import { useState, useCallback, useEffect, useRef } from 'react';
import { AgentStatus, AgentType, AgentResponse } from '../../types/agent';

interface AgentContextData {
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  metadata?: Record<string, string | number | boolean>;
}

interface UseAIAgentOptions {
  agentType: AgentType;
  initialContext?: AgentContextData;
  onStatusChange?: (status: AgentStatus) => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

interface AgentState {
  status: AgentStatus;
  context: AgentContextData;
  history: AgentResponse[];
  error: Error | null;
}

/**
 * Hook for interacting with AI agents
 * Provides connection management, message sending, and state tracking
 */
export const useAIAgent = ({
  agentType,
  initialContext = {},
  onStatusChange,
  onError,
  autoConnect = false,
  retryCount = 3,
  retryDelay = 1000,
}: UseAIAgentOptions) => {
  const [state, setState] = useState<AgentState>({
    status: AgentStatus.IDLE,
    context: initialContext,
    history: [],
    error: null,
  });
  
  // Use refs to track retry attempts and pending requests
  const retryAttemptsRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup retry timeout
  const cleanupRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Initialize agent connection
  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: AgentStatus.CONNECTING }));
      onStatusChange?.(AgentStatus.CONNECTING);
      
      // Create a new abort controller for this connection
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/agent/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentType, 
          context: initialContext 
        }),
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to connect to agent: ${response.statusText}`);
      }
      
      setState(prev => ({ 
        ...prev, 
        status: AgentStatus.CONNECTED,
        error: null,
        context: {
          ...prev.context,
          ...data.context
        }
      }));
      onStatusChange?.(AgentStatus.CONNECTED);
      retryAttemptsRef.current = 0; // Reset retry counter on successful connection
      cleanupRetry(); // Clear any pending retries
    } catch (error) {
      // Don't handle aborted requests as errors
      if ((error as Error).name === 'AbortError') {
        return;
      }
      
      setState(prev => ({ 
        ...prev, 
        status: AgentStatus.ERROR,
        error: error as Error 
      }));
      
      onError?.(error as Error);
      
      // Implement retry logic with exponential backoff
      if (retryAttemptsRef.current < retryCount) {
        retryAttemptsRef.current++;
        console.log(`Retrying connection (${retryAttemptsRef.current}/${retryCount})...`);
        
        const delay = Math.min(retryDelay * Math.pow(2, retryAttemptsRef.current - 1), 30000);
        retryTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    }
  }, [agentType, initialContext, onStatusChange, onError, retryCount, retryDelay, cleanupRetry]);

  // Send message to agent
  const sendMessage = useCallback(async (message: string, context?: Record<string, any>): Promise<AgentResponse> => {
    try {
      setState(prev => ({ ...prev, status: AgentStatus.PROCESSING }));
      onStatusChange?.(AgentStatus.PROCESSING);
      
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/agent/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          message,
          context: { ...state.context, ...context }
        }),
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to send message: ${response.statusText}`);
      }
      
      setState(prev => ({
        ...prev,
        status: AgentStatus.CONNECTED,
        history: [...prev.history, data],
        context: { ...prev.context, ...context },
        error: null
      }));
      onStatusChange?.(AgentStatus.CONNECTED);

      return data;
    } catch (error) {
      // Don't handle aborted requests as errors
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      
      const agentError = {
        status: AgentStatus.ERROR,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
      
      setState(prev => ({ 
        ...prev, 
        ...agentError
      }));
      
      onError?.(agentError.error);
      throw agentError.error;
    }
  }, [agentType, state.context, onStatusChange, onError]);

  // Reset agent state
  const reset = useCallback(() => {
    cleanupRetry();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState({
      status: AgentStatus.IDLE,
      context: initialContext,
      history: [],
      error: null,
    });
    onStatusChange?.(AgentStatus.IDLE);
  }, [initialContext, onStatusChange, cleanupRetry]);

  // Disconnect agent
  const disconnect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: AgentStatus.DISCONNECTING }));
      onStatusChange?.(AgentStatus.DISCONNECTING);
      
      // Cleanup any pending operations
      cleanupRetry();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // Call disconnect API
      const response = await fetch('/api/agent/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentType })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to disconnect agent: ${response.statusText}`);
      }
      
      setState(prev => ({ 
        ...prev, 
        status: AgentStatus.IDLE,
        error: null
      }));
      onStatusChange?.(AgentStatus.IDLE);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        status: AgentStatus.ERROR,
        error: error as Error 
      }));
      
      onError?.(error as Error);
      throw error;
    }
  }, [agentType, onStatusChange, onError, cleanupRetry]);

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Cleanup function
    return () => {
      cleanupRetry();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Only call disconnect if we're connected or connecting
      if (state.status === AgentStatus.CONNECTED || 
          state.status === AgentStatus.CONNECTING) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, state.status, cleanupRetry]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    reset,
    isLoading: state.status === AgentStatus.CONNECTING || state.status === AgentStatus.PROCESSING,
    isConnected: state.status === AgentStatus.CONNECTED,
    isError: state.status === AgentStatus.ERROR,
  };
};