import { aiService } from "../index";
import { upsertToCollection, semanticSearch } from "../db/embeddings";

async function analyzeMarketTrends() {
  // 1. Define market trend data
  const marketTrends = [
    {
      id: "trend-1",
      category: "Electronics",
      trend:
        "Increasing demand for sustainable and eco-friendly electronics with minimal packaging",
      source: "Consumer Reports",
      confidence: 0.85,
      date: "2023-10-15",
    },
    {
      id: "trend-2",
      category: "Fashion",
      trend:
        "Rise in athleisure wear as work-from-home continues to influence fashion choices",
      source: "Fashion Industry Analysis",
      confidence: 0.92,
      date: "2023-09-22",
    },
    {
      id: "trend-3",
      category: "Home & Garden",
      trend:
        "Smart home devices becoming standard in new households, particularly voice-controlled systems",
      source: "Home Technology Magazine",
      confidence: 0.78,
      date: "2023-11-05",
    },
    {
      id: "trend-4",
      category: "Beauty",
      trend:
        "Clean beauty products with transparent ingredient lists gaining market share",
      source: "Beauty Industry Report",
      confidence: 0.88,
      date: "2023-10-30",
    },
    {
      id: "trend-5",
      category: "Electronics",
      trend:
        "Foldable and flexible display technology becoming more mainstream in mobile devices",
      source: "Tech Trends Quarterly",
      confidence: 0.75,
      date: "2023-11-10",
    },
  ];

  // 2. Store trend data in ChromaDB
  await upsertToCollection(
    "market_trends",
    marketTrends.map((trend) => ({
      id: trend.id,
      text: `${trend.category}: ${trend.trend}`,
      metadata: trend,
    })),
  );

  // 3. Define product categories to analyze
  const categoriesToAnalyze = [
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Beauty",
  ];

  // 4. Analyze each category
  const categoryAnalyses = await Promise.all(
    categoriesToAnalyze.map(async (category) => {
      // Find relevant trends for this category
      const relevantTrends = await semanticSearch(
        "market_trends",
        `${category} trends and opportunities`,
      );

      // Run market analysis task
      const analysis = await aiService.executeTask({
        type: "marketing_strategy",
        departments: ["marketing", "product"],
        data: {
          category,
          trends: relevantTrends,
          timeframe: "next 6 months",
        },
      });

      return {
        category,
        trends: relevantTrends,
        analysis: analysis.result,
      };
    }),
  );

  // 5. Generate product opportunities based on trends
  const productOpportunities = await aiService.executeTask({
    type: "product_optimization",
    departments: ["product", "marketing"],
    data: {
      categoryAnalyses,
      targetMargins: {
        min: 0.3, // 30%
        target: 0.5, // 50%
      },
      supplierConstraints: {
        maxLeadTime: 14, // days
        preferredRegions: ["Asia", "North America"],
      },
    },
  });

  return {
    marketTrends,
    categoryAnalyses,
    productOpportunities: productOpportunities.result,
  };
}

// Example usage
// analyzeMarketTrends().then(console.log).catch(console.error);
