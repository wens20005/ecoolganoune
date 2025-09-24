import { useState } from 'react'
import { Calendar, Clock, Plus, AlertCircle, CheckCircle } from 'lucide-react'

const Exams = () => {
  const [exams, setExams] = useState([
    {
      id: 1,
      title: "Mathematics Midterm",
      date: "2025-09-25",
      time: "10:00",
      duration: 120,
      status: "upcoming",
      description: "Covering chapters 1-5"
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
      description: "Biology fundamentals"
    }
  ])

  const [showCreateExam, setShowCreateExam] = useState(false)
  const [newExam, setNewExam] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    description: ''
  })

  const createExam = () => {
    if (newExam.title && newExam.date && newExam.time) {
      const currentDate = new Date()
      const examDate = new Date(`${newExam.date}T${newExam.time}`)
      
      setExams([...exams, {
        ...newExam,
        id: Date.now(),
        status: examDate > currentDate ? 'upcoming' : 'past'
      }])
      
      setNewExam({
        title: '',
        date: '',
        time: '',
        duration: 60,
        description: ''
      })
      setShowCreateExam(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const upcomingExams = exams.filter(exam => exam.status === 'upcoming')
  const pastExams = exams.filter(exam => exam.status === 'past')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-600 mt-2">Track your exam schedule and results</p>
        </div>
        <button
          onClick={() => setShowCreateExam(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Schedule Exam</span>
        </button>
      </div>

      {/* Timeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Exams */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            Upcoming Exams
          </h2>
          
          {upcomingExams.length > 0 ? (
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="card border-l-4 border-l-orange-400">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                      Upcoming
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(exam.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatTime(exam.time)} ({exam.duration} minutes)</span>
                    </div>
                  </div>
                  
                  {exam.description && (
                    <p className="text-gray-600 mt-3">{exam.description}</p>
                  )}
                  
                  <div className="mt-4">
                    <button className="btn-primary text-sm">
                      Start Exam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No upcoming exams</p>
            </div>
          )}
        </div>

        {/* Past Exams */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Past Exams
          </h2>
          
          {pastExams.length > 0 ? (
            <div className="space-y-4">
              {pastExams.map((exam) => (
                <div key={exam.id} className="card border-l-4 border-l-green-400">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Completed
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(exam.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatTime(exam.time)}</span>
                    </div>
                  </div>
                  
                  {exam.score !== undefined && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Score:</span>
                        <span className={`text-lg font-bold ${
                          exam.score / exam.maxScore >= 0.8 ? 'text-green-600' : 
                          exam.score / exam.maxScore >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {exam.score}/{exam.maxScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            exam.score / exam.maxScore >= 0.8 ? 'bg-green-500' : 
                            exam.score / exam.maxScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(exam.score / exam.maxScore) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {exam.description && (
                    <p className="text-gray-600 mt-3">{exam.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No past exams</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Exam Modal */}
      {showCreateExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule New Exam</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Exam title"
                value={newExam.title}
                onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <input
                type="date"
                value={newExam.date}
                onChange={(e) => setNewExam({...newExam, date: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <input
                type="time"
                value={newExam.time}
                onChange={(e) => setNewExam({...newExam, time: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newExam.duration}
                  onChange={(e) => setNewExam({...newExam, duration: parseInt(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="15"
                  step="15"
                />
              </div>
              
              <textarea
                placeholder="Description (optional)"
                value={newExam.description}
                onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="3"
              />
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button onClick={createExam} className="btn-primary flex-1">
                Schedule Exam
              </button>
              <button 
                onClick={() => setShowCreateExam(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Exams