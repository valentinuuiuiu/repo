import { aiService } from "../index";

async function optimizeInventory() {
  // 1. Define product inventory data
  const products = [
    {
      id: "product-1",
      title: "Wireless Bluetooth Earbuds",
      category: "Electronics",
      currentStock: 85,
      reorderPoint: 50,
      reorderQuantity: 100,
      leadTime: 14, // days
      costPrice: 32.5,
      salesVelocity: 5.2, // units per day
      seasonalityFactor: 1.3, // higher demand during holidays
      supplierReliability: 0.92, // 92% on-time delivery
    },
    {
      id: "product-2",
      title: "Smart Fitness Tracker",
      category: "Electronics",
      currentStock: 120,
      reorderPoint: 75,
      reorderQuantity: 150,
      leadTime: 10, // days
      costPrice: 18.75,
      salesVelocity: 8.5, // units per day
      seasonalityFactor: 1.5, // higher demand during holidays
      supplierReliability: 0.95, // 95% on-time delivery
    },
    {
      id: "product-3",
      title: "Portable Bluetooth Speaker",
      category: "Electronics",
      currentStock: 45,
      reorderPoint: 40,
      reorderQuantity: 80,
      leadTime: 12, // days
      costPrice: 24.25,
      salesVelocity: 4.8, // units per day
      seasonalityFactor: 1.2, // higher demand during holidays
      supplierReliability: 0.9, // 90% on-time delivery
    },
    {
      id: "product-4",
      title: "Smartphone Case",
      category: "Accessories",
      currentStock: 210,
      reorderPoint: 100,
      reorderQuantity: 200,
      leadTime: 7, // days
      costPrice: 5.5,
      salesVelocity: 12.3, // units per day
      seasonalityFactor: 1.1, // higher demand during holidays
      supplierReliability: 0.98, // 98% on-time delivery
    },
    {
      id: "product-5",
      title: "Wireless Charging Pad",
      category: "Electronics",
      currentStock: 65,
      reorderPoint: 50,
      reorderQuantity: 100,
      leadTime: 9, // days
      costPrice: 12.75,
      salesVelocity: 6.7, // units per day
      seasonalityFactor: 1.4, // higher demand during holidays
      supplierReliability: 0.93, // 93% on-time delivery
    },
  ];

  // 2. Define warehouse constraints
  const warehouseConstraints = {
    totalCapacity: 2000, // units
    currentUtilization: 1500, // units
    handlingCapacity: 200, // units per day
    storageCostPerUnit: 0.15, // $ per unit per day
    locations: ["US-East", "US-West"],
  };

  // 3. Define upcoming events that might affect demand
  const upcomingEvents = [
    {
      name: "Black Friday",
      date: "2023-11-24",
      expectedImpact: {
        Electronics: 2.5, // 2.5x normal demand
        Accessories: 2.0, // 2x normal demand
      },
    },
    {
      name: "Christmas",
      date: "2023-12-25",
      expectedImpact: {
        Electronics: 2.0, // 2x normal demand
        Accessories: 1.8, // 1.8x normal demand
      },
    },
  ];

  // 4. Analyze inventory levels for each product
  const inventoryAnalyses = await Promise.all(
    products.map(async (product) => {
      // Run inventory forecast task
      const analysis = await aiService.executeTask({
        type: "inventory_forecast",
        departments: ["inventory"],
        data: {
          product,
          upcomingEvents,
          warehouseConstraints,
          forecastPeriod: 90, // days
        },
      });

      return {
        product: {
          id: product.id,
          title: product.title,
        },
        currentStock: product.currentStock,
        daysUntilReorder: analysis.result.daysUntilReorder,
        stockoutRisk: analysis.result.stockoutRisk,
        recommendedActions: analysis.result.recommendedActions,
      };
    }),
  );

  // 5. Generate reorder recommendations
  const reorderRecommendations = await aiService.executeTask({
    type: "reorder_planning",
    departments: ["inventory", "supplier"],
    data: {
      products,
      inventoryAnalyses,
      warehouseConstraints,
      upcomingEvents,
      cashFlowConstraints: {
        maxMonthlyInventoryBudget: 25000, // $
        prioritizeHighMargin: true,
      },
    },
  });

  // 6. Generate warehouse optimization plan
  const warehouseOptimization = await aiService.executeTask({
    type: "stock_optimization",
    departments: ["inventory"],
    data: {
      products,
      warehouseConstraints,
      inventoryAnalyses,
      optimizationGoals: {
        reduceStorageCosts: true,
        minimizeStockouts: true,
        improvePickingEfficiency: true,
      },
    },
  });

  return {
    productInventory: products.map((p) => ({
      id: p.id,
      title: p.title,
      currentStock: p.currentStock,
      salesVelocity: p.salesVelocity,
    })),
    inventoryAnalyses,
    reorderRecommendations: reorderRecommendations.result,
    warehouseOptimization: warehouseOptimization.result,
  };
}

// Example usage
// optimizeInventory().then(console.log).catch(console.error);
