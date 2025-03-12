import { aiService } from "../index";
import { upsertToCollection, semanticSearch } from "../db/embeddings";

async function launchNewProduct() {
  // 1. Define the new product
  const newProduct = {
    id: "new-product-1",
    title: "Smart Fitness Watch with Heart Rate Monitor",
    description:
      "Track your fitness goals with this advanced smartwatch featuring heart rate monitoring, sleep tracking, and smartphone notifications.",
    category: "Wearables",
    costPrice: 45.99,
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80",
    ],
  };

  // 2. Find market trends and similar products
  await upsertToCollection("products", [
    {
      id: newProduct.id,
      text: `${newProduct.title}. ${newProduct.description}`,
      metadata: {
        category: newProduct.category,
        costPrice: newProduct.costPrice,
      },
    },
  ]);

  const similarProducts = await semanticSearch(
    "products",
    "fitness smartwatch heart rate",
  );
  const marketTrends = await semanticSearch(
    "market_trends",
    "fitness wearables trends",
  );

  // 3. Product optimization task
  const productOptimization = await aiService.executeTask({
    type: "product_launch",
    departments: ["product"],
    data: {
      product: newProduct,
      similarProducts,
      marketTrends,
    },
  });

  // 4. Marketing strategy task
  const marketingStrategy = await aiService.executeTask({
    type: "marketing_strategy",
    departments: ["marketing"],
    data: {
      product: newProduct,
      optimizedProduct: productOptimization.result,
      targetAudience: "fitness enthusiasts, 25-45 years old",
    },
  });

  // 5. Inventory forecast task
  const inventoryForecast = await aiService.executeTask({
    type: "inventory_forecast",
    departments: ["inventory"],
    data: {
      product: newProduct,
      marketingPlan: marketingStrategy.result,
      launchDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  });

  // 6. Supplier evaluation task
  const supplierEvaluation = await aiService.executeTask({
    type: "supplier_evaluation",
    departments: ["supplier"],
    data: {
      product: newProduct,
      requiredQuantity: inventoryForecast.result.initialStock,
      qualityRequirements:
        "High durability, water resistance, accurate sensors",
    },
  });

  // 7. Final launch plan
  const launchPlan = await aiService.executeTask({
    type: "product_launch",
    departments: ["product", "marketing", "inventory", "supplier"],
    data: {
      product: newProduct,
      productOptimization: productOptimization.result,
      marketingStrategy: marketingStrategy.result,
      inventoryForecast: inventoryForecast.result,
      supplierEvaluation: supplierEvaluation.result,
    },
  });

  return {
    product: newProduct,
    launchPlan: launchPlan.result,
  };
}

// Example usage
// launchNewProduct().then(console.log).catch(console.error);
