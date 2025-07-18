// utils/types.ts
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  createdAt: string;
}

export interface LLNResponse {
  studentId: string;
  responses: Record<string, string | string[]>;
  scores: {
    learning: number;
    reading: number;
    writing: number;
    numeracy: number;
    digitalLiteracy: number;
  };
  overallScore: number;
  rating: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Support' | 'Requires Intensive Support';
  eligible: boolean;
  completedAt: string;
}

export interface EnrollmentData {
  studentId: string;
  personalDetails: {
    title: string;
    gender: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    mobile: string;
    email: string;
    address: {
      houseNumber: string;
      streetName: string;
      suburb: string;
      postcode: string;
      state: string;
      postalAddress?: string;
    };
  };
  courseDetails: {
    courseName: string;
    deliveryMode: string;
    startDate: string;
  };
  background: {
    emergencyContact: string;
    countryOfBirth: string;
    countryOfCitizenship: string;
    mainLanguage: string;
    englishProficiency: string;
    australianCitizen: boolean;
    aboriginalStatus: string;
    employmentStatus: string;
    secondarySchool: boolean;
    schoolLevel: string;
    qualifications: string;
    disability: boolean;
    courseReason: string;
  };
  compliance: {
    usi?: string;
    privacySignature: string;
    privacyDate: string;
    declarationSignature: string;
    declarationDate: string;
    policySignature: string;
    policyDate: string;
  };
  documents: {
    passportBio?: string;
    visaCopy?: string;
    photoId?: string;
    usiEmail?: string;
    recentPhoto?: string;
  };
  status: 'draft' | 'lln-complete' | 'enrollment-complete' | 'documents-pending' | 'complete';
}

export interface DocumentUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}