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
  productId?: string;
  originalData: any;
  results: Record<string, any>;
  errors: Record<string, string>;
  startTime: number;
  userId?: string;
  metadata: Record<string, any>;
}

/**
 * ProductPipeline handles the end-to-end process of product management
 * including creation, optimization, and publishing
 */
export class ProductPipeline {
  private swarmManager: SwarmManager;
  private stages: PipelineStage[];
  
  constructor(swarmManager: SwarmManager) {
    this.swarmManager = swarmManager;
    this.stages = this.defineStages();
  }

  /**
   * Define the stages of the product pipeline
   */
  private defineStages(): PipelineStage[] {
    return [
      {
        name: 'product_validation',
        taskType: 'product_validation',
        agentGroup: 'ecommerce',
        required: true,
        transform: (data, context) => ({
          action: 'validate',
          productData: data
        })
      },
      {
        name: 'market_research',
        taskType: 'market_analysis',
        agentGroup: 'analytics',
        required: false,
        condition: (data, context) => data.performMarketResearch === true,
        transform: (data, context) => ({
          industry: data.category || 'general',
          targetMarket: data.targetMarket || 'general',
          timeframe: '30 days',
          focusAreas: ['trends', 'competitors', 'opportunities']
        })
      },
      {
        name: 'description_enhancement',
        taskType: 'product_enhancement',
        agentGroup: 'ecommerce',
        required: false,
        condition: (data, context) => 
          data.description && 
          data.description.length < 100 && 
          data.enhanceDescription !== false,
        transform: (data, context) => ({
          action: 'enhance_description',
          productData: {
            id: context.productId,
            name: data.name,
            description: data.description,
            category: data.category
          }
        })
      },
      {
        name: 'pricing_optimization',
        taskType: 'pricing_optimization',
        agentGroup: 'ecommerce',
        required: false,
        condition: (data, context) => 
          data.optimizePricing === true || 
          context.results.market_research?.data?.trends?.length > 0,
        transform: (data, context) => ({
          productId: context.productId,
          marketData: context.results.market_research?.data || {},
          salesHistory: []
        })
      },
      {
        name: 'seo_optimization',
        taskType: 'seo_optimization',
        agentGroup: 'marketing',
        required: false,
        condition: (data, context) => data.optimizeSEO !== false,
        transform: (data, context) => ({
          productId: context.productId,
          name: data.name,
          description: context.results.description_enhancement?.data?.enhancedDescription || data.description,
          category: data.category,
          keywords: data.keywords || []
        })
      },
      {
        name: 'product_creation',
        taskType: 'product_creation',
        agentGroup: 'ecommerce',
        required: true,
        transform: (data, context) => {
          // Merge optimized data from previous stages
          const enhancedDescription = context.results.description_enhancement?.data?.enhancedDescription;
          const optimizedPrice = context.results.pricing_optimization?.data?.suggestedPrice;
          const seoData = context.results.seo_optimization?.data;
          
          return {
            action: 'create',
            productData: {
              name: data.name,
              description: enhancedDescription || data.description,
              price: optimizedPrice || data.price,
              category: data.category,
              inventory: data.inventory || 0,
              images: data.images || [],
              attributes: {
                ...data.attributes,
                ...(seoData ? { seoKeywords: seoData.keywords, seoTitle: seoData.title } : {})
              }
            }
          };
        }
      },
      {
        name: 'inventory_forecast',
        taskType: 'inventory_forecast',
        agentGroup: 'inventory',
        required: false,
        condition: (data, context) => 
          context.productId && 
          (data.forecastInventory === true || data.inventory === undefined),
        transform: (data, context) => ({
          productId: context.productId,
          timeframe: '90 days',
          salesData: []
        })
      }
    ];
  }

  /**
   * Execute the product pipeline
   */
  async execute(data: any, userId?: string): Promise<any> {
    const context: PipelineContext = {
      originalData: data,
      results: {},
      errors: {},
      startTime: Date.now(),
      userId,
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
          id: `product-pipeline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: stage.taskType,
          data: stageData,
          departments: [stage.agentGroup],
          priority: 'medium',
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        };
        
        // Execute task using swarm manager
        const response = await this.swarmManager.processTask(task);
        
        // Store result in context
        context.results[stage.name] = response;
        
        // Update context with product ID if created
        if (stage.name === 'product_creation' && response.success && response.data.product?.id) {
          context.productId = response.data.product.id;
        }
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
    // Extract product from results
    const product = context.results.product_creation?.data?.product;
    
    // Collect all enhancements made
    const enhancements = {
      descriptionEnhanced: !!context.results.description_enhancement?.data?.enhancedDescription,
      pricingOptimized: !!context.results.pricing_optimization?.data?.suggestedPrice,
      seoOptimized: !!context.results.seo_optimization?.data,
      inventoryForecasted: !!context.results.inventory_forecast?.data
    };
    
    // Collect recommendations from various stages
    const recommendations = [
      ...(context.results.market_research?.data?.recommendations || []),
      ...(context.results.pricing_optimization?.data?.reasoning ? 
        [`Pricing: ${context.results.pricing_optimization.data.reasoning}`] : []),
      ...(context.results.inventory_forecast?.data?.recommendations || [])
    ];
    
    return {
      success: true,
      product,
      enhancements,
      recommendations,
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