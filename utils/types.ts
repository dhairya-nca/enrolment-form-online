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
  status?: string;
  personalDetails: {
    firstName: string;
    lastName?: string;
    surname?: string;
    middleName?: string;
    title?: string;
    gender?: string;
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
      postalAddress?: string;
    };
  };
  qualificationDetails?: {
    preferredQualification?: string;
  };
  courseDetails?: {
    courseName?: string;
    deliveryMode?: string;
    startDate?: string;
  };
  background?: {
    countryOfBirth?: string;
    countryOfCitizenship?: string;
    mainLanguage?: string;
    englishProficiency?: string;
    australianCitizen?: boolean;
    aboriginalStatus?: string;
    employmentStatus?: string;
    secondarySchool?: boolean;
    schoolLevel?: string;
    qualifications?: string;
    disability?: boolean;
    courseReason?: string;
    emergencyContact?: string;
  };
  compliance?: {
    declarationSignature?: string;
    declarationDate?: string;
    policyDate?: string;
    readPolicy?: boolean;
    readHandbook?: boolean;
    agreesToDeclaration?: boolean;
    usi?: string;
  };
  documents?: {
    passportBio?: string;
    visaCopy?: string;
    photoId?: string;
    usiEmail?: string;
    recentPhoto?: string;
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