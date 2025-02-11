import { prisma } from "../prisma";
import { sendEmail } from "../notifications/email";
import { Supplier } from "@prisma/client";

export class SupplierManagementService {
  async evaluateSupplier(supplierId: string) {
    const [orders, qualityReports] = await Promise.all([
      prisma.order.findMany({
        where: { supplierId },
        include: { items: true },
      }),
      prisma.qualityReport.findMany({
        where: { supplierId },
      }),
    ]);

    // Calculate metrics
    const metrics = {
      fulfillmentSpeed: this.calculateAverageFulfillmentTime(orders),
      qualityScore: this.calculateQualityScore(qualityReports),
      communicationScore: this.calculateCommunicationScore(orders),
      reliabilityScore: this.calculateReliabilityScore(orders),
    };

    // Update supplier ratings
    await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        fulfillmentSpeed: metrics.fulfillmentSpeed,
        qualityScore: metrics.qualityScore,
        communicationScore: metrics.communicationScore,
        rating:
          (metrics.fulfillmentSpeed +
            metrics.qualityScore +
            metrics.communicationScore) /
          3,
      },
    });

    // Send performance report to supplier
    await this.sendPerformanceReport(supplierId, metrics);

    return metrics;
  }

  private calculateAverageFulfillmentTime(orders: any[]): number {
    if (orders.length === 0) return 0;

    const fulfillmentTimes = orders.map((order) => {
      const created = new Date(order.createdAt);
      const fulfilled = new Date(order.fulfillmentDate);
      return (fulfilled.getTime() - created.getTime()) / (1000 * 60 * 60); // Hours
    });

    return fulfillmentTimes.reduce((a, b) => a + b) / fulfillmentTimes.length;
  }

  private calculateQualityScore(reports: any[]): number {
    if (reports.length === 0) return 0;

    const scores = reports.map((report) => report.score);
    return scores.reduce((a, b) => a + b) / scores.length;
  }

  private calculateCommunicationScore(orders: any[]): number {
    if (orders.length === 0) return 0;

    const scores = orders.map((order) => order.communicationRating || 0);
    return scores.reduce((a, b) => a + b) / scores.length;
  }

  private calculateReliabilityScore(orders: any[]): number {
    if (orders.length === 0) return 0;

    const onTimeDeliveries = orders.filter(
      (order) =>
        new Date(order.deliveryDate) <= new Date(order.expectedDeliveryDate),
    ).length;

    return (onTimeDeliveries / orders.length) * 100;
  }

  private async sendPerformanceReport(supplierId: string, metrics: any) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) return;

    await sendEmail({
      to: supplier.email,
      subject: "Monthly Performance Report",
      template: "supplier-performance",
      data: {
        supplierName: supplier.name,
        metrics,
        recommendations: this.generateRecommendations(metrics),
      },
    });
  }

  private generateRecommendations(metrics: any): string[] {
    const recommendations = [];

    if (metrics.fulfillmentSpeed > 48) {
      // If average fulfillment time is over 48 hours
      recommendations.push(
        "Consider optimizing your order fulfillment process to reduce processing time.",
      );
    }

    if (metrics.qualityScore < 4) {
      recommendations.push(
        "Review quality control processes to improve product consistency.",
      );
    }

    if (metrics.communicationScore < 4) {
      recommendations.push(
        "Aim to respond to inquiries more quickly and maintain clear communication channels.",
      );
    }

    if (metrics.reliabilityScore < 90) {
      recommendations.push(
        "Work on improving delivery reliability to meet expected delivery dates.",
      );
    }

    return recommendations;
  }

  async automateReordering(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { supplier: true },
    });

    if (!product) throw new Error("Product not found");

    const reorderPoint = product.reorderPoint || 10;
    const reorderQuantity = product.reorderQuantity || 50;

    if (product.inventory <= reorderPoint) {
      // Create purchase order
      const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          supplierId: product.supplierId,
          status: "pending",
          items: {
            create: {
              productId,
              quantity: reorderQuantity,
              price: product.costPrice,
            },
          },
        },
      });

      // Send order to supplier
      await sendEmail({
        to: product.supplier.email,
        subject: `Purchase Order #${purchaseOrder.id}`,
        template: "purchase-order",
        data: {
          orderNumber: purchaseOrder.id,
          product: {
            name: product.title,
            sku: product.sku,
            quantity: reorderQuantity,
          },
        },
      });

      return purchaseOrder;
    }
  }
}
