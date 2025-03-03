import { Task, AgentResponse } from '../../types';
import { SwarmManager } from '../swarm/SwarmManager';
import { prisma } from '../../../prisma';

interface PipelineStage {
  name: string;
  taskType: string;
  agentGroup: string;
  required: boolean;
  condition?: (data: any, context: PipelineContext) => boolean;
  transform?: (data: any, context: PipelineContext) => any;
}

interface PipelineContext {
  sessionId: string;
  userId: string;
  originalData: any;
  results: Record<string, any>;
  errors: Record<string, string>;
  startTime: number;
  metadata: Record<string, any>;
}

/**
 * CheckoutPipeline handles the end-to-end process of checkout optimization
 * including personalization, upsells, payment optimization, and order processing
 */
export class CheckoutPipeline {
  private swarmManager: SwarmManager;
  private stages: PipelineStage[];
  
  constructor(swarmManager: SwarmManager) {
    this.swarmManager = swarmManager;
    this.stages = this.defineStages();
  }

  /**
   * Define the stages of the checkout pipeline
   */
  private defineStages(): PipelineStage[] {
    return [
      {
        name: 'cart_validation',
        taskType: 'cart_validation',
        agentGroup: 'ecommerce',
        required: true,
        transform: (data, context) => ({
          action: 'validate',
          cartItems: data.cartItems,
          userId: context.userId
        })
      },
      {
        name: 'checkout_optimization',
        taskType: 'order_processing',
        agentGroup: 'ecommerce',
        required: true,
        transform: (data, context) => ({
          userId: context.userId,
          cartItems: data.cartItems,
          shippingAddress: data.shippingAddress,
          paymentMethod: data.paymentMethod,
          couponCode: data.couponCode,
          sessionId: context.sessionId
        })
      },
      {
        name: 'payment_recommendation',
        taskType: 'payment_optimization',
        agentGroup: 'ecommerce',
        required: false,
        condition: (data, context) => !data.paymentMethod,
        transform: (data, context) => ({
          action: 'payment_method_recommendation',
          data: {
            userId: context.userId,
            cartTotal: data.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            country: data.shippingAddress?.country || 'US'
          }
        })
      },
      {
        name: 'shipping_optimization',
        taskType: 'shipping_optimization',
        agentGroup: 'ecommerce',
        required: false,
        condition: (data, context) => 
          data.shippingAddress && 
          !data.shippingMethod,
        transform: (data, context) => ({
          action: 'shipping_optimization',
          data: {
            userId: context.userId,
            cartItems: data.cartItems,
            shippingAddress: data.shippingAddress
          }
        })
      },
      {
        name: 'discount_application',
        taskType: 'discount_optimization',
        agentGroup: 'ecommerce',
        required: false,
        condition: (data, context) => {
          // Apply if cart value is high or abandonment risk is high
          const cartTotal = data.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const abandonmentRisk = context.results.checkout_optimization?.data?.abandonmentRisk || 0;
          return (cartTotal > 100 || abandonmentRisk > 0.7) && !data.couponCode;
        },
        transform: (data, context) => ({
          action: 'discount_recommendation',
          data: {
            userId: context.userId,
            cartItems: data.cartItems,
            cartTotal: data.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            abandonmentRisk: context.results.checkout_optimization?.data?.abandonmentRisk || 0
          }
        })
      },
      {
        name: 'order_processing',
        taskType: 'order_creation',
        agentGroup: 'ecommerce',
        required: true,
        condition: (data, context) => data.completeOrder === true,
        transform: (data, context) => {
          // Get optimized data from previous stages
          const paymentMethod = context.results.payment_recommendation?.data?.primaryRecommendation || data.paymentMethod;
          const shippingMethod = context.results.shipping_optimization?.data?.recommendedMethod || data.shippingMethod;
          const discountCode = context.results.discount_application?.data?.recommendedDiscount?.code || data.couponCode;
          
          return {
            action: 'create_order',
            orderData: {
              userId: context.userId,
              items: data.cartItems,
              shippingAddress: data.shippingAddress,
              paymentMethod,
              shippingMethod,
              discountCode
            }
          };
        }
      }
    ];
  }

  /**
   * Execute the checkout pipeline
   */
  async execute(data: any, userId: string, sessionId: string): Promise<any> {
    const context: PipelineContext = {
      sessionId,
      userId,
      originalData: data,
      results: {},
      errors: {},
      startTime: Date.now(),
      metadata: {}
    };
    
    // Execute each stage in sequence
    for (const stage of this.stages) {
      // Check if stage should be executed
      if (stage.condition && !stage.condition(data, context)) {
        console.log(`Skipping stage ${stage.name} due to condition`);
        continue;
      }
      
      try {
        // Transform data for this stage
        const stageData = stage.transform ? stage.transform(data, context) : data;
        
        // Create task for this stage
        const task: Task = {
          id: `checkout-pipeline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: stage.taskType,
          data: stageData,
          departments: [stage.agentGroup],
          priority: 'high',
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        };
        
        // Execute task using swarm manager
        const response = await this.swarmManager.processTask(task);
        
        // Store result in context
        context.results[stage.name] = response;
      } catch (error) {
        // Record error
        context.errors[stage.name] = (error as Error).message;
        
        // If stage is required and failed, abort pipeline
        if (stage.required) {
          return this.generateErrorResponse(context, `Required stage ${stage.name} failed: ${(error as Error).message}`);
        }
      }
    }
    
    return this.generateSuccessResponse(context);
  }

  /**
   * Generate success response
   */
  private generateSuccessResponse(context: PipelineContext): any {
    // Extract order from results if order was created
    const order = context.results.order_processing?.data?.order;
    
    // Collect all optimizations made
    const optimizations = {
      checkoutOptimized: !!context.results.checkout_optimization?.data,
      paymentRecommended: !!context.results.payment_recommendation?.data,
      shippingOptimized: !!context.results.shipping_optimization?.data,
      discountApplied: !!context.results.discount_application?.data
    };
    
    // Collect recommendations from checkout optimization
    const recommendations = context.results.checkout_optimization?.data?.recommendations || [];
    
    // Determine if order was created or just optimized
    const orderCreated = !!order;
    
    return {
      success: true,
      sessionId: context.sessionId,
      orderCreated,
      order,
      optimizations,
      recommendations,
      abandonmentRisk: context.results.checkout_optimization?.data?.abandonmentRisk || 0,
      suggestedPaymentMethod: context.results.payment_recommendation?.data?.primaryRecommendation,
      suggestedShippingMethod: context.results.shipping_optimization?.data?.recommendedMethod,
      suggestedDiscount: context.results.discount_application?.data?.recommendedDiscount,
      processingTime: Date.now() - context.startTime,
      stages: Object.keys(context.results).map(stageName => ({
        name: stageName,
        success: true,
        processingTime: context.results[stageName].metadata.processingTime
      }))
    };
  }

  /**
   * Generate error response
   */
  private generateErrorResponse(context: PipelineContext, message: string): any {
    return {
      success: false,
      sessionId: context.sessionId,
      error: message,
      errors: context.errors,
      processingTime: Date.now() - context.startTime,
      stages: Object.keys(context.results).map(stageName => ({
        name: stageName,
        success: true,
        processingTime: context.results[stageName].metadata.processingTime
      }))
    };
  }
}