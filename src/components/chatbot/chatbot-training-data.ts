export interface TrainingIntent {
  patterns: string[];
  responses: string[];
}

export const chatbotTrainingData: TrainingIntent[] = [
  // Platform Overview
  {
    patterns: ['what is dropconnect', 'about dropconnect', 'platform overview'],
    responses: [
      "DropConnect is a comprehensive dropshipping platform that helps merchants discover, manage, and sync products from multiple suppliers to their e-commerce stores.",
      "We provide an all-in-one solution for dropshipping, connecting merchants with global suppliers across various categories like Electronics, Clothing, and Accessories."
    ]
  },
  
  // Supplier Information
  {
    patterns: ['how to find suppliers', 'supplier network', 'connect with suppliers'],
    responses: [
      "Our platform offers a curated network of verified suppliers from countries like China, Vietnam, and India. You can browse suppliers by category, rating, and specialties.",
      "We make supplier discovery easy. Simply browse our Suppliers page, filter by category or region, and connect with suppliers that match your business needs."
    ]
  },
  
  // Platform Features
  {
    patterns: ['platform features', 'what can dropconnect do', 'platform capabilities'],
    responses: [
      "DropConnect offers multi-channel selling, automated inventory sync, order routing, supplier integration, and business analytics.",
      "Key features include connecting with platforms like Shopify, WooCommerce, and eBay, automated fulfillment, and real-time performance tracking."
    ]
  },
  
  // Categories
  {
    patterns: ['product categories', 'what products can i sell', 'categories available'],
    responses: [
      "We support multiple categories including Electronics, Gadgets, Clothing, Accessories, Home Decor, and more. Each category has multiple verified suppliers.",
      "Our platform covers a wide range of product categories to help you diversify your online store and reach different market segments."
    ]
  },
  
  // Pricing and Plans
  {
    patterns: ['pricing', 'plans', 'how much does it cost'],
    responses: [
      "DropConnect offers flexible pricing plans. We have options for startups, growing businesses, and enterprise-level merchants.",
      "Our pricing is transparent and scalable. We recommend checking our Pricing page for the most up-to-date information on our subscription tiers."
    ]
  },
  
  // Technical Support
  {
    patterns: ['help', 'support', 'technical issues', 'contact support'],
    responses: [
      "Our support team is available through multiple channels. You can reach us via email, our help center, or schedule a demo for personalized assistance.",
      "We offer comprehensive documentation, video tutorials, and a dedicated support team to help you maximize your dropshipping business."
    ]
  },
  
  // Integration
  {
    patterns: ['platform integration', 'how to connect stores', 'supported platforms'],
    responses: [
      "DropConnect supports integration with major e-commerce platforms like Shopify, WooCommerce, eBay, and more. Our one-click setup makes connecting your store simple.",
      "We provide seamless integration tools that allow you to sync inventory, manage orders, and connect with suppliers across multiple platforms."
    ]
  },
  
  // Verification and Trust
  {
    patterns: ['supplier verification', 'how do you verify suppliers', 'trust'],
    responses: [
      "We rigorously verify suppliers through multiple checks including product quality, shipping reliability, and business credentials.",
      "Our verification process ensures that suppliers meet our high standards for product quality, shipping speed, and customer service."
    ]
  },
  
  // AI Agents
  {
    patterns: ['ai agents', 'what are agents', 'agent system', 'how do agents work'],
    responses: [
      "DropConnect uses specialized AI agents to automate various aspects of your dropshipping business. Each agent has specific skills and responsibilities.",
      "Our AI agent system includes specialized agents for product research, supplier communication, order processing, customer service, and market analysis."
    ]
  },
  
  // Departments
  {
    patterns: ['departments', 'what departments', 'department structure'],
    responses: [
      "Our platform organizes AI agents into departments like Product Management, Supplier Relations, Customer Service, Marketing, and Analytics.",
      "Each department in DropConnect contains specialized agents that work together to handle specific aspects of your dropshipping business."
    ]
  },
  
  // Product Management Department
  {
    patterns: ['product management', 'product department', 'manage products'],
    responses: [
      "The Product Management department includes agents for product research, trend analysis, pricing optimization, and inventory management.",
      "Our Product Management agents help you discover trending products, optimize pricing, and maintain proper inventory levels across all your sales channels."
    ]
  },
  
  // Supplier Relations Department
  {
    patterns: ['supplier relations', 'supplier department', 'manage suppliers'],
    responses: [
      "The Supplier Relations department handles supplier communication, order routing, quality control, and shipping logistics.",
      "Our Supplier Relations agents automate communications with suppliers, track orders, and ensure timely fulfillment of customer purchases."
    ]
  },
  
  // Customer Service Department
  {
    patterns: ['customer service', 'customer department', 'customer support'],
    responses: [
      "The Customer Service department includes agents for handling inquiries, processing returns, managing disputes, and gathering feedback.",
      "Our Customer Service agents help maintain high satisfaction rates by promptly addressing customer questions and resolving issues."
    ]
  },
  
  // Marketing Department
  {
    patterns: ['marketing', 'marketing department', 'promote products'],
    responses: [
      "The Marketing department contains agents for market research, ad campaign management, social media, and promotional strategies.",
      "Our Marketing agents analyze market trends, suggest promotional strategies, and help optimize your advertising campaigns."
    ]
  },
  
  // Analytics Department
  {
    patterns: ['analytics', 'analytics department', 'business insights'],
    responses: [
      "The Analytics department provides business intelligence through agents that analyze sales data, customer behavior, market trends, and performance metrics.",
      "Our Analytics agents generate actionable insights from your business data to help you make informed decisions and optimize your operations."
    ]
  }
];

// Fallback responses for general queries
export const fallbackResponses = [
  "I'm not sure I understand completely. Could you rephrase your question?",
  "That's an interesting question. Could you provide more context?",
  "I can help you with information about DropConnect's dropshipping platform. What specific details are you looking for?",
  "I'm here to assist you. Feel free to ask about our suppliers, features, or how our platform works."
];