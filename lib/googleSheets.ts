import { GoogleSpreadsheet } from 'google-spreadsheet';
import { LLNResponse, EnrollmentData } from '../utils/types';

export class GoogleSheetsService {
  private doc: GoogleSpreadsheet;
  
  constructor() {
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID environment variable is required');
    }
    this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  }

  private async authenticate() {
    await this.doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    });
    await this.doc.loadInfo();
  }

  async submitLLNAssessment(data: LLNResponse): Promise<string> {
    try {
      await this.authenticate();
      const sheet = this.doc.sheetsByTitle['LLN_Assessments'];
      
      if (!sheet) {
        throw new Error('LLN_Assessments sheet not found');
      }

      const row = await sheet.addRow({
        timestamp: new Date().toISOString(),
        student_id: data.studentId,
        first_name: data.responses.firstName || '',
        last_name: data.responses.lastName || '',
        email: data.responses.email || '',
        phone: data.responses.phone || '',
        date_of_birth: data.responses.dateOfBirth || '',
        
        // LLN Responses (Q1-Q22)
        ...Object.fromEntries(
          Object.entries(data.responses).map(([key, value]) => [
            key, Array.isArray(value) ? value.join(', ') : value
          ])
        ),
        
        // Scores
        learning_score: data.scores.learning,
        reading_score: data.scores.reading,
        writing_score: data.scores.writing,
        numeracy_score: data.scores.numeracy,
        digital_score: data.scores.digitalLiteracy,
        overall_score: data.overallScore,
        rating: data.rating,
        eligible: data.eligible ? 'Yes' : 'No',
        completed_at: data.completedAt
      });

      return `LLN-${data.studentId}`;
    } catch (error) {
      console.error('Error submitting LLN assessment:', error);
      throw new Error('Failed to submit LLN assessment');
    }
  }

  async submitEnrollment(data: EnrollmentData): Promise<string> {
    try {
      await this.authenticate();
      const sheet = this.doc.sheetsByTitle['Student_Enrollments'];
      
      if (!sheet) {
        throw new Error('Student_Enrollments sheet not found');
      }

      const row = await sheet.addRow({
        timestamp: new Date().toISOString(),
        student_id: data.studentId,
        
        // Personal Details
        title: data.personalDetails.title,
        gender: data.personalDetails.gender,
        first_name: data.personalDetails.firstName,
        middle_name: data.personalDetails.middleName || '',
        last_name: data.personalDetails.lastName,
        date_of_birth: data.personalDetails.dateOfBirth,
        mobile: data.personalDetails.mobile,
        email: data.personalDetails.email,
        
        // Address
        house_number: data.personalDetails.address.houseNumber,
        street_name: data.personalDetails.address.streetName,
        suburb: data.personalDetails.address.suburb,
        postcode: data.personalDetails.address.postcode,
        state: data.personalDetails.address.state,
        postal_address: data.personalDetails.address.postalAddress || '',
        
        // Course Details
        course_name: data.courseDetails.courseName,
        delivery_mode: data.courseDetails.deliveryMode,
        start_date: data.courseDetails.startDate,
        
        // Background Information
        emergency_contact: data.background.emergencyContact,
        country_of_birth: data.background.countryOfBirth,
        country_of_citizenship: data.background.countryOfCitizenship,
        main_language: data.background.mainLanguage,
        english_proficiency: data.background.englishProficiency,
        australian_citizen: data.background.australianCitizen ? 'Yes' : 'No',
        aboriginal_status: data.background.aboriginalStatus,
        employment_status: data.background.employmentStatus,
        secondary_school: data.background.secondarySchool ? 'Yes' : 'No',
        school_level: data.background.schoolLevel,
        qualifications: data.background.qualifications,
        disability: data.background.disability ? 'Yes' : 'No',
        course_reason: data.background.courseReason,
        
        // Compliance
        usi: data.compliance.usi || '',
        privacy_signature_date: data.compliance.privacyDate,
        declaration_signature_date: data.compliance.declarationDate,
        policy_signature_date: data.compliance.policyDate,
        
        // Status
        status: data.status
      });

      return `ENR-${data.studentId}`;
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      throw new Error('Failed to submit enrollment');
    }
  }

  async updateDocumentStatus(studentId: string, documents: Record<string, string>): Promise<void> {
    try {
      await this.authenticate();
      const sheet = this.doc.sheetsByTitle['Document_Tracking'];
      
      if (!sheet) {
        throw new Error('Document_Tracking sheet not found');
      }

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

  async getAnalytics(): Promise<any> {
    try {
      await this.authenticate();
      const enrollmentSheet = this.doc.sheetsByTitle['Student_Enrollments'];
      const llnSheet = this.doc.sheetsByTitle['LLN_Assessments'];
      
      const enrollmentRows = await enrollmentSheet.getRows();
      const llnRows = await llnSheet.getRows();
      
      const today = new Date().toISOString().split('T')[0];
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        totalEnrollments: enrollmentRows.length,
        totalLLNAssessments: llnRows.length,
        todaySubmissions: enrollmentRows.filter(row => 
          row.get('timestamp')?.startsWith(today)
        ).length,
        weeklySubmissions: enrollmentRows.filter(row => 
          row.get('timestamp') >= thisWeek
        ).length,
        eligibilityRate: llnRows.filter(row => 
          row.get('eligible') === 'Yes'
        ).length / llnRows.length * 100,
        popularCourses: this.getPopularCourses(enrollmentRows)
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {};
    }
  }

  private getPopularCourses(rows: any[]): Array<{course: string, count: number}> {
    const courseCounts: Record<string, number> = {};
    
    rows.forEach(row => {
      const course = row.get('course_name');
      if (course) {
        courseCounts[course] = (courseCounts[course] || 0) + 1;
      }
    });
    
    return Object.entries(courseCounts)
      .map(([course, count]) => ({ course, count }))
      .sort((a, b) => b.count - a.count);
  }
}