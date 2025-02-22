import { PrismaClient } from '@prisma/client';
import { initializeCollections, deleteCollection } from '../lib/ai/db/chromaClient';
import { upsertToCollection } from '../lib/ai/db/embeddings';

const prisma = new PrismaClient();

async function initializeVectorDB() {
  try {
    // Initialize collections
    console.log('Initializing ChromaDB collections...');
    await initializeCollections();

    // Clear existing collections
    console.log('Clearing existing collections...');
    await deleteCollection('products');
    await deleteCollection('suppliers');
    await deleteCollection('customers');

    // Index all products
    console.log('Indexing products...');
    const products = await prisma.product.findMany({
      include: {
        supplier: true,
        department: true,
        variants: true
      }
    });

    await upsertToCollection('products', products.map(product => ({
      id: product.id,
      text: `${product.title} ${product.description || ''} ${product.category || ''} ${product.tags.join(' ')}`,
      metadata: {
        title: product.title,
        category: product.category,
        price: product.price,
        inventory: product.inventory,
        supplier: product.supplier.name,
        department: product.department.name
      }
    })));

    // Index all suppliers
    console.log('Indexing suppliers...');
    const suppliers = await prisma.supplier.findMany({
      include: {
        department: true
      }
    });

    await upsertToCollection('suppliers', suppliers.map(supplier => ({
      id: supplier.id,
      text: `${supplier.name} ${supplier.website || ''} Ratings: Quality ${supplier.qualityScore} Communication ${supplier.communicationScore} Fulfillment ${supplier.fulfillmentSpeed}`,
      metadata: {
        name: supplier.name,
        rating: supplier.rating,
        department: supplier.department.name,
        fulfillmentSpeed: supplier.fulfillmentSpeed,
        qualityScore: supplier.qualityScore
      }
    })));

    // Index customer data (be careful with PII)
    console.log('Indexing customer preferences...');
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          include: {
            items: true
          }
        }
    }});

    await upsertToCollection('customers', customers.map(customer => ({
      id: customer.id,
      text: customer.orders.map(order => 
        order.items.map(item => `${item.productId} quantity:${item.quantity}`).join(' ')
      ).join(' '),
      metadata: {
        orderCount: customer.orders.length,
        totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
        lastOrderDate: customer.orders.length > 0 
          ? Math.max(...customer.orders.map(o => o.createdAt.getTime()))
          : null
      }
    })));

    console.log('Vector DB initialization complete!');
  } catch (error) {
    console.error('Error initializing vector DB:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initializeVectorDB()
  .catch(console.error);