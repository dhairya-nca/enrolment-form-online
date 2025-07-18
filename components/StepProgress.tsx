import React from 'react';

interface Step {
  id: number;
  name: string;
  completed?: boolean;
  current?: boolean;
}

interface StepProgressProps {
  steps: Step[];
  className?: string;
}

const StepProgress: React.FC<StepProgressProps> = ({ steps, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center relative">
            {/* Step Circle */}
            <div className="relative z-10">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  step.completed
                    ? 'nca-step-completed'
                    : step.current
                    ? 'nca-step-current'
                    : 'nca-step-pending'
                }`}
              >
                {step.completed ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span
                  className={`text-xs font-medium ${
                    step.current ? 'text-nca-primary' : 'text-nca-gray-500'
                  }`}
                >
                  {step.name}
                </span>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                  step.completed ? 'bg-nca-primary' : 'bg-nca-gray-300'
                }`}
                style={{ width: '100px' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepProgress;