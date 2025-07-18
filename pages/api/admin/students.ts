// pages/api/admin/students.ts - Updated with Authentication
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../../lib/googleSheets';
import { verifyToken, hasPermission } from '../../../middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    // Check permissions
    if (!hasPermission(user, 'view_all')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Log access for security audit
    console.log(`Admin students access: ${user.email} (${user.role}) at ${new Date().toISOString()}`);

    const sheetsService = new GoogleSheetsService();
    const students = await sheetsService.getAllStudents();
    
    res.status(200).json({ 
      success: true, 
      students 
    });
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({ error: 'Failed to retrieve students' });
  }
}