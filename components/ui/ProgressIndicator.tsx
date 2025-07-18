import React from 'react';

interface Step {
  id: number;
  name: string;
  completed?: boolean;
  current?: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className="relative">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? (
                    <span>✓</span>
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                
                {/* Step name */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span
                    className={`
                      text-xs font-medium
                      ${isCurrent ? 'text-blue-600' : 'text-gray-500'}
                    `}
                  >
                    {step.name}
                  </span>
                </div>
              </div>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 transition-all duration-200
                    ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;