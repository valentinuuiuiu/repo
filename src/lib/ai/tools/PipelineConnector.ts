/**
 * PipelineConnector
 * 
 * Inspired by AutoGen's communication patterns, this tool enables
 * structured communication between agents and departments.
 * It creates pipelines for data flow and task coordination.
 */

import { EventEmitter } from 'events';

export interface Message {
  id: string;
  from: string;
  to: string | string[];
  type: 'request' | 'response' | 'notification' | 'broadcast';
  subject: string;
  content: any;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  participants: string[];
  messageTypes: string[];
  status: 'active' | 'paused' | 'closed';
  created: string;
  updated: string;
}

export interface PipelineStats {
  messageCount: number;
  participantStats: Record<string, {
    sent: number;
    received: number;
    lastActive: string;
  }>;
  startTime: string;
  lastMessageTime: string;
}

export class PipelineConnector {
  private eventBus: EventEmitter;
  private pipelines: Map<string, Pipeline>;
  private messages: Map<string, Message>;
  private pipelineStats: Map<string, PipelineStats>;
  private agentSubscriptions: Map<string, Set<string>>;
  
  constructor() {
    this.eventBus = new EventEmitter();
    this.pipelines = new Map();
    this.messages = new Map();
    this.pipelineStats = new Map();
    this.agentSubscriptions = new Map();
    
    // Increase max listeners to avoid warnings
    this.eventBus.setMaxListeners(100);
  }
  
  /**
   * Create a new pipeline
   */
  createPipeline(pipelineData: Omit<Pipeline, 'id' | 'created' | 'updated'>): Pipeline {
    const id = `pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const pipeline: Pipeline = {
      ...pipelineData,
      id,
      created: timestamp,
      updated: timestamp
    };
    
    this.pipelines.set(id, pipeline);
    
    // Initialize stats
    this.pipelineStats.set(id, {
      messageCount: 0,
      participantStats: {},
      startTime: timestamp,
      lastMessageTime: timestamp
    });
    
    // Initialize participant stats
    for (const participant of pipeline.participants) {
      this.pipelineStats.get(id)!.participantStats[participant] = {
        sent: 0,
        received: 0,
        lastActive: timestamp
      };
      
      // Subscribe participants to pipeline
      if (!this.agentSubscriptions.has(participant)) {
        this.agentSubscriptions.set(participant, new Set());
      }
      this.agentSubscriptions.get(participant)!.add(id);
    }
    
    return pipeline;
  }
  
  /**
   * Send a message through a pipeline
   */
  sendMessage(pipelineId: string, messageData: Omit<Message, 'id' | 'timestamp'>): Message | null {
    const pipeline = this.pipelines.get(pipelineId);
    
    if (!pipeline || pipeline.status !== 'active') {
      return null;
    }
    
    // Validate sender and recipients
    if (!pipeline.participants.includes(messageData.from)) {
      return null;
    }
    
    const recipients = Array.isArray(messageData.to) 
      ? messageData.to 
      : [messageData.to];
      
    for (const recipient of recipients) {
      if (recipient !== '*' && !pipeline.participants.includes(recipient)) {
        return null;
      }
    }
    
    // Create message
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const message: Message = {
      ...messageData,
      id,
      timestamp
    };
    
    this.messages.set(id, message);
    
    // Update stats
    const stats = this.pipelineStats.get(pipelineId)!;
    stats.messageCount++;
    stats.lastMessageTime = timestamp;
    stats.participantStats[messageData.from].sent++;
    stats.participantStats[messageData.from].lastActive = timestamp;
    
    // Deliver message
    if (messageData.to === '*') {
      // Broadcast to all participants
      for (const participant of pipeline.participants) {
        if (participant !== messageData.from) {
          this.deliverMessage(participant, message);
          stats.participantStats[participant].received++;
        }
      }
    } else {
      // Deliver to specific recipients
      for (const recipient of recipients) {
        this.deliverMessage(recipient, message);
        stats.participantStats[recipient].received++;
        stats.participantStats[recipient].lastActive = timestamp;
      }
    }
    
    return message;
  }
  
  /**
   * Deliver a message to a recipient
   */
  private deliverMessage(recipient: string, message: Message): void {
    // Emit event for recipient
    this.eventBus.emit(`message:${recipient}`, message);
    
    // Also emit event for the pipeline
    const pipelineIds = this.agentSubscriptions.get(recipient) || new Set();
    for (const pipelineId of pipelineIds) {
      this.eventBus.emit(`pipeline:${pipelineId}:message`, message);
    }
  }
  
  /**
   * Subscribe to messages
   */
  subscribeToMessages(agentId: string, callback: (message: Message) => void): () => void {
    const eventName = `message:${agentId}`;
    this.eventBus.on(eventName, callback);
    
    // Return unsubscribe function
    return () => {
      this.eventBus.off(eventName, callback);
    };
  }
  
  /**
   * Subscribe to pipeline events
   */
  subscribeToPipeline(pipelineId: string, callback: (message: Message) => void): () => void {
    const eventName = `pipeline:${pipelineId}:message`;
    this.eventBus.on(eventName, callback);
    
    // Return unsubscribe function
    return () => {
      this.eventBus.off(eventName, callback);
    };
  }
  
  /**
   * Get pipeline by ID
   */
  getPipeline(id: string): Pipeline | undefined {
    return this.pipelines.get(id);
  }
  
  /**
   * Get pipeline stats
   */
  getPipelineStats(id: string): PipelineStats | undefined {
    return this.pipelineStats.get(id);
  }
  
  /**
   * Get messages for a pipeline
   */
  getPipelineMessages(pipelineId: string, limit: number = 100): Message[] {
    const pipeline = this.pipelines.get(pipelineId);
    
    if (!pipeline) {
      return [];
    }
    
    // Get all messages and filter by pipeline participants
    const pipelineMessages: Message[] = [];
    
    for (const [, message] of this.messages) {
      if (pipeline.participants.includes(message.from)) {
        const recipients = Array.isArray(message.to) ? message.to : [message.to];
        
        if (message.to === '*' || recipients.some(r => pipeline.participants.includes(r))) {
          pipelineMessages.push(message);
        }
      }
    }
    
    // Sort by timestamp (newest first) and limit
    return pipelineMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  /**
   * Add participant to pipeline
   */
  addParticipant(pipelineId: string, participantId: string): boolean {
    const pipeline = this.pipelines.get(pipelineId);
    
    if (!pipeline) {
      return false;
    }
    
    if (pipeline.participants.includes(participantId)) {
      return true; // Already a participant
    }
    
    pipeline.participants.push(participantId);
    pipeline.updated = new Date().toISOString();
    
    // Initialize participant stats
    const stats = this.pipelineStats.get(pipelineId)!;
    stats.participantStats[participantId] = {
      sent: 0,
      received: 0,
      lastActive: pipeline.updated
    };
    
    // Subscribe participant to pipeline
    if (!this.agentSubscriptions.has(participantId)) {
      this.agentSubscriptions.set(participantId, new Set());
    }
    this.agentSubscriptions.get(participantId)!.add(pipelineId);
    
    return true;
  }
  
  /**
   * Remove participant from pipeline
   */
  removeParticipant(pipelineId: string, participantId: string): boolean {
    const pipeline = this.pipelines.get(pipelineId);
    
    if (!pipeline) {
      return false;
    }
    
    const index = pipeline.participants.indexOf(participantId);
    
    if (index === -1) {
      return false; // Not a participant
    }
    
    pipeline.participants.splice(index, 1);
    pipeline.updated = new Date().toISOString();
    
    // Unsubscribe participant from pipeline
    this.agentSubscriptions.get(participantId)?.delete(pipelineId);
    
    return true;
  }
  
  /**
   * Close a pipeline
   */
  closePipeline(pipelineId: string): boolean {
    const pipeline = this.pipelines.get(pipelineId);
    
    if (!pipeline) {
      return false;
    }
    
    pipeline.status = 'closed';
    pipeline.updated = new Date().toISOString();
    
    // Unsubscribe all participants
    for (const participant of pipeline.participants) {
      this.agentSubscriptions.get(participant)?.delete(pipelineId);
    }
    
    return true;
  }
  
  /**
   * Get all pipelines for a participant
   */
  getParticipantPipelines(participantId: string): Pipeline[] {
    const pipelineIds = this.agentSubscriptions.get(participantId) || new Set();
    const pipelines: Pipeline[] = [];
    
    for (const id of pipelineIds) {
      const pipeline = this.pipelines.get(id);
      if (pipeline) {
        pipelines.push(pipeline);
      }
    }
    
    return pipelines;
  }
  
  /**
   * Create a request-response pattern
   */
  async request(
    pipelineId: string, 
    from: string, 
    to: string, 
    subject: string, 
    content: any, 
    timeout: number = 30000
  ): Promise<Message | null> {
    return new Promise((resolve) => {
      // Create a unique response identifier
      const responseId = `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Set up response listener
      const responseListener = (message: Message) => {
        if (message.from === to && 
            message.to === from && 
            message.type === 'response' && 
            message.metadata?.responseId === responseId) {
          // Got the response
          cleanup();
          resolve(message);
        }
      };
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        cleanup();
        resolve(null);
      }, timeout);
      
      // Function to clean up listeners
      const cleanup = () => {
        clearTimeout(timeoutId);
        this.eventBus.off(`message:${from}`, responseListener);
      };
      
      // Listen for response
      this.eventBus.on(`message:${from}`, responseListener);
      
      // Send request
      this.sendMessage(pipelineId, {
        from,
        to,
        type: 'request',
        subject,
        content,
        metadata: {
          responseId,
          expectsResponse: true
        }
      });
    });
  }
  
  /**
   * Respond to a request
   */
  respond(pipelineId: string, request: Message, content: any): Message | null {
    if (!request.metadata?.expectsResponse) {
      return null;
    }
    
    return this.sendMessage(pipelineId, {
      from: Array.isArray(request.to) ? request.to[0] : request.to,
      to: request.from,
      type: 'response',
      subject: `Re: ${request.subject}`,
      content,
      metadata: {
        responseId: request.metadata.responseId,
        inResponseTo: request.id
      }
    });
  }
}

export default PipelineConnector;