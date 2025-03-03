import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get total revenue from actual orders
    const revenueStats = await prisma.order.aggregate({
      _sum: {
        total: true,
        tax: true,
        shipping: true
      },
      where: {
        paymentStatus: 'paid'
      }
    });

    // Get revenue breakdown by department
    const departmentRevenue = await prisma.order.groupBy({
      by: ['supplierId'],
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
    });

    res.status(200).json({
      totalRevenue: revenueStats._sum.total || 0,
      totalTax: revenueStats._sum.tax || 0,
      totalShipping: revenueStats._sum.shipping || 0,
      departmentBreakdown: departmentRevenue
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ error: 'Failed to fetch revenue statistics' });
  }
}
