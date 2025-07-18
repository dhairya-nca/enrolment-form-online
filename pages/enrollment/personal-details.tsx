import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';

const COURSES = [
  'CHC33021 Certificate III in Individual Support',
  'CHC43015 Certificate IV in Ageing Support',
  'CHC43121 Certificate IV in Disability',
  'HLT33115 Certificate III in Health Services Assistance'
];

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

const PersonalDetailsPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    gender: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    mobile: '',
    email: '',
    houseNumber: '',
    streetName: '',
    suburb: '',
    postcode: '',
    state: '',
    postalAddress: '',
    courseName: '',
    deliveryMode: 'Blended',
    startDate: '',
    emergencyContact: '',
    countryOfBirth: '',
    countryOfCitizenship: '',
    mainLanguage: '',
    englishProficiency: 'Very well',
    australianCitizen: 'Yes',
    aboriginalStatus: 'No',
    employmentStatus: 'Full-time',
    secondarySchool: 'No',
    schoolLevel: 'Year 12',
    qualifications: 'None',
    disability: 'No',
    courseReason: 'To get a job',
    usi: ''
  });

  const steps = [
    { id: 1, name: 'LLN Assessment', completed: true },
    { id: 2, name: 'Personal Details', current: true },
    { id: 3, name: 'Declarations' },
    { id: 4, name: 'Documents' }
  ];

  useEffect(() => {
    const savedData = localStorage.getItem('nca_student_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      setStudentData(data);
      
      // Pre-fill form with LLN data
      if (data.personalInfo) {
        setFormData(prev => ({
          ...prev,
          firstName: data.personalInfo.firstName,
          lastName: data.personalInfo.lastName,
          email: data.personalInfo.email,
          mobile: data.personalInfo.phone,
          dateOfBirth: data.personalInfo.dateOfBirth
        }));
      }
    } else {
      router.push('/enrollment/start');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedStudentData = {
        ...studentData,
        personalDetails: {
          title: formData.title,
          gender: formData.gender,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          mobile: formData.mobile,
          email: formData.email,
          address: {
            houseNumber: formData.houseNumber,
            streetName: formData.streetName,
            suburb: formData.suburb,
            postcode: formData.postcode,
            state: formData.state,
            postalAddress: formData.postalAddress
          }
        },
        courseDetails: {
          courseName: formData.courseName,
          deliveryMode: formData.deliveryMode,
          startDate: formData.startDate
        },
        background: {
          emergencyContact: formData.emergencyContact,
          countryOfBirth: formData.countryOfBirth,
          countryOfCitizenship: formData.countryOfCitizenship,
          mainLanguage: formData.mainLanguage,
          englishProficiency: formData.englishProficiency,
          australianCitizen: formData.australianCitizen === 'Yes',
          aboriginalStatus: formData.aboriginalStatus,
          employmentStatus: formData.employmentStatus,
          secondarySchool: formData.secondarySchool === 'Yes',
          schoolLevel: formData.schoolLevel,
          qualifications: formData.qualifications,
          disability: formData.disability === 'Yes',
          courseReason: formData.courseReason
        },
        compliance: {
          usi: formData.usi
        },
        status: 'personal-details-complete'
      };

      localStorage.setItem('nca_student_data', JSON.stringify(updatedStudentData));
      router.push('/enrollment/declaration');

    } catch (error) {
      console.error('Error saving personal details:', error);
      alert('There was an error saving your information. Please try again.');
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
                <p className="text-xs text-gray-600">Student Enrollment</p>
              </div>
            </Link>
            <div className="text-right">
              <p className="text-sm text-gray-600">Step 2 of 4</p>
              <p className="text-xs text-gray-500">Personal Details</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Details</h2>
            <p className="text-gray-600">
              Please provide your complete information for enrollment
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <select 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                  >
                    <option value="">Select title</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Miss">Miss</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                  <select 
                    value={formData.courseName}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                  >
                    <option value="">Select course</option>
                    {COURSES.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Continue to Declarations'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PersonalDetailsPage;