// pages/enrollment/register.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import StudentRegistration from '../../components/forms/StudentRegistration';

const RegisterPage = () => {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegistrationComplete = (studentData: any) => {
    setIsRegistered(true);
    
    // Redirect to LLN assessment after successful registration
    setTimeout(() => {
      router.push('/enrollment/lln');
    }, 1000);
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">Redirecting you to the LLN assessment...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">NCA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">National College Australia</h1>
              <p className="text-xs text-gray-600">Student Registration</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  1
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Registration</p>
                  <p className="text-xs text-gray-500">Verify your details</p>
                </div>
              </div>
              
              <div className="mx-4 h-0.5 w-16 bg-gray-200"></div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-400">LLN Assessment</p>
                  <p className="text-xs text-gray-500">Complete the test</p>
                </div>
              </div>
              
              <div className="mx-4 h-0.5 w-16 bg-gray-200"></div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-400">Enrollment</p>
                  <p className="text-xs text-gray-500">Complete forms</p>
                </div>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Welcome to National College Australia</h2>
              <p className="text-lg text-gray-600 mt-2">Begin your enrollment journey</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Register with your personal details</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Complete the Language, Literacy & Numeracy assessment</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Fill out enrollment forms and upload documents</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Receive confirmation and course details</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Information</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <svg className="flex-shrink-0 h-5 w-5 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-800">LLN Assessment Attempts</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        You have a maximum of 3 attempts to complete the LLN assessment. 
                        Please ensure you're in a quiet environment with a stable internet connection.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="flex-shrink-0 h-5 w-5 text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">Data Security</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your personal information is securely stored and protected. 
                        We comply with all privacy regulations and will only use your data for enrollment purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <StudentRegistration onRegistrationComplete={handleRegistrationComplete} />

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Need help? Contact our enrollment team at{' '}
              <a href="mailto:enrollment@nca.edu.au" className="text-blue-600 hover:text-blue-700">
                enrollment@nca.edu.au
              </a>{' '}
              or call{' '}
              <a href="tel:+61123456789" className="text-blue-600 hover:text-blue-700">
                +61 1 2345 6789
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;