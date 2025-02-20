import { ChromaClient } from "chromadb";

export const chroma = new ChromaClient();

export async function initializeCollections() {
  try {
    // Create collections for different entity types
    const collections = {
      products: await chroma.createCollection("products"),
      customers: await chroma.createCollection("customers"),
      suppliers: await chroma.createCollection("suppliers"),
      orders: await chroma.createCollection("orders"),
    };

    return collections;
  } catch (error) {
    console.error("Error initializing ChromaDB collections:", error);
    throw error;
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
    const collection = await chroma.getCollection(collectionName);
    await collection.add({
      ids: [data.id],
      embeddings: [data.embedding],
      metadatas: [data.metadata],
    });
  } catch (error) {
    console.error(`Error storing embedding in ${collectionName}:`, error);
    throw error;
  }
}

export async function querySimilar(
  collectionName: string,
  embedding: number[],
  limit: number = 5,
) {
  try {
    const collection = await chroma.getCollection(collectionName);
    return await collection.query({
      queryEmbeddings: [embedding],
      nResults: limit,
    });
  } catch (error) {
    console.error(`Error querying similar items in ${collectionName}:`, error);
    throw error;
  }
}
