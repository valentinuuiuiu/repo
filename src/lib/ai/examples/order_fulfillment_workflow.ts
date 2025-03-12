import { aiService } from "../index";

async function processNewOrder() {
  // 1. Define a new customer order
  const newOrder = {
    id: "order-123",
    customer: {
      id: "cust-456",
      name: "Jane Smith",
      email: "jane@example.com",
      address: {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zip: "62704",
        country: "USA",
      },
    },
    items: [
      {
        productId: "prod-789",
        title: "Wireless Headphones",
        quantity: 1,
        price: 89.99,
      },
      {
        productId: "prod-101",
        title: "Phone Case",
        quantity: 2,
        price: 19.99,
      },
    ],
    total: 129.97,
    shippingMethod: "standard",
    paymentMethod: "credit_card",
    createdAt: new Date().toISOString(),
  };

  // 2. Supplier selection task
  const supplierSelection = await aiService.executeTask({
    type: "supplier_evaluation",
    departments: ["supplier", "inventory"],
    data: {
      orderItems: newOrder.items,
      customerLocation: newOrder.customer.address,
      shippingMethod: newOrder.shippingMethod,
    },
  });

  // 3. Order routing task
  const orderRouting = await aiService.executeTask({
    type: "inventory_forecast",
    departments: ["inventory"],
    data: {
      order: newOrder,
      selectedSuppliers: supplierSelection.result.suppliers,
      fulfillmentOptions: supplierSelection.result.fulfillmentOptions,
    },
  });

  // 4. Customer communication task
  const customerCommunication = await aiService.executeTask({
    type: "customer_inquiry",
    departments: ["customerService"],
    data: {
      order: newOrder,
      fulfillmentPlan: orderRouting.result,
      communicationType: "order_confirmation",
    },
  });

  // 5. Shipping optimization task
  const shippingOptimization = await aiService.executeTask({
    type: "supplier_evaluation",
    departments: ["supplier", "inventory"],
    data: {
      order: newOrder,
      fulfillmentPlan: orderRouting.result,
      customerLocation: newOrder.customer.address,
      shippingMethod: newOrder.shippingMethod,
    },
  });

  return {
    order: newOrder,
    fulfillmentPlan: {
      suppliers: supplierSelection.result.suppliers,
      routing: orderRouting.result,
      shipping: shippingOptimization.result,
      customerCommunication: customerCommunication.result,
    },
  };
}

// Example usage
// processNewOrder().then(console.log).catch(console.error);
