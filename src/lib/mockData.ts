import { AgentType } from '@/types/agent';

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

export const mockProducts = [
  {
    id: 'p1',
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with health tracking',
    price: 129.99,
    cost: 45.00,
    stock: 150,
    threshold: 50,
    supplier: 'TechVision Electronics',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400'
  },
  {
    id: 'p2',
    name: 'Wireless Earbuds X1',
    description: 'Premium wireless earbuds with noise cancellation',
    price: 89.99,
    cost: 28.50,
    stock: 200,
    threshold: 75,
    supplier: 'AudioTech Solutions',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'
  },
  {
    id: 'p3',
    name: 'Smart Home Hub',
    description: 'Central control for all your smart devices',
    price: 149.99,
    cost: 52.00,
    stock: 100,
    threshold: 30,
    supplier: 'SmartLife Electronics',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400'
  },
  {
    id: 'p4',
    name: 'Ultra HD Action Camera',
    description: '4K action camera with image stabilization',
    price: 199.99,
    cost: 75.00,
    stock: 80,
    threshold: 25,
    supplier: 'CameraPro Tech',
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'
  }
];

export const mockSuppliers = [
  {
    id: 's1',
    name: 'TechVision Electronics',
    location: 'Shenzhen, China',
    rating: 4.8,
    shippingTime: 12,
    minimumOrder: 50,
    categories: ['Electronics', 'Smart Devices'],
    image: 'https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?w=400'
  },
  {
    id: 's2',
    name: 'AudioTech Solutions',
    location: 'Guangzhou, China',
    rating: 4.6,
    shippingTime: 14,
    minimumOrder: 100,
    categories: ['Audio Equipment', 'Accessories'],
    image: 'https://images.unsplash.com/photo-1558478551-1a378f63328e?w=400'
  },
  {
    id: 's3',
    name: 'SmartLife Electronics',
    location: 'Seoul, South Korea',
    rating: 4.9,
    shippingTime: 10,
    minimumOrder: 25,
    categories: ['Smart Home', 'IoT Devices'],
    image: 'https://images.unsplash.com/photo-1581092921461-39e14e340069?w=400'
  },
  {
    id: 's4',
    name: 'CameraPro Tech',
    location: 'Tokyo, Japan',
    rating: 4.7,
    shippingTime: 15,
    minimumOrder: 20,
    categories: ['Cameras', 'Photography Equipment'],
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400'
  }
];

export const mockPlatforms = [
  {
    id: 'pl1',
    name: 'Amazon',
    productCount: 2500,
    monthlyVisitors: 2000000,
    commission: 0.15,
    categories: ['Electronics', 'Smart Devices', 'Audio Equipment'],
    minimumPrice: 10,
    image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400'
  },
  {
    id: 'pl2', 
    name: 'eBay',
    productCount: 1800,
    monthlyVisitors: 1500000,
    commission: 0.1,
    categories: ['Electronics', 'Cameras', 'Audio'],
    minimumPrice: 5,
    image: 'https://images.unsplash.com/photo-1561908818-526e141cad2d?w=400'
  },
  {
    id: 'pl3',
    name: 'Walmart',
    productCount: 1200,
    monthlyVisitors: 1800000,
    commission: 0.12,
    categories: ['Electronics', 'Smart Home', 'Photography'],
    minimumPrice: 15,
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400'
  }
];

export const mockMarketData = {
  trends: [
    {
      category: 'Smart Watches',
      growthRate: 0.25,
      averagePrice: 145.99,
      popularFeatures: ['Health Tracking', 'ECG', 'Sleep Analysis']
    },
    {
      category: 'Wireless Earbuds',
      growthRate: 0.32,
      averagePrice: 95.99,
      popularFeatures: ['Noise Cancellation', 'Water Resistance', 'Long Battery']
    },
    {
      category: 'Smart Home',
      growthRate: 0.28,
      averagePrice: 155.99,
      popularFeatures: ['Voice Control', 'App Integration', 'Energy Monitoring']
    }
  ],
  competitors: [
    {
      name: 'TechGear Pro',
      marketShare: 0.15,
      averagePricing: 'Premium',
      strengths: ['Brand Recognition', 'Quality'],
      weaknesses: ['High Prices', 'Limited Selection']
    },
    {
      name: 'SmartStyle',
      marketShare: 0.12,
      averagePricing: 'Mid-Range',
      strengths: ['Trendy Designs', 'Fast Shipping'],
      weaknesses: ['Stock Issues', 'Customer Service']
    }
  ],
  customerInsights: {
    pricePreference: {
      budget: 0.3,
      midRange: 0.5,
      premium: 0.2
    },
    importantFactors: [
      'Quality',
      'Price',
      'Features',
      'Brand Reputation',
      'Shipping Speed'
    ],
    commonComplaints: [
      'Long Shipping Times',
      'Unclear Product Specs',
      'Poor Customer Support',
      'Quality Inconsistency'
    ]
  }
};

// Sample customer support cases for testing
export const mockSupportCases = [
  {
    id: 'cs1',
    type: 'Product Query',
    subject: 'Smart Watch Pro Battery Life',
    description: 'Customer asking about typical battery life and charging time',
    priority: 'Medium',
    status: 'Open',
    createdAt: new Date('2024-02-25T10:30:00')
  },
  {
    id: 'cs2',
    type: 'Technical Issue',
    subject: 'Wireless Earbuds Not Pairing',
    description: 'Customer cannot connect earbuds to their phone',
    priority: 'High',
    status: 'In Progress',
    createdAt: new Date('2024-02-25T09:15:00')
  }
];

// Agent-specific test scenarios for each agent type
export const mockTestScenarios = {
  [AgentType.PRODUCT_LEADER]: [
    {
      scenario: 'New Product Launch',
      context: {
        productType: 'Smart Fitness Tracker',
        targetMarket: 'Health-conscious young professionals',
        competitors: mockMarketData.competitors,
        marketTrends: mockMarketData.trends
      }
    }
  ],
  [AgentType.MARKET_RESEARCH_LEADER]: [
    {
      scenario: 'Market Analysis',
      context: {
        targetMarket: 'Smart Home Technology',
        currentTrends: mockMarketData.trends,
        competitorData: mockMarketData.competitors,
        customerInsights: mockMarketData.customerInsights
      }
    }
  ],
  [AgentType.OPERATIONS_LEADER]: [
    {
      scenario: 'Supply Chain Optimization',
      context: {
        currentSuppliers: mockSuppliers,
        inventory: mockProducts,
        shippingPerformance: {
          averageTime: 13,
          delayedOrders: 0.08,
          costPerUnit: 12.5
        }
      }
    }
  ]
};
