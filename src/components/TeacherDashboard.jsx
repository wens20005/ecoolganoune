import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Users, 
  FileText, 
  Award, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  Target,
  Star,
  Brain
} from 'lucide-react'
import { databaseService } from '../services/database'

const TeacherDashboard = ({ teacherId }) => {
  const [analytics, setAnalytics] = useState({
    totalUploads: 0,
    totalStudents: 0,
    averageGrade: 0,
    pendingGrades: 0,
    recentActivity: []
  })
  
  const [students, setStudents] = useState([])
  const [files, setFiles] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('week')
  const [selectedView, setSelectedView] = useState('overview')

  useEffect(() => {
    if (teacherId) {
      loadDashboardData()
    }
  }, [teacherId, timeframe])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load students
      const studentsData = await databaseService.getUsersByRole('student')
      
      // Load files uploaded by students
      const filesData = await databaseService.query('files', [
        { field: 'status', operator: '==', value: 'ready' }
      ], { field: 'uploadedAt', direction: 'desc' })
      
      // Load grades by this teacher
      const gradesData = await databaseService.getGradesByTeacher(teacherId)
      
      // Load analytics
      const analyticsData = await databaseService.getUploadAnalytics(timeframe)
      
      setStudents(studentsData)
      setFiles(filesData)
      setGrades(gradesData)
      setAnalytics({
        totalUploads: filesData.length,
        totalStudents: studentsData.length,
        averageGrade: analyticsData.averageGrade,
        pendingGrades: filesData.filter(f => !gradesData.some(g => g.fileId === f.id)).length,
        recentActivity: generateRecentActivity(filesData, gradesData)
      })
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecentActivity = (files, grades) => {
    const activity = []
    
    // Add recent uploads
    files.slice(0, 5).forEach(file => {
      activity.push({
        id: `upload_${file.id}`,
        type: 'upload',
        message: `${getStudentName(file.userId)} uploaded ${file.originalName}`,
        timestamp: file.uploadedAt,
        fileId: file.id
      })
    })
    
    // Add recent grades
    grades.slice(0, 5).forEach(grade => {
      activity.push({
        id: `grade_${grade.id}`,
        type: 'grade',
        message: `Graded submission with ${grade.score}/${grade.maxScore}`,
        timestamp: grade.gradedAt,
        gradeId: grade.id
      })
    })
    
    return activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10)
  }

  const getStudentName = (userId) => {
    const student = students.find(s => s.id === userId)
    return student ? student.name : 'Unknown Student'
  }

  // Overview Statistics Component
  const OverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalStudents}</p>
          </div>
          <Users className="h-8 w-8 text-blue-500" />
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Uploads</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalUploads}</p>
          </div>
          <FileText className="h-8 w-8 text-green-500" />
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Grade</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.averageGrade.toFixed(1)}</p>
          </div>
          <Star className="h-8 w-8 text-yellow-500" />
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Grades</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.pendingGrades}</p>
          </div>
          <Clock className="h-8 w-8 text-orange-500" />
        </div>
      </div>
    </div>
  )

  // Student Performance Component
  const StudentPerformance = () => {
    const studentsWithStats = students.map(student => {
      const studentFiles = files.filter(f => f.userId === student.id)
      const studentGrades = grades.filter(g => g.studentId === student.id)
      const avgGrade = studentGrades.length > 0 
        ? studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length 
        : 0
      
      return {
        ...student,
        totalUploads: studentFiles.length,
        avgGrade,
        pendingGrades: studentFiles.filter(f => !studentGrades.some(g => g.fileId === f.id)).length
      }
    })

    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentsWithStats.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{student.totalUploads}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{student.avgGrade.toFixed(1)}</span>
                      {student.avgGrade >= 16 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
                      ) : student.avgGrade < 12 ? (
                        <TrendingDown className="h-4 w-4 text-red-500 ml-1" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.pendingGrades > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {student.pendingGrades} pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Up to date
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Upload Analytics Component
  const UploadAnalytics = () => {
    const uploadsByDay = {}
    files.forEach(file => {
      const day = new Date(file.uploadedAt).toDateString()
      uploadsByDay[day] = (uploadsByDay[day] || 0) + 1
    })

    return (
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upload Analytics</h3>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{analytics.totalUploads}</div>
            <div className="text-sm text-gray-600">Total Uploads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{grades.length}</div>
            <div className="text-sm text-gray-600">Graded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{analytics.pendingGrades}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
        
        {/* Simple upload trend visualization */}
        <div className="space-y-2">
          {Object.entries(uploadsByDay).slice(-7).map(([day, count]) => (
            <div key={day} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{new Date(day).toLocaleDateString()}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${Math.min((count / Math.max(...Object.values(uploadsByDay))) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Recent Activity Component
  const RecentActivity = () => (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {analytics.recentActivity.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-full ${
              activity.type === 'upload' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              {activity.type === 'upload' ? (
                <FileText className={`h-4 w-4 ${
                  activity.type === 'upload' ? 'text-blue-600' : 'text-green-600'
                }`} />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // AI Insights Component
  const AIInsights = () => {
    const insights = [
      {
        type: 'recommendation',
        title: 'Student Engagement',
        message: 'Consider providing more feedback to students with lower upload frequency',
        actionable: true
      },
      {
        type: 'alert',
        title: 'Grading Backlog',
        message: `You have ${analytics.pendingGrades} submissions awaiting grades`,
        actionable: true
      },
      {
        type: 'success',
        title: 'Improvement Trend',
        message: 'Average class performance has improved by 12% this month',
        actionable: false
      }
    ]

    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className={`p-3 rounded-lg border-l-4 ${
              insight.type === 'recommendation' ? 'bg-blue-50 border-blue-400' :
              insight.type === 'alert' ? 'bg-yellow-50 border-yellow-400' :
              'bg-green-50 border-green-400'
            }`}>
              <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
              {insight.actionable && (
                <button className="text-xs text-primary-600 hover:text-primary-800 mt-2">
                  Take Action
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor student progress and manage submissions</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedView === 'overview'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedView === 'analytics'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <OverviewStats />

      {selectedView === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <StudentPerformance />
          </div>
          <div className="space-y-6">
            <RecentActivity />
            <AIInsights />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UploadAnalytics />
          <div className="space-y-6">
            <RecentActivity />
            <AIInsights />
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard