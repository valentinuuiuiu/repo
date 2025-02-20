import { aiService } from "../index";
import { upsertToCollection, semanticSearch } from "../db/embeddings";
import { nlpPipeline } from "../nlp/pipeline";

async function analyzeCustomerFeedback() {
  // 1. Process customer reviews with NLP
  const reviews = [
    "Great sound quality but battery life could be better",
    "Perfect noise cancellation for my daily commute",
    "Shipping was slow but product is worth the wait",
  ];

  const processedReviews = await Promise.all(
    reviews.map(async (review) => ({
      text: review,
      sentiment: await nlpPipeline.analyzeSentiment(review),
      entities: await nlpPipeline.extractEntities(review),
    })),
  );

  // 2. Store processed reviews
  await upsertToCollection(
    "customer_feedback",
    processedReviews.map((review, index) => ({
      id: `review${index + 1}`,
      text: review.text,
      metadata: {
        sentiment: review.sentiment,
        entities: review.entities,
      },
    })),
  );

  // 3. Find similar feedback
  const similarFeedback = await semanticSearch(
    "customer_feedback",
    "product quality issues",
  );

  // 4. Run customer satisfaction analysis
  const result = await aiService.executeTask({
    type: "satisfaction_analysis",
    departments: ["customerService", "product"],
    data: {
      reviews: processedReviews,
      similarFeedback,
    },
  });

  console.log("Feedback analysis result:", result);
}

// Example usage
// analyzeCustomerFeedback().catch(console.error);
