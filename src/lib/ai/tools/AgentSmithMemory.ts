/**
 * AgentSmithMemory
 * 
 * Inspired by AgentSmith, this tool provides enhanced memory capabilities
 * for agents, including episodic memory, semantic memory, and procedural memory.
 * It enables agents to learn from experience and improve over time.
 */

export interface MemoryItem {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural';
  content: any;
  metadata: {
    timestamp: string;
    importance: number;
    context?: string;
    source?: string;
    tags: string[];
  };
  lastAccessed?: string;
  accessCount: number;
}

export interface EpisodicMemory extends MemoryItem {
  type: 'episodic';
  content: {
    event: string;
    actors: string[];
    outcome: string;
    emotions?: string[];
  };
}

export interface SemanticMemory extends MemoryItem {
  type: 'semantic';
  content: {
    concept: string;
    definition: string;
    relationships: Array<{ concept: string; relationship: string }>;
  };
}

export interface ProceduralMemory extends MemoryItem {
  type: 'procedural';
  content: {
    task: string;
    steps: string[];
    conditions: string[];
    successRate: number;
  };
}

export interface MemoryQuery {
  type?: 'episodic' | 'semantic' | 'procedural';
  tags?: string[];
  timeRange?: { start?: string; end?: string };
  content?: Record<string, any>;
  importance?: { min?: number; max?: number };
  limit?: number;
}

export class AgentSmithMemory {
  private memories: Map<string, MemoryItem>;
  private agentId: string;
  private decayFactor: number;
  private lastConsolidation: string;
  
  constructor(agentId: string, decayFactor: number = 0.95) {
    this.memories = new Map();
    this.agentId = agentId;
    this.decayFactor = decayFactor;
    this.lastConsolidation = new Date().toISOString();
  }
  
  /**
   * Store an episodic memory
   */
  storeEpisodic(
    event: string,
    actors: string[],
    outcome: string,
    importance: number,
    tags: string[] = [],
    emotions?: string[]
  ): EpisodicMemory {
    const id = `episodic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const memory: EpisodicMemory = {
      id,
      type: 'episodic',
      content: {
        event,
        actors,
        outcome,
        emotions
      },
      metadata: {
        timestamp,
        importance,
        tags: [...tags, 'episodic']
      },
      accessCount: 0
    };
    
    this.memories.set(id, memory);
    return memory;
  }
  
  /**
   * Store a semantic memory
   */
  storeSemantic(
    concept: string,
    definition: string,
    relationships: Array<{ concept: string; relationship: string }>,
    importance: number,
    tags: string[] = []
  ): SemanticMemory {
    const id = `semantic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const memory: SemanticMemory = {
      id,
      type: 'semantic',
      content: {
        concept,
        definition,
        relationships
      },
      metadata: {
        timestamp,
        importance,
        tags: [...tags, 'semantic']
      },
      accessCount: 0
    };
    
    this.memories.set(id, memory);
    return memory;
  }
  
  /**
   * Store a procedural memory
   */
  storeProcedural(
    task: string,
    steps: string[],
    conditions: string[],
    successRate: number,
    importance: number,
    tags: string[] = []
  ): ProceduralMemory {
    const id = `procedural-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const memory: ProceduralMemory = {
      id,
      type: 'procedural',
      content: {
        task,
        steps,
        conditions,
        successRate
      },
      metadata: {
        timestamp,
        importance,
        tags: [...tags, 'procedural']
      },
      accessCount: 0
    };
    
    this.memories.set(id, memory);
    return memory;
  }
  
  /**
   * Retrieve a memory by ID
   */
  retrieve(id: string): MemoryItem | null {
    const memory = this.memories.get(id);
    
    if (!memory) {
      return null;
    }
    
    // Update access metadata
    memory.lastAccessed = new Date().toISOString();
    memory.accessCount += 1;
    
    return memory;
  }
  
  /**
   * Query memories
   */
  query(query: MemoryQuery): MemoryItem[] {
    let results = Array.from(this.memories.values());
    
    // Filter by type
    if (query.type) {
      results = results.filter(memory => memory.type === query.type);
    }
    
    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter(memory => 
        query.tags!.some(tag => memory.metadata.tags.includes(tag))
      );
    }
    
    // Filter by time range
    if (query.timeRange) {
      if (query.timeRange.start) {
        const startTime = new Date(query.timeRange.start).getTime();
        results = results.filter(memory => 
          new Date(memory.metadata.timestamp).getTime() >= startTime
        );
      }
      
      if (query.timeRange.end) {
        const endTime = new Date(query.timeRange.end).getTime();
        results = results.filter(memory => 
          new Date(memory.metadata.timestamp).getTime() <= endTime
        );
      }
    }
    
    // Filter by content
    if (query.content) {
      results = results.filter(memory => {
        for (const [key, value] of Object.entries(query.content!)) {
          if (typeof memory.content[key] === 'undefined' || memory.content[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Filter by importance
    if (query.importance) {
      if (typeof query.importance.min !== 'undefined') {
        results = results.filter(memory => 
          memory.metadata.importance >= query.importance!.min!
        );
      }
      
      if (typeof query.importance.max !== 'undefined') {
        results = results.filter(memory => 
          memory.metadata.importance <= query.importance!.max!
        );
      }
    }
    
    // Sort by importance (highest first)
    results.sort((a, b) => b.metadata.importance - a.metadata.importance);
    
    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }
    
    // Update access metadata for retrieved memories
    const now = new Date().toISOString();
    for (const memory of results) {
      memory.lastAccessed = now;
      memory.accessCount += 1;
    }
    
    return results;
  }
  
  /**
   * Search memories by text
   */
  search(text: string, limit: number = 10): MemoryItem[] {
    const searchTerms = text.toLowerCase().split(' ');
    const results: Array<{ memory: MemoryItem; score: number }> = [];
    
    for (const [, memory] of this.memories) {
      let score = 0;
      const memoryText = JSON.stringify(memory.content).toLowerCase();
      
      for (const term of searchTerms) {
        if (memoryText.includes(term)) {
          score += 1;
          
          // Bonus for exact matches of important fields
          if (memory.type === 'episodic' && 
              (memory.content.event.toLowerCase().includes(term) || 
               memory.content.outcome.toLowerCase().includes(term))) {
            score += 2;
          } else if (memory.type === 'semantic' && 
                    (memory.content.concept.toLowerCase().includes(term) || 
                     memory.content.definition.toLowerCase().includes(term))) {
            score += 2;
          } else if (memory.type === 'procedural' && 
                    memory.content.task.toLowerCase().includes(term)) {
            score += 2;
          }
        }
      }
      
      if (score > 0) {
        // Adjust score by importance
        score *= memory.metadata.importance;
        results.push({ memory, score });
      }
    }
    
    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    // Get top results
    const topResults = results.slice(0, limit).map(r => r.memory);
    
    // Update access metadata
    const now = new Date().toISOString();
    for (const memory of topResults) {
      memory.lastAccessed = now;
      memory.accessCount += 1;
    }
    
    return topResults;
  }
  
  /**
   * Update a memory
   */
  update(id: string, updates: Partial<MemoryItem>): MemoryItem | null {
    const memory = this.memories.get(id);
    
    if (!memory) {
      return null;
    }
    
    // Apply updates
    if (updates.content) {
      memory.content = {
        ...memory.content,
        ...updates.content
      };
    }
    
    if (updates.metadata) {
      memory.metadata = {
        ...memory.metadata,
        ...updates.metadata
      };
    }
    
    return memory;
  }
  
  /**
   * Delete a memory
   */
  delete(id: string): boolean {
    return this.memories.delete(id);
  }
  
  /**
   * Consolidate memories (simulate memory consolidation during "sleep")
   * This process:
   * 1. Decays less important memories
   * 2. Strengthens frequently accessed memories
   * 3. Creates new connections between related memories
   */
  consolidate(): void {
    const now = new Date();
    const nowStr = now.toISOString();
    
    // Calculate time since last consolidation (in hours)
    const lastTime = new Date(this.lastConsolidation).getTime();
    const hoursSinceLastConsolidation = (now.getTime() - lastTime) / (1000 * 60 * 60);
    
    // Only consolidate if enough time has passed (e.g., 24 hours)
    if (hoursSinceLastConsolidation < 24) {
      return;
    }
    
    // Process each memory
    for (const [id, memory] of this.memories) {
      // 1. Apply decay to importance based on time and access
      const memoryAge = (now.getTime() - new Date(memory.metadata.timestamp).getTime()) / (1000 * 60 * 60 * 24); // in days
      
      // Memories that haven't been accessed decay faster
      const accessFactor = memory.accessCount > 0 ? 1 : 0.5;
      
      // Calculate decay amount
      const decayAmount = (memoryAge * 0.01) * accessFactor;
      
      // Apply decay
      memory.metadata.importance *= Math.max(this.decayFactor, 1 - decayAmount);
      
      // Remove memories that have decayed too much
      if (memory.metadata.importance < 0.1) {
        this.memories.delete(id);
        continue;
      }
      
      // 2. Strengthen frequently accessed memories
      if (memory.lastAccessed) {
        const daysSinceLastAccess = (now.getTime() - new Date(memory.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastAccess < 7 && memory.accessCount > 3) {
          // Frequently accessed recent memories get strengthened
          memory.metadata.importance = Math.min(1, memory.metadata.importance * 1.2);
        }
      }
    }
    
    // 3. Create connections between related memories (for semantic memories)
    this.createSemanticConnections();
    
    // Update last consolidation time
    this.lastConsolidation = nowStr;
  }
  
  /**
   * Create connections between related semantic memories
   */
  private createSemanticConnections(): void {
    const semanticMemories = Array.from(this.memories.values())
      .filter(memory => memory.type === 'semantic') as SemanticMemory[];
    
    // For each semantic memory, find related concepts
    for (const memory of semanticMemories) {
      const concept = memory.content.concept.toLowerCase();
      
      for (const otherMemory of semanticMemories) {
        if (memory.id === otherMemory.id) {
          continue;
        }
        
        const otherConcept = otherMemory.content.concept.toLowerCase();
        
        // Check if concepts are related
        const isRelated = memory.content.definition.toLowerCase().includes(otherConcept) ||
                          otherMemory.content.definition.toLowerCase().includes(concept);
        
        if (isRelated) {
          // Check if relationship already exists
          const existingRelationship = memory.content.relationships.find(r => 
            r.concept.toLowerCase() === otherConcept
          );
          
          if (!existingRelationship) {
            // Add new relationship
            memory.content.relationships.push({
              concept: otherMemory.content.concept,
              relationship: 'related'
            });
          }
        }
      }
    }
  }
  
  /**
   * Get memory statistics
   */
  getStats() {
    const totalMemories = this.memories.size;
    const episodicCount = Array.from(this.memories.values()).filter(m => m.type === 'episodic').length;
    const semanticCount = Array.from(this.memories.values()).filter(m => m.type === 'semantic').length;
    const proceduralCount = Array.from(this.memories.values()).filter(m => m.type === 'procedural').length;
    
    const avgImportance = Array.from(this.memories.values())
      .reduce((sum, m) => sum + m.metadata.importance, 0) / totalMemories;
    
    const avgAccessCount = Array.from(this.memories.values())
      .reduce((sum, m) => sum + m.accessCount, 0) / totalMemories;
    
    return {
      totalMemories,
      episodicCount,
      semanticCount,
      proceduralCount,
      avgImportance,
      avgAccessCount,
      lastConsolidation: this.lastConsolidation
    };
  }
  
  /**
   * Export memories to JSON
   */
  export(): string {
    return JSON.stringify(Array.from(this.memories.values()));
  }
  
  /**
   * Import memories from JSON
   */
  import(json: string): boolean {
    try {
      const memories = JSON.parse(json) as MemoryItem[];
      
      for (const memory of memories) {
        this.memories.set(memory.id, memory);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing memories:', error);
      return false;
    }
  }
}

export default AgentSmithMemory;