import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Implement logic to fetch the total number of users from your database
    const usersCount = 100; // Replace with actual database query

    res.status(200).json({ count: usersCount });
  } catch (error) {
    console.error('Error fetching users count:', error);
    res.status(500).json({ error: 'Failed to fetch users count' });
  }
}
