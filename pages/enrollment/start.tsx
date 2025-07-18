import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircleIcon, ClockIcon, FileTextIcon, UploadIcon } from 'lucide-react';

const EnrollmentStart = () => {
  const router = useRouter();
  const [hasReadInstructions, setHasReadInstructions] = useState(false);

  const requirements = [
    {
      icon: FileTextIcon,
      title: 'Personal Information',
      description: 'Have your personal details, address, and contact information ready'
    },
    {
      icon: CheckCircleIcon,
      title: 'Course Selection',
      description: 'Know which course you want to enroll in and your preferred start date'
    },
    {
      icon: UploadIcon,
      title: 'Required Documents',
      description: 'Digital copies of passport, visa, photo ID, USI email, and recent photo'
    },
    {
      icon: ClockIcon,
      title: 'Time Commitment',
      description: 'Allow 30-45 minutes to complete the entire enrollment process'
    }
  ];

  const handleStartAssessment = () => {
    if (hasReadInstructions) {
      router.push('/enrollment/lln');
    }
  };

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
              <p className="text-xs text-gray-600">Student Enrollment</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to NCA Enrollment</h2>
            <p className="text-gray-600 text-lg">
              You're about to begin your journey toward a rewarding career in healthcare and community services.
            </p>
          </div>

          {/* Process Overview */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">What to Expect</h3>
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">1</div>
                <div>
                  <h4 className="font-semibold">LLN Assessment (15 minutes)</h4>
                  <p className="text-gray-600 text-sm">Quick assessment of your Language, Literacy, and Numeracy skills</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">2</div>
                <div>
                  <h4 className="font-semibold">Personal Details (10 minutes)</h4>
                  <p className="text-gray-600 text-sm">Provide your personal information and course preferences</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">3</div>
                <div>
                  <h4 className="font-semibold">Legal Declarations (5 minutes)</h4>
                  <p className="text-gray-600 text-sm">Review and agree to student policies and terms</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">4</div>
                <div>
                  <h4 className="font-semibold">Document Upload (10 minutes)</h4>
                  <p className="text-gray-600 text-sm">Upload required identification and supporting documents</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Before You Begin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <req.icon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{req.title}</h4>
                    <p className="text-gray-600 text-sm">{req.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents Detail */}
          <div className="mb-8 bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Documents</h3>
            <p className="text-gray-600 mb-3">Please have digital copies (photos or scans) of these documents ready:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Passport bio page (clear photo of information page)</li>
              <li>Current Australian visa copy</li>
              <li>Photo ID (driver's license or other government-issued ID)</li>
              <li>USI creation email confirmation</li>
              <li>Recent passport-style photograph</li>
            </ul>
            <p className="text-sm text-gray-500 mt-3">
              💡 Tip: Have these files saved on your device before starting to make the upload process quicker.
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="mb-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy & Security</h3>
            <p className="text-gray-600 text-sm">
              Your personal information is protected by our privacy policy and will only be used for enrollment 
              and educational purposes. All data is encrypted and stored securely. By proceeding, you acknowledge 
              that you have read and understood our privacy statement.
            </p>
          </div>

          {/* Acknowledgment */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasReadInstructions}
                onChange={(e) => setHasReadInstructions(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">
                I have read and understood the enrollment process, requirements, and privacy notice. 
                I am ready to begin my enrollment with National College Australia.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartAssessment}
              disabled={!hasReadInstructions}
              className={`
                px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200
                ${hasReadInstructions 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Start LLN Assessment
            </button>
            <Link 
              href="/"
              className="px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>

          {/* Support Contact */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Need help? Contact our support team at <a href="mailto:support@nca.edu.au" className="text-blue-600 hover:underline">support@nca.edu.au</a></p>
            <p>or call <a href="tel:+61234567890" className="text-blue-600 hover:underline">+61 2 3456 7890</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentStart;