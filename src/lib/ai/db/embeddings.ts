import { OpenAIEmbeddings } from "@langchain/openai";
import { getOrCreateCollection } from "./chromaClient";

// Initialize OpenAI embeddings with configurable model
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  modelName: import.meta.env.VITE_OPENAI_EMBEDDING_MODEL || "text-embedding-ada-002",
  maxRetries: 3,
  maxConcurrency: 5
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    return await embeddings.embedQuery(text);
  } catch (error) {
    console.error("Error generating embedding:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Embedding generation error: ${errorMessage}`);
  }
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    return await embeddings.embedDocuments(texts);
  } catch (error) {
    console.error("Error generating batch embeddings:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Batch embedding generation error: ${errorMessage}`);
  }
}

export async function upsertToCollection(
  collectionName: string,
  documents: Array<{
    id: string;
    text: string;
    metadata?: Record<string, any>;
  }>,
  batchSize: number = 100
) {
  try {
    const collection = await getOrCreateCollection(collectionName);

    // Process documents in batches
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const texts = batch.map((doc) => doc.text);
      
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(documents.length / batchSize)}`);
      const batchEmbeddings = await generateBatchEmbeddings(texts);

      await collection.upsert({
        ids: batch.map((doc) => doc.id),
        embeddings: batchEmbeddings,
        metadatas: batch.map((doc) => ({
          text: doc.text,
          ...doc.metadata
        })),
      });
    }
  } catch (error) {
    console.error(`Error upserting to collection ${collectionName}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Collection upsert error: ${errorMessage}`);
  }
}

export async function semanticSearch(
  collectionName: string,
  query: string,
  limit: number = 5,
  filters?: Record<string, any>
) {
  try {
    const collection = await getOrCreateCollection(collectionName);
    const queryEmbedding = await generateEmbedding(query);

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      where: filters,
      include: ["metadatas", "distances", "embeddings"]
    });

    // Add similarity scores
    return {
      ...results,
      scores: results.distances?.[0].map((distance: number) => 1 - distance) // Convert distance to similarity score
    };
  } catch (error) {
    console.error(`Error performing semantic search in ${collectionName}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Semantic search error: ${errorMessage}`);
  }
}

export async function deleteFromCollection(collectionName: string, ids: string[]) {
  try {
    const collection = await getOrCreateCollection(collectionName);
    await collection.delete({
      ids: ids
    });
  } catch (error) {
    console.error(`Error deleting from collection ${collectionName}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Collection deletion error: ${errorMessage}`);
  }
}

export async function updateEmbeddings(
  collectionName: string,
  documents: Array<{
    id: string;
    text: string;
    metadata?: Record<string, any>;
  }>
) {
  try {
    // Delete existing entries
    await deleteFromCollection(collectionName, documents.map(doc => doc.id));
    // Insert updated entries
    await upsertToCollection(collectionName, documents);
  } catch (error) {
    console.error(`Error updating embeddings in ${collectionName}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Embedding update error: ${errorMessage}`);
  }
}
