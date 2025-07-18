import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { GoogleSheetsService } from '../../lib/googleSheets';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const studentId = Array.isArray(fields.studentId) ? fields.studentId[0] : fields.studentId;
    const documentType = Array.isArray(fields.documentType) ? fields.documentType[0] : fields.documentType;
    
    if (!studentId || !documentType || !files.file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.' });
    }

    // In a real implementation, you would upload to Google Drive or another cloud storage
    // For now, we'll simulate a successful upload
    const fileUrl = `https://drive.google.com/file/d/simulated_${Date.now()}/view`;

    // Update document tracking in Google Sheets
    const sheetsService = new GoogleSheetsService();
    await sheetsService.updateDocumentStatus(studentId, {
      [documentType]: fileUrl
    });

    res.status(200).json({ 
      success: true,
      fileUrl,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//mock 

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock file upload
    console.log('Mock Document Upload');

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockFileUrl = `https://mock-storage.com/files/mock_${Date.now()}.pdf`;

    res.status(200).json({ 
      success: true,
      fileUrl: mockFileUrl,
      message: 'Document uploaded successfully (MOCK)'
    });

  } catch (error) {
    console.error('Mock error:', error);
    res.status(500).json({ error: 'Mock internal server error' });
  }
}