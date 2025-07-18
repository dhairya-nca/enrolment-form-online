import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpenIcon, ClockIcon, ShieldCheckIcon, GraduationCapIcon } from 'lucide-react';
import NCALogo from '../components/NCALogo';

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
    <div className="min-h-screen nca-gradient">
      {/* Header */}
      <header className="nca-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <NCALogo size="large" showText={true} />
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
            <h2 className="text-4xl md:text-5xl font-bold text-nca-gray-900 mb-6">
              Start Your Healthcare Career Journey
            </h2>
            <p className="text-xl text-nca-gray-700 mb-8 max-w-3xl mx-auto">
              Complete your enrollment online in just 30 minutes. Our streamlined process gets you 
              started on your path to a rewarding career in healthcare and community services.
            </p>
            <Link 
              href="/enrollment/start"
              className="btn-primary text-lg px-8 py-4 inline-block"
            >
              Start Your Enrollment
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-nca-gray-900 mb-4">How It Works</h3>
            <p className="text-nca-gray-600 text-lg max-w-2xl mx-auto">
              Our simple 4-step process makes enrollment quick and easy. 
              Complete everything online at your own pace.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card text-center hover:shadow-xl transition-shadow"
                >
                  <div className="w-16 h-16 bg-nca-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-nca-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-nca-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-nca-gray-600 text-sm mb-3">{feature.description}</p>
                  <span className="inline-block bg-nca-accent text-white px-3 py-1 rounded-full text-xs font-medium">
                    {feature.duration}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 bg-nca-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-nca-gray-900 mb-4">Available Courses</h3>
            <p className="text-nca-gray-600 text-lg max-w-2xl mx-auto">
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
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-nca-primary"
              >
                <h4 className="text-lg font-semibold text-nca-gray-900 mb-2">{course}</h4>
                <p className="text-nca-gray-600 text-sm">Blended delivery mode combining online learning with practical placement</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-nca-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-nca-light mb-8 text-lg">
            Join thousands of students who have successfully completed their qualifications with National College Australia.
          </p>
          <Link 
            href="/enrollment/start"
            className="bg-white text-nca-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-nca-gray-100 transition-colors shadow-lg inline-block"
          >
            Begin Your Enrollment
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="nca-footer py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <NCALogo size="medium" showText={false} className="mx-auto" />
            </div>
            <p className="mb-2">&copy; 2025 National College Australia. All rights reserved.</p>
            <p className="text-nca-gray-400 text-sm">RTO Provider No. #91000</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;