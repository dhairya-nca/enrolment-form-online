import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircleIcon, FileTextIcon, MailIcon, CalendarIcon, UserIcon, PhoneIcon } from 'lucide-react';
import Header from '../../components/Header';

const EnrollmentCompletePage = () => {
  const router = useRouter();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem('nca_student_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.status === 'enrollment-complete') {
        setStudentData(data);
      } else {
        // Redirect if enrollment not complete
        router.push('/enrollment/start');
      }
    } else {
      router.push('/enrollment/start');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen nca-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nca-primary mx-auto mb-4"></div>
          <p className="text-nca-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return null;
  }

  const nextSteps = [
    {
      icon: MailIcon,
      title: 'Check Your Email',
      description: 'You will receive a confirmation email within 24 hours with your enrollment details and next steps.'
    },
    {
      icon: CalendarIcon,
      title: 'Course Start Date',
      description: `Your course is scheduled to begin on ${studentData.courseDetails?.startDate || 'TBA'}. Mark your calendar!`
    },
    {
      icon: FileTextIcon,
      title: 'Placement Prerequisites',
      description: 'Submit your placement prerequisite documents within 2-3 weeks of enrollment as outlined in your student handbook.'
    },
    {
      icon: PhoneIcon,
      title: 'Contact Support',
      description: 'If you have any questions, contact our support team at support@nca.edu.au or call (08) 8231 8811'
    }
  ];

  return (
    <div className="min-h-screen nca-gradient">
      {/* Header */}
      <Header 
        title="Enrollment Complete" 
        subtitle="Welcome to National College Australia"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-4xl font-bold text-nca-gray-900 mb-4">
            🎉 Enrollment Successfully Completed!
          </h1>
          <p className="text-xl text-nca-gray-600 mb-2">
            Welcome to National College Australia, {studentData.personalDetails?.firstName}!
          </p>
          <p className="text-nca-gray-500">
            Your enrollment for <strong>{studentData.courseDetails?.courseName}</strong> has been submitted successfully.
          </p>
        </motion.div>

        {/* Enrollment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card mb-8"
        >
          <h2 className="text-2xl font-bold text-nca-gray-900 mb-6">📋 Enrollment Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-nca-gray-700 mb-2">Student Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {studentData.personalDetails?.firstName} {studentData.personalDetails?.lastName}</p>
                <p><span className="font-medium">Email:</span> {studentData.personalDetails?.email}</p>
                <p><span className="font-medium">Mobile:</span> {studentData.personalDetails?.mobile}</p>
                <p><span className="font-medium">Date of Birth:</span> {studentData.personalDetails?.dateOfBirth}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-nca-gray-700 mb-2">Course Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Course:</span> {studentData.courseDetails?.courseName}</p>
                <p><span className="font-medium">Delivery Mode:</span> {studentData.courseDetails?.deliveryMode}</p>
                <p><span className="font-medium">Start Date:</span> {studentData.courseDetails?.startDate}</p>
                <p><span className="font-medium">Enrollment Date:</span> {new Date(studentData.completedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              <strong>✅ Status:</strong> Your enrollment has been successfully submitted and is being processed by our admissions team.
            </p>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card mb-8"
        >
          <h2 className="text-2xl font-bold text-nca-gray-900 mb-6">🚀 What Happens Next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nextSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-nca-primary bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-nca-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nca-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-nca-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Important Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card mb-8"
        >
          <h2 className="text-2xl font-bold text-nca-gray-900 mb-4">⚠️ Important Reminders</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <ul className="text-sm text-yellow-800 space-y-2">
              <li>• <strong>Placement Prerequisites:</strong> Submit your placement prerequisite documents within 2-3 weeks of enrollment</li>
              <li>• <strong>Placement Logbook:</strong> Submit your placement logbook within one month after placement completion</li>
              <li>• <strong>Class Requirements:</strong> Keep your camera ON during online sessions and maintain a professional environment</li>
              <li>• <strong>Contact Updates:</strong> Inform us within one week of any changes to your visa conditions or address</li>
            </ul>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-nca-primary text-white rounded-lg hover:bg-nca-primary-dark transition-colors"
            >
              📄 Print Summary
            </button>
            
            <a
              href="mailto:support@nca.edu.au"
              className="px-6 py-3 border border-nca-primary text-nca-primary rounded-lg hover:bg-nca-primary hover:text-white transition-colors"
            >
              📧 Contact Support
            </a>
            
            <Link
              href="/"
              className="px-6 py-3 bg-nca-gray-100 text-nca-gray-700 rounded-lg hover:bg-nca-gray-200 transition-colors"
            >
              🏠 Return to Homepage
            </Link>
          </div>
          
          <p className="text-sm text-nca-gray-500 mt-4">
            Reference ID: {studentData.studentId || 'ENR-' + Date.now()}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EnrollmentCompletePage;