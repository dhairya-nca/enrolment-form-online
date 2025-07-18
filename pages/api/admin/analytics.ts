// pages/api/admin/analytics.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../../lib/googleSheets';

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
    
    res.status(200).json({ 
      success: true, 
      analytics 
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
}