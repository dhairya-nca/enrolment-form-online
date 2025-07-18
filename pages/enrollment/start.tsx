import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircleIcon, ClockIcon, FileTextIcon, UploadIcon } from 'lucide-react';
import Header from '../../components/Header';
import NCALogo from '../../components/NCALogo';

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
    <div className="min-h-screen nca-gradient">
      {/* Header */}
      <Header 
        title="Student Enrollment" 
        subtitle="Getting Started"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-nca-gray-900 mb-4">Welcome to NCA Enrollment</h2>
            <p className="text-nca-gray-600 text-lg">
              You're about to begin your journey toward a rewarding career in healthcare and community services.
            </p>
          </div>

          {/* Requirements Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-nca-gray-900 mb-6 text-center">
              Before You Begin
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requirements.map((requirement, index) => {
                const IconComponent = requirement.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-nca-light rounded-lg border border-nca-gray-200"
                  >
                    <div className="w-10 h-10 bg-nca-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-nca-gray-900 mb-1">{requirement.title}</h4>
                      <p className="text-sm text-nca-gray-600">{requirement.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Process Overview */}
          <div className="mb-8 p-6 bg-white border border-nca-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-nca-gray-900 mb-4">Enrollment Process</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-nca-primary text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-nca-gray-700">Complete LLN Assessment (15 minutes)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-nca-primary text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-nca-gray-700">Fill Personal Details & Course Selection (10 minutes)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-nca-primary text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <span className="text-nca-gray-700">Read & Accept Declarations (5 minutes)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-nca-primary text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <span className="text-nca-gray-700">Upload Required Documents (10 minutes)</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="mb-8 p-6 bg-nca-light border border-nca-primary rounded-lg">
            <h3 className="text-lg font-semibold text-nca-primary mb-4">Important Information</h3>
            <ul className="space-y-2 text-sm text-nca-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-nca-primary font-bold">•</span>
                <span>Your progress will be automatically saved at each step</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-nca-primary font-bold">•</span>
                <span>All information provided must be accurate and up-to-date</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-nca-primary font-bold">•</span>
                <span>You will receive an email confirmation upon successful enrollment</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-nca-primary font-bold">•</span>
                <span>If you need assistance, contact our support team at support@nca.edu.au</span>
              </li>
            </ul>
          </div>

          {/* Confirmation and Start Button */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="readInstructions"
                checked={hasReadInstructions}
                onChange={(e) => setHasReadInstructions(e.target.checked)}
                className="w-5 h-5 text-nca-primary border-nca-gray-300 rounded focus:ring-nca-primary focus:ring-offset-0"
              />
              <label htmlFor="readInstructions" className="text-nca-gray-700 cursor-pointer">
                I have read and understood the enrollment requirements and process
              </label>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleStartAssessment}
                disabled={!hasReadInstructions}
                className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 ${
                  hasReadInstructions
                    ? 'btn-primary hover:scale-105'
                    : 'bg-nca-gray-300 text-nca-gray-500 cursor-not-allowed'
                }`}
              >
                {hasReadInstructions ? 'Begin LLN Assessment' : 'Please read the information above'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentStart;