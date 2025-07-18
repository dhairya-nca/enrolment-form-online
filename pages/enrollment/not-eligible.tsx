import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircleIcon, PhoneIcon, MailIcon } from 'lucide-react';
import Header from '../../components/Header';

const NotEligiblePage = () => {
  return (
    <div className="min-h-screen nca-gradient">
      {/* Header */}
      <Header 
        title="Assessment Results" 
        subtitle="LLN Assessment Complete"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card text-center"
        >
          <div className="mb-6">
            <AlertCircleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-nca-gray-900 mb-2">Additional Support Required</h2>
            <p className="text-nca-gray-600">
              Based on your LLN assessment results, you may benefit from additional support 
              before beginning your chosen course.
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-nca-gray-900 mb-3">What This Means</h3>
            <ul className="text-left text-nca-gray-700 space-y-2">
              <li>• Your assessment indicates you may need additional literacy or numeracy support</li>
              <li>• This doesn't mean you can't study with us - we're here to help you succeed</li>
              <li>• We offer foundation programs to build your skills before starting your main course</li>
              <li>• Our student support team will work with you to create a personalized learning plan</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-nca-light rounded-lg p-6">
              <h4 className="font-semibold text-nca-primary mb-3">Foundation Programs</h4>
              <p className="text-nca-gray-600 text-sm">
                We offer preparatory courses in reading, writing, and basic mathematics 
                to help you build confidence and skills.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-semibold text-nca-primary mb-3">Individual Support</h4>
              <p className="text-nca-gray-600 text-sm">
                Our experienced support staff provide one-on-one assistance 
                throughout your learning journey.
              </p>
            </div>
          </div>

          <div className="bg-nca-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-nca-gray-900 mb-4">Next Steps</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+61234567890"
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <PhoneIcon className="w-4 h-4" />
                <span>Call Us: +61 2 3456 7890</span>
              </a>
              <a 
                href="mailto:support@nca.edu.au"
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <MailIcon className="w-4 h-4" />
                <span>Email Support</span>
              </a>
            </div>
          </div>

          <div className="text-center">
            <p className="text-nca-gray-600 mb-4">
              Don't worry - this is just the beginning of your journey with us. 
              Our team is ready to help you achieve your goals.
            </p>
            <Link 
              href="/"
              className="text-nca-primary hover:underline font-medium"
            >
              Return to Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotEligiblePage;