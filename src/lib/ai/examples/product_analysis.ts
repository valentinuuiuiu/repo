import { aiService } from "../index";
import { upsertToCollection, semanticSearch } from "../db/embeddings";

async function analyzeProduct() {
  // 1. Store product data in ChromaDB
  await upsertToCollection("products", [
    {
      id: "product1",
      text: "Wireless Noise-Cancelling Headphones with 30-hour battery life",
      metadata: {
        price: 199.99,
        category: "Electronics",
        supplier: "TechCo",
      },
    },
  ]);

  // 2. Find similar products
  const similarProducts = await semanticSearch(
    "products",
    "wireless headphones premium quality",
  );

  // 3. Run product optimization task
  const result = await aiService.executeTask({
    type: "product_optimization",
    departments: ["product", "marketing", "inventory"],
    data: {
      product: {
        id: "product1",
        title: "Wireless Noise-Cancelling Headphones",
        price: 199.99,
        similarProducts,
      },
    },
  });

  console.log("Analysis result:", result);
}

// Example usage
// analyzeProduct().catch(console.error);
