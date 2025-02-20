import { aiService } from "../index";
import { upsertToCollection, semanticSearch } from "../db/embeddings";

async function evaluateSupplier() {
  // 1. Store supplier data
  await upsertToCollection("suppliers", [
    {
      id: "supplier1",
      text: "TechCo Electronics Supplier - Specializing in audio equipment",
      metadata: {
        rating: 4.5,
        fulfillmentSpeed: 2.3, // days
        orderCount: 1500,
      },
    },
  ]);

  // 2. Find similar suppliers for comparison
  const similarSuppliers = await semanticSearch(
    "suppliers",
    "electronics supplier audio equipment",
  );

  // 3. Run supplier evaluation task
  const result = await aiService.executeTask({
    type: "supplier_evaluation",
    departments: ["supplier", "inventory"],
    data: {
      supplier: {
        id: "supplier1",
        name: "TechCo",
        similarSuppliers,
      },
      orders: [
        // Example order data
        {
          id: "order1",
          status: "completed",
          fulfillmentTime: 2.1,
        },
      ],
    },
  });

  console.log("Evaluation result:", result);
}

// Example usage
// evaluateSupplier().catch(console.error);
