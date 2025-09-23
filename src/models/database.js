// Database models and schema definitions for the advanced file upload system

// User model schema
export const UserSchema = {
  id: 'string', // unique user identifier
  email: 'string',
  name: 'string',
  role: 'string', // 'student' | 'teacher' | 'admin'
  avatar: 'string', // profile picture URL
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  
  // Student-specific fields
  grade: 'string', // e.g., '5th Grade', '10th Grade'
  studentId: 'string', // school student ID
  
  // Teacher-specific fields
  subjects: 'array', // array of subjects they teach
  classes: 'array', // array of class IDs they manage
  
  // Statistics
  stats: {
    totalUploads: 'number',
    totalPoints: 'number',
    averageGrade: 'number',
    badges: 'array', // array of earned badge IDs
    level: 'number', // gamification level
    xp: 'number' // experience points
  }
}

// File upload model schema
export const FileSchema = {
  id: 'string', // unique file identifier
  userId: 'string', // uploader ID
  originalName: 'string', // original filename
  fileName: 'string', // stored filename (unique)
  fileSize: 'number', // file size in bytes
  fileType: 'string', // MIME type
  fileExtension: 'string', // file extension
  category: 'string', // 'lesson' | 'exercise' | 'assignment' | 'resource'
  
  // Storage info
  storageUrl: 'string', // download URL
  storagePath: 'string', // Firebase storage path
  
  // Metadata
  uploadedAt: 'timestamp',
  lastModified: 'timestamp',
  
  // Association
  courseId: 'string', // associated course ID (optional)
  exerciseId: 'string', // associated exercise ID (optional)
  assignmentId: 'string', // associated assignment ID (optional)
  
  // Processing status
  status: 'string', // 'uploading' | 'processing' | 'ready' | 'failed'
  processingError: 'string', // error message if processing failed
  
  // Content analysis (AI-powered)
  analysis: {
    extractedText: 'string', // text extracted from file
    keywords: 'array', // relevant keywords
    subject: 'string', // detected subject area
    difficulty: 'string', // 'easy' | 'medium' | 'hard'
    estimatedReadTime: 'number', // minutes
    language: 'string' // detected language
  },
  
  // Security
  virusScanned: 'boolean',
  scanResults: 'object', // virus scan results
  
  // Version control
  version: 'number', // file version
  parentFileId: 'string', // if this is an updated version
  
  // Access control
  isPublic: 'boolean',
  allowedUsers: 'array', // user IDs who can access
  allowedRoles: 'array' // roles that can access
}

// Grade/Feedback model schema
export const GradeSchema = {
  id: 'string', // unique grade identifier
  fileId: 'string', // associated file ID
  studentId: 'string', // student being graded
  teacherId: 'string', // teacher giving grade
  
  // Grading
  score: 'number', // numerical score (0-100)
  maxScore: 'number', // maximum possible score
  grade: 'string', // letter grade (A+, A, B+, etc.)
  percentage: 'number', // calculated percentage
  
  // Feedback
  feedback: 'string', // teacher's written feedback
  suggestions: 'array', // improvement suggestions
  strengths: 'array', // noted strengths
  
  // AI Analysis
  aiAnalysis: {
    autoScore: 'number', // AI-generated score
    detectedIssues: 'array', // potential issues found
    recommendations: 'array', // AI recommendations
    complexity: 'number', // content complexity (1-10)
    readability: 'number' // readability score
  },
  
  // Rubric (if applicable)
  rubricScores: 'object', // breakdown by rubric criteria
  
  // Timestamps
  gradedAt: 'timestamp',
  lastModified: 'timestamp',
  
  // Status
  status: 'string', // 'draft' | 'published' | 'archived'
  isVisible: 'boolean', // visible to student
  
  // Revision
  allowRevision: 'boolean',
  revisionDeadline: 'timestamp',
  revisionCount: 'number'
}

// Achievement/Badge model schema
export const AchievementSchema = {
  id: 'string', // unique achievement identifier
  name: 'string', // achievement name
  description: 'string', // what the achievement is for
  icon: 'string', // badge icon/image URL
  type: 'string', // 'upload' | 'grade' | 'streak' | 'milestone'
  
  // Requirements
  criteria: {
    type: 'string', // 'count' | 'streak' | 'score' | 'time'
    target: 'number', // target value to achieve
    timeframe: 'string', // 'daily' | 'weekly' | 'monthly' | 'all-time'
    subject: 'string', // specific subject (optional)
    difficulty: 'string' // minimum difficulty level
  },
  
  // Rewards
  xpReward: 'number', // XP points awarded
  badgeLevel: 'string', // 'bronze' | 'silver' | 'gold' | 'platinum'
  
  // Metadata
  isActive: 'boolean',
  createdAt: 'timestamp',
  
  // Rarity
  rarity: 'string', // 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  totalEarned: 'number' // how many users have earned this
}

// User Achievement (earned badges) model schema
export const UserAchievementSchema = {
  id: 'string', // unique record identifier
  userId: 'string', // user who earned it
  achievementId: 'string', // achievement earned
  
  // Earning details
  earnedAt: 'timestamp',
  progress: 'number', // progress when earned (for tracking)
  context: 'object', // additional context about how it was earned
  
  // Display
  isVisible: 'boolean', // show on profile
  isFavorite: 'boolean', // user marked as favorite
  
  // Verification
  verified: 'boolean', // manually verified by teacher/admin
  verifiedBy: 'string', // who verified it
  verifiedAt: 'timestamp'
}

// Upload History model schema
export const UploadHistorySchema = {
  id: 'string', // unique history record
  userId: 'string', // user who uploaded
  
  // Upload session info
  sessionId: 'string', // upload session identifier
  files: 'array', // array of file IDs uploaded in this session
  totalFiles: 'number', // total files in session
  successfulUploads: 'number', // how many succeeded
  failedUploads: 'number', // how many failed
  
  // Timing
  startedAt: 'timestamp',
  completedAt: 'timestamp',
  duration: 'number', // upload duration in seconds
  
  // Technical details
  uploadMethod: 'string', // 'drag-drop' | 'click-select' | 'bulk'
  deviceInfo: 'object', // browser/device information
  connectionSpeed: 'number', // estimated speed (optional)
  
  // Results
  totalSize: 'number', // total bytes uploaded
  averageSpeed: 'number', // bytes per second
  errors: 'array', // any errors encountered
  
  // Context
  courseId: 'string', // if uploaded to specific course
  exerciseId: 'string', // if uploaded for specific exercise
  category: 'string' // upload category
}

// Notification model schema
export const NotificationSchema = {
  id: 'string', // unique notification ID
  userId: 'string', // recipient user ID
  
  // Content
  title: 'string', // notification title
  message: 'string', // notification message
  type: 'string', // 'grade' | 'achievement' | 'upload' | 'system'
  
  // Actions
  actionType: 'string', // 'view_file' | 'view_grade' | 'claim_badge'
  actionData: 'object', // data needed for action
  
  // Status
  isRead: 'boolean',
  isArchived: 'boolean',
  
  // Timing
  createdAt: 'timestamp',
  readAt: 'timestamp',
  expiresAt: 'timestamp',
  
  // Priority
  priority: 'string', // 'low' | 'normal' | 'high' | 'urgent'
  category: 'string' // for filtering/grouping
}

// Database collection names
export const Collections = {
  USERS: 'users',
  FILES: 'files',
  GRADES: 'grades',
  ACHIEVEMENTS: 'achievements',
  USER_ACHIEVEMENTS: 'userAchievements',
  UPLOAD_HISTORY: 'uploadHistory',
  NOTIFICATIONS: 'notifications',
  
  // Additional collections
  COURSES: 'courses',
  EXERCISES: 'exercises',
  ASSIGNMENTS: 'assignments',
  ANALYTICS: 'analytics'
}

// Pre-defined achievements
export const DefaultAchievements = [
  {
    id: 'first_upload',
    name: 'First Steps',
    description: 'Upload your first file',
    icon: '🎯',
    type: 'upload',
    criteria: { type: 'count', target: 1, timeframe: 'all-time' },
    xpReward: 10,
    badgeLevel: 'bronze',
    rarity: 'common'
  },
  {
    id: 'upload_streak_7',
    name: 'Week Warrior',
    description: 'Upload files for 7 consecutive days',
    icon: '🔥',
    type: 'streak',
    criteria: { type: 'streak', target: 7, timeframe: 'daily' },
    xpReward: 50,
    badgeLevel: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'perfect_scores',
    name: 'Perfectionist',
    description: 'Get 5 perfect scores in a row',
    icon: '⭐',
    type: 'grade',
    criteria: { type: 'streak', target: 5, timeframe: 'all-time' },
    xpReward: 100,
    badgeLevel: 'gold',
    rarity: 'rare'
  },
  {
    id: 'upload_master',
    name: 'Upload Master',
    description: 'Upload 100 files successfully',
    icon: '👑',
    type: 'upload',
    criteria: { type: 'count', target: 100, timeframe: 'all-time' },
    xpReward: 200,
    badgeLevel: 'platinum',
    rarity: 'epic'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Submit assignments before deadline 10 times',
    icon: '🌅',
    type: 'upload',
    criteria: { type: 'count', target: 10, timeframe: 'all-time' },
    xpReward: 75,
    badgeLevel: 'gold',
    rarity: 'uncommon'
  }
]

export default {
  UserSchema,
  FileSchema,
  GradeSchema,
  AchievementSchema,
  UserAchievementSchema,
  UploadHistorySchema,
  NotificationSchema,
  Collections,
  DefaultAchievements
}