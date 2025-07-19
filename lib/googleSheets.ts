// lib/googleSheets.ts - Complete fixed version with all missing methods
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

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
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
  attemptCount: number;
  folderId: string;
  isBlocked?: boolean;
}

interface LLNAssessmentData {
  studentId: string;
  responses: any;
  scores: any;
  overallScore: number;
  rating: string;
  eligible: boolean;
  completedAt: string;
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

  /**
   * Find student by email and date of birth
   */
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
          firstName: existingRow.get('first_name'),
          lastName: existingRow.get('last_name'),
          email: existingRow.get('email'),
          dateOfBirth: existingRow.get('date_of_birth'),
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

  /**
   * Register new student
   */
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
        status: 'Active',
        reset_at: ''
      });
    } catch (error) {
      console.error('Error registering student:', error);
      throw new Error('Failed to register student');
    }
  }

  /**
   * Submit LLN Assessment
   */
  async submitLLNAssessment(data: LLNAssessmentData): Promise<string> {
    try {
      await this.ensureAuthenticated();
      
      // Get or create the LLN sheet
      let sheet = this.doc.sheetsByTitle['LLN_Assessments'];
      if (!sheet) {
        console.log('Creating LLN_Assessments sheet...');
        sheet = await this.createLLNSheet();
      }
      
      // Ensure the sheet has headers
      try {
        await sheet.loadHeaderRow();
        if (!sheet.headerValues || sheet.headerValues.length === 0) {
          const headers = [
            'timestamp', 'student_id', 'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
            'learning_score', 'reading_score', 'writing_score', 'numeracy_score', 'digital_score',
            'overall_score', 'rating', 'eligible', 'completed_at'
          ];
          await sheet.setHeaderRow(headers);
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

  /**
   * Submit enrollment data
   */
  async submitEnrollment(data: any): Promise<string> {
    try {
      await this.ensureAuthenticated();
      
      // Get or create the enrollment sheet
      let sheet = this.doc.sheetsByTitle['Student_Enrollments'];
      if (!sheet) {
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
        }
      } catch (headerError) {
        const headers = [
          'enrolled_date', 'student_id', 'first_name', 'middle_name', 'surname',
          'email_address', 'mobile_phone', 'dob', 'address', 'qualification',
          'usi', 'country_of_birth', 'emergency_contact_name', 'submission_timestamp', 'verification_status'
        ];
        await sheet.setHeaderRow(headers);
      }
      
      // Store enrollment data
      const rowData = {
        enrolled_date: new Date().toISOString().split('T')[0],
        student_id: data.studentId,
        first_name: data.personalDetails.firstName,
        middle_name: data.personalDetails.middleName || '',
        surname: data.personalDetails.surname || data.personalDetails.lastName,
        email_address: data.personalDetails.emailAddress || data.personalDetails.email,
        mobile_phone: data.personalDetails.mobilePhone || data.personalDetails.mobile,
        dob: data.personalDetails.dateOfBirth,
        address: data.personalDetails.address ? 
          `${data.personalDetails.address.streetAddress || ''}, ${data.personalDetails.address.suburb || ''}, ${data.personalDetails.address.state || ''} ${data.personalDetails.address.postcode || ''}`.trim() :
          '',
        qualification: data.qualificationDetails?.preferredQualification || data.courseDetails?.courseName || '',
        usi: data.personalDetails.usi || '',
        country_of_birth: data.background?.countryOfBirth || '',
        emergency_contact_name: data.background?.emergencyContact?.split(' - ')[0] || '',
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

  /**
   * Increment attempt count for student
   */
  async incrementAttemptCount(studentId: string): Promise<void> {
    try {
      await this.ensureAuthenticated();
      const sheet = this.doc.sheetsByTitle['Student_Tracking'] || await this.createStudentTrackingSheet();
      
      const rows = await sheet.getRows();
      const studentRow = rows.find(row => row.get('student_id') === studentId);
      
      if (studentRow) {
        const currentCount = parseInt(studentRow.get('attempt_count') || '0');
        studentRow.set('attempt_count', currentCount + 1);
        studentRow.set('last_attempt_at', new Date().toISOString());
        await studentRow.save();
      }
    } catch (error) {
      console.error('Error incrementing attempt count:', error);
      // Don't throw error as this shouldn't block the main operation
    }
  }

  /**
   * Update student folder ID
   */
  async updateStudentFolder(studentId: string, folderId: string): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      let sheet = this.doc.sheetsByTitle['Student_Tracking'];
      if (!sheet) {
        sheet = await this.createStudentTrackingSheet();
      }

      const rows = await sheet.getRows();
      let existingRow = rows.find(row => row.get('student_id') === studentId);

      if (existingRow) {
        existingRow.set('folder_id', folderId);
        existingRow.set('folder_created_at', new Date().toISOString());
        await existingRow.save();
      } else {
        // Create new student record
        await sheet.addRow({
          student_id: studentId,
          folder_id: folderId,
          folder_created_at: new Date().toISOString(),
          attempt_count: 0,
          is_blocked: 'No',
          registered_at: new Date().toISOString(),
          status: 'Active'
        });
      }
    } catch (error) {
      console.error('Error updating student folder:', error);
      throw new Error('Failed to update student folder information');
    }
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(studentId: string, documents: Record<string, string>): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      let sheet = this.doc.sheetsByTitle['Document_Tracking'];
      if (!sheet) {
        sheet = await this.createDocumentTrackingSheet();
      }
      
      const rows = await sheet.getRows();
      let existingRow = rows.find(row => row.get('student_id') === studentId);
      
      // Check completion status
      const currentDocuments = existingRow ? {
        passportBio: existingRow.get('passport_bio') || '',
        visaCopy: existingRow.get('visa_copy') || '',
        photoId: existingRow.get('photo_id') || '',
        usiEmail: existingRow.get('usi_email') || '',
        recentPhoto: existingRow.get('recent_photo') || ''
      } : {};

      const updatedDocuments = { ...currentDocuments, ...documents };
      const requiredDocs = ['passportBio', 'visaCopy', 'photoId', 'usiEmail', 'recentPhoto'];
      const completedDocs = requiredDocs.filter(doc => 
        updatedDocuments[doc] && updatedDocuments[doc].trim() !== ''
      );
      
      const allComplete = completedDocs.length === requiredDocs.length;

      const documentData = {
        student_id: studentId,
        passport_bio: updatedDocuments.passportBio || '',
        visa_copy: updatedDocuments.visaCopy || '',
        photo_id: updatedDocuments.photoId || '',
        usi_email: updatedDocuments.usiEmail || '',
        recent_photo: updatedDocuments.recentPhoto || '',
        all_documents_complete: allComplete ? 'Yes' : 'No',
        documents_completed_count: completedDocs.length,
        last_upload_date: new Date().toISOString(),
        verification_status: allComplete ? 'Ready for Review' : 'Pending Upload'
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

  /**
   * Get document status for a student
   */
  async getDocumentStatus(studentId: string): Promise<any | null> {
    try {
      await this.ensureAuthenticated();
      const sheet = this.doc.sheetsByTitle['Document_Tracking'];
      
      if (!sheet) {
        return null;
      }
      
      const rows = await sheet.getRows();
      const studentDocRow = rows.find(row => row.get('student_id') === studentId);
      
      if (studentDocRow) {
        return {
          passportBio: studentDocRow.get('passport_bio') || '',
          visaCopy: studentDocRow.get('visa_copy') || '',
          photoId: studentDocRow.get('photo_id') || '',
          usiEmail: studentDocRow.get('usi_email') || '',
          recentPhoto: studentDocRow.get('recent_photo') || '',
          allComplete: studentDocRow.get('all_documents_complete') === 'Yes',
          completedCount: parseInt(studentDocRow.get('documents_completed_count')) || 0,
          lastUploadDate: studentDocRow.get('last_upload_date') || '',
          verificationStatus: studentDocRow.get('verification_status') || 'Pending'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting document status:', error);
      return null;
    }
  }

  /**
   * Get student list
   */
  async getStudentList(): Promise<any[]> {
    try {
      await this.ensureAuthenticated();
      const sheet = this.doc.sheetsByTitle['Student_Tracking'];
      
      if (!sheet) {
        return [];
      }
      
      const rows = await sheet.getRows();
      return rows.map(row => ({
        studentId: row.get('student_id'),
        firstName: row.get('first_name'),
        lastName: row.get('last_name'),
        email: row.get('email'),
        dateOfBirth: row.get('date_of_birth'),
        folderId: row.get('folder_id'),
        attemptCount: parseInt(row.get('attempt_count')) || 0,
        isBlocked: row.get('is_blocked') === 'Yes',
        registeredAt: row.get('registered_at'),
        lastAttemptAt: row.get('last_attempt_at'),
        status: row.get('status'),
        folderCreatedAt: row.get('folder_created_at')
      }));
    } catch (error) {
      console.error('Error getting student list:', error);
      return [];
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<any> {
    try {
      await this.ensureAuthenticated();
      
      const trackingSheet = this.doc.sheetsByTitle['Student_Tracking'];
      const enrollmentSheet = this.doc.sheetsByTitle['Student_Enrollments'];
      const llnSheet = this.doc.sheetsByTitle['LLN_Assessments'];
      
      const trackingRows = trackingSheet ? await trackingSheet.getRows() : [];
      const enrollmentRows = enrollmentSheet ? await enrollmentSheet.getRows() : [];
      const llnRows = llnSheet ? await llnSheet.getRows() : [];
      
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        totalStudents: trackingRows.length,
        totalEnrollments: enrollmentRows.length,
        totalLLNAssessments: llnRows.length,
        todaySubmissions: llnRows.filter(row => 
          row.get('timestamp')?.split('T')[0] === today
        ).length,
        weeklySubmissions: llnRows.filter(row => 
          row.get('timestamp') >= weekAgo
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

  /**
   * Get popular courses from enrollment data
   */
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

  /**
   * Get all students (alias for getStudentList)
   */
  async getAllStudents(): Promise<any[]> {
    return this.getStudentList();
  }

  // Sheet creation methods
  private async createStudentTrackingSheet() {
    const sheet = await this.doc.addSheet({
      title: 'Student_Tracking',
      headerValues: [
        'student_id', 'first_name', 'last_name', 'email', 'date_of_birth',
        'folder_id', 'folder_created_at', 'attempt_count', 'is_blocked', 
        'registered_at', 'last_attempt_at', 'status', 'reset_at'
      ]
    });
    return sheet;
  }

  private async createDocumentTrackingSheet() {
    const sheet = await this.doc.addSheet({
      title: 'Document_Tracking',
      headerValues: [
        'student_id', 'passport_bio', 'visa_copy', 'photo_id', 'usi_email', 'recent_photo',
        'all_documents_complete', 'documents_completed_count', 'last_upload_date', 'verification_status'
      ]
    });
    return sheet;
  }

  private async createEnrollmentSheet() {
    const sheet = await this.doc.addSheet({
      title: 'Student_Enrollments',
      headerValues: [
        'enrolled_date', 'student_id', 'first_name', 'middle_name', 'surname',
        'email_address', 'mobile_phone', 'dob', 'address', 'qualification',
        'usi', 'country_of_birth', 'emergency_contact_name', 'submission_timestamp', 'verification_status'
      ]
    });
    return sheet;
  }

  private async createLLNSheet() {
    const sheet = await this.doc.addSheet({
      title: 'LLN_Assessments',
      headerValues: [
        'timestamp', 'student_id', 'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
        'learning_score', 'reading_score', 'writing_score', 'numeracy_score', 'digital_score',
        'overall_score', 'rating', 'eligible', 'completed_at'
      ]
    });
    return sheet;
  }
}