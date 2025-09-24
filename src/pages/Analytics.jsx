import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  AlertTriangle,
  Users,
  BookOpen,
  FileEdit,
  Calendar
} from 'lucide-react'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week')
  
  // Mock data for analytics
  const analyticsData = {
    overview: {
      totalStudents: 245,
      averageScore: 16.2,
      completionRate: 78,
      needsRevision: 42
    },
    performance: {
      week: [
        { subject: 'Mathematics', average: 17.5, trend: 'up' },
        { subject: 'Science', average: 15.8, trend: 'down' },
        { subject: 'English', average: 16.9, trend: 'up' },
        { subject: 'History', average: 14.2, trend: 'stable' }
      ],
      month: [
        { subject: 'Mathematics', average: 16.8, trend: 'up' },
        { subject: 'Science', average: 16.2, trend: 'up' },
        { subject: 'English', average: 17.1, trend: 'up' },
        { subject: 'History', average: 15.5, trend: 'up' }
      ]
    },
    advice: [
      {
        type: 'warning',
        title: 'Science Performance Declining',
        description: 'Students are struggling with recent science topics. Consider additional review sessions.',
        action: 'Schedule Review Session'
      },
      {
        type: 'success',
        title: 'Mathematics Improvement',
        description: 'Great progress in mathematics! Students are responding well to new teaching methods.',
        action: 'Continue Current Approach'
      },
      {
        type: 'info',
        title: 'History Engagement Low',
        description: 'Consider adding more interactive content to history lessons.',
        action: 'Add Interactive Elements'
      }
    ]
  }

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
      red: 'bg-red-500 text-red-600 bg-red-50'
    }

    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
                <span>
                  {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[2]}`}>
            <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[1]}`} />
          </div>
        </div>
      </div>
    )
  }

  const PerformanceChart = ({ data }) => {
    const maxScore = 20
    
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
        <div className="space-y-4">
          {data.map((subject) => (
            <div key={subject.subject} className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                  <span className="text-sm text-gray-600">{subject.average}/20</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      subject.average >= 16 ? 'bg-green-500' : 
                      subject.average >= 12 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(subject.average / maxScore) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className={`text-sm ${
                subject.trend === 'up' ? 'text-green-600' : 
                subject.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {subject.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                {subject.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                {subject.trend === 'stable' && <div className="h-4 w-4" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const AdviceCard = ({ advice }) => {
    const getIcon = (type) => {
      switch (type) {
        case 'warning':
          return <AlertTriangle className="h-5 w-5 text-yellow-600" />
        case 'success':
          return <Award className="h-5 w-5 text-green-600" />
        default:
          return <Target className="h-5 w-5 text-blue-600" />
      }
    }

    const getBorderColor = (type) => {
      switch (type) {
        case 'warning':
          return 'border-l-yellow-400'
        case 'success':
          return 'border-l-green-400'
        default:
          return 'border-l-blue-400'
      }
    }

    return (
      <div className={`card border-l-4 ${getBorderColor(advice.type)}`}>
        <div className="flex items-start space-x-3">
          {getIcon(advice.type)}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{advice.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{advice.description}</p>
            <button className="text-sm text-primary-600 hover:text-primary-700 mt-2 font-medium">
              {advice.action}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor student performance and get insights</p>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={analyticsData.overview.totalStudents}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Average Score"
          value={`${analyticsData.overview.averageScore}/20`}
          icon={Target}
          trend="up"
          color="green"
        />
        <StatCard
          title="Completion Rate"
          value={`${analyticsData.overview.completionRate}%`}
          icon={BarChart3}
          trend="up"
          color="blue"
        />
        <StatCard
          title="Needs Revision"
          value={analyticsData.overview.needsRevision}
          icon={AlertTriangle}
          trend="down"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <PerformanceChart data={analyticsData.performance[timeRange] || analyticsData.performance.week} />
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Active Courses</span>
                </div>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileEdit className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Total Exercises</span>
                </div>
                <span className="font-medium">48</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Upcoming Exams</span>
                </div>
                <span className="font-medium">5</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-3">
              {['Alice Johnson', 'Bob Smith', 'Carol Davis'].map((name, index) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                  <span className="text-sm text-gray-600">19.2/20</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Advice */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Teacher Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyticsData.advice.map((advice, index) => (
            <AdviceCard key={index} advice={advice} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics