import { prisma } from '../prisma';
import { sendEmail } from '../notifications/email';
import { Order, Supplier, OrderItem, Product, ShippingAddress } from '@prisma/client';

interface OrderWithRelations extends Order {
  items: (OrderItem & {
    product: Product;
  })[];
  supplier: Supplier;
  shippingAddress: ShippingAddress;
}

interface SupplierOrderDetails {
  orderNumber: string;
  items: {
    sku: string;
    quantity: number;
    title: string;
  }[];
  shippingAddress: ShippingAddress;
}

export class OrderFulfillmentService {
  async processNewOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        supplier: true,
        shippingAddress: true
      }
    });

    if (!order) throw new Error('Order not found');

    // Group items by supplier
    const itemsBySupplier = order.items.reduce<Record<string, typeof order.items>>((acc, item) => {
      const supplierId = item.product.supplierId;
      if (!acc[supplierId]) acc[supplierId] = [];
      acc[supplierId].push(item);
      return acc;
    }, {});

    // Process each supplier's items
    for (const [supplierId, items] of Object.entries(itemsBySupplier)) {
      await this.sendSupplierOrder(order as OrderWithRelations, items);
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'processing',
        fulfillmentStatus: 'processing'
      }
    });
  }

  private async sendSupplierOrder(order: OrderWithRelations, items: OrderWithRelations['items']) {
    const orderDetails: SupplierOrderDetails = {
      orderNumber: order.orderNumber,
      items: items.map(item => ({
        sku: item.product.sku,
        quantity: item.quantity,
        title: item.product.title
      })),
      shippingAddress: order.shippingAddress
    };

    await sendEmail({
      to: order.supplier.email,
      subject: `New Order #${order.orderNumber}`,
      template: 'supplier-order',
      data: orderDetails
    });
  }
}