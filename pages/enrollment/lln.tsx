import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LLNAssessment from '../../components/forms/LLNAssessment';

const LLNPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLLNComplete = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Store results in localStorage for next steps
      localStorage.setItem('nca_student_data', JSON.stringify({
        studentId: data.studentId,
        personalInfo: data.personalInfo,
        llnResults: {
          scores: data.scores,
          overallScore: data.overallScore,
          rating: data.rating,
          eligible: data.eligible
        }
      }));

      // Redirect based on eligibility
      if (data.eligible) {
        router.push('/enrollment/personal-details');
      } else {
        router.push('/enrollment/not-eligible');
      }
    } catch (error) {
      console.error('Error processing LLN completion:', error);
      alert('There was an error processing your assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nca-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4">
              <img 
                src="/api/placeholder/120/60" 
                alt="National College Australia" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-nca-primary">National College Australia</h1>
                <p className="text-xs text-gray-600">LLN Assessment</p>
              </div>
            </Link>
            <div className="text-right">
              <p className="text-sm text-gray-600">Step 1 of 4</p>
              <p className="text-xs text-gray-500">Language, Literacy & Numeracy</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-nca-primary mb-2">LLN Assessment</h2>
            <p className="text-gray-600">
              This assessment helps us understand your current skill level and ensure you receive 
              the appropriate support throughout your studies.
            </p>
          </div>

          <LLNAssessment onComplete={handleLLNComplete} />
        </motion.div>
      </div>
    </div>
  );
};

export default LLNPage;