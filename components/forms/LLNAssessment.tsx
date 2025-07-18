// components/forms/LLNAssessment.tsx - Complete LLN Assessment
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from 'lucide-react';

// All 22 LLN Questions
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
    question: 'Circle the larger number: 42 or 24',
    type: 'number' as const,
    answer: '42',
    required: true
  },
  {
    section: 'Numeracy',
    id: 'q16',
    question: 'What is half of 20?',
    type: 'number' as const,
    answer: '10',
    required: true
  },
  
  // Digital Literacy (6 questions)
  {
    section: 'Digital Literacy',
    id: 'q17',
    question: 'What is the purpose of a password?',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Digital Literacy',
    id: 'q18',
    question: 'Which one is a web browser?',
    type: 'radio' as const,
    options: ['Microsoft Word', 'Google Chrome', 'Excel', 'Zoom'],
    answer: 'Google Chrome',
    required: true
  },
  {
    section: 'Digital Literacy',
    id: 'q19',
    question: 'True or False: You can attach a file to an email.',
    type: 'radio' as const,
    options: ['True', 'False'],
    answer: 'True',
    required: true
  },
  {
    section: 'Digital Literacy',
    id: 'q20',
    question: 'You need to join an online class. What should you do?',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Digital Literacy',
    id: 'q21',
    question: 'List one thing you can do on a computer.',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Digital Literacy',
    id: 'q22',
    question: 'Which of these is the safest way to create a password?',
    type: 'radio' as const,
    options: [
      'A. Use your pet\'s name and birthday',
      'B. Use \'password123\'',
      'C. Use a mix of letters, numbers, and symbols',
      'D. Use only your date of birth'
    ],
    answer: 'C. Use a mix of letters, numbers, and symbols',
    required: true
  }
];

interface LLNAssessmentProps {
  onComplete: (data: any) => void;
}

const LLNAssessment: React.FC<LLNAssessmentProps> = ({ onComplete }) => {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  });
  const [showPersonalInfo, setShowPersonalInfo] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nca_lln_progress');
    if (saved) {
      const data = JSON.parse(saved);
      setResponses(data.responses || {});
      setPersonalInfo(data.personalInfo || personalInfo);
      setCurrentQuestion(data.currentQuestion || 0);
      setShowPersonalInfo(data.showPersonalInfo !== false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nca_lln_progress', JSON.stringify({
      responses,
      personalInfo,
      currentQuestion,
      showPersonalInfo
    }));
  }, [responses, personalInfo, currentQuestion, showPersonalInfo]);

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!personalInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!personalInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!personalInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) newErrors.email = 'Invalid email format';
    if (!personalInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!personalInfo.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePersonalInfoSubmit = () => {
    if (validatePersonalInfo()) {
      setShowPersonalInfo(false);
      setCurrentQuestion(0);
    }
  };

  const handleResponseChange = (questionId: string, value: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    const question = LLN_QUESTIONS[currentQuestion];
    const response = responses[question.id];
    
    if (question.required && (!response || (Array.isArray(response) && response.length === 0))) {
      alert('Please answer this question before continuing.');
      return;
    }
    
    if (currentQuestion < LLN_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      setShowPersonalInfo(true);
    }
  };

  const calculateScore = () => {
    const sections = {
      Learning: { correct: 0, total: 2 },
      Reading: { correct: 0, total: 4 },
      Writing: { correct: 0, total: 5 },
      Numeracy: { correct: 0, total: 5 },
      'Digital Literacy': { correct: 0, total: 6 }
    };

    LLN_QUESTIONS.forEach(question => {
      const response = responses[question.id];
      if (response) {
        if (question.answer) {
          // Objective question - check if answer is correct
          const isCorrect = question.type === 'checkbox' 
            ? Array.isArray(response) && response.length > 0
            : String(response).toLowerCase().trim() === String(question.answer).toLowerCase().trim();
          
          if (isCorrect) {
            sections[question.section as keyof typeof sections].correct++;
          }
        } else {
          // Subjective question - give credit if answered
          sections[question.section as keyof typeof sections].correct++;
        }
      }
    });

    const scores = Object.fromEntries(
      Object.entries(sections).map(([section, { correct, total }]) => [
        section.toLowerCase().replace(' ', ''),
        Math.round((correct / total) * 100)
      ])
    );

    const overallScore = Math.round(
      Object.values(sections).reduce((sum, { correct, total }) => sum + (correct / total), 0) / 
      Object.keys(sections).length * 100
    );

    let rating = 'Requires Intensive Support';
    if (overallScore >= 80) rating = 'Excellent';
    else if (overallScore >= 65) rating = 'Good';
    else if (overallScore >= 50) rating = 'Satisfactory';
    else if (overallScore >= 35) rating = 'Needs Support';

    const eligible = overallScore >= 35 && !Object.values(scores).some(score => score < 40);

    return { scores, overallScore, rating, eligible };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { scores, overallScore, rating, eligible } = calculateScore();
    
    const submissionData = {
      studentId: `STU-${Date.now()}`,
      personalInfo,
      responses,
      scores: {
        learning: scores.learning,
        reading: scores.reading,
        writing: scores.writing,
        numeracy: scores.numeracy,
        digitalLiteracy: scores.digitalliteracy
      },
      overallScore,
      rating,
      eligible,
      completedAt: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/submit-lln', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        localStorage.removeItem('nca_lln_progress');
        localStorage.setItem('nca_lln_result', JSON.stringify(submissionData));
        localStorage.setItem('nca_student_data', JSON.stringify({
          studentId: submissionData.studentId,
          personalInfo: submissionData.personalInfo,
          llnResults: {
            scores: submissionData.scores,
            overallScore: submissionData.overallScore,
            rating: submissionData.rating,
            eligible: submissionData.eligible
          }
        }));
        onComplete(submissionData);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting LLN:', error);
      alert('There was an error submitting your assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPersonalInfoForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
        <p className="text-gray-600">Please provide your details to begin the LLN assessment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={personalInfo.firstName}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your first name"
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={personalInfo.lastName}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your last name"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your phone number"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            value={personalInfo.dateOfBirth}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handlePersonalInfoSubmit}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Start Assessment
        </button>
      </div>
    </motion.div>
  );

  const renderQuestion = () => {
    const question = LLN_QUESTIONS[currentQuestion];
    const response = responses[question.id];

    return (
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">{question.section}</div>
          <div className="text-sm text-blue-600 mb-4">
            Question {currentQuestion + 1} of {LLN_QUESTIONS.length}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{question.question}</h3>
        </div>

        <div className="max-w-2xl mx-auto">
          {question.type === 'radio' && (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={response === option}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'checkbox' && (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(response) && response.includes(option)}
                    onChange={(e) => {
                      const currentResponse = Array.isArray(response) ? response : [];
                      if (e.target.checked) {
                        handleResponseChange(question.id, [...currentResponse, option]);
                      } else {
                        handleResponseChange(question.id, currentResponse.filter(item => item !== option));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={response as string || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              rows={4}
              placeholder="Type your answer here..."
            />
          )}

          {question.type === 'number' && (
            <input
              type="number"
              value={response as string || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Enter your answer"
            />
          )}
        </div>
      </motion.div>
    );
  };

  if (isSubmitting) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Assessment</h3>
        <p className="text-gray-600">Please wait while we calculate your results...</p>
      </div>
    );
  }

  if (showPersonalInfo) {
    return renderPersonalInfoForm();
  }

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / LLN_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {renderQuestion()}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-sm text-gray-500">
          {currentQuestion + 1} / {LLN_QUESTIONS.length}
        </span>

        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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