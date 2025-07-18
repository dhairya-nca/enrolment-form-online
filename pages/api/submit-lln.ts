// import type { NextApiRequest, NextApiResponse } from 'next';
// import { GoogleSheetsService } from '../../lib/googleSheets';
// import { PDFGenerator } from '../../lib/pdfGenerator';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const llnData = req.body;
    
//     // Validate required fields
//     if (!llnData.studentId || !llnData.personalInfo || !llnData.responses) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Submit to Google Sheets
//     const sheetsService = new GoogleSheetsService();
//     const submissionId = await sheetsService.submitLLNAssessment({
//       studentId: llnData.studentId,
//       responses: { ...llnData.personalInfo, ...llnData.responses },
//       scores: llnData.scores,
//       overallScore: llnData.overallScore,
//       rating: llnData.rating,
//       eligible: llnData.eligible,
//       completedAt: llnData.completedAt
//     });

//     // Generate PDF
//     const pdfGenerator = new PDFGenerator();
//     const pdfBuffer = pdfGenerator.generateLLNReport(llnData);

//     // You could upload the PDF to Google Drive here if needed
//     // const driveService = new GoogleDriveService();
//     // const pdfUrl = await driveService.uploadPDF(pdfBuffer, `LLN_${llnData.studentId}.pdf`);

//     res.status(200).json({ 
//       success: true, 
//       submissionId,
//       message: 'LLN assessment submitted successfully',
//       eligible: llnData.eligible,
//       rating: llnData.rating,
//       overallScore: llnData.overallScore
//     });

//   } catch (error) {
//     console.error('Error submitting LLN assessment:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

// mock

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const llnData = req.body;
    
    // Mock successful submission
    console.log('Mock LLN Submission:', {
      studentId: llnData.studentId,
      rating: llnData.rating,
      eligible: llnData.eligible,
      scores: llnData.scores
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({ 
      success: true, 
      submissionId: `MOCK-LLN-${Date.now()}`,
      message: 'LLN assessment submitted successfully (MOCK)',
      eligible: llnData.eligible,
      rating: llnData.rating,
      overallScore: llnData.overallScore
    });

  } catch (error) {
    console.error('Mock error:', error);
    res.status(500).json({ error: 'Mock internal server error' });
  }
}