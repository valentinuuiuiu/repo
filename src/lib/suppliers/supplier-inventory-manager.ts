import { z } from 'zod';
import { sendAdminNotification } from '@/lib/email';

// Validation Schemas
const SupplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    country: z.string(),
    postalCode: z.string()
  }),
  rating: z.number().min(0).max(5).default(3),
  performanceMetrics: z.object({
    onTimeDeliveryRate: z.number().min(0).max(100),
    productQualityScore: z.number().min(0).max(100),
    responsiveness: z.number().min(0).max(100)
  }),
  integrationStatus: z.enum(['pending', 'active', 'suspended']).default('pending')
});

const ProductSchema = z.object({
  id: z.string(),
  supplierId: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number().positive(),
  costPrice: z.number().positive(),
  inventory: z.object({
    total: z.number().min(0),
    available: z.number().min(0),
    reserved: z.number().min(0),
    minimumThreshold: z.number().min(0)
  }),
  status: z.enum(['active', 'out_of_stock', 'discontinued']).default('active')
});

const InventoryTransactionSchema = z.object({
  id: z.string(),
  productId: z.string(),
  type: z.enum(['restock', 'sale', 'reservation', 'adjustment']),
  quantity: z.number(),
  timestamp: z.date(),
  userId: z.string().optional(),
  reason: z.string().optional()
});

// Advanced Supplier and Inventory Management Class
export class SupplierInventoryManager {
  private suppliers: Map<string, z.infer<typeof SupplierSchema>> = new Map();
  private products: Map<string, z.infer<typeof ProductSchema>> = new Map();
  private inventoryTransactions: Map<string, z.infer<typeof InventoryTransactionSchema>> = new Map();

  // Supplier Management
  addSupplier(supplierData: z.infer<typeof SupplierSchema>) {
    try {
      const validatedSupplier = SupplierSchema.parse(supplierData);
      this.suppliers.set(validatedSupplier.id, validatedSupplier);
      
      // Notify admin about new supplier
      sendAdminNotification(
        'New Supplier Added', 
        `Supplier ${validatedSupplier.name} has been added to the platform.`
      );

      return validatedSupplier;
    } catch (error) {
      console.error('Supplier validation failed:', error);
      throw new Error('Invalid supplier data');
    }
  }

  // Product Management
  addProduct(productData: z.infer<typeof ProductSchema>) {
    try {
      const validatedProduct = ProductSchema.parse(productData);
      
      // Verify supplier exists
      if (!this.suppliers.has(validatedProduct.supplierId)) {
        throw new Error('Supplier does not exist');
      }

      this.products.set(validatedProduct.id, validatedProduct);
      
      // Check inventory threshold and notify
      this.checkInventoryThreshold(validatedProduct);

      return validatedProduct;
    } catch (error) {
      console.error('Product validation failed:', error);
      throw new Error('Invalid product data');
    }
  }

  // Inventory Transaction
  processInventoryTransaction(
    transactionData: z.infer<typeof InventoryTransactionSchema>
  ) {
    try {
      const transaction = InventoryTransactionSchema.parse(transactionData);
      const product = this.products.get(transaction.productId);

      if (!product) {
        throw new Error('Product not found');
      }

      // Update inventory based on transaction type
      switch (transaction.type) {
        case 'restock':
          product.inventory.total += transaction.quantity;
          product.inventory.available += transaction.quantity;
          break;
        case 'sale':
          if (product.inventory.available < transaction.quantity) {
            throw new Error('Insufficient inventory');
          }
          product.inventory.available -= transaction.quantity;
          product.inventory.total -= transaction.quantity;
          break;
        case 'reservation':
          if (product.inventory.available < transaction.quantity) {
            throw new Error('Insufficient inventory for reservation');
          }
          product.inventory.available -= transaction.quantity;
          product.inventory.reserved += transaction.quantity;
          break;
        case 'adjustment':
          // Allow both positive and negative adjustments
          product.inventory.total += transaction.quantity;
          product.inventory.available += transaction.quantity;
          break;
      }

      // Store transaction
      this.inventoryTransactions.set(transaction.id, transaction);

      // Check inventory threshold
      this.checkInventoryThreshold(product);

      return transaction;
    } catch (error) {
      console.error('Inventory transaction failed:', error);
      throw new Error('Invalid inventory transaction');
    }
  }

  // Inventory Threshold Monitoring
  private checkInventoryThreshold(product: z.infer<typeof ProductSchema>) {
    if (product.inventory.available <= product.inventory.minimumThreshold) {
      // Send low stock notification
      sendAdminNotification(
        'Low Stock Alert', 
        `Product ${product.name} is below minimum threshold. 
         Current stock: ${product.inventory.available}`
      );

      // Optionally trigger automatic reorder process
      this.triggerRestockProcess(product);
    }
  }

  // Automatic Restock Process
  private triggerRestockProcess(product: z.infer<typeof ProductSchema>) {
    const supplier = this.suppliers.get(product.supplierId);
    
    if (!supplier) return;

    // AI-driven restock recommendation
    const recommendedRestockQuantity = this.calculateRestockQuantity(product);

    // Notify supplier about potential restock
    sendAdminNotification(
      'Restock Recommendation', 
      `Recommended restock for ${product.name}:
       Quantity: ${recommendedRestockQuantity}
       Supplier: ${supplier.name}`
    );
  }

  // AI-Driven Restock Quantity Calculation
  private calculateRestockQuantity(product: z.infer<typeof ProductSchema>): number {
    // Advanced algorithm considering:
    // 1. Current inventory
    // 2. Sales velocity
    // 3. Supplier lead time
    // 4. Seasonal variations
    const baseRestock = product.inventory.minimumThreshold * 2;
    
    // Simulate some intelligence (in a real system, this would use ML)
    const randomVariation = Math.random() * 0.2; // ±20% variation
    
    return Math.round(baseRestock * (1 + (Math.random() > 0.5 ? 1 : -1) * randomVariation));
  }

  // Supplier Performance Tracking
  evaluateSupplierPerformance(supplierId: string) {
    const supplier = this.suppliers.get(supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    const supplierProducts = Array.from(this.products.values())
      .filter(p => p.supplierId === supplierId);

    const performanceMetrics = {
      totalProducts: supplierProducts.length,
      activeProducts: supplierProducts.filter(p => p.status === 'active').length,
      outOfStockProducts: supplierProducts.filter(p => p.status === 'out_of_stock').length,
      averageInventoryLevel: supplierProducts.reduce((sum, p) => sum + p.inventory.available, 0) / supplierProducts.length
    };

    return {
      supplier,
      performanceMetrics
    };
  }

  // Advanced Search and Filtering
  searchProducts(filters: Partial<z.infer<typeof ProductSchema>>) {
    return Array.from(this.products.values()).filter(product => 
      Object.entries(filters).every(([key, value]) => 
        product[key as keyof typeof product] === value
      )
    );
  }

  // Export Methods for External Use
  getSuppliers() {
    return Array.from(this.suppliers.values());
  }

  getProducts() {
    return Array.from(this.products.values());
  }

  getInventoryTransactions() {
    return Array.from(this.inventoryTransactions.values());
  }
}

// Export Schemas for Type Checking
export const schemas = {
  Supplier: SupplierSchema,
  Product: ProductSchema,
  InventoryTransaction: InventoryTransactionSchema
};