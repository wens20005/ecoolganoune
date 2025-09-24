// Comprehensive Demo Page for Advanced File Upload System
import { useState, useEffect } from 'react'
import { 
  Upload, 
  Shield, 
  Zap, 
  Trophy, 
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import AdvancedFileUpload from '../components/AdvancedFileUpload'
import TeacherDashboard from '../components/TeacherDashboard'
import UploadHistory from '../components/UploadHistory'
import AchievementSystem from '../components/AchievementSystem'
import { databaseService } from '../database/services'
import { securityScanner } from '../utils/securityScanner'
import { fileConverter } from '../utils/fileConverter'

const FileUploadDemo = () => {
  const [currentUser] = useState('demo-user-123')
  const [currentView, setCurrentView] = useState('upload')
  const [demoStats, setDemoStats] = useState({
    totalUploads: 0,
    securityScans: 0,
    conversions: 0,
    achievements: 0
  })
  const [notifications, setNotifications] = useState([])
  const [isTeacher, setIsTeacher] = useState(false)

  useEffect(() => {
    loadDemoData()
  }, [])

  const loadDemoData = async () => {
    try {
      // Load or create demo user stats
      const stats = await databaseService.getUserStats(currentUser)
      setDemoStats({
        totalUploads: stats.totalUploads || 0,
        securityScans: stats.cleanScans || 0,
        conversions: stats.autoConversions || 0,
        achievements: stats.achievementsUnlocked || 0
      })
    } catch (error) {
      console.log('Demo mode - using mock data')
    }
  }

  const handleUploadSuccess = (uploadResult, originalFile, savedFile, metadata) => {
    console.log('📁 File uploaded successfully:', {
      uploadResult,
      originalFile: originalFile.name,
      savedFile,
      security: metadata.securityScan,
      conversion: metadata.conversion
    })

    // Update demo stats
    setDemoStats(prev => ({
      ...prev,
      totalUploads: prev.totalUploads + 1,
      securityScans: metadata.securityScan?.riskLevel === 'clean' ? prev.securityScans + 1 : prev.securityScans,
      conversions: metadata.conversion ? prev.conversions + 1 : prev.conversions
    }))

    // Show success notification
    addNotification('success', `File "${originalFile.name}" uploaded successfully!`)
  }

  const handleUploadError = (error, file) => {
    console.error('❌ Upload failed:', error, file.name)
    addNotification('error', `Upload failed: ${error.message}`)
  }

  const handleAchievementUnlocked = (achievements) => {
    achievements.forEach(achievement => {
      addNotification('achievement', `🎉 Achievement unlocked: ${achievement.title}`)
    })
    setDemoStats(prev => ({
      ...prev,
      achievements: prev.achievements + achievements.length
    }))
  }

  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    }
    setNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep last 5
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  const getViewContent = () => {
    switch (currentView) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🚀 Advanced File Upload System
              </h2>
              <p className="text-gray-600 mb-6">
                Experience the complete file upload system with security scanning, 
                auto-conversion, gamification, and database integration.
              </p>
              
              <AdvancedFileUpload
                userId={currentUser}
                courseId="demo-course"
                multiple={true}
                maxFiles={5}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                className="mb-6"
              />
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Shield className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-blue-900">Security Scanning</h3>
                  <p className="text-sm text-blue-700">Advanced virus detection and threat analysis</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <Zap className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-semibold text-green-900">Auto Conversion</h3>
                  <p className="text-sm text-green-700">Automatic file format optimization</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <Trophy className="h-8 w-8 text-yellow-600 mb-2" />
                  <h3 className="font-semibold text-yellow-900">Gamification</h3>
                  <p className="text-sm text-yellow-700">Achievements and progress tracking</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold text-purple-900">Analytics</h3>
                  <p className="text-sm text-purple-700">Detailed upload insights and metrics</p>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'history':
        return (
          <UploadHistory 
            userId={currentUser}
            courseId="demo-course"
          />
        )
        
      case 'teacher':
        return (
          <TeacherDashboard 
            teacherId={currentUser}
            className="min-h-screen"
          />
        )
        
      case 'achievements':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Achievement System</h2>
            <p className="text-gray-600 mb-6">
              Upload files to unlock achievements and track your progress!
            </p>
            
            {/* Demo Achievement Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'First Steps', description: 'Upload your first file', icon: '🎯', unlocked: demoStats.totalUploads > 0 },
                { title: 'Security Conscious', description: 'Pass 10 security scans', icon: '🛡️', unlocked: demoStats.securityScans >= 10 },
                { title: 'Efficiency Expert', description: 'Auto-convert 5 files', icon: '⚙️', unlocked: demoStats.conversions >= 5 },
                { title: 'File Master', description: 'Upload 25 files total', icon: '📚', unlocked: demoStats.totalUploads >= 25 },
                { title: 'Achievement Hunter', description: 'Unlock 5 achievements', icon: '🏆', unlocked: demoStats.achievements >= 5 },
                { title: 'Week Warrior', description: 'Upload files 7 days in a row', icon: '⚡', unlocked: false }
              ].map((achievement, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <h3 className={`font-semibold ${achievement.unlocked ? 'text-yellow-900' : 'text-gray-600'}`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'}`}>
                        {achievement.description}
                      </p>
                      {achievement.unlocked && (
                        <div className="flex items-center space-x-1 mt-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Unlocked!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
        
      default:
        return <div>View not found</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Upload className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Advanced File Upload Demo
              </h1>
            </div>
            
            {/* User Toggle */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isTeacher}
                  onChange={(e) => setIsTeacher(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Teacher View</span>
              </label>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{isTeacher ? 'Teacher' : 'Student'} Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'upload', label: 'File Upload', icon: Upload },
              { id: 'history', label: 'Upload History', icon: Clock },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              ...(isTeacher ? [{ id: 'teacher', label: 'Teacher Dashboard', icon: BarChart3 }] : [])
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    currentView === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">{demoStats.totalUploads}</span>
                <span className="text-blue-700">uploads</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">{demoStats.securityScans}</span>
                <span className="text-green-700">clean scans</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-900">{demoStats.conversions}</span>
                <span className="text-yellow-700">conversions</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">{demoStats.achievements}</span>
                <span className="text-purple-700">achievements</span>
              </div>
            </div>
            
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Demo Mode
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getViewContent()}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-40 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`max-w-sm p-4 rounded-lg shadow-lg border transition-all duration-300 ${
                notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                notification.type === 'achievement' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-start space-x-3">
                {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                {notification.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}
                {notification.type === 'achievement' && <Trophy className="h-5 w-5 text-yellow-600 mt-0.5" />}
                {notification.type === 'info' && <Info className="h-5 w-5 text-blue-600 mt-0.5" />}
                
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievement System Component */}
      <AchievementSystem 
        userId={currentUser}
        onAchievementUnlocked={handleAchievementUnlocked}
      />
    </div>
  )
}

export default FileUploadDemo