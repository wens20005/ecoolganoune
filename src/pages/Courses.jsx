import React, { useState } from 'react'
import { Plus, Upload, Play, Lock, CheckCircle, FileText, AlertCircle } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import { fileUploadManager } from '../utils/fileUpload'

const Courses = () => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Introduction to Mathematics",
      lessons: [
        { id: 1, title: "Basic Arithmetic", completed: true, locked: false },
        { id: 2, title: "Algebra Fundamentals", completed: false, locked: false },
        { id: 3, title: "Geometry Basics", completed: false, locked: true },
      ]
    }
  ])

  const [showAddCourse, setShowAddCourse] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [newCourse, setNewCourse] = useState({ title: '', description: '' })
  const [uploadFeedback, setUploadFeedback] = useState({ show: false, type: '', message: '' })

  const addCourse = () => {
    if (newCourse.title.trim()) {
      setCourses([...courses, {
        id: Date.now(),
        title: newCourse.title,
        lessons: []
      }])
      setNewCourse({ title: '', description: '' })
      setShowAddCourse(false)
    }
  }

  const addLesson = (courseId, lessonTitle) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? {
            ...course,
            lessons: [
              ...course.lessons,
              {
                id: Date.now(),
                title: lessonTitle,
                completed: false,
                locked: course.lessons.length > 0
              }
            ]
          }
        : course
    ))
  }

  // Handle file upload success
  const handleUploadSuccess = (uploadResult, originalFile) => {
    if (selectedCourse) {
      // Add the uploaded file as a new lesson
      const lessonTitle = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || originalFile.name
      
      setCourses(courses.map(course => 
        course.id === selectedCourse.id 
          ? {
              ...course,
              lessons: [
                ...course.lessons,
                {
                  id: Date.now(),
                  title: lessonTitle,
                  completed: false,
                  locked: course.lessons.length > 0,
                  fileUrl: uploadResult.url,
                  fileName: originalFile.name,
                  fileSize: originalFile.size,
                  fileType: originalFile.type,
                  uploadedAt: uploadResult.uploadedAt
                }
              ]
            }
          : course
      ))
      
      showFeedback('success', `"${originalFile.name}" uploaded successfully!`)
    }
  }

  // Handle file upload error
  const handleUploadError = (error, originalFile) => {
    console.error('Upload failed:', error)
    showFeedback('error', `Failed to upload "${originalFile.name}": ${error.message}`)
  }

  // Show feedback message
  const showFeedback = (type, message) => {
    setUploadFeedback({ show: true, type, message })
    setTimeout(() => {
      setUploadFeedback({ show: false, type: '', message: '' })
    }, 5000)
  }

  // Open upload modal for a specific course
  const openUploadModal = (course) => {
    setSelectedCourse(course)
    setShowUploadModal(true)
  }

  // Close upload modal
  const closeUploadModal = () => {
    setShowUploadModal(false)
    setSelectedCourse(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-2">Organize and manage your lessons in sequence</p>
        </div>
        <button
          onClick={() => setShowAddCourse(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Course</h3>
            <input
              type="text"
              placeholder="Course title"
              value={newCourse.title}
              onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <textarea
              placeholder="Course description (optional)"
              value={newCourse.description}
              onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
            />
            <div className="flex space-x-3">
              <button onClick={addCourse} className="btn-primary flex-1">
                Create Course
              </button>
              <button 
                onClick={() => setShowAddCourse(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
              <button 
                onClick={() => openUploadModal(course)}
                className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
                title="Upload lesson files"
              >
                <Upload className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {course.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                    lesson.completed 
                      ? 'bg-green-50 border-green-200' 
                      : lesson.locked 
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">
                      {index + 1}.
                    </span>
                    <div className="flex items-center space-x-2">
                      {lesson.fileUrl && (
                        <FileText className="h-4 w-4 text-blue-500" title="Has attached file" />
                      )}
                      <span className={`font-medium ${
                        lesson.completed ? 'text-green-700' : 
                        lesson.locked ? 'text-gray-500' : 'text-blue-700'
                      }`}>
                        {lesson.title}
                      </span>
                    </div>
                    {lesson.fileName && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({lesson.fileName})
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {lesson.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {lesson.locked && <Lock className="h-5 w-5 text-gray-400" />}
                    {!lesson.completed && !lesson.locked && (
                      <button className="p-1 hover:bg-blue-200 rounded">
                        <Play className="h-4 w-4 text-blue-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add Lesson Button */}
              <button
                onClick={() => {
                  const title = prompt('Enter lesson title:')
                  if (title) addLesson(course.id, title)
                }}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors duration-200"
              >
                + Add Lesson
              </button>
            </div>
          </div>
        ))}
        
        {courses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first course</p>
            <button
              onClick={() => setShowAddCourse(true)}
              className="btn-primary"
            >
              Create Course
            </button>
          </div>
        )}
      </div>

      {/* File Upload Modal */}
      {showUploadModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Files to "{selectedCourse.title}"
              </h3>
              <button
                onClick={closeUploadModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                📚 Upload lesson materials like documents, videos, or images. 
                Each file will be added as a new lesson to this course.
              </p>
            </div>
            
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              path={`courses/${selectedCourse.id}/lessons`}
              multiple={true}
              maxFiles={10}
              acceptedTypes=".pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif,.mp3,.wav"
              showPreview={true}
            />
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeUploadModal}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Feedback */}
      {uploadFeedback.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          uploadFeedback.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {uploadFeedback.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                uploadFeedback.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {uploadFeedback.type === 'success' ? 'Upload Successful!' : 'Upload Failed!'}
              </p>
              <p className={`text-sm mt-1 ${
                uploadFeedback.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {uploadFeedback.message}
              </p>
            </div>
            <button
              onClick={() => setUploadFeedback({ show: false, type: '', message: '' })}
              className={`flex-shrink-0 ${
                uploadFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Courses