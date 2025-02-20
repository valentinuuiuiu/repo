import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { chroma } from "./chromaClient";

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const embedding = await embeddings.embedQuery(text);
  return embedding;
}

export async function generateBatchEmbeddings(
  texts: string[],
): Promise<number[][]> {
  const embeddings = await embeddings.embedDocuments(texts);
  return embeddings;
}

export async function upsertToCollection(
  collectionName: string,
  documents: Array<{
    id: string;
    text: string;
    metadata?: Record<string, any>;
  }>,
) {
  const collection = await chroma.getOrCreateCollection(collectionName);

  // Generate embeddings in batches
  const batchSize = 100;
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    const texts = batch.map((doc) => doc.text);
    const embeddings = await generateBatchEmbeddings(texts);

    await collection.add({
      ids: batch.map((doc) => doc.id),
      embeddings,
      metadatas: batch.map((doc) => doc.metadata || {}),
    });
  }
}

export async function semanticSearch(
  collectionName: string,
  query: string,
  limit: number = 5,
) {
  const collection = await chroma.getCollection(collectionName);
  const queryEmbedding = await generateEmbedding(query);

  return collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
    include: ["metadatas", "distances"],
  });
}
