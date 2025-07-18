import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../../lib/googleSheets';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Get all students
    try {
      const sheetsService = new GoogleSheetsService();
      const students = await sheetsService.getStudentList();
      
      res.status(200).json({ 
        success: true, 
        students 
      });
    } catch (error) {
      console.error('Error getting students:', error);
      res.status(500).json({ error: 'Failed to retrieve students' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}