import React, { useState, useEffect } from 'react'
import { 
  Award, 
  Star, 
  Trophy, 
  Zap, 
  Target, 
  Crown,
  Flame,
  Gift,
  Sparkles,
  Volume2
} from 'lucide-react'
import { databaseService } from '../services/database'
import { soundManager } from '../utils/sounds'

const AchievementSystem = ({ 
  userId, 
  onAchievementEarned,
  showNotifications = true 
}) => {
  const [achievements, setAchievements] = useState([])
  const [userAchievements, setUserAchievements] = useState([])
  const [notifications, setNotifications] = useState([])
  const [userStats, setUserStats] = useState({})
  const [loading, setLoading] = useState(true)

  // Load achievements and user data
  useEffect(() => {
    if (userId) {
      loadAchievementData()
    }
  }, [userId])

  const loadAchievementData = async () => {
    try {
      setLoading(true)
      
      // Load all achievements
      const allAchievements = await databaseService.query('achievements', [
        { field: 'isActive', operator: '==', value: true }
      ])
      
      // Load user achievements
      const userAchievementsData = await databaseService.getUserAchievements(userId)
      
      // Load user stats
      const user = await databaseService.getUserById(userId)
      
      setAchievements(allAchievements)
      setUserAchievements(userAchievementsData)
      setUserStats(user?.stats || {})
      
    } catch (error) {
      console.error('Error loading achievement data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check for new achievements based on user action
  const checkAchievements = async (actionType, actionData = {}) => {
    try {
      const earnedAchievements = []
      
      for (const achievement of achievements) {
        // Skip if user already has this achievement
        const alreadyEarned = userAchievements.some(ua => ua.achievementId === achievement.id)
        if (alreadyEarned) continue
        
        // Check if criteria are met
        const criteriaMatch = await evaluateAchievementCriteria(achievement, actionType, actionData)
        if (criteriaMatch.earned) {
          const userAchievementId = await databaseService.awardAchievement(
            userId, 
            achievement.id, 
            criteriaMatch.context
          )
          
          if (userAchievementId) {
            earnedAchievements.push({
              ...achievement,
              userAchievementId,
              earnedAt: new Date()
            })
          }
        }
      }
      
      // Show notifications for new achievements
      if (earnedAchievements.length > 0) {
        for (const achievement of earnedAchievements) {
          await showAchievementNotification(achievement)
        }
        
        // Reload data
        await loadAchievementData()
        
        if (onAchievementEarned) {
          onAchievementEarned(earnedAchievements)
        }
      }
      
      return earnedAchievements
    } catch (error) {
      console.error('Error checking achievements:', error)
      return []
    }
  }

  // Evaluate if achievement criteria are met
  const evaluateAchievementCriteria = async (achievement, actionType, actionData) => {
    const criteria = achievement.criteria
    const stats = userStats
    
    let earned = false
    let context = { actionType, ...actionData }
    
    switch (achievement.id) {
      case 'first_upload':
        earned = actionType === 'upload' && (stats.totalUploads || 0) >= 1
        break
        
      case 'upload_streak_7':
        // This would require more complex streak tracking
        earned = false // Simplified for demo
        break
        
      case 'perfect_scores':
        earned = actionType === 'grade' && actionData.score === 20 && 
                (stats.perfectScoreStreak || 0) >= 5
        break
        
      case 'upload_master':
        earned = actionType === 'upload' && (stats.totalUploads || 0) >= 100
        break
        
      case 'early_bird':
        earned = actionType === 'upload' && actionData.beforeDeadline === true
        break
        
      // Dynamic milestone achievements
      default:
        if (achievement.type === 'upload' && criteria.type === 'count') {
          earned = actionType === 'upload' && (stats.totalUploads || 0) >= criteria.target
        } else if (achievement.type === 'grade' && criteria.type === 'score') {
          earned = actionType === 'grade' && actionData.score >= criteria.target
        }
    }
    
    return { earned, context }
  }

  // Show achievement notification with animation
  const showAchievementNotification = async (achievement) => {
    const notification = {
      id: Date.now(),
      achievement,
      timestamp: new Date(),
      shown: false
    }
    
    setNotifications(prev => [...prev, notification])
    
    // Play celebration sound
    if (achievement.badgeLevel === 'platinum') {
      soundManager.playCelebration()
      soundManager.speakPerfectScore()
    } else if (achievement.badgeLevel === 'gold') {
      soundManager.playSuccess()
      soundManager.speakBravo()
    } else {
      soundManager.playNotification()
    }
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
    
    // Create database notification
    await databaseService.createNotification({
      userId,
      title: `Achievement Unlocked: ${achievement.name}!`,
      message: achievement.description,
      type: 'achievement',
      actionType: 'view_achievement',
      actionData: { achievementId: achievement.id },
      priority: achievement.badgeLevel === 'platinum' ? 'high' : 'normal'
    })
  }

  // Get achievement icon based on type and level
  const getAchievementIcon = (achievement) => {
    const { badgeLevel, type } = achievement
    
    // Icon based on type
    let IconComponent = Award
    switch (type) {
      case 'upload':
        IconComponent = Zap
        break
      case 'grade':
        IconComponent = Star
        break
      case 'streak':
        IconComponent = Flame
        break
      case 'milestone':
        IconComponent = Target
        break
    }
    
    // Color based on level
    let colorClass = 'text-gray-500'
    switch (badgeLevel) {
      case 'bronze':
        colorClass = 'text-orange-600'
        break
      case 'silver':
        colorClass = 'text-gray-400'
        break
      case 'gold':
        colorClass = 'text-yellow-500'
        break
      case 'platinum':
        colorClass = 'text-purple-600'
        break
    }
    
    return <IconComponent className={`h-6 w-6 ${colorClass}`} />
  }

  // Achievement notification component
  const AchievementNotification = ({ notification }) => {
    const { achievement } = notification
    const [visible, setVisible] = useState(false)
    
    useEffect(() => {
      // Trigger animation
      setTimeout(() => setVisible(true), 100)
    }, [])
    
    return (
      <div className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="relative">
                {getAchievementIcon(achievement)}
                <Sparkles className="h-4 w-4 text-yellow-200 absolute -top-1 -right-1 animate-ping" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">Achievement Unlocked!</h3>
              <p className="text-sm font-medium">{achievement.name}</p>
              <p className="text-xs opacity-90">{achievement.description}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Zap className="h-3 w-3" />
                <span className="text-xs">+{achievement.xpReward} XP</span>
              </div>
            </div>
          </div>
          
          {/* Celebration particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-bounce"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + (i % 2) * 30}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Achievement progress bar
  const AchievementProgress = ({ achievement, currentValue, targetValue }) => {
    const progress = Math.min((currentValue / targetValue) * 100, 100)
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{currentValue}/{targetValue}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  // User level and XP display
  const UserLevelDisplay = () => {
    const level = userStats.level || 1
    const xp = userStats.xp || 0
    const xpForNextLevel = level * 100
    const currentLevelXP = xp % 100
    
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Level {level}</h3>
            <p className="text-sm opacity-90">{userStats.totalPoints || 0} Total Points</p>
          </div>
          <Crown className="h-8 w-8 text-yellow-300" />
        </div>
        
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>XP Progress</span>
            <span>{currentLevelXP}/100</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-yellow-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentLevelXP / 100) * 100}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Achievement grid
  const AchievementGrid = () => {
    const earnedIds = userAchievements.map(ua => ua.achievementId)
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(achievement => {
          const isEarned = earnedIds.includes(achievement.id)
          const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)
          
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                isEarned 
                  ? 'bg-green-50 border-green-200 shadow-md' 
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getAchievementIcon(achievement)}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-sm ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      achievement.badgeLevel === 'platinum' ? 'bg-purple-100 text-purple-800' :
                      achievement.badgeLevel === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                      achievement.badgeLevel === 'silver' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {achievement.badgeLevel}
                    </span>
                    <span className="text-xs text-gray-500">
                      +{achievement.xpReward} XP
                    </span>
                  </div>
                  
                  {isEarned && userAchievement && (
                    <p className="text-xs text-green-600 mt-1">
                      Earned {new Date(userAchievement.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                  
                  {!isEarned && achievement.criteria && (
                    <AchievementProgress
                      achievement={achievement}
                      currentValue={getCurrentProgress(achievement)}
                      targetValue={achievement.criteria.target}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Get current progress for achievement
  const getCurrentProgress = (achievement) => {
    switch (achievement.id) {
      case 'first_upload':
        return Math.min(userStats.totalUploads || 0, 1)
      case 'upload_master':
        return userStats.totalUploads || 0
      case 'perfect_scores':
        return userStats.perfectScoreStreak || 0
      default:
        if (achievement.type === 'upload') {
          return userStats.totalUploads || 0
        }
        return 0
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <UserLevelDisplay />
      <AchievementGrid />
      
      {/* Achievement Notifications */}
      {showNotifications && notifications.map(notification => (
        <AchievementNotification key={notification.id} notification={notification} />
      ))}
    </div>
  )
}

// Export hook for checking achievements
export const useAchievements = (userId) => {
  const [achievementSystem, setAchievementSystem] = useState(null)
  
  useEffect(() => {
    if (userId) {
      // This would be set by the parent component
    }
  }, [userId])
  
  const checkAchievements = async (actionType, actionData) => {
    if (achievementSystem) {
      return await achievementSystem.checkAchievements(actionType, actionData)
    }
    return []
  }
  
  return { checkAchievements }
}

export default AchievementSystem