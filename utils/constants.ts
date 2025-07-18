export const COURSES = [
  'CHC33021 Certificate III in Individual Support',
  'CHC43015 Certificate IV in Ageing Support', 
  'CHC43121 Certificate IV in Disability',
  'HLT33115 Certificate III in Health Services Assistance'
] as const;

export const STATES = [
  'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'
] as const;

export const LLN_QUESTIONS = [
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

export const REQUIRED_DOCUMENTS = [
  {
    id: 'passportBio',
    name: 'Passport Bio Page',
    description: 'Clear photo of your passport information page',
    accept: '.pdf,.jpg,.jpeg,.png',
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  {
    id: 'visaCopy',
    name: 'Current VISA Copy',
    description: 'Copy of your current Australian visa',
    accept: '.pdf,.jpg,.jpeg,.png',
    maxSize: 5 * 1024 * 1024
  },
  {
    id: 'photoId',
    name: 'Photo ID',
    description: 'Driver\'s license or other government-issued photo ID',
    accept: '.pdf,.jpg,.jpeg,.png',
    maxSize: 5 * 1024 * 1024
  },
  {
    id: 'usiEmail',
    name: 'USI Creation Email',
    description: 'Email confirmation from creating your USI',
    accept: '.pdf,.jpg,.jpeg,.png',
    maxSize: 5 * 1024 * 1024
  },
  {
    id: 'recentPhoto',
    name: 'Recent Photo',
    description: 'Recent passport-style photograph',
    accept: '.jpg,.jpeg,.png',
    maxSize: 2 * 1024 * 1024 // 2MB for photos
  }
] as const;