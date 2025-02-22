// Mock implementation of ChromaDB for browser environments
export class Collection {
  private name: string;
  private data: {
    ids: string[];
    embeddings: number[][];
    metadatas: Record<string, any>[];
  };

  constructor(name: string) {
    this.name = name;
    this.data = {
      ids: [],
      embeddings: [],
      metadatas: [],
    };
  }

  async add(params: {
    ids: string[];
    embeddings: number[][];
    metadatas?: Record<string, any>[];
  }) {
    const { ids, embeddings, metadatas = [] } = params;
    this.data.ids.push(...ids);
    this.data.embeddings.push(...embeddings);
    this.data.metadatas.push(...metadatas);
    return { success: true };
  }

  async upsert(params: {
    ids: string[];
    embeddings: number[][];
    metadatas?: Record<string, any>[];
  }) {
    // Remove existing entries with same IDs
    const existingIndices = new Set<number>();
    params.ids.forEach(id => {
      const index = this.data.ids.indexOf(id);
      if (index !== -1) existingIndices.add(index);
    });

    // Filter out existing entries
    this.data.ids = this.data.ids.filter((_, i) => !existingIndices.has(i));
    this.data.embeddings = this.data.embeddings.filter((_, i) => !existingIndices.has(i));
    this.data.metadatas = this.data.metadatas.filter((_, i) => !existingIndices.has(i));

    // Add new entries
    return this.add(params);
  }

  async delete(params: { ids: string[] }) {
    const indicesToDelete = new Set<number>();
    params.ids.forEach(id => {
      const index = this.data.ids.indexOf(id);
      if (index !== -1) indicesToDelete.add(index);
    });

    this.data.ids = this.data.ids.filter((_, i) => !indicesToDelete.has(i));
    this.data.embeddings = this.data.embeddings.filter((_, i) => !indicesToDelete.has(i));
    this.data.metadatas = this.data.metadatas.filter((_, i) => !indicesToDelete.has(i));

    return { success: true };
  }

  async query(params: {
    queryEmbeddings: number[][];
    nResults?: number;
    where?: Record<string, any>;
    include?: string[];
  }) {
    const { queryEmbeddings, nResults = 10, where = {}, include = [] } = params;
    
    // Simple cosine similarity implementation
    const cosineSimilarity = (a: number[], b: number[]): number => {
      const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dotProduct / (magnitudeA * magnitudeB);
    };

    // Filter by where clause if provided
    const filteredIndices = this.data.ids.map((_, i) => i).filter(i => {
      const metadata = this.data.metadatas[i] || {};
      return Object.entries(where).every(([key, value]) => metadata[key] === value);
    });

    // Calculate distances and sort
    const results = filteredIndices.map(i => ({
      id: this.data.ids[i],
      embedding: this.data.embeddings[i],
      metadata: this.data.metadatas[i],
      distance: 1 - cosineSimilarity(queryEmbeddings[0], this.data.embeddings[i]),
      index: i,
    }));

    results.sort((a, b) => a.distance - b.distance);
    const topResults = results.slice(0, nResults);

    // Format response based on include parameter
    return {
      ids: [topResults.map(r => r.id)],
      distances: [topResults.map(r => r.distance)],
      metadatas: include.includes('metadatas') ? [topResults.map(r => r.metadata)] : undefined,
      embeddings: include.includes('embeddings') ? [topResults.map(r => r.embedding)] : undefined,
    };
  }

  async peek(limit?: number) {
    const n = limit || 10;
    return {
      ids: this.data.ids.slice(0, n),
      embeddings: this.data.embeddings.slice(0, n),
      metadatas: this.data.metadatas.slice(0, n),
    };
  }

  async count() {
    return this.data.ids.length;
  }
}

export class ChromaClient {
  private collections: Map<string, Collection>;

  constructor() {
    this.collections = new Map();
  }

  async createCollection(name: string): Promise<Collection> {
    if (this.collections.has(name)) {
      throw new Error(`Collection ${name} already exists`);
    }
    const collection = new Collection(name);
    this.collections.set(name, collection);
    return collection;
  }

  async getCollection(name: string): Promise<Collection> {
    const collection = this.collections.get(name);
    if (!collection) {
      throw new Error(`Collection ${name} does not exist`);
    }
    return collection;
  }

  async getOrCreateCollection(name: string): Promise<Collection> {
    if (!this.collections.has(name)) {
      return this.createCollection(name);
    }
    return this.getCollection(name);
  }

  async listCollections() {
    return Array.from(this.collections.keys()).map(name => ({
      name,
      metadata: null
    }));
  }

  async deleteCollection(name: string) {
    if (!this.collections.has(name)) {
      throw new Error(`Collection ${name} does not exist`);
    }
    this.collections.delete(name);
    return { success: true };
  }

  async reset() {
    this.collections.clear();
    return { success: true };
  }
}

export default {
  ChromaClient,
  Collection,
};