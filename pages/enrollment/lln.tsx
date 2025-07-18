import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import LLNAssessment from '../../components/forms/LLNAssessment';
import Header from '../../components/Header';
import StepProgress from '../../components/StepProgress';

const LLNPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, name: 'LLN Assessment', current: true },
    { id: 2, name: 'Personal Details' },
    { id: 3, name: 'Declarations' },
    { id: 4, name: 'Documents' }
  ];

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
  
      // Redirect to LLN Results page instead of directly to personal-details
      router.push('/enrollment/lln-results');
      
    } catch (error) {
      console.error('Error processing LLN completion:', error);
      alert('There was an error processing your assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen nca-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nca-primary mx-auto mb-4"></div>
          <p className="text-nca-gray-600">Processing your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen nca-gradient">
      {/* Header */}
      <Header 
        title="Language, Literacy & Numeracy" 
        showProgress={true}
        currentStep={1}
        totalSteps={4}
      />

      {/* Main Content */}
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
            <h2 className="text-3xl font-bold text-nca-primary mb-2">LLN Assessment</h2>
            <p className="text-nca-gray-600">
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