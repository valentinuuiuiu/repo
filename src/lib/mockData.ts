export const mockData = {
  orders: [
    {
      id: "1",
      orderNumber: "ORD-001",
      customer: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      },
      status: "processing",
      total: 299.99,
      createdAt: new Date().toISOString(),
    },
    // Add more mock orders
  ],
  suppliers: [
    {
      id: "1",
      name: "Tech Supplies Inc",
      email: "sales@techsupplies.com",
      rating: 4.5,
      status: "active",
      _count: {
        products: 150,
        orders: 1200,
      },
    },
    // Add more mock suppliers
  ],
  analytics: {
    totalOrders: 1250,
    totalRevenue: 125000,
    totalProfit: 45000,
    averageOrderValue: 100,
    salesByDay: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      total_sales: Math.floor(Math.random() * 10000),
    })),
  },
};
