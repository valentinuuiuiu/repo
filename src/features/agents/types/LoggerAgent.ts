import { Agent, AgentCapability, AGENT_CAPABILITIES } from '../AgentModel';

export interface InvoiceData {
  id: string;
  date: string;
  dueDate: string;
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    description: string;
  }[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  unitCost: number;
  unitPrice: number;
  supplier: string;
  location: string;
  lastUpdated: string;
}

export interface DocumentRecord {
  id: string;
  type: 'invoice' | 'purchase_order' | 'shipping_manifest' | 'receipt' | 'contract' | 'return_form';
  title: string;
  fileUrl: string;
  relatedEntityId?: string; // Could be an order ID, customer ID, etc.
  createdDate: string;
  expiryDate?: string;
  status: 'draft' | 'active' | 'archived' | 'expired';
  tags: string[];
}

// Logger Agent specific capabilities
export const LOGGER_CAPABILITIES: AgentCapability[] = [
  AGENT_CAPABILITIES.INVENTORY_MANAGEMENT,
  AGENT_CAPABILITIES.INVOICE_PROCESSING,
  AGENT_CAPABILITIES.DOCUMENTATION_MANAGEMENT
];

export interface LoggerAgent extends Agent {
  // Specific properties for Logger Agent
  inventoryAccessLevel: 'read' | 'write' | 'admin';
  financialClearance: boolean;
  documentationAuthority: 'basic' | 'intermediate' | 'advanced';
}

// Logger Agent functions
export class LoggerAgentFunctions {
  agent: LoggerAgent;

  constructor(agent: LoggerAgent) {
    this.agent = agent;
  }

  // Inventory Management Functions
  updateInventoryItem(item: InventoryItem): InventoryItem {
    // Check permissions
    if (this.agent.inventoryAccessLevel === 'read') {
      throw new Error('Insufficient permissions to update inventory');
    }
    
    // Logic to update inventory item
    console.log(`Updating inventory item: ${item.name}`);
    
    // In a real implementation, this would connect to a database
    return {
      ...item,
      lastUpdated: new Date().toISOString()
    };
  }

  checkStockLevels(): InventoryItem[] {
    // Logic to check stock levels and identify items that need reordering
    console.log('Checking stock levels for all inventory items');
    
    // This would return items below reorder point in a real implementation
    return [];
  }

  // Invoice Processing Functions
  createInvoice(data: Omit<InvoiceData, 'id' | 'status'>): InvoiceData {
    // Check permissions
    if (!this.agent.financialClearance) {
      throw new Error('No financial clearance to create invoices');
    }
    
    // Logic to create a new invoice
    console.log('Creating new invoice');
    
    // Generate a new invoice with an ID
    return {
      ...data,
      id: `INV-${Date.now()}`,
      status: 'draft'
    };
  }

  processInvoicePayment(invoiceId: string, amount: number): void {
    // Logic to process an invoice payment
    console.log(`Processing payment of ${amount} for invoice ${invoiceId}`);
    
    // In a real implementation, this would update the invoice status
  }

  // Documentation Management Functions
  createDocument(document: Omit<DocumentRecord, 'id'>): DocumentRecord {
    // Check permissions
    if (this.agent.documentationAuthority === 'basic') {
      throw new Error('Insufficient authority to create this document type');
    }
    
    // Logic to create a new document
    console.log(`Creating new ${document.type} document: ${document.title}`);
    
    // Generate a new document with an ID
    return {
      ...document,
      id: `DOC-${Date.now()}`
    };
  }

  archiveDocument(documentId: string): void {
    // Logic to archive a document
    console.log(`Archiving document: ${documentId}`);
    
    // In a real implementation, this would update the document status
  }

  generateInventoryReport(): string {
    // Logic to generate an inventory report
    console.log('Generating inventory report');
    
    // In a real implementation, this would create a report based on current inventory
    return `Inventory Report - ${new Date().toLocaleDateString()}`;
  }
}

// Factory function to create a Logger Agent
export function createLoggerAgent(id: string, name: string): LoggerAgent {
  return {
    id,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@dropconnect.com`,
    avatar: `/avatars/logger-${id}.png`,
    departmentId: 'logistics',
    role: 'Logistics Specialist',
    specialization: 'Inventory and Documentation Management',
    capabilities: LOGGER_CAPABILITIES,
    performanceMetrics: {
      completedTasks: 0,
      customerSatisfactionScore: 0,
      responseTime: 0
    },
    accessibleTools: [
      'inventory-manager',
      'invoice-generator',
      'document-archive',
      'report-builder'
    ],
    inventoryAccessLevel: 'write',
    financialClearance: true,
    documentationAuthority: 'advanced'
  };
}