import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Implement logic to fetch the total number of active stores from your database
    const storesCount = 50; // Replace with actual database query

    res.status(200).json({ count: storesCount });
  } catch (error) {
    console.error('Error fetching stores count:', error);
    res.status(500).json({ error: 'Failed to fetch stores count' });
  }
}
