// utils/types.ts - TypeScript type definitions for the project

export interface StudentInfo {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  folderId?: string;
  attemptCount: number;
  isBlocked?: boolean;
  registeredAt?: string;
  lastAttemptAt?: string;
  status?: string;
}

export interface LLNResponse {
  studentId: string;
  responses: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth: string;
    [key: string]: any;
  };
  scores: {
    learning: number;
    reading: number;
    writing: number;
    numeracy: number;
    digitalLiteracy: number;
  };
  overallScore: number;
  rating: string;
  eligible: boolean;
  completedAt: string;
}

export interface EnrollmentData {
  studentId: string;
  personalDetails: {
    firstName: string;
    lastName?: string;
    surname?: string;
    middleName?: string;
    email?: string;
    emailAddress?: string;
    mobile?: string;
    mobilePhone?: string;
    dateOfBirth: string;
    usi?: string;
    address?: {
      streetAddress?: string;
      houseNumber?: string;
      streetName?: string;
      suburb?: string;
      state?: string;
      postcode?: string;
    };
  };
  qualificationDetails?: {
    preferredQualification?: string;
  };
  courseDetails?: {
    courseName?: string;
  };
  background?: {
    countryOfBirth?: string;
    emergencyContact?: string;
  };
}

export interface DocumentStatus {
  passportBio: string;
  visaCopy: string;
  photoId: string;
  usiEmail: string;
  recentPhoto: string;
  allComplete?: boolean;
  completedCount?: number;
  lastUploadDate?: string;
  verificationStatus?: string;
}

export interface AnalyticsData {
  totalStudents: number;
  totalEnrollments: number;
  totalLLNAssessments: number;
  todaySubmissions: number;
  weeklySubmissions: number;
  eligibilityRate: number;
  studentsAtMaxAttempts: number;
  popularCourses: Array<{course: string, count: number}>;
}

export interface StudentRegistration {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  folderId: string;
  attemptCount: number;
  registeredAt: string;
}