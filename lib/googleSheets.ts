// lib/googleSheets.ts
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { LLNResponse, EnrollmentData } from '../utils/types';

interface StudentRegistration {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  folderId: string;
  attemptCount: number;
  registeredAt: string;
}

interface ExistingStudent {
  studentId: string;
  attemptCount: number;
  folderId: string;
  isBlocked?: boolean;
}

export class GoogleSheetsService {
  private doc: GoogleSpreadsheet;
  private serviceAccountAuth: JWT;
  
  constructor() {
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID environment variable is required');
    }

    // Create JWT auth for newer version of google-spreadsheet
    this.serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, this.serviceAccountAuth);
  }

  private async ensureAuthenticated() {
    try {
      await this.doc.loadInfo();
    } catch (error) {
      throw new Error(`Failed to authenticate with Google Sheets: ${error}`);
    }
  }

  async findStudentByEmailAndDOB(email: string, dateOfBirth: string): Promise<ExistingStudent | null> {
    try {
      await this.ensureAuthenticated();
      const sheet = this.doc.sheetsByTitle['Student_Tracking'] || await this.createStudentTrackingSheet();
      
      const rows = await sheet.getRows();
      const existingRow = rows.find(row => 
        row.get('email')?.toLowerCase() === email.toLowerCase() && 
        row.get('date_of_birth') === dateOfBirth
      );

      if (existingRow) {
        return {
          studentId: existingRow.get('student_id'),
          attemptCount: parseInt(existingRow.get('attempt_count') || '0'),
          folderId: existingRow.get('folder_id'),
          isBlocked: existingRow.get('is_blocked') === 'Yes'
        };
      }

      return null;
    } catch (error) {
      console.error('Error finding student:', error);
      throw new Error('Failed to check existing student');
    }
  }

  async registerNewStudent(data: StudentRegistration): Promise<void> {
    try {
      await this.ensureAuthenticated();
      const sheet = this.doc.sheetsByTitle['Student_Tracking'] || await this.createStudentTrackingSheet();
      
      await sheet.addRow({
        student_id: data.studentId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        date_of_birth: data.dateOfBirth,
        folder_id: data.folderId,
        attempt_count: data.attemptCount,
        is_blocked: 'No',
        registered_at: data.registeredAt,
        last_attempt_at: '',
        status: 'Registered'
      });

      console.log(`Registered new student: ${data.studentId}`);
    } catch (error) {
      console.error('Error registering student:', error);
      throw new Error('Failed to register student');
    }
  }

  async incrementAttemptCount(studentId: string): Promise<number> {
    try {
      await this.ensureAuthenticated();
      const sheet = this.doc.sheetsByTitle['Student_Tracking'];
      
      const rows = await sheet.getRows();
      const studentRow = rows.find(row => row.get('student_id') === studentId);
      
      if (studentRow) {
        const currentCount = parseInt(studentRow.get('attempt_count') || '0');
        const newCount = currentCount + 1;
        
        studentRow.set('attempt_count', newCount);
        studentRow.set('last_attempt_at', new Date().toISOString());
        studentRow.set('status', newCount >= 3 ? 'Max Attempts Reached' : 'In Progress');
        
        await studentRow.save();
        return newCount;
      }
      
      throw new Error('Student not found for attempt increment');
    } catch (error) {
      console.error('Error incrementing attempt count:', error);
      throw new Error('Failed to update attempt count');
    }
  }

  async resetStudentAttempts(studentId: string): Promise<void> {
    try {
      await this.ensureAuthenticated();
      const sheet = this.doc.sheetsByTitle['Student_Tracking'];
      
      const rows = await sheet.getRows();
      const studentRow = rows.find(row => row.get('student_id') === studentId);
      
      if (studentRow) {
        studentRow.set('attempt_count', 0);
        studentRow.set('is_blocked', 'No');
        studentRow.set('status', 'Reset by Admin');
        studentRow.set('reset_at', new Date().toISOString());
        
        await studentRow.save();
        console.log(`Reset attempts for student: ${studentId}`);
      } else {
        throw new Error('Student not found for reset');
      }
    } catch (error) {
      console.error('Error resetting student attempts:', error);
      throw new Error('Failed to reset student attempts');
    }
  }

  async submitLLNAssessment(data: LLNResponse): Promise<string> {
    try {
      await this.ensureAuthenticated();
      
      // Get or create the LLN sheet
      let sheet = this.doc.sheetsByTitle['LLN_Assessments'];
      if (!sheet) {
        console.log('Creating LLN_Assessments sheet...');
        sheet = await this.createLLNSheet();
      }
      
      // Ensure the sheet has headers by checking if it's empty and setting headers if needed
      try {
        await sheet.loadHeaderRow();
        if (!sheet.headerValues || sheet.headerValues.length === 0) {
          // Set headers manually if they don't exist
          const headers = [
            'timestamp', 'student_id', 'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
            'learning_score', 'reading_score', 'writing_score', 'numeracy_score', 'digital_score',
            'overall_score', 'rating', 'eligible', 'completed_at'
          ];
          await sheet.setHeaderRow(headers);
          console.log('Set headers for LLN_Assessments sheet');
        }
      } catch (headerError) {
        console.log('Header loading failed, setting headers manually...');
        const headers = [
          'timestamp', 'student_id', 'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
          'learning_score', 'reading_score', 'writing_score', 'numeracy_score', 'digital_score',
          'overall_score', 'rating', 'eligible', 'completed_at'
        ];
        await sheet.setHeaderRow(headers);
      }
      
      // Update attempt count first
      await this.incrementAttemptCount(data.studentId);
      
      // Store LLN results
      const rowData = {
        timestamp: new Date().toISOString(),
        student_id: data.studentId,
        first_name: String(data.responses.firstName || ''),
        last_name: String(data.responses.lastName || ''),
        email: String(data.responses.email || ''),
        phone: String(data.responses.phone || ''),
        date_of_birth: String(data.responses.dateOfBirth || ''),
        learning_score: Number(data.scores.learning) || 0,
        reading_score: Number(data.scores.reading) || 0,
        writing_score: Number(data.scores.writing) || 0,
        numeracy_score: Number(data.scores.numeracy) || 0,
        digital_score: Number(data.scores.digitalLiteracy) || 0,
        overall_score: Number(data.overallScore) || 0,
        rating: String(data.rating),
        eligible: data.eligible ? 'Yes' : 'No',
        completed_at: String(data.completedAt)
      };

      await sheet.addRow(rowData);

      console.log('LLN assessment data saved successfully');
      return `LLN-${data.studentId}`;
      
    } catch (error) {
      console.error('Error submitting LLN assessment:', error);
      throw new Error('Failed to submit LLN assessment');
    }
  }

  async submitEnrollment(data: EnrollmentData): Promise<string> {
    try {
      await this.ensureAuthenticated();
      
      // Get or create the enrollment sheet
      let sheet = this.doc.sheetsByTitle['Student_Enrollments'];
      if (!sheet) {
        console.log('Creating Student_Enrollments sheet...');
        sheet = await this.createEnrollmentSheet();
      }
      
      // Ensure the sheet has headers
      try {
        await sheet.loadHeaderRow();
        if (!sheet.headerValues || sheet.headerValues.length === 0) {
          const headers = [
            'enrolled_date', 'student_id', 'first_name', 'middle_name', 'surname',
            'email_address', 'mobile_phone', 'dob', 'address', 'qualification',
            'usi', 'country_of_birth', 'emergency_contact_name', 'submission_timestamp', 'verification_status'
          ];
          await sheet.setHeaderRow(headers);
          console.log('Set headers for Student_Enrollments sheet');
        }
      } catch (headerError) {
        console.log('Header loading failed, setting headers manually...');
        const headers = [
          'enrolled_date', 'student_id', 'first_name', 'middle_name', 'surname',
          'email_address', 'mobile_phone', 'dob', 'address', 'qualification',
          'usi', 'country_of_birth', 'emergency_contact_name', 'submission_timestamp', 'verification_status'
        ];
        await sheet.setHeaderRow(headers);
      }
      
      // Store enrollment data with simplified structure
      const rowData = {
        enrolled_date: new Date().toISOString().split('T')[0],
        student_id: data.studentId,
        first_name: data.personalDetails.firstName,
        middle_name: data.personalDetails.middleName || '',
        surname: data.personalDetails.lastName,
        email_address: data.personalDetails.email,
        mobile_phone: data.personalDetails.mobile,
        dob: data.personalDetails.dateOfBirth,
        address: `${data.personalDetails.address.houseNumber} ${data.personalDetails.address.streetName}, ${data.personalDetails.address.suburb} ${data.personalDetails.address.state} ${data.personalDetails.address.postcode}`,
        qualification: data.courseDetails.courseName,
        usi: data.compliance.usi || '',
        country_of_birth: data.background.countryOfBirth,
        emergency_contact_name: data.background.emergencyContact.split(' - ')[0] || '',
        submission_timestamp: new Date().toISOString(),
        verification_status: 'Pending Review'
      };

      await sheet.addRow(rowData);

      console.log('Enrollment data saved successfully');
      return `ENR-${data.studentId}`;
      
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      throw new Error('Failed to submit enrollment');
    }
  }

  async updateDocumentStatus(studentId: string, documents: Record<string, string>): Promise<void> {
    try {
      await this.ensureAuthenticated();
      const sheet = this.doc.sheetsByTitle['Document_Tracking'] || await this.createDocumentTrackingSheet();
      
      // Find existing row or create new one
      const rows = await sheet.getRows();
      let existingRow = rows.find(row => row.get('student_id') === studentId);
      
      const documentData = {
        student_id: studentId,
        passport_bio: documents.passportBio || '',
        visa_copy: documents.visaCopy || '',
        photo_id: documents.photoId || '',
        usi_email: documents.usiEmail || '',
        recent_photo: documents.recentPhoto || '',
        all_documents_complete: Object.keys(documents).length === 5 ? 'Yes' : 'No',
        upload_date: new Date().toISOString(),
        verification_status: 'Pending Review'
      };

      if (existingRow) {
        Object.entries(documentData).forEach(([key, value]) => {
          existingRow.set(key, value);
        });
        await existingRow.save();
      } else {
        await sheet.addRow(documentData);
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      throw new Error('Failed to update document status');
    }
  }

  async getStudentList(): Promise<any[]> {
    try {
      await this.ensureAuthenticated();
      const sheet = this.doc.sheetsByTitle['Student_Tracking'];
      
      if (!sheet) {
        console.log('Student_Tracking sheet does not exist yet');
        return [];
      }
      
      try {
        const rows = await sheet.getRows();
        return rows.map(row => ({
          studentId: row.get('student_id'),
          firstName: row.get('first_name'),
          lastName: row.get('last_name'),
          email: row.get('email'),
          dateOfBirth: row.get('date_of_birth'),
          attemptCount: parseInt(row.get('attempt_count') || '0'),
          isBlocked: row.get('is_blocked') === 'Yes',
          status: row.get('status'),
          folderId: row.get('folder_id'),
          registeredAt: row.get('registered_at'),
          lastAttemptAt: row.get('last_attempt_at')
        }));
      } catch (error) {
        console.log('Student_Tracking sheet has no data yet');
        return [];
      }
    } catch (error) {
      console.error('Error getting student list:', error);
      return [];
    }
  }

  async getAnalytics(): Promise<any> {
    try {
      await this.ensureAuthenticated();
      
      // Get sheets if they exist, create them if they don't
      const enrollmentSheet = this.doc.sheetsByTitle['Student_Enrollments'];
      const llnSheet = this.doc.sheetsByTitle['LLN_Assessments'];
      const trackingSheet = this.doc.sheetsByTitle['Student_Tracking'];
      
      let enrollmentRows: any[] = [];
      let llnRows: any[] = [];
      let trackingRows: any[] = [];
      
      // Safely get rows from each sheet
      if (enrollmentSheet) {
        try {
          enrollmentRows = await enrollmentSheet.getRows();
        } catch (error) {
          console.log('Student_Enrollments sheet has no data yet');
        }
      }
      
      if (llnSheet) {
        try {
          llnRows = await llnSheet.getRows();
        } catch (error) {
          console.log('LLN_Assessments sheet has no data yet');
        }
      }
      
      if (trackingSheet) {
        try {
          trackingRows = await trackingSheet.getRows();
        } catch (error) {
          console.log('Student_Tracking sheet has no data yet');
        }
      }
      
      const today = new Date().toISOString().split('T')[0];
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        totalStudents: trackingRows.length,
        totalEnrollments: enrollmentRows.length,
        totalLLNAssessments: llnRows.length,
        todaySubmissions: enrollmentRows.filter(row => 
          row.get('submission_timestamp')?.startsWith(today)
        ).length,
        weeklySubmissions: enrollmentRows.filter(row => 
          row.get('submission_timestamp') >= thisWeek
        ).length,
        eligibilityRate: llnRows.length > 0 ? 
          llnRows.filter(row => row.get('eligible') === 'Yes').length / llnRows.length * 100 : 0,
        studentsAtMaxAttempts: trackingRows.filter(row => 
          parseInt(row.get('attempt_count') || '0') >= 3
        ).length,
        popularCourses: this.getPopularCourses(enrollmentRows)
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      // Return default analytics if there's an error
      return {
        totalStudents: 0,
        totalEnrollments: 0,
        totalLLNAssessments: 0,
        todaySubmissions: 0,
        weeklySubmissions: 0,
        eligibilityRate: 0,
        studentsAtMaxAttempts: 0,
        popularCourses: []
      };
    }
  }

  private getPopularCourses(rows: any[]): Array<{course: string, count: number}> {
    const courseCounts: Record<string, number> = {};
    
    rows.forEach(row => {
      const course = row.get('qualification');
      if (course) {
        courseCounts[course] = (courseCounts[course] || 0) + 1;
      }
    });
    
    return Object.entries(courseCounts)
      .map(([course, count]) => ({ course, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Helper methods to create sheets if they don't exist
  private async createStudentTrackingSheet() {
    const sheet = await this.doc.addSheet({
      title: 'Student_Tracking',
      headerValues: [
        'student_id', 'first_name', 'last_name', 'email', 'date_of_birth',
        'folder_id', 'attempt_count', 'is_blocked', 'registered_at',
        'last_attempt_at', 'status', 'reset_at'
      ]
    });
    return sheet;
  }

  private async createLLNSheet() {
    try {
      // Create a basic sheet first
      const sheet = await this.doc.addSheet({
        title: 'LLN_Assessments'
      });
      
      // Set the headers manually
      const headers = [
        'timestamp', 'student_id', 'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
        'learning_score', 'reading_score', 'writing_score', 'numeracy_score', 'digital_score',
        'overall_score', 'rating', 'eligible', 'completed_at'
      ];
      
      await sheet.setHeaderRow(headers);
      console.log('Created LLN_Assessments sheet with headers');
      
      return sheet;
      
    } catch (error) {
      console.error('Error creating LLN sheet:', error);
      throw error;
    }
  }

  private async createEnrollmentSheet() {
    try {
      // Create a basic sheet with fewer columns
      const sheet = await this.doc.addSheet({
        title: 'Student_Enrollments'
      });
      
      // Essential headers only (reduced from 27 to 15 columns)
      const headers = [
        'enrolled_date', 'student_id', 'first_name', 'middle_name', 'surname',
        'email_address', 'mobile_phone', 'dob', 'address', 'qualification',
        'usi', 'country_of_birth', 'emergency_contact_name', 'submission_timestamp', 'verification_status'
      ];
      
      await sheet.setHeaderRow(headers);
      console.log('Created Student_Enrollments sheet with simplified headers');
      
      return sheet;
      
    } catch (error) {
      console.error('Error creating enrollment sheet:', error);
      throw error;
    }
  }

    // Add this to your GoogleSheetsService class
  async getAllStudents(): Promise<any[]> {
    return this.getStudentList();
  }
  
  private async createDocumentTrackingSheet() {
    const sheet = await this.doc.addSheet({
      title: 'Document_Tracking',
      headerValues: [
        'student_id', 'passport_bio', 'visa_copy', 'photo_id', 'usi_email', 'recent_photo',
        'all_documents_complete', 'upload_date', 'verification_status'
      ]
    });
    return sheet;
  }
}