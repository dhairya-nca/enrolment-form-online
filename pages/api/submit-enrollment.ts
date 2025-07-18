// pages/api/submit-enrollment.ts
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
    const enrollmentData = req.body;
    
    // Validate required fields
    if (!enrollmentData.studentId || !enrollmentData.personalDetails) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sheetsService = new GoogleSheetsService();
    const driveService = new GoogleDriveService();
    const pdfGenerator = new PDFGenerator();

    // Submit to Google Sheets
    const submissionId = await sheetsService.submitEnrollment(enrollmentData);

    // Get student folder ID
    const studentData = await sheetsService.findStudentByEmailAndDOB(
      enrollmentData.personalDetails.email,
      enrollmentData.personalDetails.dateOfBirth
    );

    if (studentData && studentData.folderId) {
      // Generate Personal Details Form PDF
      const personalDetailsPdf = pdfGenerator.generatePersonalDetailsForm(enrollmentData);
      const personalDetailsFileName = `Personal_Details_${enrollmentData.studentId}.pdf`;
      
      // Generate Declaration Forms PDF
      const declarationPdf = pdfGenerator.generateDeclarationForm(enrollmentData);
      const declarationFileName = `Declaration_Forms_${enrollmentData.studentId}.pdf`;

      // Generate Enrollment Summary PDF
      const summaryPdf = pdfGenerator.generateEnrollmentSummary(enrollmentData);
      const summaryFileName = `Enrollment_Summary_${enrollmentData.studentId}.pdf`;

      // Upload all PDFs to student's folder
      const [personalDetailsUrl, declarationUrl, summaryUrl] = await Promise.all([
        driveService.uploadPDFFromBuffer(studentData.folderId, personalDetailsFileName, personalDetailsPdf),
        driveService.uploadPDFFromBuffer(studentData.folderId, declarationFileName, declarationPdf),
        driveService.uploadPDFFromBuffer(studentData.folderId, summaryFileName, summaryPdf)
      ]);

      console.log('Enrollment documents uploaded:', {
        personalDetails: personalDetailsUrl,
        declaration: declarationUrl,
        summary: summaryUrl
      });
    }

    res.status(200).json({ 
      success: true, 
      submissionId,
      message: 'Enrollment submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting enrollment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}