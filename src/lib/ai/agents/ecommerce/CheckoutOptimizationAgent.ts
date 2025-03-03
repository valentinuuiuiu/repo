import { BaseAgent, AgentConfig } from '../../core/BaseAgent';
import { Task, AgentResponse } from '../../types';
import { prisma } from '../../../prisma';

interface CheckoutData {
  userId: string;
  cartItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: {
    country: string;
    state?: string;
    city: string;
    zipCode: string;
  };
  paymentMethod?: string;
  couponCode?: string;
  sessionId?: string;
}

interface CheckoutOptimization {
  recommendations: Array<{
    type: 'cross_sell' | 'upsell' | 'discount' | 'shipping' | 'payment';
    message: string;
    productId?: string;
    discountAmount?: number;
    confidence: number;
  }>;
  abandonmentRisk: number;
  suggestedActions: string[];
}

/**
 * CheckoutOptimizationAgent handles checkout flow optimization
 * including cross-sells, upsells, abandoned cart recovery, and checkout UX improvements
 */
export class CheckoutOptimizationAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({
      ...config,
      capabilities: [
        'checkout_optimization',
        'cross_sell_recommendations',
        'upsell_recommendations',
        'abandoned_cart_recovery',
        'discount_optimization',
        'payment_method_optimization',
        'checkout_ux_improvement'
      ],
      group: 'ecommerce'
    });
  }

  /**
   * Execute a checkout-related task
   */
  async executeTask(task: Task): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      switch (task.type) {
        case 'order_processing':
          result = await this.optimizeCheckout(task.data);
          break;
        default:
          // Handle other checkout-related tasks
          result = await this.handleGenericCheckoutTask(task);
      }
      
      return {
        success: true,
        data: result,
        metadata: {
          confidence: 0.85,
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4'
        }
      };
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  /**
   * Optimize the checkout experience for a user
   */
  private async optimizeCheckout(data: CheckoutData): Promise<CheckoutOptimization> {
    try {
      // Get user purchase history
      const purchaseHistory = await prisma.order.findMany({
        where: { userId: data.userId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      // Get cart products
      const cartProductIds = data.cartItems.map(item => item.productId);
      const cartProducts = await prisma.product.findMany({
        where: { id: { in: cartProductIds } }
      });
      
      // Prepare data for analysis
      const analysisData = {
        user: {
          id: data.userId,
          purchaseHistory: purchaseHistory.map(order => ({
            id: order.id,
            total: order.total,
            items: order.items.map(item => ({
              productId: item.productId,
              productName: item.product.name,
              quantity: item.quantity,
              price: item.price
            }))
          }))
        },
        currentCart: {
          items: data.cartItems.map(item => {
            const product = cartProducts.find(p => p.id === item.productId);
            return {
              productId: item.productId,
              productName: product?.name || 'Unknown Product',
              quantity: item.quantity,
              price: item.price,
              category: product?.category
            };
          }),
          total: data.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        },
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        couponCode: data.couponCode
      };
      
      // Get optimization recommendations
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a checkout optimization specialist. Analyze the user's cart and purchase history to provide recommendations for improving their checkout experience and increasing order value.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify(analysisData)
        }
      ];
      
      const response = await this.chat(prompt);
      let optimization: CheckoutOptimization;
      
      try {
        optimization = JSON.parse(response || '{}');
      } catch (e) {
        // Default optimization if parsing fails
        optimization = {
          recommendations: [],
          abandonmentRisk: 0.5,
          suggestedActions: ['Ensure checkout process is smooth and fast']
        };
        
        // Extract recommendations from text response
        if (response) {
          const lines = response.split('\n');
          for (const line of lines) {
            if (line.includes('cross-sell') || line.includes('Cross-sell')) {
              optimization.recommendations.push({
                type: 'cross_sell',
                message: line,
                confidence: 0.7
              });
            } else if (line.includes('upsell') || line.includes('Upsell')) {
              optimization.recommendations.push({
                type: 'upsell',
                message: line,
                confidence: 0.7
              });
            } else if (line.includes('discount') || line.includes('Discount')) {
              optimization.recommendations.push({
                type: 'discount',
                message: line,
                confidence: 0.7
              });
            }
          }
        }
      }
      
      // If session ID is provided, save recommendations for future use
      if (data.sessionId) {
        await prisma.checkoutSession.upsert({
          where: { id: data.sessionId },
          update: {
            recommendations: optimization.recommendations,
            abandonmentRisk: optimization.abandonmentRisk
          },
          create: {
            id: data.sessionId,
            userId: data.userId,
            cartItems: data.cartItems,
            recommendations: optimization.recommendations,
            abandonmentRisk: optimization.abandonmentRisk
          }
        });
      }
      
      return optimization;
    } catch (error) {
      console.error('Error optimizing checkout:', error);
      throw error;
    }
  }

  /**
   * Handle generic checkout-related tasks
   */
  private async handleGenericCheckoutTask(task: Task): Promise<any> {
    const { action, data } = task.data;
    
    switch (action) {
      case 'abandoned_cart_recovery':
        return await this.generateAbandonedCartRecovery(data);
      case 'payment_method_recommendation':
        return await this.recommendPaymentMethod(data);
      case 'shipping_optimization':
        return await this.optimizeShipping(data);
      default:
        throw new Error(`Unknown checkout action: ${action}`);
    }
  }

  /**
   * Generate abandoned cart recovery strategies
   */
  private async generateAbandonedCartRecovery(data: { sessionId: string }): Promise<any> {
    try {
      // Get abandoned cart session
      const session = await prisma.checkoutSession.findUnique({
        where: { id: data.sessionId },
        include: {
          user: true
        }
      });
      
      if (!session) {
        throw new Error(`Checkout session with ID ${data.sessionId} not found`);
      }
      
      // Get cart products
      const cartProductIds = session.cartItems.map((item: any) => item.productId);
      const cartProducts = await prisma.product.findMany({
        where: { id: { in: cartProductIds } }
      });
      
      // Prepare data for analysis
      const analysisData = {
        user: session.user,
        cart: {
          items: session.cartItems.map((item: any) => {
            const product = cartProducts.find(p => p.id === item.productId);
            return {
              productId: item.productId,
              productName: product?.name || 'Unknown Product',
              quantity: item.quantity,
              price: item.price,
              category: product?.category
            };
          }),
          total: session.cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
        },
        abandonmentRisk: session.abandonmentRisk,
        lastActive: session.updatedAt
      };
      
      // Generate recovery strategies
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, an abandoned cart recovery specialist. Generate personalized strategies to recover this abandoned cart.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify(analysisData)
        }
      ];
      
      const response = await this.chat(prompt);
      let strategies;
      
      try {
        strategies = JSON.parse(response || '{}');
      } catch (e) {
        strategies = {
          emailSubject: 'Complete Your Purchase - Items Waiting in Your Cart',
          emailBody: response || 'We noticed you left some items in your cart. Come back and complete your purchase!',
          discountOffer: session.abandonmentRisk > 0.7 ? '10% OFF' : '5% OFF',
          urgencyMessage: 'Limited time offer - expires in 24 hours',
          recommendedTiming: '1 day after abandonment'
        };
      }
      
      return strategies;
    } catch (error) {
      console.error('Error generating abandoned cart recovery:', error);
      throw error;
    }
  }

  /**
   * Recommend optimal payment methods
   */
  private async recommendPaymentMethod(data: { userId: string, cartTotal: number, country: string }): Promise<any> {
    try {
      // Get user's previous payment methods
      const previousOrders = await prisma.order.findMany({
        where: { userId: data.userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      const previousPaymentMethods = previousOrders.map(order => order.paymentMethod);
      
      // Get available payment methods for the country
      const availablePaymentMethods = await prisma.paymentMethod.findMany({
        where: { supportedCountries: { has: data.country } }
      });
      
      // Prepare data for analysis
      const analysisData = {
        user: { id: data.userId },
        cartTotal: data.cartTotal,
        country: data.country,
        previousPaymentMethods,
        availablePaymentMethods: availablePaymentMethods.map(method => ({
          id: method.id,
          name: method.name,
          type: method.type,
          processingFee: method.processingFee,
          processingTime: method.processingTime
        }))
      };
      
      // Generate payment method recommendations
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a payment optimization specialist. Recommend the best payment methods for this user based on their history and available options.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify(analysisData)
        }
      ];
      
      const response = await this.chat(prompt);
      let recommendations;
      
      try {
        recommendations = JSON.parse(response || '{}');
      } catch (e) {
        // Default recommendations if parsing fails
        const preferredMethod = previousPaymentMethods.length > 0 ? 
          previousPaymentMethods[0] : 
          availablePaymentMethods[0]?.name;
        
        recommendations = {
          primaryRecommendation: preferredMethod,
          alternativeRecommendations: availablePaymentMethods
            .filter(method => method.name !== preferredMethod)
            .map(method => method.name)
            .slice(0, 2),
          reasoning: response || 'Based on user history and available options'
        };
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error recommending payment method:', error);
      throw error;
    }
  }

  /**
   * Optimize shipping options
   */
  private async optimizeShipping(data: { userId: string, cartItems: any[], shippingAddress: any }): Promise<any> {
    try {
      // Get cart products
      const cartProductIds = data.cartItems.map(item => item.productId);
      const cartProducts = await prisma.product.findMany({
        where: { id: { in: cartProductIds } }
      });
      
      // Calculate cart weight and dimensions
      const cartWeight = data.cartItems.reduce((sum, item) => {
        const product = cartProducts.find(p => p.id === item.productId);
        return sum + ((product?.weight || 0) * item.quantity);
      }, 0);
      
      // Get available shipping methods
      const shippingMethods = await prisma.shippingMethod.findMany({
        where: {
          supportedCountries: { has: data.shippingAddress.country },
          maxWeight: { gte: cartWeight }
        }
      });
      
      // Prepare data for analysis
      const analysisData = {
        user: { id: data.userId },
        cart: {
          items: data.cartItems.map(item => {
            const product = cartProducts.find(p => p.id === item.productId);
            return {
              productId: item.productId,
              productName: product?.name || 'Unknown Product',
              quantity: item.quantity,
              weight: product?.weight || 0
            };
          }),
          totalWeight: cartWeight
        },
        shippingAddress: data.shippingAddress,
        availableShippingMethods: shippingMethods.map(method => ({
          id: method.id,
          name: method.name,
          estimatedDeliveryDays: method.estimatedDeliveryDays,
          cost: method.baseCost + (method.costPerWeight * cartWeight)
        }))
      };
      
      // Generate shipping recommendations
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a shipping optimization specialist. Recommend the best shipping options for this order.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify(analysisData)
        }
      ];
      
      const response = await this.chat(prompt);
      let recommendations;
      
      try {
        recommendations = JSON.parse(response || '{}');
      } catch (e) {
        // Default recommendations if parsing fails
        recommendations = {
          recommendedMethod: shippingMethods[0]?.name || 'Standard Shipping',
          alternatives: shippingMethods.slice(1, 3).map(method => method.name),
          reasoning: response || 'Based on delivery time and cost analysis'
        };
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error optimizing shipping:', error);
      throw error;
    }
  }
}