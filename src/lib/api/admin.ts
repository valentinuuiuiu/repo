import { prisma } from "../prisma";

export interface RevenueStats {
  totalRevenue: number;
  totalTax: number;
  totalShipping: number;
  departmentBreakdown: Array<{
    supplierId: string;
    _sum: { total: number };
  }>;
}

export interface StoreStats {
  totalStores: number;
  activeStores: number;
  storesByPlatform: Array<{
    platform: string;
    _count: number;
  }>;
  storesWithProducts: number;
  emptyStores: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Array<{
    role: string;
    _count: number;
  }>;
  usersWithStores: number;
  customersWithOrders: number;
  conversionRate: string;
}

export const adminService = {
  async getRevenueStats(): Promise<RevenueStats> {
    const [revenueStats, departmentRevenue] = await Promise.all([
      prisma.order.aggregate({
        _sum: {
          total: true,
          tax: true,
          shipping: true
        },
        where: {
          paymentStatus: 'paid'
        }
      }),
      prisma.order.groupBy({
        by: ['supplierId'] as const,
        _sum: {
          total: true
        },
        having: {
          supplierId: {
            _count: {
              gt: 0
            }
          }
        },
        orderBy: {
          _sum: {
            total: 'desc'
          }
        }
      })
    ]);

    return {
      totalRevenue: revenueStats._sum.total ?? 0,
      totalTax: revenueStats._sum.tax ?? 0,
      totalShipping: revenueStats._sum.shipping ?? 0,
      departmentBreakdown: departmentRevenue.map(d => ({
        supplierId: d.supplierId,
        _sum: { total: d._sum?.total ?? 0 }
      }))
    };
  },

  async getStoreStats(): Promise<StoreStats> {
    const [
      totalStores,
      activeStores,
      platformStats,
      storesWithProducts
    ] = await Promise.all([
      prisma.store.count(),
      prisma.store.count({
        where: {
          products: {
            some: {
              status: 'active'
            }
          }
        }
      }),
      prisma.store.groupBy({
        by: ['platform'] as const,
        _count: {
          _all: true
        }
      }),
      prisma.store.count({
        where: {
          products: {
            some: {}
          }
        }
      })
    ]);

    const storesByPlatform = platformStats.map(stat => ({
      platform: stat.platform,
      _count: stat._count._all ?? 0
    }));

    return {
      totalStores,
      activeStores,
      storesByPlatform,
      storesWithProducts,
      emptyStores: totalStores - storesWithProducts
    };
  },

  async getUserStats(): Promise<UserStats> {
    const [
      totalUsers,
      activeUsers,
      roleStats,
      usersWithStores,
      customersWithOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          stores: {
            some: {
              products: {
                some: {
                  status: 'active'
                }
              }
            }
          }
        }
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      prisma.user.count({
        where: {
          stores: {
            some: {}
          }
        }
      }),
      prisma.customer.count({
        where: {
          orders: {
            some: {}
          }
        }
      })
    ]);

    const usersByRole = roleStats.map(stat => ({
      role: stat.role,
      _count: stat._count ?? 0
    }));

    return {
      totalUsers,
      activeUsers,
      usersByRole,
      usersWithStores,
      customersWithOrders,
      conversionRate: usersWithStores > 0 ? (activeUsers / usersWithStores * 100).toFixed(2) + '%' : '0%'
    };
  }
};