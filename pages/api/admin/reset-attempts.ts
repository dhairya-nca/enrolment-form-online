// pages/api/admin/reset-attempts.ts - Updated with Authentication
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../../lib/googleSheets';
import { verifyToken, hasPermission } from '../../../middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies['admin-token'];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Check permissions - only super_admin and admin can reset attempts
    if (!hasPermission(user, 'reset_attempts')) {
      return res.status(403).json({ error: 'Insufficient permissions to reset attempts' });
    }

    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Log the reset action for audit trail
    console.log(`Attempt reset initiated by ${user.email} (${user.role}) for student ${studentId} at ${new Date().toISOString()}`);

    const sheetsService = new GoogleSheetsService();
    await sheetsService.resetStudentAttempts(studentId);
    
    // Log successful reset
    console.log(`Attempt reset completed by ${user.email} for student ${studentId}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Student attempts reset successfully',
      resetBy: user.email,
      resetAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting student attempts:', error);
    res.status(500).json({ error: 'Failed to reset student attempts' });
  }
}