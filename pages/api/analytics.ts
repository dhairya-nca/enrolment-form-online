import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../lib/googleSheets';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sheetsService = new GoogleSheetsService();
    const analytics = await sheetsService.getAnalytics();

    res.status(200).json(analytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
