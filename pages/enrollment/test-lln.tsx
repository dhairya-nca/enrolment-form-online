import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const TestLLNPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickTest = async (scenario: 'eligible' | 'not-eligible') => {
    setIsSubmitting(true);
    
    const mockStudentData = {
      studentId: `TEST-${Date.now()}`,
      personalInfo: {
        firstName: 'Test',
        lastName: 'Student',
        email: 'test@example.com',
        phone: '0412345678',
        dateOfBirth: '1990-01-01'
      },
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

    // Store test data
    localStorage.setItem('nca_student_data', JSON.stringify({
      studentId: mockStudentData.studentId,
      personalInfo: mockStudentData.personalInfo,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">NCA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">National College Australia</h1>
              <p className="text-xs text-gray-600">🧪 Testing Mode</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🧪 Quick Testing Mode</h2>
          <p className="text-gray-600 mb-8">
            Skip the full LLN assessment and jump straight to testing different scenarios
          </p>

          <div className="space-y-4">
            <button
              onClick={() => handleQuickTest('eligible')}
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              🎉 Test Eligible Student Flow
              <div className="text-sm opacity-90">Score: 83% (Excellent) → Personal Details</div>
            </button>

            <button
              onClick={() => handleQuickTest('not-eligible')}
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              ❌ Test Not Eligible Student Flow
              <div className="text-sm opacity-90">Score: 28% (Requires Support) → Not Eligible Page</div>
            </button>

            <Link 
              href="/enrollment/lln"
              className="block w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📝 Take Full LLN Assessment
              <div className="text-sm opacity-90">Complete all 22 questions normally</div>
            </Link>

            <Link 
              href="/"
              className="block w-full border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🏠 Back to Homepage
            </Link>
          </div>

          {isSubmitting && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Setting up test scenario...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestLLNPage;