import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../../lib/googleSheets';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const sheetsService = new GoogleSheetsService();
    await sheetsService.resetStudentAttempts(studentId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Student attempts reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting attempts:', error);
    res.status(500).json({ error: 'Failed to reset student attempts' });
  }
}