import { BaseAgent, AgentConfig } from '../../core/BaseAgent';
import { Task, AgentResponse } from '../../types';
import { prisma } from '../../../prisma';

interface ProductData {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
  images?: string[];
  attributes?: Record<string, any>;
}

/**
 * ProductManagementAgent handles all product-related operations
 * including creation, updates, pricing optimization, and inventory management
 */
export class ProductManagementAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({
      ...config,
      capabilities: [
        'product_creation',
        'product_updates',
        'pricing_optimization',
        'product_categorization',
        'product_description_enhancement',
        'inventory_management',
        'product_search_optimization'
      ],
      group: 'ecommerce'
    });
  }

  /**
   * Execute a product-related task
   */
  async executeTask(task: Task): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      switch (task.type) {
        case 'pricing_optimization':
          result = await this.optimizeProductPricing(task.data);
          break;
        case 'inventory_forecast':
          result = await this.forecastInventory(task.data);
          break;
        default:
          // Handle generic product management tasks
          result = await this.handleGenericProductTask(task);
      }
      
      return {
        success: true,
        data: result,
        metadata: {
          confidence: 0.9,
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4'
        }
      };
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  /**
   * Optimize product pricing based on market data and sales history
   */
  private async optimizeProductPricing(data: any): Promise<any> {
    const { productId, marketData, salesHistory } = data;
    
    try {
      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      // Prepare prompt for pricing optimization
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a product pricing specialist. Analyze the product data, market trends, and sales history to recommend an optimal price.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify({
            product,
            marketData,
            salesHistory
          })
        }
      ];
      
      const response = await this.chat(prompt);
      let recommendation;
      
      try {
        recommendation = JSON.parse(response || '{}');
      } catch (e) {
        recommendation = {
          suggestedPrice: product.price,
          reasoning: response,
          confidence: 0.7
        };
      }
      
      // Update product price if confidence is high
      if (recommendation.confidence > 0.8 && recommendation.suggestedPrice) {
        await prisma.product.update({
          where: { id: productId },
          data: { price: recommendation.suggestedPrice }
        });
        
        recommendation.priceUpdated = true;
      }
      
      return recommendation;
    } catch (error) {
      console.error('Error optimizing product pricing:', error);
      throw error;
    }
  }

  /**
   * Forecast inventory needs based on sales data and trends
   */
  private async forecastInventory(data: any): Promise<any> {
    const { productId, timeframe, salesData } = data;
    
    try {
      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      // Prepare prompt for inventory forecasting
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, an inventory management specialist. Forecast inventory needs for the specified timeframe based on sales data and trends.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify({
            product,
            timeframe,
            salesData
          })
        }
      ];
      
      const response = await this.chat(prompt);
      let forecast;
      
      try {
        forecast = JSON.parse(response || '{}');
      } catch (e) {
        forecast = {
          estimatedDemand: 0,
          recommendedStockLevel: product.inventory,
          reasoning: response,
          confidence: 0.7
        };
      }
      
      return forecast;
    } catch (error) {
      console.error('Error forecasting inventory:', error);
      throw error;
    }
  }

  /**
   * Handle generic product management tasks
   */
  private async handleGenericProductTask(task: Task): Promise<any> {
    const { action, productData } = task.data;
    
    switch (action) {
      case 'create':
        return await this.createProduct(productData);
      case 'update':
        return await this.updateProduct(productData);
      case 'enhance_description':
        return await this.enhanceProductDescription(productData);
      case 'categorize':
        return await this.categorizeProduct(productData);
      default:
        throw new Error(`Unknown product action: ${action}`);
    }
  }

  /**
   * Create a new product
   */
  private async createProduct(productData: ProductData): Promise<any> {
    try {
      // Enhance product description if needed
      if (productData.description && productData.description.length < 100) {
        const enhancedDescription = await this.generateEnhancedDescription(
          productData.name,
          productData.description,
          productData.category
        );
        
        if (enhancedDescription) {
          productData.description = enhancedDescription;
        }
      }
      
      // Create product in database
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          inventory: productData.inventory,
          images: productData.images || [],
          attributes: productData.attributes || {}
        }
      });
      
      return {
        success: true,
        product,
        enhancements: {
          descriptionEnhanced: productData.description.length > 100
        }
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update an existing product
   */
  private async updateProduct(productData: ProductData): Promise<any> {
    try {
      if (!productData.id) {
        throw new Error('Product ID is required for updates');
      }
      
      // Update product in database
      const product = await prisma.product.update({
        where: { id: productData.id },
        data: {
          ...(productData.name && { name: productData.name }),
          ...(productData.description && { description: productData.description }),
          ...(productData.price && { price: productData.price }),
          ...(productData.category && { category: productData.category }),
          ...(productData.inventory !== undefined && { inventory: productData.inventory }),
          ...(productData.images && { images: productData.images }),
          ...(productData.attributes && { attributes: productData.attributes })
        }
      });
      
      return {
        success: true,
        product
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Enhance a product description
   */
  private async enhanceProductDescription(productData: ProductData): Promise<any> {
    try {
      if (!productData.id) {
        throw new Error('Product ID is required for description enhancement');
      }
      
      // Get current product
      const product = await prisma.product.findUnique({
        where: { id: productData.id }
      });
      
      if (!product) {
        throw new Error(`Product with ID ${productData.id} not found`);
      }
      
      // Generate enhanced description
      const enhancedDescription = await this.generateEnhancedDescription(
        product.name,
        product.description,
        product.category
      );
      
      if (!enhancedDescription) {
        return {
          success: false,
          message: 'Could not enhance description'
        };
      }
      
      // Update product with enhanced description
      const updatedProduct = await prisma.product.update({
        where: { id: productData.id },
        data: { description: enhancedDescription }
      });
      
      return {
        success: true,
        product: updatedProduct,
        originalDescription: product.description,
        enhancedDescription
      };
    } catch (error) {
      console.error('Error enhancing product description:', error);
      throw error;
    }
  }

  /**
   * Categorize a product
   */
  private async categorizeProduct(productData: ProductData): Promise<any> {
    try {
      if (!productData.id) {
        throw new Error('Product ID is required for categorization');
      }
      
      // Get current product
      const product = await prisma.product.findUnique({
        where: { id: productData.id }
      });
      
      if (!product) {
        throw new Error(`Product with ID ${productData.id} not found`);
      }
      
      // Get all categories
      const categories = await prisma.category.findMany();
      
      // Generate category recommendation
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a product categorization specialist. Analyze the product and recommend the most appropriate category from the available options.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify({
            product,
            availableCategories: categories.map(c => c.name)
          })
        }
      ];
      
      const response = await this.chat(prompt);
      let recommendation;
      
      try {
        recommendation = JSON.parse(response || '{}');
      } catch (e) {
        recommendation = {
          suggestedCategory: product.category,
          reasoning: response,
          confidence: 0.7
        };
      }
      
      // Update product category if confidence is high
      if (recommendation.confidence > 0.8 && recommendation.suggestedCategory) {
        await prisma.product.update({
          where: { id: productData.id },
          data: { category: recommendation.suggestedCategory }
        });
        
        recommendation.categoryUpdated = true;
      }
      
      return recommendation;
    } catch (error) {
      console.error('Error categorizing product:', error);
      throw error;
    }
  }

  /**
   * Generate an enhanced product description
   */
  private async generateEnhancedDescription(
    name: string,
    currentDescription: string,
    category: string
  ): Promise<string | null> {
    try {
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a product description specialist. Create an enhanced, SEO-friendly product description that highlights key features and benefits.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify({
            productName: name,
            currentDescription,
            category
          })
        }
      ];
      
      const response = await this.chat(prompt);
      return response || null;
    } catch (error) {
      console.error('Error generating enhanced description:', error);
      return null;
    }
  }
}