import { prisma } from "../prisma";

export const analyticsService = {
  async getDashboardStats(
    storeId: string,
    dateRange: { start: Date; end: Date },
  ) {
    const [
      totalOrders,
      totalRevenue,
      totalProfit,
      averageOrderValue,
      topProducts,
      topSuppliers,
      salesByDay,
    ] = await Promise.all([
      // Total Orders
      prisma.order.count({
        where: {
          storeId,
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),

      // Total Revenue
      prisma.order.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        _sum: {
          total: true,
        },
      }),

      // Total Profit
      prisma.orderItem.aggregate({
        where: {
          order: {
            storeId,
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
        },
        _sum: {
          profit: true,
        },
      }),

      // Average Order Value
      prisma.order.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        _avg: {
          total: true,
        },
      }),

      // Top Products
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            storeId,
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
        },
        _sum: {
          quantity: true,
          profit: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      }),

      // Top Suppliers
      prisma.order.groupBy({
        by: ["supplierId"],
        where: {
          storeId,
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        _count: {
          _all: true,
        },
        _sum: {
          total: true,
        },
        orderBy: {
          _sum: {
            total: "desc",
          },
        },
        take: 5,
      }),

      // Sales by Day
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as order_count,
          SUM(total) as total_sales,
          SUM(
            SELECT SUM(profit)
            FROM order_items
            WHERE order_id = orders.id
          ) as total_profit
        FROM orders
        WHERE 
          store_id = ${storeId}
          AND created_at >= ${dateRange.start}
          AND created_at <= ${dateRange.end}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalProfit: totalProfit._sum.profit || 0,
      averageOrderValue: averageOrderValue._avg.total || 0,
      topProducts,
      topSuppliers,
      salesByDay,
    };
  },

  async getProductPerformance(
    productId: string,
    dateRange: { start: Date; end: Date },
  ) {
    const [salesData, inventoryHistory, profitMargins, competitorPrices] =
      await Promise.all([
        // Sales Data
        prisma.orderItem.findMany({
          where: {
            productId,
            order: {
              createdAt: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          },
          include: {
            order: true,
          },
          orderBy: {
            order: {
              createdAt: "asc",
            },
          },
        }),

        // Inventory History
        prisma.inventoryLog.findMany({
          where: {
            productId,
            timestamp: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          orderBy: {
            timestamp: "asc",
          },
        }),

        // Profit Margins
        prisma.orderItem.groupBy({
          by: ["productId"],
          where: {
            productId,
            order: {
              createdAt: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          },
          _avg: {
            profit: true,
          },
          _sum: {
            profit: true,
            quantity: true,
          },
        }),

        // Competitor Prices (if you have a price tracking feature)
        prisma.priceHistory.findMany({
          where: {
            productId,
            timestamp: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          orderBy: {
            timestamp: "asc",
          },
        }),
      ]);

    return {
      salesData,
      inventoryHistory,
      profitMargins,
      competitorPrices,
    };
  },

  async getSupplierPerformance(
    supplierId: string,
    dateRange: { start: Date; end: Date },
  ) {
    const [orderStats, qualityMetrics, fulfillmentTimes, profitability] =
      await Promise.all([
        // Order Stats
        prisma.order.aggregate({
          where: {
            supplierId,
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          _count: {
            _all: true,
          },
          _sum: {
            total: true,
          },
          _avg: {
            total: true,
          },
        }),

        // Quality Metrics
        prisma.supplierQualityLog.findMany({
          where: {
            supplierId,
            timestamp: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          orderBy: {
            timestamp: "asc",
          },
        }),

        // Fulfillment Times
        prisma.order.aggregate({
          where: {
            supplierId,
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          _avg: {
            fulfillmentTime: true,
          },
        }),

        // Profitability
        prisma.orderItem.groupBy({
          by: ["supplierId"],
          where: {
            order: {
              supplierId,
              createdAt: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          },
          _sum: {
            profit: true,
            cost: true,
          },
        }),
      ]);

    return {
      orderStats,
      qualityMetrics,
      fulfillmentTimes,
      profitability,
    };
  },
};
