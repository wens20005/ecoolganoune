// Database Service Layer for Educational Platform
import { db } from '../firebase'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { Collections, AchievementTypes } from './schema'

export class DatabaseService {
  constructor() {
    this.collections = Collections
  }

  // =================== USER SERVICES ===================
  
  async createUser(userData) {
    try {
      const userRef = collection(db, this.collections.USERS)
      const defaultUserData = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        preferences: {
          soundEnabled: true,
          notifications: true,
          theme: 'light',
          language: 'en'
        },
        stats: {
          totalUploads: 0,
          totalScore: 0,
          averageScore: 0,
          streakDays: 0,
          lastActiveDate: serverTimestamp()
        }
      }
      
      const docRef = await addDoc(userRef, defaultUserData)
      return { id: docRef.id, ...defaultUserData }
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  async getUser(uid) {
    try {
      const userDoc = await getDoc(doc(db, this.collections.USERS, uid))
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting user:', error)
      throw new Error('Failed to get user')
    }
  }

  async updateUser(uid, updateData) {
    try {
      const userRef = doc(db, this.collections.USERS, uid)
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      })
      return await this.getUser(uid)
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Failed to update user')
    }
  }

  async updateUserStats(uid, stats) {
    try {
      const userRef = doc(db, this.collections.USERS, uid)
      await updateDoc(userRef, {
        'stats.totalUploads': increment(stats.uploads || 0),
        'stats.totalScore': increment(stats.score || 0),
        'stats.lastActiveDate': serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Recalculate average score
      const user = await this.getUser(uid)
      if (user && user.stats.totalUploads > 0) {
        const averageScore = user.stats.totalScore / user.stats.totalUploads
        await updateDoc(userRef, {
          'stats.averageScore': averageScore
        })
      }
    } catch (error) {
      console.error('Error updating user stats:', error)
      throw new Error('Failed to update user stats')
    }
  }

  // =================== FILE SERVICES ===================

  async saveFileMetadata(fileData) {
    try {
      const fileRef = collection(db, this.collections.FILES)
      const fileMetadata = {
        ...fileData,
        uploadedAt: serverTimestamp(),
        status: 'processing',
        processingInfo: {
          virusScanResult: 'scanning',
          conversionStatus: 'none',
          convertedFiles: [],
          thumbnailUrl: '',
          textExtracted: '',
          aiAnalysis: {}
        },
        isPublic: false,
        allowedUsers: [fileData.uploadedBy],
        tags: [],
        difficulty: 'medium',
        estimatedTime: 10,
        description: ''
      }
      
      const docRef = await addDoc(fileRef, fileMetadata)
      
      // Update user upload stats
      await this.updateUserStats(fileData.uploadedBy, { uploads: 1 })
      
      // Check for achievements
      await this.checkUploadAchievements(fileData.uploadedBy)
      
      return { id: docRef.id, ...fileMetadata }
    } catch (error) {
      console.error('Error saving file metadata:', error)
      throw new Error('Failed to save file metadata')
    }
  }

  async updateFileStatus(fileId, status, processingInfo = {}) {
    try {
      const fileRef = doc(db, this.collections.FILES, fileId)
      await updateDoc(fileRef, {
        status,
        processingInfo: {
          ...processingInfo
        }
      })
    } catch (error) {
      console.error('Error updating file status:', error)
      throw new Error('Failed to update file status')
    }
  }

  async getFilesByUser(userId) {
    try {
      const filesQuery = query(
        collection(db, this.collections.FILES),
        where('uploadedBy', '==', userId),
        orderBy('uploadedAt', 'desc')
      )
      const snapshot = await getDocs(filesQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting user files:', error)
      throw new Error('Failed to get user files')
    }
  }

  async getFilesByCourse(courseId) {
    try {
      const filesQuery = query(
        collection(db, this.collections.FILES),
        where('courseId', '==', courseId),
        orderBy('uploadedAt', 'desc')
      )
      const snapshot = await getDocs(filesQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting course files:', error)
      throw new Error('Failed to get course files')
    }
  }

  // =================== GRADE SERVICES ===================

  async createGrade(gradeData) {
    try {
      const gradeRef = collection(db, this.collections.GRADES)
      const grade = {
        ...gradeData,
        submittedAt: serverTimestamp(),
        status: 'submitted',
        isLate: gradeData.dueDate ? new Date() > gradeData.dueDate.toDate() : false,
        attemptNumber: 1,
        timeSpent: 0
      }
      
      const docRef = await addDoc(gradeRef, grade)
      
      // Update user stats with score
      if (gradeData.score !== undefined) {
        await this.updateUserStats(gradeData.studentId, { score: gradeData.score })
        
        // Check for score-based achievements
        await this.checkScoreAchievements(gradeData.studentId, gradeData.score, gradeData.maxScore)
      }
      
      return { id: docRef.id, ...grade }
    } catch (error) {
      console.error('Error creating grade:', error)
      throw new Error('Failed to create grade')
    }
  }

  async updateGrade(gradeId, updateData) {
    try {
      const gradeRef = doc(db, this.collections.GRADES, gradeId)
      await updateDoc(gradeRef, {
        ...updateData,
        gradedAt: serverTimestamp(),
        status: 'graded'
      })
    } catch (error) {
      console.error('Error updating grade:', error)
      throw new Error('Failed to update grade')
    }
  }

  async getGradesByStudent(studentId) {
    try {
      const gradesQuery = query(
        collection(db, this.collections.GRADES),
        where('studentId', '==', studentId),
        orderBy('submittedAt', 'desc')
      )
      const snapshot = await getDocs(gradesQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting student grades:', error)
      throw new Error('Failed to get student grades')
    }
  }

  async getGradesByCourse(courseId) {
    try {
      const gradesQuery = query(
        collection(db, this.collections.GRADES),
        where('courseId', '==', courseId),
        orderBy('submittedAt', 'desc')
      )
      const snapshot = await getDocs(gradesQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting course grades:', error)
      throw new Error('Failed to get course grades')
    }
  }

  // =================== ACHIEVEMENT SERVICES ===================

  async checkUploadAchievements(userId) {
    try {
      const user = await this.getUser(userId)
      if (!user) return

      // Check for first upload achievement
      if (user.stats.totalUploads === 1) {
        await this.awardAchievement(userId, AchievementTypes.FIRST_UPLOAD)
      }

      // Check for upload streak (simplified - in production, would need more complex logic)
      if (user.stats.totalUploads % 7 === 0 && user.stats.totalUploads > 0) {
        await this.awardAchievement(userId, AchievementTypes.UPLOAD_STREAK_7)
      }
    } catch (error) {
      console.error('Error checking upload achievements:', error)
    }
  }

  async checkScoreAchievements(userId, score, maxScore) {
    try {
      // Check for perfect score achievement
      if (score === maxScore && score >= 20) {
        await this.awardAchievement(userId, AchievementTypes.PERFECT_SCORE)
      }
    } catch (error) {
      console.error('Error checking score achievements:', error)
    }
  }

  async awardAchievement(userId, achievementTemplate) {
    try {
      // Check if user already has this achievement
      const existingQuery = query(
        collection(db, this.collections.ACHIEVEMENTS),
        where('studentId', '==', userId),
        where('type', '==', achievementTemplate.type),
        where('title', '==', achievementTemplate.title)
      )
      const existingSnapshot = await getDocs(existingQuery)
      
      if (!existingSnapshot.empty) {
        return // Achievement already exists
      }

      const achievementRef = collection(db, this.collections.ACHIEVEMENTS)
      const achievement = {
        studentId: userId,
        ...achievementTemplate,
        criteria: {
          type: achievementTemplate.type,
          target: 1,
          current: 1,
          courseId: '',
          subjectId: ''
        },
        progress: 100,
        isUnlocked: true,
        unlockedAt: serverTimestamp(),
        rewards: [],
        displayOrder: 1
      }
      
      await addDoc(achievementRef, achievement)
      
      // Return the achievement for UI feedback
      return { id: 'temp', ...achievement }
    } catch (error) {
      console.error('Error awarding achievement:', error)
      throw new Error('Failed to award achievement')
    }
  }

  async getUserAchievements(userId) {
    try {
      const achievementsQuery = query(
        collection(db, this.collections.ACHIEVEMENTS),
        where('studentId', '==', userId),
        orderBy('unlockedAt', 'desc')
      )
      const snapshot = await getDocs(achievementsQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting user achievements:', error)
      throw new Error('Failed to get user achievements')
    }
  }

  // =================== ANALYTICS SERVICES ===================

  async getUploadAnalytics(period = 'week') {
    try {
      const files = await getDocs(collection(db, this.collections.FILES))
      const grades = await getDocs(collection(db, this.collections.GRADES))
      
      // Calculate basic analytics
      const totalUploads = files.size
      const totalGrades = grades.size
      const averageScore = grades.docs.reduce((sum, doc) => {
        const data = doc.data()
        return sum + (data.score || 0)
      }, 0) / totalGrades || 0
      
      return {
        totalUploads,
        totalGrades,
        averageScore: Math.round(averageScore * 100) / 100,
        period
      }
    } catch (error) {
      console.error('Error getting analytics:', error)
      throw new Error('Failed to get analytics')
    }
  }

  // =================== UTILITY METHODS ===================

  async searchFiles(searchTerm, filters = {}) {
    try {
      let filesQuery = collection(db, this.collections.FILES)
      
      if (filters.userId) {
        filesQuery = query(filesQuery, where('uploadedBy', '==', filters.userId))
      }
      
      if (filters.courseId) {
        filesQuery = query(filesQuery, where('courseId', '==', filters.courseId))
      }
      
      const snapshot = await getDocs(filesQuery)
      let files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      // Client-side search filtering (in production, use full-text search)
      if (searchTerm) {
        files = files.filter(file => 
          file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      return files
    } catch (error) {
      console.error('Error searching files:', error)
      throw new Error('Failed to search files')
    }
  }

  async deleteFile(fileId) {
    try {
      await deleteDoc(doc(db, this.collections.FILES, fileId))
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error('Failed to delete file')
    }
  }
}

// Create singleton instance
export const databaseService = new DatabaseService()
export default databaseService