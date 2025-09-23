import React, { useState, useEffect } from 'react'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Award, 
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Brain,
  Zap
} from 'lucide-react'
import { databaseService } from '../services/database'

const GradingSystem = ({ 
  fileId, 
  studentId, 
  teacherId, 
  onGradeSubmitted,
  mode = 'teacher' // 'teacher' or 'student'
}) => {
  const [grade, setGrade] = useState({
    score: 0,
    maxScore: 20,
    feedback: '',
    suggestions: [],
    strengths: [],
    rubricScores: {}
  })
  
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [existingGrade, setExistingGrade] = useState(null)
  const [showAIHelper, setShowAIHelper] = useState(false)

  // Rubric criteria
  const rubricCriteria = [
    { id: 'content', name: 'Content Quality', maxPoints: 5, description: 'Accuracy and depth of content' },
    { id: 'organization', name: 'Organization', maxPoints: 4, description: 'Structure and logical flow' },
    { id: 'creativity', name: 'Creativity', maxPoints: 4, description: 'Original thinking and innovation' },
    { id: 'presentation', name: 'Presentation', maxPoints: 4, description: 'Visual appeal and clarity' },
    { id: 'effort', name: 'Effort', maxPoints: 3, description: 'Demonstrated effort and completion' }
  ]

  // Load existing grade if any
  useEffect(() => {
    if (fileId) {
      loadExistingGrade()
      if (mode === 'teacher') {
        generateAIAnalysis()
      }
    }
  }, [fileId])

  const loadExistingGrade = async () => {
    try {
      const grades = await databaseService.query('grades', [
        { field: 'fileId', operator: '==', value: fileId }
      ])
      
      if (grades.length > 0) {
        const existingGrade = grades[0]
        setExistingGrade(existingGrade)
        setGrade({
          score: existingGrade.score || 0,
          maxScore: existingGrade.maxScore || 20,
          feedback: existingGrade.feedback || '',
          suggestions: existingGrade.suggestions || [],
          strengths: existingGrade.strengths || [],
          rubricScores: existingGrade.rubricScores || {}
        })
      }
    } catch (error) {
      console.error('Error loading existing grade:', error)
    }
  }

  // Generate AI analysis and suggestions
  const generateAIAnalysis = async () => {
    try {
      setLoading(true)
      
      // Simulate AI analysis (in production, integrate with actual AI service)
      const mockAnalysis = await simulateAIAnalysis()
      setAiAnalysis(mockAnalysis)
      
      // Pre-populate some suggestions based on AI analysis
      if (mockAnalysis.detectedIssues.length > 0) {
        setGrade(prev => ({
          ...prev,
          suggestions: mockAnalysis.recommendations
        }))
      }
      
    } catch (error) {
      console.error('Error generating AI analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  // Simulate AI analysis
  const simulateAIAnalysis = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      autoScore: Math.floor(Math.random() * 5) + 15, // 15-20 range
      complexity: Math.floor(Math.random() * 10) + 1,
      readability: Math.floor(Math.random() * 100) + 1,
      detectedIssues: [
        'Minor formatting inconsistencies detected',
        'Could benefit from more detailed explanations'
      ],
      recommendations: [
        'Consider adding more examples to support main points',
        'Improve visual hierarchy with better headings',
        'Check spelling and grammar for minor errors'
      ],
      strengths: [
        'Clear structure and organization',
        'Good use of supporting evidence',
        'Demonstrates understanding of key concepts'
      ]
    }
  }

  // Handle rubric score change
  const handleRubricChange = (criteriaId, points) => {
    const newRubricScores = {
      ...grade.rubricScores,
      [criteriaId]: points
    }
    
    // Calculate total score from rubric
    const totalScore = Object.values(newRubricScores).reduce((sum, score) => sum + (score || 0), 0)
    
    setGrade(prev => ({
      ...prev,
      rubricScores: newRubricScores,
      score: totalScore
    }))
  }

  // Add suggestion
  const addSuggestion = (suggestion) => {
    if (suggestion.trim() && !grade.suggestions.includes(suggestion.trim())) {
      setGrade(prev => ({
        ...prev,
        suggestions: [...prev.suggestions, suggestion.trim()]
      }))
    }
  }

  // Remove suggestion
  const removeSuggestion = (index) => {
    setGrade(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter((_, i) => i !== index)
    }))
  }

  // Add strength
  const addStrength = (strength) => {
    if (strength.trim() && !grade.strengths.includes(strength.trim())) {
      setGrade(prev => ({
        ...prev,
        strengths: [...prev.strengths, strength.trim()]
      }))
    }
  }

  // Remove strength
  const removeStrength = (index) => {
    setGrade(prev => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index)
    }))
  }

  // Submit grade
  const submitGrade = async () => {
    try {
      setLoading(true)
      
      const gradeData = {
        fileId,
        studentId,
        teacherId,
        score: grade.score,
        maxScore: grade.maxScore,
        grade: calculateLetterGrade(grade.score, grade.maxScore),
        percentage: Math.round((grade.score / grade.maxScore) * 100),
        feedback: grade.feedback,
        suggestions: grade.suggestions,
        strengths: grade.strengths,
        rubricScores: grade.rubricScores,
        aiAnalysis: aiAnalysis,
        status: 'published',
        isVisible: true
      }
      
      let gradeId
      if (existingGrade) {
        await databaseService.update('grades', existingGrade.id, gradeData)
        gradeId = existingGrade.id
      } else {
        gradeId = await databaseService.createGrade(gradeData)
      }
      
      // Create notification for student
      await databaseService.createNotification({
        userId: studentId,
        title: 'New Grade Available',
        message: `You received a grade of ${grade.score}/${grade.maxScore} on your submission`,
        type: 'grade',
        actionType: 'view_grade',
        actionData: { gradeId },
        priority: 'normal'
      })
      
      if (onGradeSubmitted) {
        onGradeSubmitted(gradeData)
      }
      
    } catch (error) {
      console.error('Error submitting grade:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate letter grade
  const calculateLetterGrade = (score, maxScore) => {
    const percentage = (score / maxScore) * 100
    
    if (percentage >= 97) return 'A+'
    if (percentage >= 93) return 'A'
    if (percentage >= 90) return 'A-'
    if (percentage >= 87) return 'B+'
    if (percentage >= 83) return 'B'
    if (percentage >= 80) return 'B-'
    if (percentage >= 77) return 'C+'
    if (percentage >= 73) return 'C'
    if (percentage >= 70) return 'C-'
    if (percentage >= 67) return 'D+'
    if (percentage >= 65) return 'D'
    return 'F'
  }

  // AI Helper Component
  const AIHelper = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <Brain className="h-5 w-5 text-blue-600" />
        <h3 className="font-medium text-blue-900">AI Grading Assistant</h3>
      </div>
      
      {loading ? (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Analyzing submission...</span>
        </div>
      ) : aiAnalysis ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{aiAnalysis.autoScore}/20</div>
              <div className="text-blue-700">Suggested Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{aiAnalysis.complexity}/10</div>
              <div className="text-blue-700">Complexity</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{aiAnalysis.readability}%</div>
              <div className="text-blue-700">Readability</div>
            </div>
          </div>
          
          {aiAnalysis.strengths.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-1">Detected Strengths:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {aiAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                    <button
                      onClick={() => addStrength(strength)}
                      className="text-green-600 hover:text-green-800 text-xs"
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {aiAnalysis.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Suggestions for Improvement:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {aiAnalysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                    <button
                      onClick={() => addSuggestion(rec)}
                      className="text-yellow-600 hover:text-yellow-800 text-xs"
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )

  if (mode === 'student' && existingGrade) {
    // Student view - display grade results
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-600 mb-2">
            {existingGrade.score}/{existingGrade.maxScore}
          </div>
          <div className="text-xl font-medium text-gray-700">
            {existingGrade.grade} ({existingGrade.percentage}%)
          </div>
        </div>
        
        {existingGrade.feedback && (
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-2">Teacher Feedback</h3>
            <p className="text-gray-700">{existingGrade.feedback}</p>
          </div>
        )}
        
        {existingGrade.strengths?.length > 0 && (
          <div className="card">
            <h3 className="font-medium text-green-800 mb-2 flex items-center">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Strengths
            </h3>
            <ul className="space-y-1">
              {existingGrade.strengths.map((strength, index) => (
                <li key={index} className="text-green-700 flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {existingGrade.suggestions?.length > 0 && (
          <div className="card">
            <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Areas for Improvement
            </h3>
            <ul className="space-y-1">
              {existingGrade.suggestions.map((suggestion, index) => (
                <li key={index} className="text-yellow-700 flex items-start space-x-2">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // Teacher grading interface
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* AI Helper */}
      {showAIHelper && <AIHelper />}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Grade Submission</h2>
        <button
          onClick={() => setShowAIHelper(!showAIHelper)}
          className="btn-secondary flex items-center space-x-2"
        >
          <Brain className="h-4 w-4" />
          <span>AI Assistant</span>
        </button>
      </div>

      {/* Rubric Grading */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rubric Assessment</h3>
        <div className="space-y-4">
          {rubricCriteria.map(criteria => (
            <div key={criteria.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{criteria.name}</h4>
                  <p className="text-sm text-gray-600">{criteria.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-600">
                    {grade.rubricScores[criteria.id] || 0}/{criteria.maxPoints}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-3">
                {[...Array(criteria.maxPoints + 1)].map((_, points) => (
                  <button
                    key={points}
                    onClick={() => handleRubricChange(criteria.id, points)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      (grade.rubricScores[criteria.id] || 0) === points
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {points}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              Total Score: {grade.score}/{grade.maxScore}
            </div>
            <div className="text-lg text-primary-700">
              {calculateLetterGrade(grade.score, grade.maxScore)} ({Math.round((grade.score / grade.maxScore) * 100)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Written Feedback</h3>
        <textarea
          value={grade.feedback}
          onChange={(e) => setGrade(prev => ({ ...prev, feedback: e.target.value }))}
          placeholder="Provide detailed feedback for the student..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={submitGrade}
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Award className="h-4 w-4" />
          )}
          <span>{existingGrade ? 'Update Grade' : 'Submit Grade'}</span>
        </button>
      </div>
    </div>
  )
}

export default GradingSystem