import { initializeCollections } from "../src/lib/ai/db/chromaClient";
import "../src/lib/ai/examples/product_analysis";
import "../src/lib/ai/examples/supplier_evaluation";
import "../src/lib/ai/examples/market_analysis";
import "../src/lib/ai/examples/customer_feedback";

async function runExamples() {
  console.log("Initializing ChromaDB collections...");
  await initializeCollections();

  console.log("\nRunning Product Analysis Example...");
  await import("../src/lib/ai/examples/product_analysis")
    .then((m) => m.default())
    .catch(console.error);

  console.log("\nRunning Supplier Evaluation Example...");
  await import("../src/lib/ai/examples/supplier_evaluation")
    .then((m) => m.default())
    .catch(console.error);

  console.log("\nRunning Market Analysis Example...");
  await import("../src/lib/ai/examples/market_analysis")
    .then((m) => m.default())
    .catch(console.error);

  console.log("\nRunning Customer Feedback Analysis Example...");
  await import("../src/lib/ai/examples/customer_feedback")
    .then((m) => m.default())
    .catch(console.error);
}

runExamples().catch(console.error);
