import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const stats = await prisma.$transaction(async (tx) => {
      const [
        totalUsers,
        activeUsers,
        usersByRole,
        usersWithStores,
        customersWithOrders
      ] = await Promise.all([
        tx.user.count(),
        tx.user.count({
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
        tx.user.groupBy({
          by: ['role'],
          _count: true
        }),
        tx.user.count({
          where: {
            stores: {
              some: {}
            }
          }
        }),
        tx.customer.count({
          where: {
            orders: {
              some: {}
            }
          }
        })
      ]);

      return {
        totalUsers,
        activeUsers,
        usersByRole,
        usersWithStores,
        customersWithOrders,
        conversionRate: usersWithStores > 0 ? (activeUsers / usersWithStores * 100).toFixed(2) + '%' : '0%'
      };
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
}
