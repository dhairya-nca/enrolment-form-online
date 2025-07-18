// pages/enrollment/lln-results.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { CheckCircleIcon, AlertCircleIcon, ArrowRightIcon } from 'lucide-react';
import Header from '../../components/Header';
import StepProgress from '../../components/StepProgress';

const LLNResultsPage = () => {
  const router = useRouter();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const steps = [
    { id: 1, name: 'LLN Assessment', completed: true },
    { id: 2, name: 'Personal Details' },
    { id: 3, name: 'Declarations' },
    { id: 4, name: 'Documents' }
  ];

  useEffect(() => {
    const savedData = localStorage.getItem('nca_student_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.llnResults) {
        setStudentData(data);
      } else {
        // No LLN results found, redirect to LLN assessment
        router.push('/enrollment/lln');
      }
    } else {
      router.push('/enrollment/start');
    }
    setLoading(false);
  }, [router]);

  const handleContinueToPersonalDetails = () => {
    router.push('/enrollment/personal-details');
  };

  const handleRetakeLLN = () => {
    // Clear LLN results and redirect to assessment
    if (studentData) {
      const updatedData = {
        ...studentData,
        llnResults: undefined
      };
      localStorage.setItem('nca_student_data', JSON.stringify(updatedData));
    }
    router.push('/enrollment/lln');
  };

  if (loading) {
    return (
      <div className="min-h-screen nca-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nca-primary mx-auto mb-4"></div>
          <p className="text-nca-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!studentData?.llnResults) {
    return null; // Will redirect in useEffect
  }

  const { llnResults } = studentData;

  return (
    <div className="min-h-screen nca-gradient">
      {/* Header */}
      <Header 
        title="LLN Assessment Results" 
        showProgress={true}
        currentStep={1}
        totalSteps={4}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <StepProgress steps={steps} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card"
        >
          <div className="text-center mb-8">
            {llnResults.eligible ? (
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <AlertCircleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            )}
            <h2 className="text-3xl font-bold text-nca-gray-900 mb-2">
              Assessment Complete
            </h2>
            <p className="text-nca-gray-600">
              {llnResults.eligible 
                ? "Congratulations! You're eligible to proceed with your enrollment."
                : "Your assessment results indicate you may benefit from additional support."
              }
            </p>
          </div>

          {/* Results Summary */}
          <div className="bg-nca-light rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-nca-gray-900 mb-4">Your Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-nca-primary mb-2">
                  {llnResults.overallScore}%
                </div>
                <div className="text-nca-gray-600">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-nca-gray-900 mb-2">
                  {llnResults.rating}
                </div>
                <div className="text-nca-gray-600">Performance Rating</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold mb-2 ${
                  llnResults.eligible ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {llnResults.eligible ? 'Eligible' : 'Needs Support'}
                </div>
                <div className="text-nca-gray-600">Status</div>
              </div>
            </div>
          </div>

          {/* Detailed Scores */}
          {llnResults.scores && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-nca-gray-900 mb-4">Detailed Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(llnResults.scores).map(([skill, score]) => (
                  <div key={skill} className="bg-white rounded-lg p-4 border border-nca-gray-200">
                    <div className="text-center">
                      <div className="text-xl font-bold text-nca-primary mb-1">
                        {score}%
                      </div>
                      <div className="text-sm text-nca-gray-600 capitalize">
                        {skill.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Information Recap */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-nca-gray-900 mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-nca-gray-700">Name:</span>{' '}
                {studentData.personalInfo?.firstName} {studentData.personalInfo?.lastName}
              </div>
              <div>
                <span className="font-medium text-nca-gray-700">Email:</span>{' '}
                {studentData.personalInfo?.email}
              </div>
              <div>
                <span className="font-medium text-nca-gray-700">Phone:</span>{' '}
                {studentData.personalInfo?.phone}
              </div>
              <div>
                <span className="font-medium text-nca-gray-700">Date of Birth:</span>{' '}
                {studentData.personalInfo?.dateOfBirth}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <button
              onClick={handleRetakeLLN}
              className="px-6 py-3 border border-nca-gray-300 text-nca-gray-700 rounded-lg hover:bg-nca-gray-50 transition-colors"
            >
              Retake Assessment
            </button>

            {llnResults.eligible ? (
              <button
                onClick={handleContinueToPersonalDetails}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Continue to Personal Details</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-center">
                <p className="text-nca-gray-600 mb-4">
                  We recommend speaking with our student support team to discuss your options.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="tel:+61234567890"
                    className="btn-primary"
                  >
                    Call Student Support
                  </a>
                  <a
                    href="mailto:support@nca.edu.au"
                    className="btn-secondary"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Important Notes */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your assessment results are valid for 12 months</li>
              <li>• You can retake the assessment if you're not satisfied with your results</li>
              <li>• All data is securely stored and only used for enrollment purposes</li>
              {llnResults.eligible && (
                <li>• You can now proceed to complete your personal details and enrollment</li>
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LLNResultsPage;