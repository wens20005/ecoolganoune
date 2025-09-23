// AI-Powered Smart Correction and Feedback System
import { databaseService } from '../database/services'

export class AICorrection {
  constructor() {
    this.apiKey = localStorage.getItem('openai_api_key') || ''
    this.baseURL = 'https://api.openai.com/v1'
  }

  // Analyze uploaded file content for educational insights
  async analyzeFileContent(file, fileContent) {
    try {
      const analysis = {
        fileType: file.type,
        size: file.size,
        name: file.name,
        insights: [],
        suggestions: [],
        difficulty: 'medium',
        estimatedTime: 10,
        subjects: [],
        keyTopics: []
      }

      // Basic file analysis
      if (file.type.includes('image')) {
        analysis.insights.push('Image file detected - consider adding text description for accessibility')
        analysis.subjects.push('Visual Learning')
      } else if (file.type.includes('pdf') || file.type.includes('document')) {
        analysis.insights.push('Document file - good for detailed study materials')
        analysis.subjects.push('Reading Comprehension')
      } else if (file.type.includes('video')) {
        analysis.insights.push('Video content - excellent for visual learners')
        analysis.subjects.push('Multimedia Learning')
        analysis.estimatedTime = Math.max(20, Math.ceil(file.size / (1024 * 1024)) * 5)
      }

      // Content-based analysis (if text content is available)
      if (fileContent && typeof fileContent === 'string') {
        const contentAnalysis = await this.analyzeTextContent(fileContent)
        analysis.insights.push(...contentAnalysis.insights)
        analysis.suggestions.push(...contentAnalysis.suggestions)
        analysis.keyTopics.push(...contentAnalysis.keyTopics)
        analysis.difficulty = contentAnalysis.difficulty
      }

      // AI-powered analysis (if API key is available)
      if (this.apiKey && fileContent) {
        try {
          const aiAnalysis = await this.performAIAnalysis(fileContent, file.name)
          analysis.insights.push(...aiAnalysis.insights)
          analysis.suggestions.push(...aiAnalysis.suggestions)
          analysis.subjects.push(...aiAnalysis.subjects)
        } catch (error) {
          console.warn('AI analysis failed, using fallback:', error.message)
        }
      }

      return analysis
    } catch (error) {
      console.error('Error analyzing file content:', error)
      return this.getDefaultAnalysis(file)
    }
  }

  // Analyze text content for educational value
  async analyzeTextContent(content) {
    const analysis = {
      insights: [],
      suggestions: [],
      keyTopics: [],
      difficulty: 'medium'
    }

    const wordCount = content.split(/\s+/).length
    const sentences = content.split(/[.!?]+/).length
    const avgWordsPerSentence = wordCount / sentences

    // Basic readability analysis
    if (avgWordsPerSentence > 20) {
      analysis.difficulty = 'hard'
      analysis.insights.push('Complex sentence structure detected - may be challenging for beginners')
      analysis.suggestions.push('Consider breaking down long sentences for better readability')
    } else if (avgWordsPerSentence < 10) {
      analysis.difficulty = 'easy'
      analysis.insights.push('Simple sentence structure - good for beginners')
    }

    // Keyword extraction (basic implementation)
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can']
    const words = content.toLowerCase().match(/\b\w+\b/g) || []
    const wordFreq = {}
    
    words.forEach(word => {
      if (word.length > 3 && !commonWords.includes(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    })

    // Get top keywords
    const topKeywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)

    analysis.keyTopics.push(...topKeywords)

    // Subject detection based on keywords
    const subjects = this.detectSubjects(content)
    analysis.insights.push(`Detected subjects: ${subjects.join(', ') || 'General'}`)

    // Educational value assessment
    if (wordCount > 500) {
      analysis.insights.push('Comprehensive content - suitable for in-depth study')
    } else if (wordCount < 100) {
      analysis.insights.push('Brief content - good for quick review or introduction')
      analysis.suggestions.push('Consider expanding with more examples or explanations')
    }

    return analysis
  }

  // Detect subjects based on content keywords
  detectSubjects(content) {
    const subjectKeywords = {
      'Mathematics': ['math', 'equation', 'number', 'calculate', 'formula', 'algebra', 'geometry', 'calculus', 'statistics'],
      'Science': ['experiment', 'hypothesis', 'theory', 'molecule', 'atom', 'biology', 'chemistry', 'physics', 'research'],
      'History': ['ancient', 'century', 'war', 'empire', 'civilization', 'historical', 'period', 'culture', 'society'],
      'English': ['literature', 'grammar', 'writing', 'essay', 'paragraph', 'poetry', 'novel', 'author', 'language'],
      'Geography': ['continent', 'country', 'climate', 'map', 'region', 'population', 'capital', 'mountain', 'river'],
      'Computer Science': ['programming', 'algorithm', 'code', 'computer', 'software', 'data', 'technology', 'digital']
    }

    const subjects = []
    const lowerContent = content.toLowerCase()

    Object.entries(subjectKeywords).forEach(([subject, keywords]) => {
      const matches = keywords.filter(keyword => lowerContent.includes(keyword))
      if (matches.length >= 2) {
        subjects.push(subject)
      }
    })

    return subjects
  }

  // Perform AI analysis using OpenAI API
  async performAIAnalysis(content, filename) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not provided')
    }

    const prompt = `Analyze this educational content from file "${filename}":

${content.substring(0, 2000)}

Please provide:
1. Educational insights (what this content teaches)
2. Learning suggestions (how to improve understanding)
3. Subject areas this content covers
4. Key learning objectives

Respond in JSON format with arrays for insights, suggestions, and subjects.`

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an AI educational analyst that provides insights about learning materials.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      // Try to parse JSON response
      try {
        return JSON.parse(aiResponse)
      } catch {
        // If JSON parsing fails, extract information manually
        return this.parseAIResponse(aiResponse)
      }
    } catch (error) {
      console.error('AI API call failed:', error)
      throw error
    }
  }

  // Parse AI response when JSON parsing fails
  parseAIResponse(response) {
    const result = {
      insights: [],
      suggestions: [],
      subjects: []
    }

    // Extract insights
    const insightMatch = response.match(/insights?:?\s*(.+?)(?=suggestions?|subjects?|$)/is)
    if (insightMatch) {
      const insights = insightMatch[1].split(/[•\-\n]/).filter(item => item.trim().length > 10)
      result.insights = insights.map(item => item.trim()).slice(0, 3)
    }

    // Extract suggestions
    const suggestionMatch = response.match(/suggestions?:?\s*(.+?)(?=insights?|subjects?|$)/is)
    if (suggestionMatch) {
      const suggestions = suggestionMatch[1].split(/[•\-\n]/).filter(item => item.trim().length > 10)
      result.suggestions = suggestions.map(item => item.trim()).slice(0, 3)
    }

    // Extract subjects
    const subjectMatch = response.match(/subjects?:?\s*(.+?)(?=insights?|suggestions?|$)/is)
    if (subjectMatch) {
      const subjects = subjectMatch[1].split(/[,•\-\n]/).filter(item => item.trim().length > 2)
      result.subjects = subjects.map(item => item.trim().replace(/[^\w\s]/g, '')).slice(0, 3)
    }

    return result
  }

  // Generate smart feedback for student submissions
  async generateFeedback(studentAnswer, correctAnswer, question, context = {}) {
    const feedback = {
      isCorrect: false,
      score: 0,
      explanation: '',
      suggestions: [],
      encouragement: '',
      nextSteps: []
    }

    // Basic correctness check
    const isCorrect = this.checkAnswer(studentAnswer, correctAnswer)
    feedback.isCorrect = isCorrect
    feedback.score = isCorrect ? (context.maxScore || 20) : 0

    if (isCorrect) {
      feedback.encouragement = this.getPositiveFeedback()
      feedback.explanation = `Excellent! "${studentAnswer}" is correct.`
      feedback.nextSteps = ['Continue to the next question', 'Review related concepts for deeper understanding']
    } else {
      feedback.encouragement = this.getConstructiveFeedback()
      feedback.explanation = `Not quite right. The correct answer is "${correctAnswer}".`
      feedback.suggestions = await this.generateImprovementSuggestions(studentAnswer, correctAnswer, question)
      feedback.nextSteps = ['Review the explanation', 'Try similar practice questions', 'Ask for help if needed']
    }

    // AI-enhanced feedback (if available)
    if (this.apiKey) {
      try {
        const aiEnhancement = await this.enhanceFeedbackWithAI(studentAnswer, correctAnswer, question, isCorrect)
        feedback.explanation = aiEnhancement.explanation || feedback.explanation
        feedback.suggestions.push(...(aiEnhancement.suggestions || []))
      } catch (error) {
        console.warn('AI feedback enhancement failed:', error.message)
      }
    }

    return feedback
  }

  // Check if student answer matches correct answer
  checkAnswer(studentAnswer, correctAnswer) {
    if (!studentAnswer || !correctAnswer) return false
    
    const normalize = (str) => str.toString().toLowerCase().trim().replace(/[^\w\s]/g, '')
    
    const normalizedStudent = normalize(studentAnswer)
    const normalizedCorrect = normalize(correctAnswer)
    
    // Exact match
    if (normalizedStudent === normalizedCorrect) return true
    
    // Numeric answers
    const studentNum = parseFloat(studentAnswer)
    const correctNum = parseFloat(correctAnswer)
    if (!isNaN(studentNum) && !isNaN(correctNum)) {
      return Math.abs(studentNum - correctNum) < 0.01
    }
    
    // Partial credit for close answers
    const similarity = this.calculateSimilarity(normalizedStudent, normalizedCorrect)
    return similarity > 0.8
  }

  // Calculate string similarity
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  // Levenshtein distance calculation
  levenshteinDistance(str1, str2) {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // Generate improvement suggestions
  async generateImprovementSuggestions(studentAnswer, correctAnswer, question) {
    const suggestions = []
    
    // Basic suggestions based on answer type
    if (this.isNumericAnswer(correctAnswer)) {
      suggestions.push('Double-check your calculations')
      suggestions.push('Make sure you\'re using the right formula')
      suggestions.push('Pay attention to units and decimal places')
    } else {
      suggestions.push('Read the question carefully')
      suggestions.push('Look for key terms in the question')
      suggestions.push('Consider reviewing related study materials')
    }
    
    // Analyze common mistakes
    if (studentAnswer && correctAnswer) {
      const studentWords = studentAnswer.toLowerCase().split(/\s+/)
      const correctWords = correctAnswer.toLowerCase().split(/\s+/)
      
      const commonWords = studentWords.filter(word => correctWords.includes(word))
      if (commonWords.length > 0) {
        suggestions.push('You\'re on the right track - some parts of your answer are correct')
      }
    }
    
    return suggestions.slice(0, 3) // Limit to 3 suggestions
  }

  // Enhance feedback using AI
  async enhanceFeedbackWithAI(studentAnswer, correctAnswer, question, isCorrect) {
    const prompt = `Student Question: "${question}"
Correct Answer: "${correctAnswer}"
Student Answer: "${studentAnswer}"
Result: ${isCorrect ? 'Correct' : 'Incorrect'}

Provide educational feedback that:
1. Explains why the answer is ${isCorrect ? 'correct' : 'incorrect'}
2. Gives specific learning suggestions
3. Encourages the student

Keep it supportive and educational. Respond in JSON format.`

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a supportive AI tutor providing constructive feedback to students.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      })

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      try {
        return JSON.parse(aiResponse)
      } catch {
        return {
          explanation: aiResponse.substring(0, 200),
          suggestions: ['Review the concept again', 'Practice similar problems']
        }
      }
    } catch (error) {
      console.error('AI feedback enhancement failed:', error)
      return {}
    }
  }

  // Get positive feedback messages
  getPositiveFeedback() {
    const messages = [
      'Excellent work! 🌟',
      'Perfect! You\'ve got it! 🎉',
      'Outstanding! Keep it up! 🚀',
      'Brilliant answer! 💡',
      'Well done! 👏',
      'Fantastic! You\'re doing great! ✨',
      'Superb! That\'s exactly right! 🎯'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Get constructive feedback messages
  getConstructiveFeedback() {
    const messages = [
      'Good effort! Let\'s learn from this. 💪',
      'Not quite, but you\'re learning! 🌱',
      'Close! Keep practicing! 📚',
      'Good try! Let\'s work on this together. 🤝',
      'Learning opportunity! Don\'t give up! 🎯',
      'Nice attempt! Here\'s how to improve. 📈',
      'Keep going! Every mistake is a step forward! 🔄'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Check if answer is numeric
  isNumericAnswer(answer) {
    return !isNaN(parseFloat(answer)) && isFinite(answer)
  }

  // Get default analysis for files when AI is not available
  getDefaultAnalysis(file) {
    return {
      fileType: file.type,
      size: file.size,
      name: file.name,
      insights: ['File uploaded successfully for review'],
      suggestions: ['Review the content and add descriptions if needed'],
      difficulty: 'medium',
      estimatedTime: Math.max(5, Math.ceil(file.size / (1024 * 1024)) * 2),
      subjects: ['General'],
      keyTopics: []
    }
  }

  // Update API key
  setApiKey(apiKey) {
    this.apiKey = apiKey
    localStorage.setItem('openai_api_key', apiKey)
  }

  // Check if AI features are available
  isAIAvailable() {
    return Boolean(this.apiKey)
  }
}

// Create singleton instance
export const aiCorrection = new AICorrection()
export default aiCorrection