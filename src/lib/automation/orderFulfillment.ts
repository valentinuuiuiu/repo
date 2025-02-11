import { prisma } from '../prisma';
import { sendEmail } from '../notifications/email';
import { Order, Supplier } from '@prisma/client';

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
    const itemsBySupplier = order.items.reduce((acc, item) => {
      const supplierId = item.product.supplierId;
      if (!acc[supplierId]) acc[supplierId] = [];
      acc[supplierId].push(item);
      return acc;
    }, {} as Record<string, typeof order.items>);

    // Process each supplier's items
    for (const [supplierId, items] of Object.entries(itemsBySupplier)) {
      await this.sendSupplierOrder(order, items);
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

  private async sendSupplierOrder(order: Order & { supplier: Supplier }, items: any[]) {
    const orderDetails = {
      orderNumber: order.orderNumber,
      items: items.map(item => ({
        sku: item.product.sku,
        quantity: item.quantity,
        title: item.product.title
      })),
      shippingAddress: order.shippingAddress
    };

    // Send email to supplier
    await sendEmail({
      to: order.supplier.email,
      subject: `New Order #${order.orderNumber}`,
      template: 'supplier-order',
      data: orderDetails