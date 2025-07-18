// pages/api/submit-lln.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../lib/googleSheets';
import { GoogleDriveService } from '../../lib/googleDrive';
import { PDFGenerator } from '../../lib/pdfGenerator';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const llnData = req.body;
    
    // Validate required fields
    if (!llnData.studentId || !llnData.personalInfo || !llnData.responses) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sheetsService = new GoogleSheetsService();
    const driveService = new GoogleDriveService();
    const pdfGenerator = new PDFGenerator();

    // Submit to Google Sheets and get attempt count
    const submissionId = await sheetsService.submitLLNAssessment({
      studentId: llnData.studentId,
      responses: { ...llnData.personalInfo, ...llnData.responses },
      scores: llnData.scores,
      overallScore: llnData.overallScore,
      rating: llnData.rating,
      eligible: llnData.eligible,
      completedAt: llnData.completedAt
    });

    // Get student folder ID from tracking
    const studentData = await sheetsService.findStudentByEmailAndDOB(
      llnData.personalInfo.email, 
      llnData.personalInfo.dateOfBirth
    );

    if (studentData && studentData.folderId) {
      // Generate LLN Report PDF
      const pdfBuffer = pdfGenerator.generateLLNReport(llnData);
      const pdfFileName = `LLN_Report_${llnData.studentId}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Upload PDF to student's Google Drive folder
      const pdfUrl = await driveService.uploadPDFFromBuffer(
        studentData.folderId,
        pdfFileName,
        pdfBuffer
      );

      console.log(`LLN Report uploaded: ${pdfUrl}`);
    }

    // Check if student has reached maximum attempts
    const currentAttemptCount = studentData?.attemptCount || 0;
    const maxAttemptsReached = currentAttemptCount >= 3;

    res.status(200).json({ 
      success: true, 
      submissionId,
      message: 'LLN assessment submitted successfully',
      eligible: llnData.eligible,
      rating: llnData.rating,
      overallScore: llnData.overallScore,
      attemptCount: currentAttemptCount,
      maxAttemptsReached
    });

  } catch (error) {
    console.error('Error submitting LLN assessment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}