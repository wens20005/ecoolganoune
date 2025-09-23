// Database Schema Definitions for Educational Platform
// Using Firestore collections and document structures

export const DatabaseSchema = {
  // Users Collection - stores student and teacher accounts
  users: {
    collectionName: 'users',
    structure: {
      uid: 'string', // Firebase Auth UID
      email: 'string',
      displayName: 'string',
      role: 'string', // 'student' | 'teacher' | 'admin'
      profilePicture: 'string', // URL to profile image
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      
      // Student-specific fields
      studentId: 'string', // Unique student identifier
      grade: 'string', // e.g., "5th Grade", "High School"
      enrolledCourses: 'array', // Array of course IDs
      
      // Teacher-specific fields
      teacherId: 'string', // Unique teacher identifier
      subject: 'string', // Primary subject taught
      managedCourses: 'array', // Array of course IDs managed
      
      // Preferences and settings
      preferences: {
        soundEnabled: 'boolean',
        notifications: 'boolean',
        theme: 'string', // 'light' | 'dark'
        language: 'string'
      },
      
      // Statistics
      stats: {
        totalUploads: 'number',
        totalScore: 'number',
        averageScore: 'number',
        streakDays: 'number',
        lastActiveDate: 'timestamp'
      }
    }
  },

  // Files Collection - metadata about all uploaded files
  files: {
    collectionName: 'files',
    structure: {
      fileId: 'string', // Unique file identifier
      originalName: 'string', // Original filename
      storageUrl: 'string', // Firebase Storage download URL
      storagePath: 'string', // Storage path for deletion
      
      // File metadata
      size: 'number', // File size in bytes
      type: 'string', // MIME type
      extension: 'string', // File extension
      category: 'string', // 'document' | 'image' | 'video' | 'audio'
      
      // Upload information
      uploadedBy: 'string', // User UID who uploaded
      uploadedAt: 'timestamp',
      courseId: 'string', // Associated course ID
      lessonId: 'string', // Associated lesson ID (optional)
      exerciseId: 'string', // Associated exercise ID (optional)
      
      // Processing status
      status: 'string', // 'uploading' | 'processing' | 'ready' | 'error'
      processingInfo: {
        virusScanResult: 'string', // 'clean' | 'infected' | 'scanning'
        conversionStatus: 'string', // 'none' | 'converting' | 'converted' | 'failed'
        convertedFiles: 'array', // Array of converted file URLs
        thumbnailUrl: 'string', // Generated thumbnail for images/videos
        textExtracted: 'string', // Extracted text from documents
        aiAnalysis: 'object' // AI-generated analysis of content
      },
      
      // Visibility and permissions
      isPublic: 'boolean',
      allowedUsers: 'array', // Array of user UIDs with access
      
      // Metadata for educational content
      tags: 'array', // Subject tags
      difficulty: 'string', // 'easy' | 'medium' | 'hard'
      estimatedTime: 'number', // Estimated time to complete in minutes
      description: 'string' // File description
    }
  },

  // Grades Collection - links files to scores and feedback
  grades: {
    collectionName: 'grades',
    structure: {
      gradeId: 'string', // Unique grade identifier
      studentId: 'string', // Student UID
      teacherId: 'string', // Teacher UID who graded
      fileId: 'string', // Associated file ID
      courseId: 'string',
      exerciseId: 'string', // If it's an exercise submission
      
      // Grading information
      score: 'number', // Score out of maxScore
      maxScore: 'number', // Maximum possible score
      percentage: 'number', // Calculated percentage
      letterGrade: 'string', // 'A', 'B', 'C', 'D', 'F'
      
      // Feedback
      feedback: {
        teacherComments: 'string', // Manual teacher feedback
        aiSuggestions: 'array', // AI-generated improvement suggestions
        correctAnswers: 'array', // For exercise auto-correction
        wrongAnswers: 'array', // Incorrect answers with explanations
        strengths: 'array', // What the student did well
        improvements: 'array' // Areas for improvement
      },
      
      // Timing information
      submittedAt: 'timestamp',
      gradedAt: 'timestamp',
      dueDate: 'timestamp',
      isLate: 'boolean',
      
      // Attempt information
      attemptNumber: 'number', // For multiple attempts
      timeSpent: 'number', // Time spent in seconds
      
      // Status
      status: 'string', // 'submitted' | 'grading' | 'graded' | 'returned'
      isResubmissionAllowed: 'boolean'
    }
  },

  // Achievements Collection - tracks student rewards and badges
  achievements: {
    collectionName: 'achievements',
    structure: {
      achievementId: 'string', // Unique achievement identifier
      studentId: 'string', // Student UID
      
      // Achievement details
      type: 'string', // 'badge' | 'milestone' | 'streak' | 'score' | 'completion'
      title: 'string', // Achievement title
      description: 'string', // Achievement description
      icon: 'string', // Icon name or URL
      color: 'string', // Badge color
      
      // Achievement criteria
      criteria: {
        type: 'string', // 'uploads' | 'score' | 'streak' | 'completion' | 'improvement'
        target: 'number', // Target value to achieve
        current: 'number', // Current progress
        courseId: 'string', // Specific course (optional)
        subjectId: 'string' // Specific subject (optional)
      },
      
      // Progress tracking
      progress: 'number', // Progress percentage (0-100)
      isUnlocked: 'boolean',
      unlockedAt: 'timestamp',
      
      // Rewards
      points: 'number', // Points awarded
      rewards: 'array', // Additional rewards
      
      // Rarity and value
      rarity: 'string', // 'common' | 'rare' | 'epic' | 'legendary'
      displayOrder: 'number' // Order for displaying achievements
    }
  }
}

// Firestore Collection References
export const Collections = {
  USERS: 'users',
  FILES: 'files',
  GRADES: 'grades',
  ACHIEVEMENTS: 'achievements',
  UPLOAD_HISTORY: 'uploadHistory',
  ANALYTICS: 'analytics'
}

// Predefined Achievement Types
export const AchievementTypes = {
  FIRST_UPLOAD: {
    type: 'milestone',
    title: 'First Steps',
    description: 'Upload your first file',
    icon: '🚀',
    color: 'blue',
    points: 10,
    rarity: 'common'
  },
  
  PERFECT_SCORE: {
    type: 'score',
    title: 'Perfect Performance',
    description: 'Get a perfect score on an exercise',
    icon: '🏆',
    color: 'gold',
    points: 50,
    rarity: 'rare'
  },
  
  UPLOAD_STREAK_7: {
    type: 'streak',
    title: 'Week Warrior',
    description: 'Upload files for 7 consecutive days',
    icon: '🔥',
    color: 'orange',
    points: 75,
    rarity: 'epic'
  },
  
  COURSE_COMPLETION: {
    type: 'completion',
    title: 'Course Master',
    description: 'Complete all lessons in a course',
    icon: '🎓',
    color: 'purple',
    points: 100,
    rarity: 'epic'
  }
}

export default DatabaseSchema