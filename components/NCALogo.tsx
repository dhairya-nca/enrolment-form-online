import React from 'react';

interface NCALogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showText?: boolean;
}

const NCALogo: React.FC<NCALogoProps> = ({ 
  size = 'medium', 
  className = '', 
  showText = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-8 w-auto';
      case 'large':
        return 'h-16 w-auto';
      default:
        return 'h-12 w-auto';
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* NCA Logo SVG */}
      <svg 
        className={getSizeClasses()} 
        viewBox="0 0 200 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="200" height="120" fill="white" rx="8"/>
        
        {/* Main NCA Letters */}
        <text 
          x="100" 
          y="50" 
          textAnchor="middle" 
          className="fill-nca-primary font-bold text-4xl" 
          style={{ fontFamily: 'serif' }}
        >
          NCA
        </text>
        
        {/* Horizontal line */}
        <line 
          x1="30" 
          y1="65" 
          x2="170" 
          y2="65" 
          stroke="#1A7B76" 
          strokeWidth="2"
        />
        
        {/* National College Australia text */}
        <text 
          x="100" 
          y="80" 
          textAnchor="middle" 
          className="fill-nca-primary font-medium text-xs tracking-wide" 
          style={{ fontFamily: 'sans-serif' }}
        >
          NATIONAL COLLEGE
        </text>
        
        <text 
          x="100" 
          y="95" 
          textAnchor="middle" 
          className="fill-nca-primary font-medium text-xs tracking-widest" 
          style={{ fontFamily: 'sans-serif' }}
        >
          A U S T R A L I A
        </text>
      </svg>
      
      {/* Optional text beside logo */}
      {showText && size !== 'small' && (
        <div className="flex flex-col">
          <span className="text-nca-primary font-bold text-lg leading-tight">
            National College Australia
          </span>
          <span className="text-nca-gray-600 text-xs">
            RTO Provider No. #91000
          </span>
        </div>
      )}
    </div>
  );
};

export default NCALogo;