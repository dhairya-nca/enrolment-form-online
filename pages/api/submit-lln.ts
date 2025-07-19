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

    console.log('Processing LLN submission for student:', llnData.studentId);

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

    console.log('LLN assessment saved to sheets:', submissionId);

    // Get updated attempt count and student folder
    const updatedStudentData = await sheetsService.findStudentByEmailAndDOB(
      llnData.personalInfo.email, 
      llnData.personalInfo.dateOfBirth
    );
    
    const currentAttemptCount = updatedStudentData?.attemptCount || 0;
    const maxAttemptsReached = currentAttemptCount >= 3;

    let pdfGenerated = false;
    let llnReportUrl = null;

    // Generate and upload LLN PDF report if student folder exists
    if (updatedStudentData && updatedStudentData.folderId) {
      try {
        console.log('Generating LLN PDF report...');
        
        // Generate LLN Report PDF
        const llnReportPdf = pdfGenerator.generateLLNReport({
          ...llnData,
          personalInfo: llnData.personalInfo
        });
        
        const llnReportFileName = `LLN_Assessment_Report_${llnData.studentId}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Upload PDF to student's Google Drive folder
        llnReportUrl = await driveService.uploadPDFFromBuffer(
          updatedStudentData.folderId, 
          llnReportFileName, 
          llnReportPdf
        );
        
        console.log('LLN PDF report generated and uploaded:', llnReportUrl);
        pdfGenerated = true;
        
      } catch (pdfError) {
        console.error('Error generating LLN PDF report:', pdfError);
        // Don't fail the entire request if PDF generation fails
        console.log('Continuing without PDF generation...');
      }
    } else {
      console.log('No student folder found, skipping PDF generation');
    }

    console.log('LLN submission completed successfully');

    res.status(200).json({ 
      success: true, 
      submissionId,
      message: 'LLN assessment submitted successfully',
      eligible: llnData.eligible,
      rating: llnData.rating,
      overallScore: llnData.overallScore,
      attemptCount: currentAttemptCount,
      maxAttemptsReached,
      pdfGenerated,
      llnReportUrl,
      note: pdfGenerated ? 'LLN report PDF generated and saved to Google Drive' : 'PDF generation skipped - no student folder available'
    });

  } catch (error) {
    console.error('Error submitting LLN assessment:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to submit LLN assessment. Please try again.'
    });
  }
}