import React from 'react';
import Link from 'next/link';
import NCALogo from './NCALogo';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showProgress = false, 
  currentStep = 1, 
  totalSteps = 4 
}) => {
  return (
    <header className="nca-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center">
            <NCALogo size="medium" showText={false} />
            <div className="ml-4 hidden sm:block">
              <h1 className="text-xl font-bold text-nca-primary">National College Australia</h1>
              <p className="text-xs text-nca-gray-600">
                {subtitle || 'RTO Provider No. #91000'}
              </p>
            </div>
          </Link>

          {/* Progress/Step Indicator */}
          {showProgress && (
            <div className="text-right">
              <p className="text-sm text-nca-gray-600">
                Step {currentStep} of {totalSteps}
              </p>
              {title && (
                <p className="text-xs text-nca-gray-500">{title}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;