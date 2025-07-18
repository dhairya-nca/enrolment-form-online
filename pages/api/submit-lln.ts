// pages/api/submit-lln.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../lib/googleSheets';

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

    // Get updated attempt count
    const updatedStudentData = await sheetsService.findStudentByEmailAndDOB(
      llnData.personalInfo.email, 
      llnData.personalInfo.dateOfBirth
    );
    
    const currentAttemptCount = updatedStudentData?.attemptCount || 0;
    const maxAttemptsReached = currentAttemptCount >= 3;

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
      pdfGenerated: false, // Will be implemented later
      note: 'PDF generation will be added once Drive permissions are configured'
    });

  } catch (error) {
    console.error('Error submitting LLN assessment:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to submit LLN assessment. Please try again.'
    });
  }
}