import { initializeCollections } from "../lib/ai/db/chromaClient";
import { nlpPipeline } from "../lib/ai/nlp/pipeline";

async function runExamples() {
  console.log("Initializing NLP pipeline...");
  await nlpPipeline.initialize([
    "sentiment-analysis",
    "text-classification",
    "ner",
  ]);

  console.log("Initializing ChromaDB collections...");
  await initializeCollections();

  console.log("\nRunning Product Analysis Example...");
  const productAnalysis = await import("../lib/ai/examples/product_analysis")
    .then((m) => (m.default ? m.default() : null))
    .catch((err) => {
      console.error("Error running product analysis:", err);
      return null;
    });
  console.log("Product Analysis Result:", productAnalysis);

  console.log("\nRunning Supplier Evaluation Example...");
  const supplierEvaluation = await import(
    "../lib/ai/examples/supplier_evaluation"
  )
    .then((m) => (m.default ? m.default() : null))
    .catch((err) => {
      console.error("Error running supplier evaluation:", err);
      return null;
    });
  console.log("Supplier Evaluation Result:", supplierEvaluation);

  console.log("\nRunning Market Analysis Example...");
  const marketAnalysis = await import("../lib/ai/examples/market_analysis")
    .then((m) => (m.default ? m.default() : null))
    .catch((err) => {
      console.error("Error running market analysis:", err);
      return null;
    });
  console.log("Market Analysis Result:", marketAnalysis);

  console.log("\nRunning Product Launch Workflow Example...");
  const productLaunch = await import(
    "../lib/ai/examples/product_launch_workflow"
  )
    .then((m) => (m.launchNewProduct ? m.launchNewProduct() : null))
    .catch((err) => {
      console.error("Error running product launch workflow:", err);
      return null;
    });
  console.log("Product Launch Result:", productLaunch);

  console.log("\nRunning Inventory Optimization Example...");
  const inventoryOptimization = await import(
    "../lib/ai/examples/inventory_optimization"
  )
    .then((m) => (m.optimizeInventory ? m.optimizeInventory() : null))
    .catch((err) => {
      console.error("Error running inventory optimization:", err);
      return null;
    });
  console.log("Inventory Optimization Result:", inventoryOptimization);
}

runExamples().catch(console.error);
