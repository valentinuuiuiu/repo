import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Implement logic to fetch the total revenue from your database
    const totalRevenue = 12345.67; // Replace with actual database query

    res.status(200).json({ amount: totalRevenue });
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    res.status(500).json({ error: 'Failed to fetch total revenue' });
  }
}
