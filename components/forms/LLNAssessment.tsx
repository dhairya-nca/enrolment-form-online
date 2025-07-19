// components/forms/LLNAssessment.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

// Define proper TypeScript interfaces
interface BaseQuestion {
  section: string;
  id: string;
  question: string;
  required: boolean;
  hint?: string;
}

interface RadioQuestion extends BaseQuestion {
  type: 'radio';
  options: string[];
  answer?: string;
}

interface CheckboxQuestion extends BaseQuestion {
  type: 'checkbox';
  options: string[];
}

interface TextQuestion extends BaseQuestion {
  type: 'text';
  answer?: string;
}

interface NumberQuestion extends BaseQuestion {
  type: 'number';
  answer?: string;
}

interface EmailQuestion extends BaseQuestion {
  type: 'email';
}

type Question = RadioQuestion | CheckboxQuestion | TextQuestion | NumberQuestion | EmailQuestion;

// All LLN Questions organized by sections with proper typing
const LLN_SECTIONS: Record<string, Question[]> = {
  'Learning': [
    {
      section: 'Learning',
      id: 'q1',
      question: 'How do you prefer to learn new skills?',
      type: 'checkbox',
      options: ['Watching videos', 'Reading', 'Doing it yourself', 'Listening to others'],
      required: true
    },
    {
      section: 'Learning',
      id: 'q2', 
      question: 'What do you do if you don\'t understand something the first time?',
      type: 'text',
      required: true
    }
  ],
  'Reading': [
    {
      section: 'Reading',
      id: 'q3',
      question: 'What should you do before preparing food?',
      type: 'text',
      hint: 'Read: "Always wash your hands before preparing food."',
      answer: 'wash your hands',
      required: true
    },
    {
      section: 'Reading',
      id: 'q4',
      question: 'Which sign means \'No Smoking\'?',
      type: 'radio',
      options: ['🚬', '🚭', '🛑', '🔥'],
      answer: '🚭',
      required: true
    },
    {
      section: 'Reading',
      id: 'q5',
      question: 'If a label says "Keep away from children", what does it mean?',
      type: 'text',
      required: true
    },
    {
      section: 'Reading',
      id: 'q6',
      question: 'Find a word in this sentence that means \'required\' (\'It is mandatory to wear safety boots.\')',
      type: 'text',
      answer: 'mandatory',
      required: true
    }
  ],
  'Writing': [
    {
      section: 'Writing',
      id: 'q7',
      question: 'Write one sentence explaining why you want to do this course.',
      type: 'text',
      required: true
    },
    {
      section: 'Writing',
      id: 'q8',
      question: 'Fill in the form: Name:',
      type: 'text',
      required: true
    },
    {
      section: 'Writing',
      id: 'q9',
      question: 'Fill in the form: Date of Birth:',
      type: 'text',
      required: true
    },
    {
      section: 'Writing',
      id: 'q10',
      question: 'Fill in the form: Phone Number:',
      type: 'text',
      required: true
    },
    {
      section: 'Writing',
      id: 'q11',
      question: 'Write a short message to your trainer if you are going to be late.',
      type: 'text',
      required: true
    }
  ],
  'Numeracy': [
    {
      section: 'Numeracy',
      id: 'q12',
      question: 'What is 10 + 5?',
      type: 'number',
      answer: '15',
      required: true
    },
    {
      section: 'Numeracy',
      id: 'q13',
      question: 'A carton of milk costs $2. If you buy 3, how much do you spend?',
      type: 'number',
      answer: '6',
      required: true
    },
    {
      section: 'Numeracy',
      id: 'q14',
      question: 'You start work at 9:00 AM and finish at 3:00 PM. How many hours did you work?',
      type: 'number',
      answer: '6',
      required: true
    },
    {
      section: 'Numeracy',
      id: 'q15',
      question: 'Write the larger number: 42 or 24',
      type: 'number',
      answer: '42',
      required: true
    },
    {
      section: 'Numeracy',
      id: 'q16',
      question: 'What is half of 98?',
      type: 'number',
      answer: '49',
      required: true
    }
  ],
  'Digital Literacy': [
    {
      section: 'Digital Literacy',
      id: 'q17',
      question: 'What is the purpose of a password?',
      type: 'text',
      required: true
    },
    {
      section: 'Digital Literacy',
      id: 'q18',
      question: 'Which one is a web browser?',
      type: 'radio',
      options: ['Microsoft Word', 'Google Chrome', 'Excel', 'Zoom'],
      answer: 'Google Chrome',
      required: true
    },
    {
      section: 'Digital Literacy',
      id: 'q19',
      question: 'You can attach a file to an email.',
      type: 'radio',
      options: ['True', 'False'],
      answer: 'True',
      required: true
    },
    {
      section: 'Digital Literacy',
      id: 'q20',
      question: 'You need to join an online class. What should you do?',
      type: 'text',
      required: true
    },
    {
      section: 'Digital Literacy',
      id: 'q21',
      question: 'List one thing you can do on a computer.',
      type: 'text',
      required: true
    },
    {
      section: 'Digital Literacy',
      id: 'q22',
      question: 'Which of these is the safest way to create a password?',
      type: 'radio',
      options: [
        'Use your pet\'s name and birthday',
        'Use \'password123\'',
        'Use a mix of letters, numbers, and symbols',
        'Use only your date of birth'
      ],
      answer: 'Use a mix of letters, numbers, and symbols',
      required: true
    }
  ]
};

interface LLNAssessmentProps {
  onComplete: (responses: any) => void;
}

const LLNAssessment: React.FC<LLNAssessmentProps> = ({ onComplete }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sectionNames = Object.keys(LLN_SECTIONS);
  const currentSectionName = sectionNames[currentSection];
  const currentQuestions = LLN_SECTIONS[currentSectionName];
  const totalSections = sectionNames.length;

  const handleAnswerChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateCurrentSection = () => {
    const unansweredQuestions = currentQuestions.filter(q => 
      q.required && (!responses[q.id] || 
      (Array.isArray(responses[q.id]) && responses[q.id].length === 0) ||
      responses[q.id].toString().trim() === '')
    );

    if (unansweredQuestions.length > 0) {
      alert(`Please answer all required questions in the ${currentSectionName} section before proceeding.`);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentSection()) return;

    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;

    Object.values(LLN_SECTIONS).flat().forEach((question: Question) => {
      maxScore += 1;
      const response = responses[question.id];
      
      // Type-safe answer checking
      if ('answer' in question && question.answer) {
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
    
    try {
      const score = calculateScore();
      const eligible = score >= 60;
      
      let rating = 'Excellent';
      if (score < 40) rating = 'Needs Significant Support';
      else if (score < 60) rating = 'Needs Some Support';
      else if (score < 80) rating = 'Good';
  
      // Get student data from localStorage
      const registrationData = JSON.parse(localStorage.getItem('nca_student_registration') || '{}');
      
      const assessmentData = {
        studentId: registrationData.studentId,
        personalInfo: {
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          email: registrationData.email,
          dateOfBirth: registrationData.dateOfBirth,
          phone: registrationData.phone || ''
        },
        responses,
        scores: {
          learning: 0, // Calculate per section
          reading: 0,
          writing: 0, 
          numeracy: 0,
          digitalLiteracy: 0
        },
        overallScore: score,
        rating,
        eligible,
        completedAt: new Date().toISOString()
      };
  
      // Submit to API
      const response = await fetch('/api/submit-lln', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit LLN assessment');
      }
  
      const result = await response.json();
      console.log('LLN submitted successfully:', result);
  
      onComplete(assessmentData);
      
    } catch (error) {
      console.error('Error submitting LLN:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const response = responses[question.id] || '';

    return (
      <div key={question.id} className="bg-white rounded-lg p-6 shadow-sm border border-nca-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-nca-gray-900 mb-2">
            {question.question}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {question.hint && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm text-blue-800">{question.hint}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {question.type === 'radio' && 'options' in question && (
            <div className="space-y-2">
              {question.options.map((option: string, index: number) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-nca-gray-200 hover:bg-nca-light">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={response === option}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="h-4 w-4 text-nca-primary focus:ring-nca-primary border-nca-gray-300"
                  />
                  <span className="text-nca-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'checkbox' && 'options' in question && (
            <div className="space-y-2">
              {question.options.map((option: string, index: number) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-nca-gray-200 hover:bg-nca-light">
                  <input
                    type="checkbox"
                    checked={Array.isArray(response) ? response.includes(option) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(response) ? response : [];
                      if (e.target.checked) {
                        handleAnswerChange(question.id, [...currentValues, option]);
                      } else {
                        handleAnswerChange(question.id, currentValues.filter(v => v !== option));
                      }
                    }}
                    className="h-4 w-4 text-nca-primary focus:ring-nca-primary border-nca-gray-300 rounded"
                  />
                  <span className="text-nca-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {(['text', 'email', 'number'].includes(question.type)) && (
            <div>
              {question.type === 'text' ? (
                <textarea
                  value={response}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full px-3 py-2 border border-nca-gray-300 rounded-lg focus:ring-2 focus:ring-nca-primary focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Your answer"
                />
              ) : (
                <input
                  type={question.type === 'number' ? 'number' : 'text'}
                  value={response}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full px-3 py-2 border border-nca-gray-300 rounded-lg focus:ring-2 focus:ring-nca-primary focus:border-transparent"
                  placeholder="Your answer"
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 nca-gradient min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-nca-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-nca-gray-900 mb-2">Language, Literacy & Numeracy Assessment</h1>
        <p className="text-nca-gray-600">Complete this assessment to help us understand your learning needs.</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-nca-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-nca-gray-700">Section {currentSection + 1} of {totalSections}: {currentSectionName}</span>
          <span className="text-sm text-nca-gray-500">{Math.round(((currentSection + 1) / totalSections) * 100)}%</span>
        </div>
        <div className="w-full bg-nca-gray-200 rounded-full h-2">
          <div 
            className="bg-nca-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
          />
        </div>
      </div>

      {/* Section Indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2">
          {sectionNames.map((section, index) => (
            <div
              key={section}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentSection
                  ? 'bg-green-500 text-white'
                  : index === currentSection
                  ? 'bg-nca-primary text-white'
                  : 'bg-nca-gray-300 text-nca-gray-600'
              }`}
            >
              {index < currentSection ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-6">
        {currentQuestions.map(renderQuestion)}
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-nca-gray-200 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentSection === 0 
                ? 'bg-nca-gray-100 text-nca-gray-400 cursor-not-allowed' 
                : 'bg-nca-gray-600 text-white hover:bg-nca-gray-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 bg-nca-primary text-white rounded-lg font-medium hover:bg-nca-secondary transition-colors disabled:opacity-50"
          >
            <span>
              {currentSection === totalSections - 1 ? 'Submit' : 'Next'}
            </span>
            {currentSection === totalSections - 1 ? (
              isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CheckCircle className="w-4 h-4" />
              )
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LLNAssessment;