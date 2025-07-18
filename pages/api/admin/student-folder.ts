import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../../lib/googleSheets';
import { GoogleDriveService } from '../../../lib/googleDrive';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentId } = req.query;
    
    if (!studentId || typeof studentId !== 'string') {
      return res.status(400).json({ error: 'Valid student ID is required' });
    }

    const sheetsService = new GoogleSheetsService();
    const driveService = new GoogleDriveService();

    // Get student info
    const students = await sheetsService.getStudentList();
    const student = students.find(s => s.studentId === studentId);

    if (!student || !student.folderId) {
      return res.status(404).json({ error: 'Student or folder not found' });
    }

    // Get folder contents
    const folderContents = await driveService.listFolderContents(student.folderId);
    const folderInfo = await driveService.getFolderInfo(student.folderId);
    const shareableLink = await driveService.getFolderShareableLink(student.folderId);

    res.status(200).json({ 
      success: true,
      student: {
        ...student,
        folderInfo,
        shareableLink
      },
      documents: folderContents
    });
  } catch (error) {
    console.error('Error getting student folder:', error);
    res.status(500).json({ error: 'Failed to retrieve student folder' });
  }
}