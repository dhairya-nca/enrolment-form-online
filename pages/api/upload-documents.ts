// pages/api/upload-documents.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { GoogleSheetsService } from '../../lib/googleSheets';
import { GoogleDriveService } from '../../lib/googleDrive';
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
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const studentId = Array.isArray(fields.studentId) ? fields.studentId[0] : fields.studentId;
    const documentType = Array.isArray(fields.documentType) ? fields.documentType[0] : fields.documentType;
    
    if (!studentId || !documentType || !files.file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    console.log('Processing document upload:', {
      studentId,
      documentType,
      fileName: file.originalFilename,
      fileSize: file.size,
      mimeType: file.mimetype
    });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.' 
      });
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      });
    }

    const sheetsService = new GoogleSheetsService();
    const driveService = new GoogleDriveService();

    // Find student folder
    const studentList = await sheetsService.getStudentList();
    const student = studentList.find(s => s.studentId === studentId);

    if (!student || !student.folderId) {
      return res.status(404).json({ error: 'Student folder not found' });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileExtension = file.originalFilename?.split('.').pop() || 'pdf';
    const fileName = `${documentType}_${studentId}_${timestamp}.${fileExtension}`;

    let fileUrl: string;

    try {
      // Upload to Google Drive
      if (file.mimetype === 'application/pdf') {
        fileUrl = await driveService.uploadPDFFromBuffer(student.folderId, fileName, fileBuffer);
      } else {
        // Handle images
        const imageType = file.mimetype.split('/')[1];
        const base64Data = fileBuffer.toString('base64');
        fileUrl = await driveService.uploadImageFromBase64(student.folderId, fileName, base64Data, imageType);
      }

      console.log('Document uploaded to Drive:', fileUrl);

      // Update document tracking in Google Sheets
      await sheetsService.updateDocumentStatus(studentId, {
        [documentType]: fileUrl
      });

      console.log('Document status updated in sheets');

    } catch (uploadError) {
      console.error('Error uploading to Drive:', uploadError);
      throw new Error('Failed to upload document to Google Drive');
    }

    // Clean up temp file
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    res.status(200).json({ 
      success: true,
      fileUrl,
      fileName,
      documentType,
      fileSize: file.size,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to upload document. Please try again.'
    });
  }
}