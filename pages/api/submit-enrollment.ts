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
//     const enrollmentData = req.body;
    
//     // Validate required fields
//     if (!enrollmentData.studentId || !enrollmentData.personalDetails) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Submit to Google Sheets
//     const sheetsService = new GoogleSheetsService();
//     const submissionId = await sheetsService.submitEnrollment(enrollmentData);

//     // Generate PDF
//     const pdfGenerator = new PDFGenerator();
//     const pdfBuffer = pdfGenerator.generateEnrollmentForm(enrollmentData);

//     res.status(200).json({ 
//       success: true, 
//       submissionId,
//       message: 'Enrollment submitted successfully'
//     });

//   } catch (error) {
//     console.error('Error submitting enrollment:', error);
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
    const enrollmentData = req.body;
    
    // Mock successful submission
    console.log('Mock Enrollment Submission:', {
      studentId: enrollmentData.studentId,
      name: `${enrollmentData.personalDetails?.firstName} ${enrollmentData.personalDetails?.lastName}`,
      course: enrollmentData.courseDetails?.courseName
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({ 
      success: true, 
      submissionId: `MOCK-ENR-${Date.now()}`,
      message: 'Enrollment submitted successfully (MOCK)'
    });

  } catch (error) {
    console.error('Mock error:', error);
    res.status(500).json({ error: 'Mock internal server error' });
  }
}