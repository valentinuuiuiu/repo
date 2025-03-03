import { AgentType } from '@prisma/client'
import { AgentCoordinator } from './agent-coordinator'
import { OpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables'
import { useAgentStore } from './agent-monitoring'
import { AgentMessage } from './types'
import { PlatformAnalytics, EventType } from '@/lib/analytics/platform-analytics'

const openai = new OpenAI({
  modelName: 'gpt-4o-mini'
})

/**
 * Base class for department-specific agents
 * Handles communication and state management for agents within a department
 */
abstract class DepartmentAgent {
  protected coordinator: AgentCoordinator
  protected agentId: string
  protected department: string
  protected state: Record<string, any> = {}
  protected unsubscribe: (() => void) | null = null
  
  constructor(department: string, agentId: string) {
    this.coordinator = new AgentCoordinator(department)
    this.agentId = agentId
    this.department = department
  }

  abstract handleMessage(message: any): Promise<any>
  
  /**
   * Start the agent and subscribe to messages
   * @returns A cleanup function to unsubscribe
   */
  async start(): Promise<() => void> {
    if (this.unsubscribe) {
      return this.unsubscribe
    }

    // Load initial state
    await this.loadState()

    this.unsubscribe = await this.coordinator.subscribe(this.agentId, {
      onMessage: async (message: AgentMessage) => {
        try {
          // Track performance metrics
          const startTime = Date.now()
          
          // Process the message
          const response = await this.handleMessage(message)
          
          // Calculate duration
          const duration = Date.now() - startTime
          
          // Track success metric
          useAgentStore.getState().addMetric(this.agentId, {
            timestamp: Date.now(),
            success: true,
            duration,
            type: typeof message.type === 'string' ? message.type : 'unknown',
            department: this.department,
            details: { messageId: message.id }
          })
          
          // If there's a response, publish it
          if (response) {
            await this.coordinator.publish({
              id: `${message.id}-response`,
              type: `${message.type}-response`,
              from: this.agentId,
              to: message.from,
              content: response,
              timestamp: new Date(),
              agentId: this.agentId,
              metadata: { inResponseTo: message.id }
            }, message.from)
          }
          
          // Update agent state
          await this.saveState()
        } catch (error) {
          console.error(`Agent ${this.agentId} error:`, error)
          
          // Track error metric
          useAgentStore.getState().addMetric(this.agentId, {
            timestamp: Date.now(),
            success: false,
            duration: 0,
            type: typeof message.type === 'string' ? message.type : 'unknown',
            department: this.department,
            details: { messageId: message.id, error: String(error) }
          })
        }
      }
    })
    
    return this.unsubscribe
  }

  /**
   * Send a direct message to another agent
   * @param targetAgentId Target agent ID
   * @param payload Message payload
   */
  async sendDirectMessage(targetAgentId: string, payload: any): Promise<void> {
    await this.coordinator.publish({
      id: `${this.agentId}-${Date.now()}`,
      type: payload.action || 'message',
      from: this.agentId,
      to: targetAgentId,
      content: payload,
      timestamp: new Date(),
      agentId: this.agentId
    }, targetAgentId)
  }

  /**
   * Broadcast a message to all agents in the department
   * @param payload Message payload
   */
  async broadcastMessage(payload: any): Promise<void> {
    await this.coordinator.publish({
      id: `${this.agentId}-${Date.now()}`,
      type: payload.action || 'broadcast',
      from: this.agentId,
      content: payload,
      timestamp: new Date(),
      agentId: this.agentId
    })
  }

  /**
   * Load agent state from storage
   */
  protected async loadState(): Promise<void> {
    const savedState = await this.coordinator.getAgentState(this.agentId)
    if (savedState) {
      this.state = savedState
    }
  }

  /**
   * Save agent state to storage
   */
  protected async saveState(): Promise<void> {
    await this.coordinator.setState(this.agentId, this.state)
  }

  /**
   * Update agent state
   * @param updates State updates to apply
   */
  async updateState(updates: Record<string, any>): Promise<void> {
    this.state = { ...this.state, ...updates }
    await this.saveState()
  }

  /**
   * Get the current agent state
   * @returns The current state
   */
  getState(): Record<string, any> {
    return { ...this.state }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }
}

export class FashionPricingAgent extends DepartmentAgent {
  private pricingPrompt = PromptTemplate.fromTemplate(`
    Analyze the following fashion product and market data to determine optimal pricing:
    Product: {product}
    Market Data: {marketData}
    Seasonality: {season}
    
    Provide pricing recommendations in the following format:
    - Base Price
    - Recommended Markup
    - Seasonal Adjustments
    - Competitive Position
  `)

  async handleMessage(message: any) {
    if (message.content?.action === 'calculateOptimalPrice' || 
        message.payload?.action === 'calculateOptimalPrice') {
      const data = message.content?.data || message.payload?.data || {}
      const { productDetails, marketData, season } = data
      
      // Update state with current task
      await this.updateState({
        currentTask: 'calculateOptimalPrice',
        productDetails,
        lastUpdated: new Date().toISOString()
      })
      
      const chain = RunnableSequence.from([
        this.pricingPrompt,
        openai,
        (response) => {
          // Parse AI response and structure pricing data
          const lines = response.text.split('\n').filter(line => line.trim());
          const result: Record<string, any> = {
            basePrice: 0,
            markup: 0,
            adjustments: [],
            competitiveAnalysis: {}
          };
          
          // Simple parsing of response lines
          for (const line of lines) {
            if (line.includes('Base Price')) {
              const match = line.match(/\d+(\.\d+)?/);
              if (match) result.basePrice = parseFloat(match[0]);
            } else if (line.includes('Markup')) {
              const match = line.match(/\d+(\.\d+)?%?/);
              if (match) {
                let markup = parseFloat(match[0]);
                if (line.includes('%')) markup /= 100;
                result.markup = markup;
              }
            } else if (line.includes('Adjustment')) {
              result.adjustments.push(line.split(':')[1]?.trim() || line);
            } else if (line.includes('Competitive')) {
              result.competitiveAnalysis.position = line.split(':')[1]?.trim() || line;
            }
          }
          
          return result;
        }
      ])

      try {
        const result = await chain.invoke({
          product: JSON.stringify(productDetails),
          marketData: JSON.stringify(marketData),
          season
        })
        
        // Update state with results
        await this.updateState({
          lastResult: result,
          lastUpdated: new Date().toISOString()
        })
        
        return result
      } catch (error) {
        console.error('Error in pricing calculation:', error)
        throw error
      }
    }
    
    return null
  }
}

export class ElectronicsQualityAgent extends DepartmentAgent {
  private specTemplate = PromptTemplate.fromTemplate(`
    Validate the following electronic product specifications:
    Specs: {specs}
    Standards: {standards}
    
    Verify:
    1. Technical accuracy
    2. Compatibility requirements
    3. Safety certifications
    4. Performance claims
    
    Respond with a JSON object containing:
    {
      "isValid": boolean,
      "validations": [string],
      "warnings": [string],
      "recommendations": [string]
    }
  `)

  async handleMessage(message: any) {
    if (message.content?.action === 'verifyTechSpecs' || 
        message.payload?.action === 'verifyTechSpecs') {
      const data = message.content?.data || message.payload?.data || {}
      const { productSpecs, certifications } = data
      
      // Update state with current task
      await this.updateState({
        currentTask: 'verifyTechSpecs',
        productSpecs: productSpecs,
        lastUpdated: new Date().toISOString()
      })
      
      const chain = RunnableSequence.from([
        this.specTemplate,
        openai,
        (response) => {
          try {
            // Try to parse JSON response
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback to manual parsing
            return {
              isValid: response.text.toLowerCase().includes('valid'),
              validations: response.text.split('\n')
                .filter(line => line.includes('✓') || line.includes('Validated'))
                .map(line => line.trim()),
              warnings: response.text.split('\n')
                .filter(line => line.includes('⚠') || line.includes('Warning'))
                .map(line => line.trim()),
              recommendations: response.text.split('\n')
                .filter(line => line.includes('Recommend'))
                .map(line => line.trim())
            };
          } catch (e) {
            console.error('Error parsing response:', e);
            return {
              isValid: false,
              validations: [],
              warnings: ['Error parsing validation results'],
              recommendations: ['Review specifications manually']
            };
          }
        }
      ])

      try {
        const result = await chain.invoke({
          specs: JSON.stringify(productSpecs),
          standards: JSON.stringify(certifications)
        })
        
        // Update state with results
        await this.updateState({
          lastResult: result,
          lastUpdated: new Date().toISOString()
        })
        
        return result
      } catch (error) {
        console.error('Error in tech spec validation:', error)
        throw error
      }
    }
    
    return null
  }
}

export class LogisticsAgent extends DepartmentAgent {
  private invoiceTemplate = PromptTemplate.fromTemplate(`
    Process the following invoice data:
    Invoice: {invoice}
    Action: {action}
    
    Analyze:
    1. Payment terms and conditions
    2. Tax implications and requirements
    3. Accounting categorization
    4. Documentation compliance
    
    Respond with a JSON object containing:
    {
      "processed": boolean,
      "analysis": {
        "paymentTerms": string,
        "taxImplications": [string],
        "accountingCategory": string,
        "complianceStatus": string
      },
      "recommendations": [string],
      "nextSteps": [string]
    }
  `)

  private documentTemplate = PromptTemplate.fromTemplate(`
    Process the following document:
    Document: {document}
    Type: {documentType}
    Action: {action}
    
    Analyze:
    1. Document classification and purpose
    2. Required retention period
    3. Related business processes
    4. Compliance requirements
    
    Respond with a JSON object containing:
    {
      "processed": boolean,
      "classification": {
        "category": string,
        "retentionPeriod": string,
        "confidentialityLevel": string
      },
      "relatedProcesses": [string],
      "complianceNotes": [string],
      "archivingInstructions": string
    }
  `)

  private inventoryTemplate = PromptTemplate.fromTemplate(`
    Process the following inventory update:
    Products: {products}
    Action: {action}
    Location: {location}
    
    Analyze:
    1. Stock level implications
    2. Reordering requirements
    3. Inventory valuation impact
    4. Storage optimization
    
    Respond with a JSON object containing:
    {
      "processed": boolean,
      "stockAnalysis": {
        "currentLevels": object,
        "reorderRecommendations": [string],
        "valuationImpact": string
      },
      "storageOptimization": [string],
      "inventoryAlerts": [string]
    }
  `)

  private reportTemplate = PromptTemplate.fromTemplate(`
    Generate a {reportType} report for the following data:
    Data: {data}
    Timeframe: {timeframe}
    Filters: {filters}
    
    Include:
    1. Executive summary
    2. Key metrics and trends
    3. Anomalies and issues
    4. Recommendations
    
    Format the report professionally with clear sections and actionable insights.
  `)

  async handleMessage(message: any) {
    const content = message.content || message.payload || {};
    const action = content.action || '';
    
    // Track the start of processing
    const startTime = Date.now();
    PlatformAnalytics.trackEvent({
      type: EventType.AGENT_TASK_STARTED,
      properties: {
        agentId: this.agentId,
        department: this.department,
        action,
        messageId: message.id
      }
    });
    
    try {
      // Process different types of logistics tasks
      if (action === 'processInvoice') {
        return await this.handleInvoiceProcessing(content.data);
      } else if (action === 'manageDocument') {
        return await this.handleDocumentManagement(content.data);
      } else if (action === 'updateInventory') {
        return await this.handleInventoryUpdate(content.data);
      } else if (action === 'generateReport') {
        return await this.handleReportGeneration(content.data);
      }
      
      // Unknown action
      return null;
    } finally {
      // Track completion of processing
      PlatformAnalytics.trackEvent({
        type: EventType.AGENT_TASK_COMPLETED,
        properties: {
          agentId: this.agentId,
          department: this.department,
          action,
          messageId: message.id,
          duration: Date.now() - startTime
        }
      });
    }
  }
  
  private async handleInvoiceProcessing(data: any) {
    const { invoice, action } = data || {};
    
    // Update state with current task
    await this.updateState({
      currentTask: 'processInvoice',
      invoiceId: invoice?.id,
      action,
      lastUpdated: new Date().toISOString()
    });
    
    const chain = RunnableSequence.from([
      this.invoiceTemplate,
      openai,
      (response) => {
        try {
          // Try to parse JSON response
          const jsonMatch = response.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
          
          // Fallback to structured response
          return {
            processed: true,
            analysis: {
              paymentTerms: this.extractFromText(response.text, 'payment terms'),
              taxImplications: this.extractListFromText(response.text, 'tax implications'),
              accountingCategory: this.extractFromText(response.text, 'accounting category'),
              complianceStatus: this.extractFromText(response.text, 'compliance status')
            },
            recommendations: this.extractListFromText(response.text, 'recommendations'),
            nextSteps: this.extractListFromText(response.text, 'next steps')
          };
        } catch (e) {
          console.error('Error parsing invoice processing response:', e);
          return {
            processed: false,
            error: 'Failed to process invoice data',
            errorDetails: String(e)
          };
        }
      }
    ]);
    
    try {
      const result = await chain.invoke({
        invoice: JSON.stringify(invoice),
        action
      });
      
      // Update state with results
      await this.updateState({
        lastResult: result,
        lastUpdated: new Date().toISOString()
      });
      
      // Notify other agents about the invoice processing
      if (result.processed) {
        await this.broadcastMessage({
          action: 'invoiceProcessed',
          data: {
            invoiceId: invoice?.id,
            status: 'processed',
            summary: result.analysis
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error in invoice processing:', error);
      throw error;
    }
  }
  
  private async handleDocumentManagement(data: any) {
    const { document, documentType, action } = data || {};
    
    // Update state with current task
    await this.updateState({
      currentTask: 'manageDocument',
      documentId: document?.id,
      documentType,
      action,
      lastUpdated: new Date().toISOString()
    });
    
    const chain = RunnableSequence.from([
      this.documentTemplate,
      openai,
      (response) => {
        try {
          // Try to parse JSON response
          const jsonMatch = response.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
          
          // Fallback to structured response
          return {
            processed: true,
            classification: {
              category: this.extractFromText(response.text, 'category'),
              retentionPeriod: this.extractFromText(response.text, 'retention period'),
              confidentialityLevel: this.extractFromText(response.text, 'confidentiality')
            },
            relatedProcesses: this.extractListFromText(response.text, 'related processes'),
            complianceNotes: this.extractListFromText(response.text, 'compliance'),
            archivingInstructions: this.extractFromText(response.text, 'archiving')
          };
        } catch (e) {
          console.error('Error parsing document management response:', e);
          return {
            processed: false,
            error: 'Failed to process document data',
            errorDetails: String(e)
          };
        }
      }
    ]);
    
    try {
      const result = await chain.invoke({
        document: JSON.stringify(document),
        documentType,
        action
      });
      
      // Update state with results
      await this.updateState({
        lastResult: result,
        lastUpdated: new Date().toISOString()
      });
      
      // Notify relevant agents about document processing
      if (result.processed) {
        // Determine which agents need to know about this document
        const relevantAgents = this.determineRelevantAgents(documentType, result.classification?.category);
        
        for (const agentId of relevantAgents) {
          await this.sendDirectMessage(agentId, {
            action: 'documentProcessed',
            data: {
              documentId: document?.id,
              documentType,
              classification: result.classification,
              status: 'processed'
            }
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in document management:', error);
      throw error;
    }
  }
  
  private async handleInventoryUpdate(data: any) {
    const { products, action, location } = data || {};
    
    // Update state with current task
    await this.updateState({
      currentTask: 'updateInventory',
      productCount: Array.isArray(products) ? products.length : 0,
      action,
      location,
      lastUpdated: new Date().toISOString()
    });
    
    const chain = RunnableSequence.from([
      this.inventoryTemplate,
      openai,
      (response) => {
        try {
          // Try to parse JSON response
          const jsonMatch = response.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
          
          // Fallback to structured response
          return {
            processed: true,
            stockAnalysis: {
              currentLevels: {},
              reorderRecommendations: this.extractListFromText(response.text, 'reorder'),
              valuationImpact: this.extractFromText(response.text, 'valuation')
            },
            storageOptimization: this.extractListFromText(response.text, 'storage'),
            inventoryAlerts: this.extractListFromText(response.text, 'alert')
          };
        } catch (e) {
          console.error('Error parsing inventory update response:', e);
          return {
            processed: false,
            error: 'Failed to process inventory data',
            errorDetails: String(e)
          };
        }
      }
    ]);
    
    try {
      const result = await chain.invoke({
        products: JSON.stringify(products),
        action,
        location
      });
      
      // Update state with results
      await this.updateState({
        lastResult: result,
        lastUpdated: new Date().toISOString()
      });
      
      // Notify inventory agent about the update
      if (result.processed) {
        await this.sendDirectMessage('inventory-agent', {
          action: 'inventoryUpdated',
          data: {
            products: products.map((p: any) => ({ 
              id: p.id, 
              quantity: p.quantity,
              location
            })),
            action,
            analysis: result.stockAnalysis
          }
        });
        
        // If there are reorder recommendations, notify supplier agents
        if (result.stockAnalysis?.reorderRecommendations?.length > 0) {
          await this.sendDirectMessage('supplier-agent', {
            action: 'reorderRecommended',
            data: {
              recommendations: result.stockAnalysis.reorderRecommendations,
              products: products.filter((p: any) => p.quantity <= (p.reorderPoint || 10))
            }
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in inventory update:', error);
      throw error;
    }
  }
  
  private async handleReportGeneration(data: any) {
    const { reportType, timeframe, filters, data: reportData } = data || {};
    
    // Update state with current task
    await this.updateState({
      currentTask: 'generateReport',
      reportType,
      timeframe,
      lastUpdated: new Date().toISOString()
    });
    
    try {
      const response = await openai.invoke(this.reportTemplate.format({
        reportType,
        data: JSON.stringify(reportData),
        timeframe: JSON.stringify(timeframe),
        filters: JSON.stringify(filters)
      }));
      
      const result = {
        reportGenerated: true,
        reportType,
        content: response.text,
        generatedAt: new Date().toISOString(),
        metadata: {
          timeframe,
          filters
        }
      };
      
      // Update state with results
      await this.updateState({
        lastResult: result,
        lastUpdated: new Date().toISOString()
      });
      
      // Create a document record for this report
      const reportId = `REPORT-${Date.now()}`;
      await this.sendDirectMessage('logger-agent', {
        action: 'manageDocument',
        data: {
          document: {
            id: reportId,
            type: 'report',
            title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`,
            content: response.text,
            createdDate: new Date().toISOString(),
            status: 'active',
            tags: [reportType, 'report', timeframe?.period || 'custom']
          },
          documentType: 'report',
          action: 'create'
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error in report generation:', error);
      throw error;
    }
  }
  
  // Helper methods
  private extractFromText(text: string, keyword: string): string {
    const regex = new RegExp(`${keyword}[:\\s]+(.*?)(?=\\n|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }
  
  private extractListFromText(text: string, keyword: string): string[] {
    const regex = new RegExp(`${keyword}[:\\s]+(.*?)(?=\\n\\n|\\n[A-Z]|$)`, 'is');
    const match = text.match(regex);
    
    if (!match) return [];
    
    return match[1]
      .split(/\n|,|;/)
      .map(item => item.replace(/^[-*•]/, '').trim())
      .filter(Boolean);
  }
  
  private determineRelevantAgents(documentType: string, category?: string): string[] {
    const relevantAgents = ['logger-agent']; // Logger agent always needs to know
    
    if (documentType === 'invoice' || category?.includes('finance')) {
      relevantAgents.push('finance-agent');
    }
    
    if (documentType === 'shipping_manifest' || category?.includes('logistics')) {
      relevantAgents.push('inventory-agent');
    }
    
    if (documentType === 'contract' || category?.includes('legal')) {
      relevantAgents.push('legal-agent');
    }
    
    return relevantAgents;
  }
}

export const departmentAgentConfigs = {
  FASHION: [
    {
      type: AgentType.PRICING_OPTIMIZATION,
      config: {
        factors: ['seasonality', 'trend_analysis', 'competitor_pricing', 'material_costs'],
        updateFrequency: 'daily',
        marginTargets: { min: 0.2, target: 0.4, max: 0.6 }
      }
    },
    {
      type: AgentType.INVENTORY_MANAGEMENT,
      config: {
        restockThreshold: 20,
        seasonalityFactors: true,
        sizeVariantTracking: true,
        colorVariantTracking: true
      }
    },
    {
      type: AgentType.SUPPLIER_COMMUNICATION,
      config: {
        autoReorder: true,
        qualityChecks: ['material', 'stitching', 'color_accuracy'],
        communicationChannels: ['email', 'api', 'chat']
      }
    }
  ],
  ELECTRONICS: [
    {
      type: AgentType.QUALITY_CONTROL,
      config: {
        technicalSpecs: true,
        compatibilityChecks: true,
        warrantyTracking: true,
        defectTracking: true
      }
    },
    {
      type: AgentType.SUPPLIER_COMMUNICATION,
      config: {
        autoReorder: true,
        stockAlerts: true,
        techSpecUpdates: true,
        communicationChannels: ['api', 'email']
      }
    },
    {
      type: AgentType.CUSTOMER_SERVICE,
      config: {
        techSupport: true,
        setupGuides: true,
        compatibilityAdvice: true,
        warrantyProcessing: true
      }
    }
  ],
  HOME: [
    {
      type: AgentType.INVENTORY_MANAGEMENT,
      config: {
        bulkItemHandling: true,
        dimensionTracking: true,
        warehouseZoning: true,
        restockThreshold: 15
      }
    },
    {
      type: AgentType.ORDER_PROCESSING,
      config: {
        bundleProcessing: true,
        shippingCalculations: true,
        dimensionalWeight: true,
        specialHandling: true
      }
    }
  ],
  BEAUTY: [
    {
      type: AgentType.QUALITY_CONTROL,
      config: {
        expiryTracking: true,
        batchTracking: true,
        ingredientCompliance: true,
        safetyChecks: true
      }
    },
    {
      type: AgentType.CUSTOMER_SERVICE,
      config: {
        ingredientQueries: true,
        allergyInfo: true,
        usageGuides: true,
        safetyAdvice: true
      }
    },
    {
      type: AgentType.INVENTORY_MANAGEMENT,
      config: {
        expiryManagement: true,
        temperatureControl: true,
        batchTracking: true,
        restockThreshold: 25
      }
    }
  ],
  LOGISTICS: [
    {
      type: AgentType.INVENTORY_MANAGEMENT,
      config: {
        documentationTracking: true,
        invoiceProcessing: true,
        paperworkManagement: true,
        inventoryLogging: true,
        reportGeneration: true
      }
    },
    {
      type: AgentType.ORDER_PROCESSING,
      config: {
        invoiceGeneration: true,
        documentationArchiving: true,
        complianceChecking: true,
        auditTrail: true
      }
    }
  ]
}