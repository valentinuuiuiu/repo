import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const stats = await prisma.$transaction(async (tx) => {
      const [
        totalStores,
        activeStores,
        storesByPlatform,
        storesWithProducts
      ] = await Promise.all([
        tx.store.count(),
        tx.store.count({
          where: {
            products: {
              some: {
                status: 'active'
              }
            }
          }
        }),
        tx.store.groupBy({
          by: ['platform'],
          _count: true,
        }),
        tx.store.count({
          where: {
            products: {
              some: {}
            }
          }
        })
      ]);

      return {
        totalStores,
        activeStores,
        storesByPlatform,
        storesWithProducts,
        emptyStores: totalStores - storesWithProducts
      };
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stores statistics:', error);
    res.status(500).json({ error: 'Failed to fetch store statistics' });
  }
}
