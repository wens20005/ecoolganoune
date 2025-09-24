import { useState, useRef } from 'react'
import { Plus, Play, Star, Trophy, Volume2, Upload, FileText, Edit } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import Notification from '../components/Notification'

const Exercises = () => {
  const [exercises, setExercises] = useState([
    {
      id: 1,
      title: "Basic Math Quiz",
      questions: [
        { id: 1, question: "What is 2 + 2?", answer: "4", type: "text" },
        { id: 2, question: "What is 5 × 3?", answer: "15", type: "text" }
      ],
      maxScore: 20
    }
  ])

  const [showCreateExercise, setShowCreateExercise] = useState(false)
  const [activeExercise, setActiveExercise] = useState(null)
  const [userAnswers, setUserAnswers] = useState({})
  const [score, setScore] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '' })
  
  const audioRef = useRef(null)

  const playSound = (type) => {
    // In a real app, you would have actual sound files
    const context = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    
    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(523.25, context.currentTime) // C note
      oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1) // E note
      oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2) // G note
    } else {
      oscillator.frequency.setValueAtTime(200, context.currentTime)
      oscillator.frequency.setValueAtTime(150, context.currentTime + 0.1)
    }
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3)
    
    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.3)
  }

  // Handle exercise file upload
  const handleExerciseUpload = (uploadResult, originalFile) => {
    // Create a new exercise from uploaded file
    const exerciseTitle = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || originalFile.name
    
    const newExercise = {
      id: Date.now(),
      title: exerciseTitle,
      description: `Exercise created from uploaded file: ${originalFile.name}`,
      questions: [
        {
          id: Date.now() + 1,
          question: "Complete this exercise based on the uploaded material",
          answer: "completed",
          type: "text",
          explanation: "Review the uploaded material and mark as completed when done."
        }
      ],
      maxScore: 20,
      timeLimit: 30,
      difficulty: "medium",
      subject: "General",
      fileUrl: uploadResult.url,
      fileName: originalFile.name,
      fileSize: originalFile.size,
      uploadedAt: uploadResult.uploadedAt
    }
    
    setExercises([...exercises, newExercise])
    showNotification('success', 'Exercise Created!', `"${originalFile.name}" has been converted to an exercise.`)
  }

  // Handle upload error
  const handleUploadError = (error, originalFile) => {
    console.error('Upload failed:', error)
    showNotification('error', 'Upload Failed!', `Failed to upload "${originalFile.name}": ${error.message}`)
  }

  // Show notification
  const showNotification = (type, title, message) => {
    setNotification({ show: true, type, title, message })
  }

  // Close notification
  const closeNotification = () => {
    setNotification({ show: false, type: '', title: '', message: '' })
  }

  const submitExercise = () => {
    if (!activeExercise) return
    
    let correctAnswers = 0
    const totalQuestions = activeExercise.questions.length
    
    activeExercise.questions.forEach(question => {
      if (userAnswers[question.id]?.toLowerCase().trim() === question.answer.toLowerCase().trim()) {
        correctAnswers++
      }
    })
    
    const finalScore = Math.round((correctAnswers / totalQuestions) * 20)
    setScore(finalScore)
    setShowResults(true)
    
    if (finalScore === 20) {
      playSound('correct')
      // Trigger fireworks animation
    } else if (finalScore >= 15) {
      playSound('correct')
    } else {
      playSound('incorrect')
    }
  }

  const ScoreAnimation = ({ score }) => {
    if (score === 20) {
      return (
        <div className="text-center py-8">
          <div className="animate-bounce-in">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-yellow-600 mb-2">Perfect Score!</h3>
            <p className="text-lg">🎉 Bravo! You got {score}/20! 🎉</p>
          </div>
          {/* Fireworks effect */}
          <div className="fireworks">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`firework animate-ping delay-${i * 100}`} 
                   style={{
                     left: `${20 + i * 15}%`,
                     top: `${30 + (i % 2) * 20}%`,
                     animationDelay: `${i * 0.2}s`
                   }}>
                ⭐
              </div>
            ))}
          </div>
        </div>
      )
    } else if (score >= 15) {
      return (
        <div className="text-center py-8 animate-bounce-in">
          <Star className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-600 mb-2">Great Job!</h3>
          <p className="text-lg">Bravo! You scored {score}/20!</p>
        </div>
      )
    } else {
      return (
        <div className="text-center py-8 animate-fade-in">
          <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-orange-600 text-xl">📚</span>
          </div>
          <h3 className="text-xl font-bold text-orange-600 mb-2">Keep Practicing!</h3>
          <p className="text-lg">You scored {score}/20. Try again to improve!</p>
        </div>
      )
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercises</h1>
          <p className="text-gray-600 mt-2">Practice with auto-corrected exercises</p>
        </div>
        <button
          onClick={() => setShowCreateExercise(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Exercise</span>
        </button>
      </div>

      {/* Exercise Taking View */}
      {activeExercise && !showResults && (
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{activeExercise.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{activeExercise.questions.length} questions</span>
              <span>Max Score: {activeExercise.maxScore}</span>
            </div>
          </div>

          <div className="space-y-6">
            {activeExercise.questions.map((question, index) => (
              <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">
                  {index + 1}. {question.question}
                </h3>
                <input
                  type="text"
                  placeholder="Your answer..."
                  value={userAnswers[question.id] || ''}
                  onChange={(e) => setUserAnswers({
                    ...userAnswers,
                    [question.id]: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => {
                setActiveExercise(null)
                setUserAnswers({})
                setScore(null)
                setShowResults(false)
              }}
              className="btn-secondary"
            >
              Back to Exercises
            </button>
            <button
              onClick={submitExercise}
              className="btn-primary"
            >
              Submit Exercise
            </button>
          </div>
        </div>
      )}

      {/* Results View */}
      {showResults && (
        <div className="card">
          <ScoreAnimation score={score} />
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setActiveExercise(null)
                setUserAnswers({})
                setScore(null)
                setShowResults(false)
              }}
              className="btn-primary mr-4"
            >
              Back to Exercises
            </button>
            <button
              onClick={() => {
                setUserAnswers({})
                setScore(null)
                setShowResults(false)
              }}
              className="btn-secondary"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Exercises List */}
      {!activeExercise && !showResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="card hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{exercise.title}</h3>
              <div className="text-sm text-gray-600 mb-4">
                <p>{exercise.questions.length} questions</p>
                <p>Max Score: {exercise.maxScore}</p>
              </div>
              <button
                onClick={() => setActiveExercise(exercise)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Start Exercise</span>
              </button>
            </div>
          ))}
          
          {exercises.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Edit className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises yet</h3>
              <p className="text-gray-500 mb-4">Create your first exercise to get started</p>
              <button
                onClick={() => setShowCreateExercise(true)}
                className="btn-primary"
              >
                Create Exercise
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Exercise Modal */}
      {showCreateExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Exercise</h3>
            <p className="text-gray-600 mb-4">You can create exercises manually or upload exercise files that will be converted to interactive exercises.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => {
                  setShowCreateExercise(false)
                  setShowUploadModal(true)
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
              >
                <Upload className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Upload Files</h4>
                <p className="text-sm text-gray-600">Upload PDFs, documents, or images to create exercises</p>
              </button>
              
              <button
                onClick={() => {
                  // Future: Manual exercise creation
                  showNotification('info', 'Coming Soon!', 'Manual exercise creation will be available in the next update.')
                  setShowCreateExercise(false)
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
              >
                <FileText className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Create Manually</h4>
                <p className="text-sm text-gray-600">Build exercises with custom questions and answers</p>
              </button>
            </div>
            
            <button 
              onClick={() => setShowCreateExercise(false)}
              className="btn-secondary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Upload Exercise Files Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Exercise Materials
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                📝 Upload exercise materials like PDFs, Word documents, or images. 
                Each file will be converted into an interactive exercise.
              </p>
            </div>
            
            <FileUpload
              onUploadSuccess={handleExerciseUpload}
              onUploadError={handleUploadError}
              path="exercises/materials"
              multiple={true}
              maxFiles={5}
              acceptedTypes=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              showPreview={true}
            />
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={closeNotification}
      />

      {/* Fireworks Animation */}
      <style>{`
        .firework {
          position: absolute;
          font-size: 2rem;
          pointer-events: none;
        }
        .fireworks {
          position: relative;
          height: 100px;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default Exercises