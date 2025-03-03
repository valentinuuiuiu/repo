import { AgentMessage, Task, AgentResponse } from '../../types';
import { BaseAgent, AgentConfig } from '../../core/BaseAgent';
import { prisma } from '../../../prisma';
import OpenAI from 'openai';
import { DefaultArgs, PrismaClientOptions } from '@prisma/client/runtime/library';

interface CustomerInquiry {
  id: string;
  customerId: string;
  message: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  orderId?: string;
  productId?: string;
  attachments?: string[];
  createdAt: Date;
}

interface CustomerSupportResponse {
  response: string;
  suggestedActions?: string[];
  internalNotes?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  confidence: number;
  requiresHumanReview: boolean;
}

// Define interfaces for task data types
interface GenericTaskData {
  action: string;
  data: any;
}

// Define interfaces for database models
interface OrderWithItems {
  id: string;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
  orderNumber: string;
  storeId: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  supplierId: string;
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    product: any;
  }>;
  customer: any;
}

/**
 * CustomerSupportAgent handles customer inquiries, support tickets,
 * and provides assistance with orders, products, and general questions
 */
export class CustomerSupportAgent extends BaseAgent {
  protected knowledgeBase: Map<string, any>;
  private responseTemplates: Map<string, string>;
  
  constructor(config: AgentConfig) {
    super({
      ...config,
      capabilities: [
        'customer_inquiry_handling',
        'order_assistance',
        'product_assistance',
        'returns_processing',
        'complaint_resolution',
        'feedback_analysis'
      ],
      group: 'support'
    });
    
    this.knowledgeBase = new Map();
    this.responseTemplates = new Map();
    this.initializeKnowledgeBase();
    this.initializeResponseTemplates();
  }
  /**
   * Type guard for CustomerInquiry
   */
  private isCustomerInquiry(data: any): data is CustomerInquiry {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.id === 'string' &&
      typeof data.customerId === 'string' &&
      typeof data.message === 'string' &&
      typeof data.createdAt === 'object' && // Assuming Date objects are considered objects
      (data.category === undefined || typeof data.category === 'string') &&
      (data.priority === undefined || ['low', 'medium', 'high'].includes(data.priority)) &&
      (data.orderId === undefined || typeof data.orderId === 'string') &&
      (data.productId === undefined || typeof data.productId === 'string') &&
      (data.attachments === undefined || Array.isArray(data.attachments))
    );
  }

  /**
   * Handle a message from the agent
   */
  async handleMessage(message: AgentMessage): Promise<AgentResponse> {
    const task: Task = { id: `task-${Date.now()}`, type: 'customer_inquiry', priority: 1, data: message, departments: [], createdAt: new Date() };
    return await this.executeTask(task);
  }

  /**
   * Execute a customer support task
   */
  async executeTask(task: Task): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      switch (task.type) {
        case 'customer_inquiry':
          if (this.isCustomerInquiry(task.data)) {
            result = await this.handleCustomerInquiry(task.data);
          } else {
            throw new Error('Invalid data format for customer_inquiry');
          }
          break;
        default:
          // Handle other customer support tasks
          result = await this.handleGenericSupportTask(task);
      }
      
      return {
        success: true,
        data: result.response || 'No response generated',
        metadata: {
          confidence: result.confidence || 0.85,
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4'
        }
      };
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  /**
   * Handle a customer inquiry
   */
  private async handleCustomerInquiry(data: CustomerInquiry): Promise<CustomerSupportResponse> {
    try {
      // Categorize inquiry if not already categorized
      if (!data.category) {
        data.category = await this.categorizeInquiry(data.message);
      }
      
      // Get customer information
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId }
      });
      
      // Get order information if applicable
      let order = null;
      if (data.orderId) {
        // Using any type to bypass type checking for Prisma schema mismatch
        const prismaQuery = {
          where: { id: data.orderId },
          include: {
            items: {
              include: {}
            }
          }
        };
        // Adding product property dynamically to avoid TypeScript error
        (prismaQuery.include.items.include as any).product = true;
        
        order = await prisma.order.findUnique(prismaQuery) as unknown as OrderWithItems;
      }
      
      // Get product information if applicable
      let product = null;
      if (data.productId) {
        product = await prisma.product.findUnique({
          where: { id: data.productId }
        });
      }
      
      // Get relevant knowledge base articles
      const relevantArticles = await this.getRelevantKnowledgeBaseArticles(data.message, data.category);
      
      // Prepare data for response generation
      const responseData = {
        inquiry: data,
        customer,
        order,
        product,
        relevantArticles,
        category: data.category
      };
      
      // Generate response
      const response = await this.generateResponse(responseData);
      
      // Save interaction to database - using any type to bypass missing model
      await (prisma as any).customerInteraction.create({
        data: {
          customerId: data.customerId,
          inquiryId: data.id,
          category: data.category,
          message: data.message,
          response: response.response,
          sentiment: response.sentiment,
          requiresHumanReview: response.requiresHumanReview,
          createdAt: new Date()
        }
      });
      
      return response;
    } catch (error) {
      console.error('Error handling customer inquiry:', error);
      throw error;
    }
  }

  /**
   * Handle generic customer support tasks
   */
  private async handleGenericSupportTask(task: Task): Promise<any> {
    // Cast task.data to GenericTaskData to access action and data
    const taskData = task.data as unknown as GenericTaskData;
    const { action, data } = taskData;
    
    switch (action) {
      case 'process_return':
        return await this.processReturn(data);
      case 'resolve_complaint':
        return await this.resolveComplaint(data);
      case 'analyze_feedback':
        return await this.analyzeFeedback(data);
      default:
        throw new Error(`Unknown support action: ${action}`);
    }
  }

  /**
   * Categorize a customer inquiry
   */
  private async categorizeInquiry(message: string): Promise<string> {
    try {
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a customer support specialist. Categorize this customer inquiry into one of the following categories: 
          order_status, returns, product_question, technical_support, billing, shipping, complaint, general_inquiry.`
        },
        {
          role: 'user' as const,
          content: message
        }
      ];
      
      const response = await this.chat(prompt);
      
      // Extract category from response
      const categories = [
        'order_status', 'returns', 'product_question', 'technical_support', 
        'billing', 'shipping', 'complaint', 'general_inquiry'
      ];
      
      for (const category of categories) {
        if (response?.toLowerCase().includes(category)) {
          return category;
        }
      }
      
      return 'general_inquiry';
    } catch (error) {
      console.error('Error categorizing inquiry:', error);
      return 'general_inquiry';
    }
  }

  /**
   * Get relevant knowledge base articles
   */
  private async getRelevantKnowledgeBaseArticles(message: string, category: string): Promise<any[]> {
    try {
      // Get articles from database - using any type to bypass missing model
      const dbArticles = await (prisma as any).knowledgeBaseArticle.findMany({
        where: {
          categories: {
            has: category
          }
        },
        take: 3
      });
      
      if (dbArticles.length > 0) {
        return dbArticles;
      }
      
      // If no articles in database, use internal knowledge base
      const articles = [];
      for (const [key, value] of this.knowledgeBase.entries()) {
        if (key.includes(category)) {
          articles.push(value);
        }
      }
      
      return articles.slice(0, 3);
    } catch (error) {
      console.error('Error getting knowledge base articles:', error);
      return [];
    }
  }

  /**
   * Generate a response to a customer inquiry
   */
  private async generateResponse(data: any): Promise<CustomerSupportResponse> {
    try {
      // Get response template if available
      let template = '';
      if (data.category && this.responseTemplates.has(data.category)) {
        template = this.responseTemplates.get(data.category) || '';
      }
      
      // Prepare prompt for response generation
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a customer support specialist. Generate a helpful, empathetic response to this customer inquiry.
          ${template ? `Use this template as a guide: ${template}` : ''}
          Also provide:
          1. Suggested actions for the customer
          2. Internal notes for support team
          3. Assessment of customer sentiment
          4. Whether this requires human review`
        },
        {
          role: 'user' as const,
          content: JSON.stringify(data)
        }
      ];
      
      const response = await this.chat(prompt);
      let parsedResponse: CustomerSupportResponse;
      
      try {
        parsedResponse = JSON.parse(response || '{}');
      } catch (e) {
        // Extract structured response from text
        const responseText = response || '';
        
        parsedResponse = {
          response: this.extractSection(responseText, 'response') || responseText,
          suggestedActions: this.extractListFromText(responseText, 'suggested actions'),
          internalNotes: this.extractSection(responseText, 'internal notes') || undefined,
          sentiment: this.determineSentiment(responseText),
          confidence: responseText.includes('high confidence') ? 0.9 : 
                     responseText.includes('medium confidence') ? 0.7 : 0.5,
          requiresHumanReview: responseText.includes('requires human review') || 
                              responseText.includes('human review needed')
        };
      }
      
      return parsedResponse;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  /**
   * Process a return request
   */
  private async processReturn(data: { orderId: string, reason: string, items: Array<{ productId: string, quantity: number }> }): Promise<any> {
    try {
      // Get order information
      // Using any type to bypass type checking for Prisma schema mismatch
      const prismaQuery = {
        where: { id: data.orderId },
        include: {
          items: {
            include: {}
          },
          customer: true
        }
      };
      // Adding product property dynamically to avoid TypeScript error
      (prismaQuery.include.items.include as any).product = true;
      
      const order = await prisma.order.findUnique(prismaQuery) as unknown as OrderWithItems;
      
      if (!order) {
        throw new Error(`Order with ID ${data.orderId} not found`);
      }
      
      // Validate return eligibility
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceOrder > 30) {
        return {
          eligible: false,
          reason: 'Return period has expired (30 days)',
          suggestedResponse: 'We apologize, but the 30-day return period for this order has expired. Please contact our customer support team if you have any questions.'
        };
      }
      
      // Check if items are in the order
      const invalidItems = [];
      for (const returnItem of data.items) {
        const orderItem = order.items.find((item: any) => item.productId === returnItem.productId);
        if (!orderItem || orderItem.quantity < returnItem.quantity) {
          invalidItems.push(returnItem.productId);
        }
      }
      
      if (invalidItems.length > 0) {
        return {
          eligible: false,
          reason: 'One or more items are not valid for return',
          invalidItems,
          suggestedResponse: 'Some items in your return request were not found in your original order or the quantities exceed what was purchased. Please review your return request and try again.'
        };
      }
      
      // Create return in database - using any type to bypass missing model
      const returnRecord = await (prisma as any).return.create({
        data: {
          orderId: data.orderId,
          customerId: order.customerId,
          reason: data.reason,
          status: 'pending',
          items: data.items,
          createdAt: new Date()
        }
      });
      
      // Generate return instructions
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a returns specialist. Generate return instructions for this customer.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify({
            order,
            returnItems: data.items,
            reason: data.reason
          })
        }
      ];
      
      const response = await this.chat(prompt);
      
      return {
        eligible: true,
        returnId: returnRecord.id,
        instructions: response,
        estimatedRefundAmount: data.items.reduce((total, item) => {
          const orderItem = order.items.find((oi: any) => oi.productId === item.productId);
          return total + (orderItem ? orderItem.price * item.quantity : 0);
        }, 0),
        returnLabel: `https://example.com/return-labels/${returnRecord.id}.pdf`
      };
    } catch (error) {
      console.error('Error processing return:', error);
      throw error;
    }
  }

  /**
   * Resolve a customer complaint
   */
  private async resolveComplaint(data: { complaintId: string, resolution?: string }): Promise<any> {
    try {
      // Get complaint information - using any type to bypass missing model
      const complaint = await (prisma as any).complaint.findUnique({
        where: { id: data.complaintId },
        include: {
          customer: true,
          order: true
        }
      });
      
      if (!complaint) {
        throw new Error(`Complaint with ID ${data.complaintId} not found`);
      }
      
      // Generate resolution if not provided
      let resolution = data.resolution;
      if (!resolution) {
        const prompt = [
          {
            role: 'system' as const,
            content: `You are ${this.name}, a complaint resolution specialist. Generate a resolution for this customer complaint.`
          },
          {
            role: 'user' as const,
            content: JSON.stringify(complaint)
          }
        ];
      
        resolution = await this.chat(prompt);
      }
      
      // Update complaint in database - using any type to bypass missing model
      const updatedComplaint = await (prisma as any).complaint.update({
        where: { id: data.complaintId },
        data: {
          resolution,
          status: 'resolved',
          resolvedAt: new Date()
        }
      });
      
      // Generate customer communication
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a customer support specialist. Generate an email to the customer informing them of the resolution to their complaint.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify({
            complaint,
            resolution
          })
        }
      ];
      
      const customerEmail = await this.chat(prompt);
      
      return {
        complaintId: data.complaintId,
        resolution,
        status: 'resolved',
        customerEmail,
        compensationOffered: complaint.severity === 'high'
      };
    } catch (error) {
      console.error('Error resolving complaint:', error);
      throw error;
    }
  }

  /**
   * Analyze customer feedback
   */
  private async analyzeFeedback(data: { feedbackId: string } | { feedback: string, source: string }): Promise<any> {
    try {
      let feedbackText = '';
      let feedbackSource = '';
      
      if ('feedbackId' in data) {
        // Get feedback from database - using any type to bypass missing model
        const feedback = await (prisma as any).feedback.findUnique({
          where: { id: data.feedbackId }
        });
        
        if (!feedback) {
          throw new Error(`Feedback with ID ${data.feedbackId} not found`);
        }
        
        feedbackText = feedback.content;
        feedbackSource = feedback.source;
      } else {
        feedbackText = data.feedback;
        feedbackSource = data.source;
      }
      
      // Analyze feedback
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a feedback analysis specialist. Analyze this customer feedback and extract key insights, sentiment, and actionable recommendations.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify({
            feedback: feedbackText,
            source: feedbackSource
          })
        }
      ];
      
      const response = await this.chat(prompt);
      let analysis;
      
      try {
        analysis = JSON.parse(response || '{}');
      } catch (e) {
        // Extract structured analysis from text
        analysis = {
          sentiment: this.determineSentiment(response || ''),
          keyPoints: this.extractListFromText(response || '', 'key points'),
          actionableInsights: this.extractListFromText(response || '', 'actionable'),
          productMentions: this.extractListFromText(response || '', 'product'),
          priority: response?.includes('high priority') ? 'high' : 
                  response?.includes('medium priority') ? 'medium' : 'low',
          confidence: 0.85
        };
      }
      
      // Save analysis to database if feedback ID provided
      if ('feedbackId' in data) {
        await (prisma as any).feedbackAnalysis.create({
          data: {
            feedbackId: data.feedbackId,
            sentiment: analysis.sentiment,
            keyPoints: analysis.keyPoints,
            actionableInsights: analysis.actionableInsights,
            priority: analysis.priority,
            createdAt: new Date()
          }
        });
      }
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing feedback:', error);
      throw error;
    }
  }

  /**
   * Initialize knowledge base with common support information
   */
  private initializeKnowledgeBase(): void {
    this.knowledgeBase.set('returns_policy', {
      title: 'Returns Policy',
      content: 'Our standard return policy allows returns within 30 days of purchase. Items must be in original condition with tags attached. Refunds are processed within 5-7 business days after we receive the returned items.',
      categories: ['returns', 'general_inquiry']
    });
    
    this.knowledgeBase.set('shipping_information', {
      title: 'Shipping Information',
      content: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. International shipping takes 7-14 business days. Shipping is free on orders over $50.',
      categories: ['shipping', 'order_status']
    });
    
    this.knowledgeBase.set('order_tracking', {
      title: 'Order Tracking',
      content: 'You can track your order by logging into your account and viewing your order history. Alternatively, you can use the tracking number provided in your shipping confirmation email.',
      categories: ['order_status', 'shipping']
      });
      
      this.knowledgeBase.set('payment_methods', {
      title: 'Payment Methods',
      content: 'We accept Visa, Mastercard, American Express, Discover, PayPal, and Apple Pay. Payment information is securely processed and we do not store your full credit card details.',
      categories: ['billing', 'general_inquiry']
      });
      
      this.knowledgeBase.set('product_warranty', {
      title: 'Product Warranty',
      content: 'Most products come with a 1-year manufacturer warranty. Some premium products have extended warranties. Warranty claims require proof of purchase and are handled directly by the manufacturer in most cases.',
      categories: ['product_question', 'technical_support']
      });
      }
      
      /**
      * Initialize response templates for different inquiry categories
      */
     private initializeResponseTemplates(): void {
     this.responseTemplates.set('order_status', 'Thank you for your inquiry about your order status. [Order Details]. If you have any further questions about your order, please don\'t hesitate to ask.');
     
     this.responseTemplates.set('returns', 'Thank you for your inquiry about returns. Based on our return policy, [Return Eligibility]. Here are the steps to process your return: [Return Steps]. If you need any clarification, please let me know.');
     
     this.responseTemplates.set('product_question', 'Thank you for your question about [Product Name]. [Product Information]. I hope this information helps! If you have any other questions about this product, please feel free to ask.');
     
     this.responseTemplates.set('technical_support', 'I understand you\'re experiencing an issue with [Product/Service]. Let\'s troubleshoot this together. [Troubleshooting Steps]. If these steps don\'t resolve the issue, please [Next Steps].');
     
     this.responseTemplates.set('billing', 'Thank you for your inquiry about billing. [Billing Information]. If you have any other questions about your billing, please provide your order number and I\'ll be happy to help further.');
     
     this.responseTemplates.set('shipping', 'Thank you for your inquiry about shipping. [Shipping Information]. If you need any clarification about your shipment, please let me know.');
     
     this.responseTemplates.set('complaint', 'I\'m sorry to hear about your experience with [Issue]. I understand this is frustrating and I want to help resolve this for you. [Resolution Steps]. Please accept our apologies for any inconvenience this has caused.');
     
     this.responseTemplates.set('general_inquiry', 'Thank you for your inquiry. [Response to Inquiry]. If you have any other questions, please don\'t hesitate to ask.');
     }
     
     /**
     * Extract a list from text based on a keyword
     */
    private extractListFromText(text: string, keyword: string): string[] {
    const result: string[] = [];
    const lines = text.split('\n');
    let inSection = false;
    
    for (const line of lines) {
    if (line.toLowerCase().includes(keyword.toLowerCase()) && line.includes(':')) {
    inSection = true;
    continue;
    }
    
    if (inSection && line.trim()) {
    if (line.match(/^[A-Z0-9]/) && !line.includes('-') && !line.includes('•')) {
    inSection = false;
    continue;
    }
    
    const item = line.replace(/^[-•*]\s*/, '').trim();
    if (item) {
    result.push(item);
    }
    }
    }
    
    return result;
    }
    
    /**
    * Extract a section from text
    */
   private extractSection(text: string, sectionName: string): string | undefined {
   const regex = new RegExp(`${sectionName}[:\\s]+(.*?)(?=\\n\\s*\\n|\\n[A-Z]|$)`, 'is');
   const match = text.match(regex);
   return match ? match[1].trim() : undefined;
   }
   
   /**
   * Determine sentiment from text
   */
  private determineSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('positive sentiment') || 
  lowerText.includes('sentiment: positive') ||
  lowerText.includes('sentiment is positive')) {
  return 'positive';
  } else if (lowerText.includes('negative sentiment') || 
  lowerText.includes('sentiment: negative') ||
  lowerText.includes('sentiment is negative')) {
  return 'negative';
  }
  
  // Count positive and negative words
  const positiveWords = ['happy', 'satisfied', 'pleased', 'great', 'good', 'excellent', 'love', 'like', 'appreciate'];
  const negativeWords = ['unhappy', 'dissatisfied', 'disappointed', 'bad', 'poor', 'terrible', 'hate', 'dislike', 'frustrated', 'angry'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  const matches = lowerText.match(regex);
  if (matches) {
  positiveCount += matches.length;
  }
  }
  
  for (const word of negativeWords) {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  const matches = lowerText.match(regex);
  if (matches) {
  negativeCount += matches.length;
  }
  }
  
  if (positiveCount > negativeCount) {
  return 'positive';
  } else if (negativeCount > positiveCount) {
  return 'negative';
  } else {
  return 'neutral';
  }
  }
}