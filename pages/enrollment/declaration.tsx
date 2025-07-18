import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';

const DECLARATION_POINTS = [
  "Students need to be aware about the Schedule of the classes and finish all the classes as per the given timetable in student portal.",
  "Students need to attend at least one class per week.",
  "Students who are not disciplined in the classes will not be allowed to continue the course.",
  "Students who want to discontinue the classes for a week or more need to contact our team and discuss about their situation.",
  "For the practical Classes: Manual Handling and First Aid, booking is essential. Once booked (with the consent of the students), if students miss any practical classes, they have to take those classes at their own expense.",
  "Students will be doing the Manual Handling and First aid class one/two week prior to their placement considering they already submitted their Pre-Requisite documents in first 2/3 weeks.",
  "Placements: Placement is an integral part of the course. Students will be placed in a queue for placement after the completion of their theory classes and submission of placement prerequisite documents.",
  "Students need to be fully available from Monday to Friday for their placement excluding public holidays and be willing to do any shifts provided by the facility.",
  "Students cannot step back once the placement is organised with their consent. If they do so then National College Australia won't be liable to provide the second opportunity for placement.",
  "If the student does not adhere to the guidelines given by us during their placement, their placement may get cancelled either by the Host organisation or by us.",
  "Students will be placed for work placement as per our placement criteria which depends on students' attitude, reliability, punctuality, location of residence, flexibility, communication skills, overall performance of how you do the course",
  "Students need to complete all the assignments and must attend all the modules and practical classes in order to get their placements.",
  "Students need to be ready for the travel time of at least 1 hour to their placement facility.",
  "Students are supposed to submit their Placement prerequisite documents with in 2/3 weeks of their Enrolment.",
  "Students need to submit their placement log book within one month time after their placement. Failing to submit the logbook will lead to cancellation of the enrolment.",
  "Classes are strictly supervised and students are expected to follow the rules: Turn the camera ON at all times, Completely attend the session, Be respectful and maintain healthy environment, STRICTLY No driving/travelling/working/eating/drinking or being in Public places.",
  "Students are required to inform us via email within one week if there are any changes to their visa conditions and/or address."
];

const DeclarationPage = () => {
  const router = useRouter();
  const [studentData, setStudentData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    readPolicy: false,
    readHandbook: false,
    agreesToDeclaration: false,
    signatureName: '',
    signatureDate: new Date().toISOString().split('T')[0]
  });

  const steps = [
    { id: 1, name: 'LLN Assessment', completed: true },
    { id: 2, name: 'Personal Details', completed: true },
    { id: 3, name: 'Declarations', current: true },
    { id: 4, name: 'Documents' }
  ];

  useEffect(() => {
    const savedData = localStorage.getItem('nca_student_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      setStudentData(data);
      
      // Pre-fill signature name from personal details
      if (data.personalDetails) {
        setFormData(prev => ({
          ...prev,
          signatureName: `${data.personalDetails.firstName} ${data.personalDetails.lastName}`
        }));
      }
    } else {
      router.push('/enrollment/start');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.readPolicy || !formData.readHandbook || !formData.agreesToDeclaration || !formData.signatureName) {
      alert('Please complete all required fields and acknowledgments.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedStudentData = {
        ...studentData,
        compliance: {
          ...studentData.compliance,
          declarationSignature: formData.signatureName,
          declarationDate: formData.signatureDate,
          readPolicy: formData.readPolicy,
          readHandbook: formData.readHandbook,
          agreesToDeclaration: formData.agreesToDeclaration
        },
        status: 'declaration-complete'
      };

      localStorage.setItem('nca_student_data', JSON.stringify(updatedStudentData));
      router.push('/enrollment/documents');

    } catch (error) {
      console.error('Error saving declaration:', error);
      alert('There was an error saving your declaration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">NCA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">National College Australia</h1>
                <p className="text-xs text-gray-600">Student Declarations</p>
              </div>
            </Link>
            <div className="text-right">
              <p className="text-sm text-gray-600">Step 3 of 4</p>
              <p className="text-xs text-gray-500">Legal Declarations</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    step.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : step.current 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {step.completed ? (
                      <span>✓</span>
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className={`text-xs font-medium ${step.current ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.name}
                    </span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Declaration</h2>
            <p className="text-gray-600">
              Please read and agree to the following terms and conditions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Document Links */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Reading</h3>
              <p className="text-gray-600 mb-4">
                Please download and read the following documents before proceeding:
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-sm">📄</span>
                  </div>
                  <div>
                    <a 
                      href="#" 
                      className="text-blue-600 hover:underline font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Document download would be implemented here');
                      }}
                    >
                      Student Policy Handbook
                    </a>
                    <p className="text-sm text-gray-500">Complete policies and procedures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  <div>
                    <a 
                      href="#" 
                      className="text-blue-600 hover:underline font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Document download would be implemented here');
                      }}
                    >
                      Student Code of Conduct
                    </a>
                    <p className="text-sm text-gray-500">Expected behavior and responsibilities</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.readPolicy}
                    onChange={(e) => setFormData(prev => ({ ...prev, readPolicy: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">
                    I have read and understood the Student Policy Handbook
                  </span>
                </label>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.readHandbook}
                    onChange={(e) => setFormData(prev => ({ ...prev, readHandbook: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">
                    I have read and understood the Student Code of Conduct
                  </span>
                </label>
              </div>
            </div>

            {/* Declaration Points */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Declaration</h3>
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <p className="text-gray-700 mb-4 font-medium">
                  I declare that I hereby understand and comply with the following information, and I take full 
                  responsibility for all of my actions related to the following information:
                </p>
                <ul className="space-y-3">
                  {DECLARATION_POINTS.map((point, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-blue-600 font-medium mt-1">•</span>
                      <span className="text-gray-700 text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreesToDeclaration}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreesToDeclaration: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">
                    I have read, understood, and agree to all the above declarations and conditions
                  </span>
                </label>
              </div>
            </div>

            {/* Signature Section */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Signature</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name as Signature *
                  </label>
                  <input
                    type="text"
                    value={formData.signatureName}
                    onChange={(e) => setFormData(prev => ({ ...prev, signatureName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Type your full legal name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.signatureDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, signatureDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                By typing your name above, you are providing a legally binding electronic signature.
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Personal Details
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !formData.readPolicy || !formData.readHandbook || !formData.agreesToDeclaration || !formData.signatureName}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Continue to Documents'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DeclarationPage;