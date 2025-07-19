// utils/constants.ts
export const COURSES = [
  'CHC33021 Cert III Individual Support (Ageing)',
  'CHC33021 Cert III Individual Support (Disability)', 
  'CHC33021 Cert III Individual Support (Ageing & Disability)',
  'CHC43121 Certificate IV in Disability'
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
    question: 'If you need to give medication every 4 hours and start at 8:00 AM, what times will you give it during the day (until 8:00 PM)?',
    type: 'text' as const,
    required: true
  },
  {
    section: 'Numeracy',
    id: 'q16',
    question: 'A client drinks 250ml of water 6 times a day. How much water do they drink in total?',
    type: 'number' as const,
    answer: '1500',
    required: true
  }
] as const;