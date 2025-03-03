import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const departments = await prisma.department.findMany({
        include: {
          products: true,
          suppliers: true,
          agents: true,
        },
      });

      const formattedDepartments = departments.map((department) => ({
        id: department.id,
        name: department.name,
        code: department.code,
        description: department.description,
        stats: {
          products: department.products.length,
          suppliers: department.suppliers.length,
          agents: department.agents.length,
        },
      }));

      res.status(200).json(formattedDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}