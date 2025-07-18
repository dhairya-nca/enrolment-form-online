// pages/api/validate-student.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSheetsService } from '../../lib/googleSheets';
import { GoogleDriveService } from '../../lib/googleDrive';

interface StudentValidationRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
}

interface StudentValidationResponse {
  success: boolean;
  studentId?: string;
  isNewStudent: boolean;
  attemptCount?: number;
  maxAttemptsReached?: boolean;
  folderId?: string;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StudentValidationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      isNewStudent: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { firstName, lastName, email, dateOfBirth }: StudentValidationRequest = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !dateOfBirth) {
      return res.status(400).json({ 
        success: false, 
        isNewStudent: false, 
        message: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        isNewStudent: false, 
        message: 'Invalid email format' 
      });
    }

    // Validate date of birth format (YYYY-MM-DD)
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dateOfBirth)) {
      return res.status(400).json({ 
        success: false, 
        isNewStudent: false, 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    const sheetsService = new GoogleSheetsService();
    const driveService = new GoogleDriveService();

    // Check for existing student using email + DOB combination
    const existingStudent = await sheetsService.findStudentByEmailAndDOB(email, dateOfBirth);

    if (existingStudent) {
      // Existing student - check attempt count
      const attemptCount = existingStudent.attemptCount || 0;
      const maxAttemptsReached = attemptCount >= 3;

      if (maxAttemptsReached) {
        return res.status(200).json({
          success: false,
          isNewStudent: false,
          studentId: existingStudent.studentId,
          attemptCount,
          maxAttemptsReached: true,
          message: 'Maximum LLN attempts reached. Please contact administration for assistance.'
        });
      } else {
        return res.status(200).json({
          success: true,
          isNewStudent: false,
          studentId: existingStudent.studentId,
          attemptCount,
          maxAttemptsReached: false,
          folderId: existingStudent.folderId,
          message: `Welcome back! You have ${3 - attemptCount} attempts remaining.`
        });
      }
    } else {
      // New student - create folder and register
      const studentId = `STU-${Date.now()}`;
      const folderName = `${firstName}_${lastName}_${new Date().toISOString().split('T')[0]}`;
      
      // Create Google Drive folder
      const folderId = await driveService.createStudentFolder(folderName);
      
      // Register student in tracking system
      await sheetsService.registerNewStudent({
        studentId,
        firstName,
        lastName,
        email,
        dateOfBirth,
        folderId,
        attemptCount: 0,
        registeredAt: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        isNewStudent: true,
        studentId,
        attemptCount: 0,
        maxAttemptsReached: false,
        folderId,
        message: 'Registration successful! You can now proceed with the LLN assessment.'
      });
    }

  } catch (error) {
    console.error('Error validating student:', error);
    return res.status(500).json({ 
      success: false, 
      isNewStudent: false, 
      message: 'Internal server error. Please try again later.' 
    });
  }
}