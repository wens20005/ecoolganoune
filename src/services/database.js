// Database service layer with Firebase Firestore integration
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from '../firebase'
import { Collections } from '../models/database'

class DatabaseService {
  constructor() {
    this.db = db
  }

  // Generic CRUD operations
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(this.db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error)
      throw new Error(`Failed to create ${collectionName} record`)
    }
  }

  async read(collectionName, docId) {
    try {
      const docRef = doc(this.db, collectionName, docId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        return null
      }
    } catch (error) {
      console.error(`Error reading document from ${collectionName}:`, error)
      throw new Error(`Failed to read ${collectionName} record`)
    }
  }

  async update(collectionName, docId, data) {
    try {
      const docRef = doc(this.db, collectionName, docId)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error)
      throw new Error(`Failed to update ${collectionName} record`)
    }
  }

  async delete(collectionName, docId) {
    try {
      const docRef = doc(this.db, collectionName, docId)
      await deleteDoc(docRef)
      return true
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error)
      throw new Error(`Failed to delete ${collectionName} record`)
    }
  }

  async query(collectionName, conditions = [], orderByField = null, limitCount = null) {
    try {
      let q = collection(this.db, collectionName)
      
      // Apply where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value))
      })
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'))
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount))
      }
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error)
      throw new Error(`Failed to query ${collectionName} records`)
    }
  }

  // User-specific operations
  async createUser(userData) {
    const userId = await this.create(Collections.USERS, {
      ...userData,
      stats: {
        totalUploads: 0,
        totalPoints: 0,
        averageGrade: 0,
        badges: [],
        level: 1,
        xp: 0
      }
    })
    return userId
  }

  async getUserById(userId) {
    return await this.read(Collections.USERS, userId)
  }

  async updateUserStats(userId, stats) {
    return await this.update(Collections.USERS, userId, { stats })
  }

  async getUsersByRole(role) {
    return await this.query(Collections.USERS, [
      { field: 'role', operator: '==', value: role }
    ])
  }

  // File-specific operations
  async createFile(fileData) {
    const fileId = await this.create(Collections.FILES, {
      ...fileData,
      status: 'uploading',
      virusScanned: false,
      version: 1,
      isPublic: false
    })
    return fileId
  }

  async updateFileStatus(fileId, status, processingError = null) {
    const updateData = { status }
    if (processingError) {
      updateData.processingError = processingError
    }
    return await this.update(Collections.FILES, fileId, updateData)
  }

  async getFilesByUser(userId) {
    return await this.query(Collections.FILES, [
      { field: 'userId', operator: '==', value: userId }
    ], { field: 'uploadedAt', direction: 'desc' })
  }

  async getFilesByCourse(courseId) {
    return await this.query(Collections.FILES, [
      { field: 'courseId', operator: '==', value: courseId }
    ], { field: 'uploadedAt', direction: 'desc' })
  }

  async updateFileAnalysis(fileId, analysis) {
    return await this.update(Collections.FILES, fileId, { analysis })
  }

  // Grade-specific operations
  async createGrade(gradeData) {
    const gradeId = await this.create(Collections.GRADES, {
      ...gradeData,
      status: 'draft',
      isVisible: false,
      revisionCount: 0
    })
    
    // Update user stats
    if (gradeData.percentage) {
      await this.updateUserGradeStats(gradeData.studentId, gradeData.percentage)
    }
    
    return gradeId
  }

  async publishGrade(gradeId) {
    return await this.update(Collections.GRADES, gradeId, {
      status: 'published',
      isVisible: true
    })
  }

  async getGradesByStudent(studentId) {
    return await this.query(Collections.GRADES, [
      { field: 'studentId', operator: '==', value: studentId },
      { field: 'isVisible', operator: '==', value: true }
    ], { field: 'gradedAt', direction: 'desc' })
  }

  async getGradesByTeacher(teacherId) {
    return await this.query(Collections.GRADES, [
      { field: 'teacherId', operator: '==', value: teacherId }
    ], { field: 'gradedAt', direction: 'desc' })
  }

  async updateUserGradeStats(userId, newGrade) {
    try {
      const user = await this.getUserById(userId)
      if (!user) return
      
      const currentStats = user.stats || {}
      const totalGrades = (currentStats.totalGrades || 0) + 1
      const currentAverage = currentStats.averageGrade || 0
      const newAverage = ((currentAverage * (totalGrades - 1)) + newGrade) / totalGrades
      
      await this.update(Collections.USERS, userId, {
        'stats.totalGrades': totalGrades,
        'stats.averageGrade': Math.round(newAverage * 100) / 100
      })
    } catch (error) {
      console.error('Error updating user grade stats:', error)
    }
  }

  // Achievement-specific operations
  async createAchievement(achievementData) {
    return await this.create(Collections.ACHIEVEMENTS, {
      ...achievementData,
      isActive: true,
      totalEarned: 0
    })
  }

  async getUserAchievements(userId) {
    return await this.query(Collections.USER_ACHIEVEMENTS, [
      { field: 'userId', operator: '==', value: userId }
    ], { field: 'earnedAt', direction: 'desc' })
  }

  async awardAchievement(userId, achievementId, context = {}) {
    try {
      // Check if user already has this achievement
      const existing = await this.query(Collections.USER_ACHIEVEMENTS, [
        { field: 'userId', operator: '==', value: userId },
        { field: 'achievementId', operator: '==', value: achievementId }
      ])
      
      if (existing.length > 0) {
        return null // Already earned
      }
      
      // Award the achievement
      const userAchievementId = await this.create(Collections.USER_ACHIEVEMENTS, {
        userId,
        achievementId,
        progress: 100,
        context,
        isVisible: true,
        isFavorite: false,
        verified: false
      })
      
      // Update achievement total count
      const achievement = await this.read(Collections.ACHIEVEMENTS, achievementId)
      if (achievement) {
        await this.update(Collections.ACHIEVEMENTS, achievementId, {
          totalEarned: increment(1)
        })
        
        // Update user XP and stats
        await this.addUserXP(userId, achievement.xpReward || 0)
      }
      
      return userAchievementId
    } catch (error) {
      console.error('Error awarding achievement:', error)
      throw error
    }
  }

  async addUserXP(userId, xpAmount) {
    try {
      const user = await this.getUserById(userId)
      if (!user) return
      
      const currentXP = user.stats?.xp || 0
      const newXP = currentXP + xpAmount
      const newLevel = Math.floor(newXP / 100) + 1 // 100 XP per level
      
      await this.update(Collections.USERS, userId, {
        'stats.xp': newXP,
        'stats.level': newLevel,
        'stats.totalPoints': increment(xpAmount)
      })
      
      return { newXP, newLevel, levelUp: newLevel > (user.stats?.level || 1) }
    } catch (error) {
      console.error('Error adding user XP:', error)
      throw error
    }
  }

  // Upload History operations
  async createUploadSession(sessionData) {
    return await this.create(Collections.UPLOAD_HISTORY, {
      ...sessionData,
      startedAt: serverTimestamp()
    })
  }

  async updateUploadSession(sessionId, updateData) {
    return await this.update(Collections.UPLOAD_HISTORY, sessionId, updateData)
  }

  async getUserUploadHistory(userId, limitCount = 50) {
    return await this.query(Collections.UPLOAD_HISTORY, [
      { field: 'userId', operator: '==', value: userId }
    ], { field: 'startedAt', direction: 'desc' }, limitCount)
  }

  // Notification operations
  async createNotification(notificationData) {
    return await this.create(Collections.NOTIFICATIONS, {
      ...notificationData,
      isRead: false,
      isArchived: false,
      priority: notificationData.priority || 'normal'
    })
  }

  async markNotificationAsRead(notificationId) {
    return await this.update(Collections.NOTIFICATIONS, notificationId, {
      isRead: true,
      readAt: serverTimestamp()
    })
  }

  async getUserNotifications(userId, limitCount = 20) {
    return await this.query(Collections.NOTIFICATIONS, [
      { field: 'userId', operator: '==', value: userId },
      { field: 'isArchived', operator: '==', value: false }
    ], { field: 'createdAt', direction: 'desc' }, limitCount)
  }

  // Analytics operations
  async getUploadAnalytics(timeframe = 'week') {
    try {
      const now = new Date()
      let startDate = new Date()
      
      switch (timeframe) {
        case 'day':
          startDate.setDate(now.getDate() - 1)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      const uploads = await this.query(Collections.FILES, [
        { field: 'uploadedAt', operator: '>=', value: startDate }
      ])
      
      const grades = await this.query(Collections.GRADES, [
        { field: 'gradedAt', operator: '>=', value: startDate }
      ])
      
      return {
        totalUploads: uploads.length,
        totalGrades: grades.length,
        averageGrade: grades.length > 0 ? 
          grades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / grades.length : 0,
        uploads,
        grades
      }
    } catch (error) {
      console.error('Error getting upload analytics:', error)
      throw error
    }
  }

  // Batch operations
  async batchWrite(operations) {
    try {
      const batch = writeBatch(this.db)
      
      operations.forEach(op => {
        const docRef = doc(this.db, op.collection, op.id || '')
        
        switch (op.type) {
          case 'create':
            batch.set(docRef, {
              ...op.data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            })
            break
          case 'update':
            batch.update(docRef, {
              ...op.data,
              updatedAt: serverTimestamp()
            })
            break
          case 'delete':
            batch.delete(docRef)
            break
        }
      })
      
      await batch.commit()
      return true
    } catch (error) {
      console.error('Error executing batch write:', error)
      throw error
    }
  }
}

// Create singleton instance
export const databaseService = new DatabaseService()

// Export individual methods for easy access
export const {
  create,
  read,
  update,
  delete: deleteDocument,
  query: queryCollection,
  
  createUser,
  getUserById,
  updateUserStats,
  getUsersByRole,
  
  createFile,
  updateFileStatus,
  getFilesByUser,
  getFilesByCourse,
  updateFileAnalysis,
  
  createGrade,
  publishGrade,
  getGradesByStudent,
  getGradesByTeacher,
  updateUserGradeStats,
  
  createAchievement,
  getUserAchievements,
  awardAchievement,
  addUserXP,
  
  createUploadSession,
  updateUploadSession,
  getUserUploadHistory,
  
  createNotification,
  markNotificationAsRead,
  getUserNotifications,
  
  getUploadAnalytics,
  batchWrite
} = databaseService

export default databaseService