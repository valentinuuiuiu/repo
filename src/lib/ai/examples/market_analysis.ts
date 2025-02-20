import { aiService } from "../index";
import { upsertToCollection, semanticSearch } from "../db/embeddings";

async function analyzeMarket() {
  // 1. Store market data
  await upsertToCollection("market_trends", [
    {
      id: "trend1",
      text: "Rising demand for wireless audio devices with noise cancellation",
      metadata: {
        category: "Electronics",
        sentiment: "positive",
        volume: 15000,
      },
    },
  ]);

  // 2. Find relevant market trends
  const trends = await semanticSearch(
    "market_trends",
    "wireless audio market trends",
  );

  // 3. Run market analysis task
  const result = await aiService.executeTask({
    type: "marketing_strategy",
    departments: ["marketing", "product"],
    data: {
      category: "Electronics",
      trends,
      targetAudience: "tech-savvy consumers",
    },
  });

  console.log("Market analysis result:", result);
}

// Example usage
// analyzeMarket().catch(console.error);
