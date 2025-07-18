import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { COURSES, STATES } from '../../utils/constants';
import Header from '../../components/Header';
import StepProgress from '../../components/StepProgress';

// FIXED SCHEMA - The main issue was radio buttons sending strings but schema expecting booleans
const personalDetailsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  gender: z.string().min(1, 'Gender is required'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  email: z.string().email('Invalid email address'),
  houseNumber: z.string().min(1, 'House number is required'),
  streetName: z.string().min(1, 'Street name is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  state: z.string().min(1, 'State is required'),
  postalAddress: z.string().optional(),
  courseName: z.string().min(1, 'Course selection is required'),
  deliveryMode: z.string().default('Blended'),
  startDate: z.string().min(1, 'Start date is required'),
  emergencyContact: z.string().min(1, 'Emergency contact is required'),
  countryOfBirth: z.string().min(1, 'Country of birth is required'),
  countryOfCitizenship: z.string().min(1, 'Country of citizenship is required'),
  mainLanguage: z.string().min(1, 'Main language is required'),
  englishProficiency: z.string(),
  // FIXED: Changed to string and transform to boolean
  australianCitizen: z.string().transform(val => val === 'true'),
  aboriginalStatus: z.string(),
  employmentStatus: z.string(),
  // FIXED: Changed to string and transform to boolean
  secondarySchool: z.string().transform(val => val === 'true'),
  schoolLevel: z.string(),
  qualifications: z.string(),
  // FIXED: Changed to string and transform to boolean
  disability: z.string().transform(val => val === 'true'),
  courseReason: z.string(),
  usi: z.string().optional()
});

type PersonalDetailsForm = z.infer<typeof personalDetailsSchema>;

const PersonalDetailsPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<PersonalDetailsForm>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      deliveryMode: 'Blended',
      englishProficiency: 'Very well',
      australianCitizen: true, // FIXED: String instead of boolean
      aboriginalStatus: 'No',
      employmentStatus: 'Full-time',
      secondarySchool: false, // FIXED: String instead of boolean
      schoolLevel: 'Year 12',
      qualifications: 'None',
      disability: false, // FIXED: String instead of boolean
      courseReason: 'To get a job'
    }
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
        setValue('firstName', data.personalInfo.firstName);
        setValue('lastName', data.personalInfo.lastName);
        setValue('email', data.personalInfo.email);
        setValue('mobile', data.personalInfo.phone);
        setValue('dateOfBirth', data.personalInfo.dateOfBirth);
      }
    } else {
      // Redirect to start if no LLN data
      router.push('/enrollment/start');
    }
  }, [router, setValue]);

  const onSubmit = async (data: PersonalDetailsForm) => {
    console.log('🚀 Form submission started');
    console.log('📝 Form data:', data);
    
    setIsSubmitting(true);
    
    try {
      // Combine with existing student data
      const updatedStudentData = {
        ...studentData,
        personalDetails: {
          title: data.title,
          gender: data.gender,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          mobile: data.mobile,
          email: data.email,
          address: {
            houseNumber: data.houseNumber,
            streetName: data.streetName,
            suburb: data.suburb,
            postcode: data.postcode,
            state: data.state,
            postalAddress: data.postalAddress
          }
        },
        courseDetails: {
          courseName: data.courseName,
          deliveryMode: data.deliveryMode,
          startDate: data.startDate
        },
        background: {
          emergencyContact: data.emergencyContact,
          countryOfBirth: data.countryOfBirth,
          countryOfCitizenship: data.countryOfCitizenship,
          mainLanguage: data.mainLanguage,
          englishProficiency: data.englishProficiency,
          australianCitizen: data.australianCitizen,
          aboriginalStatus: data.aboriginalStatus,
          employmentStatus: data.employmentStatus,
          secondarySchool: data.secondarySchool,
          schoolLevel: data.schoolLevel,
          qualifications: data.qualifications,
          disability: data.disability,
          courseReason: data.courseReason
        },
        compliance: {
          usi: data.usi
        },
        status: 'personal-details-complete'
      };

      console.log('💾 Saving to localStorage:', updatedStudentData);
      localStorage.setItem('nca_student_data', JSON.stringify(updatedStudentData));
      
      console.log('🧭 Navigating to declaration page...');
      router.push('/enrollment/declaration');

    } catch (error) {
      console.error('❌ Error in form submission:', error);
      alert('There was an error saving your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentData) {
    return (
      <div className="min-h-screen nca-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nca-primary mx-auto mb-4"></div>
          <p className="text-nca-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen nca-gradient">
      {/* Header */}
      <Header 
        title="Personal Details" 
        showProgress={true}
        currentStep={2}
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
            <h2 className="text-3xl font-bold text-nca-gray-900 mb-2">Personal Details</h2>
            <p className="text-nca-gray-600">
              Please provide your complete information for enrollment
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-semibold text-nca-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Title *</label>
                  <select 
                    {...register('title')}
                    className="form-field"
                  >
                    <option value="">Select title</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Miss">Miss</option>
                    <option value="Dr">Dr</option>
                  </select>
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Gender *</label>
                  <select 
                    {...register('gender')}
                    className="form-field"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    {...register('firstName')}
                    className="form-field"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Middle Name</label>
                  <input
                    type="text"
                    {...register('middleName')}
                    className="form-field"
                    placeholder="Enter middle name (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    {...register('lastName')}
                    className="form-field"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    {...register('dateOfBirth')}
                    className="form-field"
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Mobile *</label>
                  <input
                    type="tel"
                    {...register('mobile')}
                    className="form-field"
                    placeholder="Enter mobile number"
                  />
                  {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="form-field"
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-xl font-semibold text-nca-gray-900 mb-4">Current Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">House Number *</label>
                  <input
                    type="text"
                    {...register('houseNumber')}
                    className="form-field"
                    placeholder="Enter house number"
                  />
                  {errors.houseNumber && <p className="text-red-500 text-sm mt-1">{errors.houseNumber.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Street Name *</label>
                  <input
                    type="text"
                    {...register('streetName')}
                    className="form-field"
                    placeholder="Enter street name"
                  />
                  {errors.streetName && <p className="text-red-500 text-sm mt-1">{errors.streetName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Suburb *</label>
                  <input
                    type="text"
                    {...register('suburb')}
                    className="form-field"
                    placeholder="Enter suburb"
                  />
                  {errors.suburb && <p className="text-red-500 text-sm mt-1">{errors.suburb.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Postcode *</label>
                  <input
                    type="text"
                    {...register('postcode')}
                    className="form-field"
                    placeholder="Enter postcode"
                  />
                  {errors.postcode && <p className="text-red-500 text-sm mt-1">{errors.postcode.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">State *</label>
                  <select 
                    {...register('state')}
                    className="form-field"
                  >
                    <option value="">Select state</option>
                    {STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Postal Address (if different)</label>
                  <input
                    type="text"
                    {...register('postalAddress')}
                    className="form-field"
                    placeholder="Enter postal address if different from current address"
                  />
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div>
              <h3 className="text-xl font-semibold text-nca-gray-900 mb-4">Course Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Course Name *</label>
                  <select 
                    {...register('courseName')}
                    className="form-field"
                  >
                    <option value="">Select course</option>
                    {COURSES.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                  {errors.courseName && <p className="text-red-500 text-sm mt-1">{errors.courseName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Delivery Mode</label>
                  <input
                    type="text"
                    {...register('deliveryMode')}
                    className="form-field bg-nca-gray-100"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Preferred Start Date *</label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="form-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Emergency Contact *</label>
                  <input
                    type="text"
                    {...register('emergencyContact')}
                    className="form-field"
                    placeholder="Name, relationship, and contact number"
                  />
                  {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.message}</p>}
                </div>
              </div>
            </div>

            {/* Background Information */}
            <div>
              <h3 className="text-xl font-semibold text-nca-gray-900 mb-4">Background Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Country of Birth *</label>
                  <input
                    type="text"
                    {...register('countryOfBirth')}
                    className="form-field"
                    placeholder="e.g. Australia"
                  />
                  {errors.countryOfBirth && <p className="text-red-500 text-sm mt-1">{errors.countryOfBirth.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Country of Citizenship *</label>
                  <input
                    type="text"
                    {...register('countryOfCitizenship')}
                    className="form-field"
                    placeholder="e.g. Australia"
                  />
                  {errors.countryOfCitizenship && <p className="text-red-500 text-sm mt-1">{errors.countryOfCitizenship.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Main Language Spoken at Home *</label>
                  <input
                    type="text"
                    {...register('mainLanguage')}
                    className="form-field"
                    placeholder="e.g. English, Hindi, Mandarin"
                  />
                  {errors.mainLanguage && <p className="text-red-500 text-sm mt-1">{errors.mainLanguage.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">If not English, how well do you speak English?</label>
                  <select 
                    {...register('englishProficiency')}
                    className="form-field"
                  >
                    <option value="Very well">Very well</option>
                    <option value="Well">Well</option>
                    <option value="Not well">Not well</option>
                    <option value="I Don't Speak English at all">I Don't Speak English at all</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Are you an Australian Citizen or PR?</label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('australianCitizen')}
                        value="true"
                        className="h-4 w-4 text-nca-primary focus:ring-nca-primary"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('australianCitizen')}
                        value="false"
                        className="h-4 w-4 text-nca-primary focus:ring-nca-primary"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Are you of Aboriginal or Torres Strait Islander origin?</label>
                  <select 
                    {...register('aboriginalStatus')}
                    className="form-field"
                  >
                    <option value="No">No</option>
                    <option value="Yes, Aboriginal">Yes, Aboriginal</option>
                    <option value="Yes, Torres Strait Islander">Yes, Torres Strait Islander</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Employment Status</label>
                  <select 
                    {...register('employmentStatus')}
                    className="form-field"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Student">Student</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Are you still attending Secondary School?</label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('secondarySchool')}
                        value="true"
                        className="h-4 w-4 text-nca-primary focus:ring-nca-primary"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('secondarySchool')}
                        value="false"
                        className="h-4 w-4 text-nca-primary focus:ring-nca-primary"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">What is your highest Completed School Level?</label>
                  <select 
                    {...register('schoolLevel')}
                    className="form-field"
                  >
                    <option value="Year 12">Year 12</option>
                    <option value="Year 11">Year 11</option>
                    <option value="Year 10">Year 10</option>
                    <option value="Year 9 or below">Year 9 or below</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">What are your highest qualifications?</label>
                  <select 
                    {...register('qualifications')}
                    className="form-field"
                  >
                    <option value="None">None</option>
                    <option value="Certificate I">Certificate I</option>
                    <option value="Certificate II">Certificate II</option>
                    <option value="Certificate III">Certificate III</option>
                    <option value="Certificate IV">Certificate IV</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Advanced Diploma">Advanced Diploma</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Do you live with any physical/mental disability that may affect participation?</label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('disability')}
                        value="false"
                        className="h-4 w-4 text-nca-primary focus:ring-nca-primary"
                      />
                      <span className="ml-2">No</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('disability')}
                        value="true"
                        className="h-4 w-4 text-nca-primary focus:ring-nca-primary"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nca-gray-700 mb-2">Main reason for undertaking course</label>
                  <select 
                    {...register('courseReason')}
                    className="form-field"
                  >
                    <option value="To get a job">To get a job</option>
                    <option value="To try a different career">To try a different career</option>
                    <option value="To get a better job">To get a better job</option>
                    <option value="To start my own business">To start my own business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* USI Section */}
            <div className="bg-nca-light rounded-lg p-6">
              <h3 className="text-lg font-semibold text-nca-primary mb-3">Unique Student Identifier (USI)</h3>
              <p className="text-nca-gray-600 text-sm mb-4">
                From 1 January 2015, National College Australia can be prevented from issuing you with a 
                nationally recognised VET qualification or statement of attainment when you complete your 
                course if you do not have a Unique Student Identifier (USI). If you haven't obtained a USI, 
                you can apply for it directly at{' '}
                <a href="https://portal.usi.gov.au/student" target="_blank" rel="noopener noreferrer" 
                   className="text-nca-primary hover:underline">
                  https://portal.usi.gov.au/student
                </a>
              </p>
              <div>
                <label className="block text-sm font-medium text-nca-gray-700 mb-2">USI (if you have one)</label>
                <input
                  type="text"
                  {...register('usi')}
                  className="form-field"
                  placeholder="Enter your USI if you have one"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-nca-gray-300 text-nca-gray-700 rounded-lg hover:bg-nca-gray-50 transition-colors"
              >
                Back to LLN Results
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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