// Demo data for the educational app

export const demoCourses = [
  {
    id: 1,
    title: "Introduction to Mathematics",
    description: "Basic mathematical concepts and operations",
    lessons: [
      { id: 1, title: "Numbers and Counting", completed: true, locked: false },
      { id: 2, title: "Basic Addition", completed: true, locked: false },
      { id: 3, title: "Basic Subtraction", completed: false, locked: false },
      { id: 4, title: "Multiplication Tables", completed: false, locked: true },
      { id: 5, title: "Division Basics", completed: false, locked: true },
    ],
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-18')
  },
  {
    id: 2,
    title: "Science Fundamentals",
    description: "Introduction to basic scientific concepts",
    lessons: [
      { id: 6, title: "What is Science?", completed: true, locked: false },
      { id: 7, title: "The Scientific Method", completed: false, locked: false },
      { id: 8, title: "Matter and Energy", completed: false, locked: true },
      { id: 9, title: "Plants and Animals", completed: false, locked: true },
    ],
    createdAt: new Date('2025-09-05'),
    updatedAt: new Date('2025-09-15')
  }
]

export const demoExercises = [
  {
    id: 1,
    title: "Basic Math Quiz",
    description: "Test your basic arithmetic skills",
    questions: [
      { 
        id: 1, 
        question: "What is 2 + 2?", 
        answer: "4", 
        type: "text",
        explanation: "2 + 2 equals 4. This is basic addition."
      },
      { 
        id: 2, 
        question: "What is 5 × 3?", 
        answer: "15", 
        type: "text",
        explanation: "5 × 3 equals 15. This is multiplication."
      },
      { 
        id: 3, 
        question: "What is 10 - 6?", 
        answer: "4", 
        type: "text",
        explanation: "10 - 6 equals 4. This is subtraction."
      },
      { 
        id: 4, 
        question: "What is 12 ÷ 3?", 
        answer: "4", 
        type: "text",
        explanation: "12 ÷ 3 equals 4. This is division."
      }
    ],
    maxScore: 20,
    timeLimit: 10, // minutes
    difficulty: "easy",
    subject: "Mathematics"
  },
  {
    id: 2,
    title: "Science Knowledge Check",
    description: "Test your understanding of basic science concepts",
    questions: [
      { 
        id: 5, 
        question: "What do plants need to make food?", 
        answer: "sunlight", 
        type: "text",
        explanation: "Plants need sunlight for photosynthesis to make their own food."
      },
      { 
        id: 6, 
        question: "How many legs does an insect have?", 
        answer: "6", 
        type: "text",
        explanation: "All insects have exactly 6 legs."
      },
      { 
        id: 7, 
        question: "What gas do we breathe in?", 
        answer: "oxygen", 
        type: "text",
        explanation: "We breathe in oxygen from the air."
      }
    ],
    maxScore: 20,
    timeLimit: 8,
    difficulty: "easy",
    subject: "Science"
  }
]

export const demoExams = [
  {
    id: 1,
    title: "Mathematics Midterm",
    date: "2025-09-25",
    time: "10:00",
    duration: 120,
    status: "upcoming",
    description: "Covering chapters 1-5: Numbers, Addition, Subtraction, Multiplication, and Division",
    subject: "Mathematics",
    totalQuestions: 25,
    maxScore: 100
  },
  {
    id: 2,
    title: "Science Quiz",
    date: "2025-09-20",
    time: "14:00",
    duration: 60,
    status: "past",
    score: 18,
    maxScore: 20,
    description: "Biology fundamentals and basic scientific concepts",
    subject: "Science",
    totalQuestions: 10,
    studentSubmissions: 24
  },
  {
    id: 3,
    title: "English Reading Comprehension",
    date: "2025-09-30",
    time: "09:00",
    duration: 90,
    status: "upcoming",
    description: "Reading passages and comprehension questions",
    subject: "English",
    totalQuestions: 15,
    maxScore: 30
  }
]

export const demoStudents = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@school.edu",
    avatar: "/avatars/alice.jpg",
    grade: "5th Grade",
    averageScore: 19.2,
    totalExercises: 45,
    completedExercises: 42,
    completionRate: 93,
    strongSubjects: ["Mathematics", "Science"],
    needsHelp: ["History"],
    lastActive: new Date('2025-09-18T10:30:00')
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob.smith@school.edu",
    avatar: "/avatars/bob.jpg",
    grade: "5th Grade",
    averageScore: 18.5,
    totalExercises: 45,
    completedExercises: 40,
    completionRate: 89,
    strongSubjects: ["English", "Science"],
    needsHelp: ["Mathematics"],
    lastActive: new Date('2025-09-18T09:15:00')
  },
  {
    id: 3,
    name: "Carol Davis",
    email: "carol.davis@school.edu",
    avatar: "/avatars/carol.jpg",
    grade: "5th Grade",
    averageScore: 17.8,
    totalExercises: 45,
    completedExercises: 38,
    completionRate: 84,
    strongSubjects: ["History", "English"],
    needsHelp: ["Science", "Mathematics"],
    lastActive: new Date('2025-09-17T16:45:00')
  }
]

export const demoAnalytics = {
  overview: {
    totalStudents: 245,
    activeStudents: 238,
    averageScore: 16.2,
    completionRate: 78,
    needsRevision: 42,
    totalCourses: 12,
    totalExercises: 48,
    totalExams: 8
  },
  performanceBySubject: {
    "Mathematics": { average: 17.5, trend: "up", studentsCount: 245 },
    "Science": { average: 15.8, trend: "down", studentsCount: 240 },
    "English": { average: 16.9, trend: "up", studentsCount: 242 },
    "History": { average: 14.2, trend: "stable", studentsCount: 238 }
  },
  weeklyProgress: [
    { week: "Week 1", averageScore: 15.2, completionRate: 72 },
    { week: "Week 2", averageScore: 15.8, completionRate: 75 },
    { week: "Week 3", averageScore: 16.1, completionRate: 77 },
    { week: "Week 4", averageScore: 16.2, completionRate: 78 }
  ],
  teacherRecommendations: [
    {
      type: "warning",
      title: "Science Performance Declining",
      description: "Students are struggling with recent science topics. Consider additional review sessions.",
      action: "Schedule Review Session",
      priority: "high",
      affectedStudents: 42
    },
    {
      type: "success",
      title: "Mathematics Improvement",
      description: "Great progress in mathematics! Students are responding well to new teaching methods.",
      action: "Continue Current Approach",
      priority: "low",
      affectedStudents: 0
    },
    {
      type: "info",
      title: "History Engagement Low",
      description: "Consider adding more interactive content to history lessons.",
      action: "Add Interactive Elements",
      priority: "medium",
      affectedStudents: 28
    }
  ]
}

export const demoChatMessages = [
  {
    id: 1,
    text: "Hello! I'm your AI assistant. I'm here to help you with any questions you have about your studies. What would you like to know?",
    sender: 'ai',
    timestamp: new Date('2025-09-18T08:00:00')
  }
]

// Helper functions to work with demo data
export const getDemoDataForUser = (userType = 'student') => {
  if (userType === 'teacher') {
    return {
      courses: demoCourses,
      exercises: demoExercises,
      exams: demoExams,
      students: demoStudents,
      analytics: demoAnalytics
    }
  } else {
    // Student view - limited data
    return {
      courses: demoCourses.map(course => ({
        ...course,
        // Students only see their own progress
        lessons: course.lessons.map(lesson => ({
          ...lesson,
          // Some lessons might be locked based on progress
        }))
      })),
      exercises: demoExercises,
      exams: demoExams.filter(exam => exam.status !== 'draft'),
      chatMessages: demoChatMessages
    }
  }
}

export const getRandomScore = () => Math.floor(Math.random() * 21) // 0-20
export const getRandomCompletionRate = () => Math.floor(Math.random() * 41) + 60 // 60-100%

export default {
  demoCourses,
  demoExercises,
  demoExams,
  demoStudents,
  demoAnalytics,
  demoChatMessages,
  getDemoDataForUser,
  getRandomScore,
  getRandomCompletionRate
}