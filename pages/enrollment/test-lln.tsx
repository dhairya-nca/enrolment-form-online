import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '../../components/Header';

const TestLLNPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRandomTestData = (scenario: 'eligible' | 'not-eligible') => {
    // Generate unique test data for each test session
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    
    return {
      studentId: `TEST-${timestamp}-${randomId}`,
      personalInfo: {
        firstName: scenario === 'eligible' ? 'Alex' : 'Sam',
        lastName: `TestUser${randomId}`,
        email: `test${randomId}@example.com`,
        dateOfBirth: '1995-03-15',
        phone: `041234${randomId.toString().slice(-4)}`
      }
    };
  };

  const handleQuickTest = async (scenario: 'eligible' | 'not-eligible') => {
    setIsSubmitting(true);
    
    const testData = generateRandomTestData(scenario);
    
    const mockStudentData = {
      ...testData,
      scores: {
        learning: scenario === 'eligible' ? 80 : 30,
        reading: scenario === 'eligible' ? 75 : 25,
        writing: scenario === 'eligible' ? 85 : 35,
        numeracy: scenario === 'eligible' ? 90 : 20,
        digitalLiteracy: scenario === 'eligible' ? 85 : 30
      },
      overallScore: scenario === 'eligible' ? 83 : 28,
      rating: scenario === 'eligible' ? 'Excellent' : 'Requires Intensive Support',
      eligible: scenario === 'eligible',
      completedAt: new Date().toISOString()
    };

    // Store test registration data (simulating what happens in actual registration)
    localStorage.setItem('nca_student_registration', JSON.stringify({
      studentId: testData.studentId,
      firstName: testData.personalInfo.firstName,
      lastName: testData.personalInfo.lastName,
      email: testData.personalInfo.email,
      dateOfBirth: testData.personalInfo.dateOfBirth,
      phone: testData.personalInfo.phone,
      folderId: `folder-${testData.studentId}`,
      attemptCount: 1
    }));

    // Store test student data
    localStorage.setItem('nca_student_data', JSON.stringify({
      studentId: testData.studentId,
      personalInfo: testData.personalInfo,
      llnResults: {
        scores: mockStudentData.scores,
        overallScore: mockStudentData.overallScore,
        rating: mockStudentData.rating,
        eligible: mockStudentData.eligible
      }
    }));

    // Redirect based on scenario
    if (scenario === 'eligible') {
      router.push('/enrollment/personal-details');
    } else {
      router.push('/enrollment/not-eligible');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen nca-gradient">
      <Header 
        title="🧪 Testing Mode" 
        subtitle="LLN Assessment Testing"
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-nca-gray-900 mb-4">🧪 Quick Testing Mode</h2>
          <p className="text-nca-gray-600 mb-8">
            Skip the full LLN assessment and jump straight to testing different scenarios with unique test data
          </p>

          <div className="space-y-4">
            <button
              onClick={() => handleQuickTest('eligible')}
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Test Eligible Student Flow
              <div className="text-sm opacity-90">Score: 83% (Excellent) → Personal Details</div>
              <div className="text-xs opacity-75">✨ Generates unique test data each time</div>
            </button>

            <button
              onClick={() => handleQuickTest('not-eligible')}
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Test Not Eligible Student Flow
              <div className="text-sm opacity-90">Score: 28% (Requires Support) → Not Eligible Page</div>
              <div className="text-xs opacity-75">✨ Generates unique test data each time</div>
            </button>

            <Link 
              href="/enrollment/lln"
              className="block w-full btn-primary"
            >
              📝 Take Full LLN Assessment
              <div className="text-sm opacity-90">Complete all 22 questions normally</div>
            </Link>

            <Link 
              href="/"
              className="block w-full btn-secondary"
            >
              Back to Homepage
            </Link>
          </div>

          {isSubmitting && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nca-primary mx-auto"></div>
              <p className="text-nca-gray-600 mt-2">Setting up test scenario...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestLLNPage;