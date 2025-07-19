// pages/api/upload-documents.ts - Enhanced with better folder management
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

    // Get or create student folder
    let studentFolderId: string;
    try {
      // Try to find existing student
      const studentList = await sheetsService.getStudentList();
      const existingStudent = studentList.find(s => s.studentId === studentId);
      
      if (existingStudent && existingStudent.folderId) {
        studentFolderId = existingStudent.folderId;
        console.log(`Using existing student folder: ${studentFolderId}`);
      } else {
        // Create new folder for student
        console.log(`Creating new folder for student: ${studentId}`);
        const studentName = existingStudent ?
          `${existingStudent.firstName}_${existingStudent.lastName}` : 
          `Student_${studentId}`;
        
        studentFolderId = await driveService.ensureStudentFolder(studentId, studentName);
        
        // Update student record with folder ID
        await sheetsService.updateStudentFolder(studentId, studentFolderId);
        console.log(`Student folder created and updated: ${studentFolderId}`);
      }
    } catch (folderError) {
      console.error('Error managing student folder:', folderError);
      return res.status(500).json({ 
        error: 'Failed to access student folder. Please contact support.' 
      });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileExtension = file.originalFilename?.split('.').pop() || 
      (file.mimetype === 'application/pdf' ? 'pdf' : 'jpg');
    const fileName = `${documentType}_${studentId}_${timestamp}.${fileExtension}`;

    // Declare variables in the correct scope
    let fileUrl: string;
    let uploadedCount: number = 0;
    let allDocumentsUploaded: boolean = false;
    const requiredDocs = ['passportBio', 'visaCopy', 'photoId', 'usiEmail', 'recentPhoto'];

    try {
      // Upload to Google Drive in Documents subfolder
      console.log(`Uploading file to Drive: ${fileName}`);
      fileUrl = await driveService.uploadFile(
        studentFolderId, 
        fileName, 
        fileBuffer, 
        file.mimetype || 'application/octet-stream',
        'Documents' // Always save in Documents subfolder
      );

      console.log('Document uploaded to Drive successfully:', fileUrl);

      // Update document tracking in Google Sheets
      await sheetsService.updateDocumentStatus(studentId, {
        [documentType]: fileUrl
      });

      console.log('Document status updated in sheets');

      // Check completion status
      const documentStatus = await sheetsService.getDocumentStatus(studentId);
      const uploadedDocs = documentStatus ? 
        requiredDocs.filter(doc => documentStatus[doc] && documentStatus[doc].trim() !== '') : 
        [];
      
      uploadedCount = uploadedDocs.length;
      allDocumentsUploaded = uploadedCount === requiredDocs.length;

      console.log(`Document completion check: ${uploadedCount}/${requiredDocs.length} documents uploaded`);

    } catch (uploadError) {
      console.error('Error uploading to Drive:', uploadError);
      return res.status(500).json({ 
        error: 'Failed to upload document to Google Drive. Please try again.' 
      });
    }

    // Clean up temp file
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    // Return success response
    res.status(200).json({ 
      success: true,
      fileUrl,
      fileName,
      documentType,
      fileSize: file.size,
      studentFolderId,
      message: 'Document uploaded successfully and saved to your student folder!',
      uploadedCount,
      totalRequired: requiredDocs.length,
      allDocumentsUploaded,
      note: allDocumentsUploaded 
        ? 'All required documents have been uploaded! Your enrollment is ready for review.' 
        : `Document saved to your student folder. ${requiredDocs.length - uploadedCount} more document(s) required.`
    });

  } catch (error) {
    console.error('Error in document upload handler:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to upload document. Please try again or contact support if the problem persists.'
    });
  }
}