import { BaseAgent } from "../core/BaseAgent";
import type { AgentResponse, Task } from "../types";
import type { Product, Order, Supplier, Invoice } from "@/types/schema";

export interface InventoryRecord {
  productId: string;
  quantity: number;
  location: string;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order';
}

export interface DocumentationRecord {
  id: string;
  type: 'invoice' | 'purchase_order' | 'shipping_manifest' | 'receipt' | 'contract' | 'return_form' | 'report';
  title: string;
  fileUrl: string;
  relatedEntityId?: string;
  createdDate: string;
  expiryDate?: string;
  status: 'draft' | 'active' | 'archived' | 'expired';
  tags: string[];
}

export class LoggerAgent extends BaseAgent {
  private inventoryRecords: Map<string, InventoryRecord> = new Map();
  private invoiceRecords: Map<string, Invoice> = new Map();
  private documentationRecords: Map<string, DocumentationRecord> = new Map();

  constructor() {
    super({
      name: "logger-agent",
      type: "LOGISTICS",
      description: "AI agent for inventory logging, invoicing, and documentation management",
      capabilities: [
        "inventory_management",
        "invoice_processing",
        "documentation_management"
      ],
      group: "logistics"
    });
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      switch (task.type) {
        case "process_invoice":
          return await this.processInvoice(task.data);
        case "update_inventory":
          return await this.updateInventory(task.data);
        case "manage_documentation":
          return await this.manageDocumentation(task.data);
        case "generate_report":
          return await this.generateReport(task.data);
        default:
          throw new Error(`Task type ${task.type} not supported by LoggerAgent`);
      }
    } catch (error) {
      return this.handleError(error);
    } finally {
      // Record task execution time
      const executionTime = Date.now() - startTime;
      console.log(`Task ${task.id} executed in ${executionTime}ms`);
    }
  }

  /**
   * Process an invoice and update relevant records
   */
  async processInvoice(data: any): Promise<AgentResponse> {
    const { invoice, action } = data;
    
    const messages = [
      {
        role: "system" as const,
        content: `You are a specialized invoice processing agent. Your task is to analyze the invoice data and provide insights.
                 Consider: payment terms, tax implications, accounting categorization, and financial impact.
                 For action '${action}', provide specific recommendations and next steps.`
      },
      {
        role: "user" as const,
        content: JSON.stringify(invoice)
      }
    ];

    try {
      const response = await this.chat(messages);
      const analysis = JSON.parse(response || "{}");
      
      // Update invoice records
      if (invoice.id) {
        this.invoiceRecords.set(invoice.id, invoice);
      }
      
      // If this is a product invoice, update inventory records
      if (invoice.items && Array.isArray(invoice.items)) {
        for (const item of invoice.items) {
          if (item.productId && item.quantity) {
            const existingRecord = this.inventoryRecords.get(item.productId);
            if (existingRecord) {
              // Update existing record
              const newQuantity = action === 'purchase' 
                ? existingRecord.quantity + item.quantity 
                : existingRecord.quantity - item.quantity;
              
              this.inventoryRecords.set(item.productId, {
                ...existingRecord,
                quantity: newQuantity,
                lastUpdated: new Date().toISOString(),
                status: this.determineStockStatus(newQuantity)
              });
            }
          }
        }
      }
      
      return {
        success: true,
        data: {
          invoiceId: invoice.id,
          analysis,
          action: action,
          status: 'processed'
        },
        metadata: {
          confidence: 0.85,
          processingTime: Date.now() - Date.parse(invoice.date || new Date().toISOString()),
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update inventory records
   */
  async updateInventory(data: any): Promise<AgentResponse> {
    const { products, action, location } = data;
    
    const messages = [
      {
        role: "system" as const,
        content: `You are an inventory management specialist. Analyze the inventory update and provide insights.
                 Consider: stock levels, reorder needs, storage optimization, and inventory valuation.
                 For action '${action}', provide specific recommendations.`
      },
      {
        role: "user" as const,
        content: JSON.stringify({ products, action, location })
      }
    ];

    try {
      const response = await this.chat(messages);
      const analysis = JSON.parse(response || "{}");
      
      // Update inventory records
      if (Array.isArray(products)) {
        for (const product of products) {
          if (product.id) {
            const existingRecord = this.inventoryRecords.get(product.id);
            const quantity = product.quantity || 0;
            
            this.inventoryRecords.set(product.id, {
              productId: product.id,
              quantity: existingRecord ? 
                (action === 'add' ? existingRecord.quantity + quantity : 
                 action === 'remove' ? existingRecord.quantity - quantity : 
                 action === 'set' ? quantity : existingRecord.quantity) : 
                quantity,
              location: location || (existingRecord?.location || 'warehouse'),
              lastUpdated: new Date().toISOString(),
              status: this.determineStockStatus(quantity)
            });
          }
        }
      }
      
      return {
        success: true,
        data: {
          updatedProducts: products.map((p: any) => p.id),
          analysis,
          action: action,
          location: location
        },
        metadata: {
          confidence: 0.9,
          processingTime: Date.now() - Date.parse(products[0]?.lastUpdated || new Date().toISOString()),
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Manage documentation records
   */
  async manageDocumentation(data: any): Promise<AgentResponse> {
    const { document, action } = data;
    
    const messages = [
      {
        role: "system" as const,
        content: `You are a documentation management specialist. Process this document and provide insights.
                 Consider: document classification, compliance requirements, retention policies, and accessibility.
                 For action '${action}', provide specific recommendations.`
      },
      {
        role: "user" as const,
        content: JSON.stringify(document)
      }
    ];

    try {
      const response = await this.chat(messages);
      const analysis = JSON.parse(response || "{}");
      
      // Update documentation records
      if (document.id) {
        if (action === 'create' || action === 'update') {
          this.documentationRecords.set(document.id, {
            ...document,
            createdDate: document.createdDate || new Date().toISOString(),
            status: document.status || 'active'
          });
        } else if (action === 'archive') {
          const existingDoc = this.documentationRecords.get(document.id);
          if (existingDoc) {
            this.documentationRecords.set(document.id, {
              ...existingDoc,
              status: 'archived'
            });
          }
        } else if (action === 'delete') {
          this.documentationRecords.delete(document.id);
        }
      }
      
      return {
        success: true,
        data: {
          documentId: document.id,
          analysis,
          action: action,
          status: action === 'delete' ? 'deleted' : (document.status || 'active')
        },
        metadata: {
          confidence: 0.85,
          processingTime: Date.now() - Date.parse(document.createdDate || new Date().toISOString()),
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generate reports based on stored records
   */
  async generateReport(data: any): Promise<AgentResponse> {
    const { reportType, timeframe, filters } = data;
    
    // Prepare data for the report
    let reportData: any = {};
    
    if (reportType === 'inventory') {
      reportData = {
        inventoryRecords: Array.from(this.inventoryRecords.values()),
        timeframe,
        filters
      };
    } else if (reportType === 'invoices') {
      reportData = {
        invoiceRecords: Array.from(this.invoiceRecords.values()),
        timeframe,
        filters
      };
    } else if (reportType === 'documentation') {
      reportData = {
        documentationRecords: Array.from(this.documentationRecords.values()),
        timeframe,
        filters
      };
    }
    
    const messages = [
      {
        role: "system" as const,
        content: `You are a business reporting specialist. Generate a comprehensive ${reportType} report.
                 Consider: data trends, anomalies, business insights, and actionable recommendations.
                 Format the report in a clear, professional structure with executive summary, key findings, and recommendations.`
      },
      {
        role: "user" as const,
        content: JSON.stringify(reportData)
      }
    ];

    try {
      const response = await this.chat(messages);
      
      // Create a documentation record for this report
      const reportId = `REPORT-${Date.now()}`;
      this.documentationRecords.set(reportId, {
        id: reportId,
        type: 'report',
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        fileUrl: '#',
        createdDate: new Date().toISOString(),
        status: 'active',
        tags: [reportType, 'report', timeframe]
      });
      
      return {
        success: true,
        data: {
          reportId,
          reportType,
          content: response,
          generatedAt: new Date().toISOString()
        },
        metadata: {
          confidence: 0.9,
          processingTime: Date.now() - Date.parse(timeframe?.start || new Date().toISOString()),
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Collaborate with InventoryAgent for demand forecasting
   */
  async collaborateOnDemandForecasting(product: Product): Promise<AgentResponse> {
    try {
      // Get historical data from our records
      const historicalData = this.getHistoricalDataForProduct(product.id);
      
      // Prepare collaboration message
      const collaborationMessage = {
        type: 'collaboration_request',
        agentId: this.getName(),
        content: JSON.stringify({
          task: 'demand_forecasting',
          product,
          historicalData
        }),
        timestamp: Date.now()
      };
      
      // This would normally be sent to the InventoryAgent through a message bus
      // For now, we'll simulate the collaboration
      
      const messages = [
        {
          role: "system" as const,
          content: `You are collaborating with the InventoryAgent on demand forecasting. 
                   As the LoggerAgent, you provide historical data and documentation insights.
                   Analyze the product and historical data to contribute to demand forecasting.`
        },
        {
          role: "user" as const,
          content: JSON.stringify({ product, historicalData })
        }
      ];

      const response = await this.chat(messages);
      const analysis = JSON.parse(response || "{}");
      
      return {
        success: true,
        data: {
          productId: product.id,
          loggerAnalysis: analysis,
          collaborationStatus: 'completed'
        },
        metadata: {
          confidence: 0.8,
          processingTime: Date.now() - Date.now(),
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get historical data for a product from our records
   */
  private getHistoricalDataForProduct(productId: string): any {
    // In a real implementation, this would query a database
    // For now, we'll return mock data based on our records
    
    const inventoryRecord = this.inventoryRecords.get(productId);
    
    // Find invoices that include this product
    const relatedInvoices = Array.from(this.invoiceRecords.values())
      .filter(invoice => 
        invoice.items && 
        invoice.items.some((item: any) => item.productId === productId)
      );
    
    return {
      currentStock: inventoryRecord?.quantity || 0,
      stockHistory: [
        // Mock data
        { date: '2023-01-01', quantity: 100 },
        { date: '2023-02-01', quantity: 85 },
        { date: '2023-03-01', quantity: 120 },
        { date: '2023-04-01', quantity: inventoryRecord?.quantity || 95 }
      ],
      salesHistory: relatedInvoices.map(invoice => ({
        date: invoice.date,
        quantity: invoice.items.find((item: any) => item.productId === productId)?.quantity || 0
      }))
    };
  }

  /**
   * Determine stock status based on quantity
   */
  private determineStockStatus(quantity: number): InventoryRecord['status'] {
    if (quantity <= 0) return 'out_of_stock';
    if (quantity < 10) return 'low_stock';
    return 'in_stock';
  }
}