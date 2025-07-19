// pages/enrollment/register.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, ShieldCheckIcon, AlertTriangleIcon, InfoIcon } from 'lucide-react';
import StudentRegistration from '../../components/forms/StudentRegistration';
import Header from '../../components/Header';
import NCALogo from '../../components/NCALogo';

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
      <div className="min-h-screen nca-gradient flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-nca-gray-900 mb-3">Registration Successful!</h2>
          <p className="text-nca-gray-600 mb-6 text-lg">Redirecting you to the LLN assessment...</p>
          <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-nca-primary mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  const processSteps = [
    {
      number: 1,
      title: 'Registration',
      subtitle: 'Verify your details',
      status: 'current',
      icon: CheckCircleIcon
    },
    {
      number: 2,
      title: 'LLN Assessment',
      subtitle: 'Complete the test',
      status: 'pending',
      icon: ClockIcon
    },
    {
      number: 3,
      title: 'Enrollment',
      subtitle: 'Complete forms',
      status: 'pending',
      icon: ShieldCheckIcon
    }
  ];

  const expectations = [
    'Complete LLN Assessment (15-20 minutes)',
    'Submit enrollment forms and documents', 
    'Receive confirmation and course details'
  ];

  return (
    <div className="min-h-screen nca-gradient">
      {/* Header */}
      <Header 
        title="Student Registration"
        subtitle="Begin your enrollment journey"
        showProgress={false}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Progress Indicator */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-center">
              {processSteps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${
                      step.status === 'current' 
                        ? 'bg-nca-primary text-white shadow-lg' 
                        : 'bg-nca-gray-200 text-nca-gray-500'
                    }`}>
                      {step.number}
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-semibold ${
                        step.status === 'current' ? 'text-nca-primary' : 'text-nca-gray-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-nca-gray-500">{step.subtitle}</p>
                    </div>
                  </div>
                  
                  {index < processSteps.length - 1 && (
                    <div className="mx-6 h-0.5 w-20 bg-nca-gray-200"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-nca-gray-900 mb-4">
              Student Registration
            </h1>
            <p className="text-lg text-nca-gray-600 max-w-2xl mx-auto">
              Complete your registration to begin the enrollment process for our nationally recognized healthcare and community services qualifications.
            </p>
          </motion.div>

          {/* Centered Registration Form */}
          <div className="max-w-lg mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StudentRegistration onRegistrationComplete={handleRegistrationComplete} />
            </motion.div>
          </div>

          {/* Professional Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white border-t border-nca-gray-200 py-8"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h4 className="text-lg font-semibold text-nca-gray-900 mb-2">Enrollment Support</h4>
              <p className="text-nca-gray-600 mb-4">
                Our admissions team is available to assist with your enrollment process.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm">
                <a 
                  href="mailto:admissions@nca.edu.au" 
                  className="text-nca-primary hover:text-nca-secondary font-medium"
                >
                  admin@nca.edu.au
                </a>
                <span className="hidden sm:block text-nca-gray-400">•</span>
                <a 
                  href="tel:+61123456789" 
                  className="text-nca-primary hover:text-nca-secondary font-medium"
                >
                  +61 1 2345 6789
                </a>
                <span className="hidden sm:block text-nca-gray-400">•</span>
                <span className="text-nca-gray-600">Monday - Friday, 9:00 AM - 5:00 PM AEST</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;