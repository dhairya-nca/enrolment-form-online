import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpenIcon, ClockIcon, ShieldCheckIcon, GraduationCapIcon } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: BookOpenIcon,
      title: 'LLN Assessment',
      description: 'Quick online assessment to determine your Language, Literacy, and Numeracy skills',
      duration: '15 minutes'
    },
    {
      icon: GraduationCapIcon,
      title: 'Course Enrollment',
      description: 'Complete your enrollment with our streamlined digital process',
      duration: '10 minutes'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Document Upload',
      description: 'Securely upload all required documents in one place',
      duration: '5 minutes'
    },
    {
      icon: ClockIcon,
      title: 'Instant Confirmation',
      description: 'Get immediate confirmation and your enrollment documents',
      duration: 'Immediate'
    }
  ];

  const courses = [
    'CHC33021 Certificate III in Individual Support',
    'CHC43015 Certificate IV in Ageing Support',
    'CHC43121 Certificate IV in Disability',
    'HLT33115 Certificate III in Health Services Assistance'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">NCA</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">National College Australia</h1>
                <p className="text-sm text-gray-600">RTO Provider No. #91000</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Start Your Healthcare Career Journey
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Complete your enrollment online in just 30 minutes. Our streamlined process gets you 
              started on your path to a rewarding career in healthcare and community services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/enrollment/start"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg inline-block"
              >
                Start Enrollment Now
              </Link>
              <a 
                href="#process"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors inline-block"
              >
                How It Works
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Simple 4-Step Process</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our online enrollment process is designed to be quick, secure, and user-friendly. 
              Complete everything from the comfort of your home.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 mb-3">{feature.description}</p>
                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {feature.duration}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Available Courses</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our range of nationally recognized qualifications in healthcare and community services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {courses.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{course}</h4>
                <p className="text-gray-600 text-sm">Blended delivery mode combining online learning with practical placement</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of students who have successfully completed their qualifications with National College Australia.
          </p>
          <Link 
            href="/enrollment/start"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg inline-block"
          >
            Begin Your Enrollment
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mb-2">&copy; 2025 National College Australia. All rights reserved.</p>
            <p className="text-gray-400 text-sm">RTO Provider No. #91000</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
