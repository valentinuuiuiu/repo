import { ChromaClient, Collection } from "chromadb";

// Configure ChromaDB client with environment variables
export const chroma = new ChromaClient({
  path: import.meta.env.VITE_CHROMADB_URL || 'http://localhost:8000',
  auth: {
    provider: import.meta.env.VITE_CHROMADB_AUTH_PROVIDER,
    credentials: import.meta.env.VITE_CHROMADB_AUTH_CREDENTIALS,
  },
});

// Collection cache to avoid repeated getCollection calls
const collectionsCache = new Map<string, Collection>();

export async function getOrCreateCollection(name: string, metadata?: Record<string, any>) {
  try {
    if (collectionsCache.has(name)) {
      return collectionsCache.get(name)!;
    }

    let collection;
    try {
      collection = await chroma.getCollection(name);
    } catch {
      collection = await chroma.createCollection(name, {
        metadata: metadata || {},
        embeddingFunction: {
          dimensionality: 1536 // OpenAI embeddings dimension
        }
      });
    }

    collectionsCache.set(name, collection);
    return collection;
  } catch (error) {
    console.error(`Error getting/creating collection ${name}:`, error);
    throw new Error(`ChromaDB collection error: ${error.message}`);
  }
}

export async function initializeCollections() {
  try {
    // Create collections for different entity types with metadata
    const collections = {
      products: await getOrCreateCollection("products", {
        description: "Product embeddings for semantic search and recommendations",
        schema: { title: "string", description: "string", category: "string" }
      }),
      customers: await getOrCreateCollection("customers", {
        description: "Customer embeddings for behavior analysis and segmentation",
        schema: { preferences: "string", history: "string" }
      }),
      suppliers: await getOrCreateCollection("suppliers", {
        description: "Supplier embeddings for matching and analysis",
        schema: { specialties: "string", performance: "string" }
      }),
      orders: await getOrCreateCollection("orders", {
        description: "Order embeddings for pattern detection",
        schema: { items: "string", customer: "string" }
      }),
    };

    return collections;
  } catch (error) {
    console.error("Error initializing ChromaDB collections:", error);
    throw new Error(`ChromaDB initialization error: ${error.message}`);
  }
}

export async function storeEmbedding(
  collectionName: string,
  data: {
    id: string;
    embedding: number[];
    metadata: Record<string, any>;
  },
) {
  try {
    const collection = await getOrCreateCollection(collectionName);
    await collection.add({
      ids: [data.id],
      embeddings: [data.embedding],
      metadatas: [data.metadata],
    });
  } catch (error) {
    console.error(`Error storing embedding in ${collectionName}:`, error);
    throw new Error(`ChromaDB storage error: ${error.message}`);
  }
}

export async function querySimilar(
  collectionName: string,
  embedding: number[],
  limit: number = 5,
  where?: Record<string, any>
) {
  try {
    const collection = await getOrCreateCollection(collectionName);
    return await collection.query({
      queryEmbeddings: [embedding],
      nResults: limit,
      where: where,
      include: ["metadatas", "distances", "embeddings"]
    });
  } catch (error) {
    console.error(`Error querying similar items in ${collectionName}:`, error);
    throw new Error(`ChromaDB query error: ${error.message}`);
  }
}

export async function deleteCollection(name: string) {
  try {
    await chroma.deleteCollection(name);
    collectionsCache.delete(name);
  } catch (error) {
    console.error(`Error deleting collection ${name}:`, error);
    throw new Error(`ChromaDB deletion error: ${error.message}`);
  }
}

export async function getCollectionInfo(name: string) {
  try {
    const collection = await getOrCreateCollection(name);
    return {
      name: collection.name,
      metadata: await collection.metadata(),
      count: await collection.count()
    };
  } catch (error) {
    console.error(`Error getting collection info for ${name}:`, error);
    throw new Error(`ChromaDB info error: ${error.message}`);
  }
}
