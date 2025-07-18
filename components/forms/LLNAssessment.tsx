import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from 'lucide-react';

// All 22 LLN Questions (keeping your existing questions structure)
const LLN_QUESTIONS = [
  // Learning (2 questions)
  {
    section: 'Learning',
    id: 'q1',
    question: 'How do you prefer to learn new skills?',
    type: 'checkbox' as const,
    options: ['Watching videos', 'Reading', 'Doing it yourself', 'Listening to others'],
    required: true
  },
  {
    section: 'Learning',
    id: 'q2', 
    question: 'What do you do if you don\'t understand something the first time?',
    type: 'text' as const,
    required: true
  },
  
  // Reading (4 questions)
  {
    section: 'Reading',
    id: 'q3',
    question: 'What should you do before preparing food? (Read: "Always wash your hands before preparing food.")',
    type: 'text' as const,
    answer: 'wash your hands',
    required: true
  },
  {
    section: 'Reading',
    id: 'q4',
    question: 'Which sign means "No Smoking"?',
    type: 'radio' as const,
    options: ['🚬', '🚭', '🛑', '🔥'],
    answer: '🚭',
    required: true
  },
  {
    section: 'Reading',
    id: 'q5',
    question: 'If a label says "Keep away from children", what does it mean?',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Reading',
    id: 'q6',
    question: 'Find a word in this sentence that means "required": "It is mandatory to wear safety boots."',
    type: 'text' as const,
    answer: 'mandatory',
    required: true
  },
  
  // Writing (5 questions)
  {
    section: 'Writing',
    id: 'q7',
    question: 'Write one sentence explaining why you want to do this course.',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Writing',
    id: 'q8',
    question: 'Fill in the form - Name:',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Writing',
    id: 'q9',
    question: 'Fill in the form - Date of Birth:',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Writing',
    id: 'q10',
    question: 'Fill in the form - Phone Number:',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Writing',
    id: 'q11',
    question: 'Write a short message to your trainer if you are going to be late.',
    type: 'text' as const,
    required: true
  },
  
  // Numeracy (5 questions)
  {
    section: 'Numeracy',
    id: 'q12',
    question: 'What is 10 + 5?',
    type: 'number' as const,
    answer: '15',
    required: true
  },
  {
    section: 'Numeracy',
    id: 'q13',
    question: 'A carton of milk costs $2. If you buy 3, how much do you spend?',
    type: 'number' as const,
    answer: '6',
    required: true
  },
  {
    section: 'Numeracy',
    id: 'q14',
    question: 'You start work at 9:00 AM and finish at 3:00 PM. How many hours did you work?',
    type: 'number' as const,
    answer: '6',
    required: true
  },
  {
    section: 'Numeracy',
    id: 'q15',
    question: 'If you take medication 3 times a day for 7 days, how many doses total?',
    type: 'number' as const,
    answer: '21',
    required: true
  },
  {
    section: 'Numeracy',
    id: 'q16',
    question: 'What is 25% of 200?',
    type: 'number' as const,
    answer: '50',
    required: true
  },
  
  // Oral Communication (3 questions)
  {
    section: 'Oral Communication',
    id: 'q17',
    question: 'How would you ask for help if you didn\'t understand instructions?',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Oral Communication',
    id: 'q18',
    question: 'Describe how you would introduce yourself to a new colleague.',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Oral Communication',
    id: 'q19',
    question: 'What would you say if you need to call in sick to work?',
    type: 'text' as const,
    required: true
  },
  
  // Personal Information (3 questions)
  {
    section: 'Personal Information',
    id: 'q20',
    question: 'First Name',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Personal Information',
    id: 'q21',
    question: 'Last Name',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Personal Information',
    id: 'q22',
    question: 'Email Address',
    type: 'email' as const,
    required: true
  }
];

interface LLNAssessmentProps {
  onComplete: (responses: any) => void;
}

const LLNAssessment: React.FC<LLNAssessmentProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQ = LLN_QUESTIONS[currentQuestion];

  const handleAnswerChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < LLN_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;

    LLN_QUESTIONS.forEach(question => {
      maxScore += 1;
      const response = responses[question.id];
      
      if (question.answer) {
        // Questions with specific answers
        if (typeof response === 'string' && typeof question.answer === 'string') {
          if (response.toLowerCase().includes(question.answer.toLowerCase())) {
            totalScore += 1;
          }
        } else if (response === question.answer) {
          totalScore += 1;
        }
      } else if (response && response.toString().trim() !== '') {
        // Questions without specific answers - mark as correct if answered
        totalScore += 1;
      }
    });

    return Math.round((totalScore / maxScore) * 100);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const score = calculateScore();
    const eligible = score >= 60; // 60% threshold for eligibility
    
    let rating = 'Excellent';
    if (score < 40) rating = 'Needs Significant Support';
    else if (score < 60) rating = 'Needs Some Support';
    else if (score < 80) rating = 'Good';

    const assessmentData = {
      responses: {
        ...responses,
        firstName: responses.q20 || '',
        lastName: responses.q21 || '',
        email: responses.q22 || '',
        phone: responses.phone || '',
        dateOfBirth: responses.dateOfBirth || ''
      },
      overallScore: score,
      rating,
      eligible,
      completedAt: new Date().toISOString()
    };

    onComplete(assessmentData);
  };

  const renderQuestion = () => {
    const response = responses[currentQ.id] || '';

    return (
      <div className="space-y-6">
        <div className="mb-6">
          <div className="text-sm text-nca-gray-600 mb-2">{currentQ.section}</div>
          <h3 className="text-xl font-semibold text-nca-gray-900">{currentQ.question}</h3>
        </div>

        <div className="space-y-4">
          {currentQ.type === 'radio' && currentQ.options && (
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={currentQ.id}
                    value={option}
                    checked={response === option}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="h-4 w-4 text-nca-primary focus:ring-nca-primary border-gray-300"
                  />
                  <span className="text-lg">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQ.type === 'checkbox' && currentQ.options && (
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Array.isArray(response) ? response.includes(option) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(response) ? response : [];
                      if (e.target.checked) {
                        handleAnswerChange(currentQ.id, [...currentValues, option]);
                      } else {
                        handleAnswerChange(currentQ.id, currentValues.filter(v => v !== option));
                      }
                    }}
                    className="h-4 w-4 text-nca-primary focus:ring-nca-primary border-gray-300 rounded"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {(['text', 'email', 'number'].includes(currentQ.type)) && (
            <textarea
              value={response}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nca-primary focus:border-transparent transition-colors resize-none"
              rows={currentQ.type === 'text' ? 3 : 1}
              placeholder="Enter your answer..."
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-nca-gray">
          <span>Question {currentQuestion + 1} of {LLN_QUESTIONS.length}</span>
          <span>{Math.round(((currentQuestion + 1) / LLN_QUESTIONS.length) * 100)}% Complete</span>
        </div>
        <div className="nca-progress-bar">
          <div 
            className="nca-progress-fill"
            style={{ width: `${((currentQuestion + 1) / LLN_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {renderQuestion()}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
            currentQuestion === 0 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'border border-gray-300 text-nca-gray hover:bg-gray-50'
          }`}
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-sm text-nca-gray">
          {currentQuestion + 1} / {LLN_QUESTIONS.length}
        </span>

        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-6 py-3 bg-nca-primary text-white rounded-lg hover:bg-nca-secondary transition-colors disabled:opacity-50"
        >
          <span>{currentQuestion === LLN_QUESTIONS.length - 1 ? 'Complete Assessment' : 'Next'}</span>
          {currentQuestion === LLN_QUESTIONS.length - 1 ? (
            <CheckCircleIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default LLNAssessment;