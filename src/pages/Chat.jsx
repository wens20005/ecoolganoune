import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Settings, Key, MessageCircle, Volume2, VolumeX, Play, Pause, Download } from 'lucide-react'
import TTSSettings from '../components/TTSSettings'
import { textToSpeechService } from '../services/textToSpeech'

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. I'm here to help you with any questions you have about your studies. What would you like to know?",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '')
  const [showSettings, setShowSettings] = useState(false)
  const [showTTSSettings, setShowTTSSettings] = useState(false)
  const [ttsSettings, setTtsSettings] = useState(textToSpeechService.getSettings())
  const [playingMessageId, setPlayingMessageId] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Set up TTS event callbacks
    textToSpeechService.setEventCallbacks({
      onStart: (utterance) => {
        // Find which message is being played
        const messageId = utterance.messageId
        if (messageId) setPlayingMessageId(messageId)
      },
      onEnd: () => {
        setPlayingMessageId(null)
      },
      onError: (error) => {
        setPlayingMessageId(null)
        console.error('TTS Error:', error)
      }
    })
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey)
    setShowSettings(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    if (!apiKey) {
      alert('Please set your OpenAI API key in settings first.')
      setShowSettings(true)
      return
    }

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsLoading(true)

    try {
      // Simulate AI response (replace with actual OpenAI API call)
      const response = await simulateAIResponse(newMessage)
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])

      // Auto-play TTS if enabled
      if (ttsSettings.enabled && ttsSettings.autoPlay) {
        setTimeout(() => {
          speakMessage(aiMessage)
        }, 500)
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I encountered an error. Please check your API key and try again.",
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate AI response (replace with actual OpenAI API call)
  const simulateAIResponse = async (message) => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    const responses = [
      "That's a great question! Let me help you understand this concept better.",
      "I can help you with that. Here's what you need to know...",
      "Based on your question, I think the best approach would be...",
      "Let me break this down for you step by step.",
      "That's an interesting topic! Here's some helpful information:",
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    if (message.toLowerCase().includes('math')) {
      return `${randomResponse} Mathematics is all about understanding patterns and logical thinking. Would you like me to help you with a specific math problem?`
    } else if (message.toLowerCase().includes('science')) {
      return `${randomResponse} Science is fascinating! It's about understanding how the world works through observation and experimentation. What area of science interests you?`
    } else {
      return `${randomResponse} I'm here to help with any academic questions you have. Feel free to ask about any subject!`
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const speakMessage = async (message) => {
    if (!ttsSettings.enabled || !message.text) return

    try {
      // Stop any currently playing message
      if (playingMessageId) {
        textToSpeechService.stop()
        setPlayingMessageId(null)
      }

      setPlayingMessageId(message.id)
      
      // Create a custom utterance with message ID for tracking
      const utterance = await textToSpeechService.speak(message.text)
      if (utterance) {
        utterance.messageId = message.id
      }
    } catch (error) {
      console.error('Failed to speak message:', error)
      setPlayingMessageId(null)
    }
  }

  const stopSpeaking = () => {
    textToSpeechService.stop()
    setPlayingMessageId(null)
  }

  const downloadMessageAudio = async (message) => {
    if (!message.text) return
    
    try {
      const filename = `ai-response-${message.id}.wav`
      await textToSpeechService.downloadAudio(message.text, filename)
    } catch (error) {
      console.error('Failed to download audio:', error)
    }
  }

  const handleTTSSettingsChange = (newSettings) => {
    setTtsSettings(newSettings)
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Chat Assistant</h1>
          <p className="text-gray-600 mt-2">Ask any question and get instant help</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowTTSSettings(true)}
            className={`btn-secondary flex items-center space-x-2 ${
              ttsSettings.enabled ? 'bg-green-50 border-green-200 text-green-700' : ''
            }`}
            title="Text-to-Speech Settings"
          >
            {ttsSettings.enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            <span>Voice</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="card h-full flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-600 text-white'
              }`}>
                {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              
              <div className={`flex-1 max-w-xs lg:max-w-md ${
                message.sender === 'user' ? 'text-right' : ''
              }`}>
                <div className={`p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  
                  {/* TTS Controls for AI messages */}
                  {message.sender === 'ai' && ttsSettings.enabled && (
                    <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => playingMessageId === message.id ? stopSpeaking() : speakMessage(message)}
                        className="flex items-center space-x-1 text-xs text-gray-600 hover:text-primary-600 transition-colors"
                        title={playingMessageId === message.id ? 'Stop speaking' : 'Read aloud'}
                      >
                        {playingMessageId === message.id ? (
                          <>
                            <Pause className="h-3 w-3" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" />
                            <span>Play</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => downloadMessageAudio(message)}
                        className="flex items-center space-x-1 text-xs text-gray-600 hover:text-primary-600 transition-colors"
                        title="Download audio"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                      
                      {playingMessageId === message.id && (
                        <div className="flex items-center space-x-1 text-xs text-primary-600">
                          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                          <span>Speaking...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your studies..."
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !newMessage.trim()}
            className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {!apiKey && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Please set your OpenAI API key in settings to use the AI assistant.
            </p>
          </div>
        )}

        {/* TTS Status */}
        {ttsSettings.enabled && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 flex items-center">
              <Volume2 className="h-4 w-4 mr-2" />
              Text-to-Speech is enabled - AI responses will be read aloud
              {ttsSettings.autoPlay && ' automatically'}
            </p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              API Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your API key is stored locally and never shared.
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">How to get your API key:</h4>
                <ol className="text-xs text-blue-800 space-y-1">
                  <li>1. Go to platform.openai.com</li>
                  <li>2. Sign up or log in to your account</li>
                  <li>3. Navigate to API Keys section</li>
                  <li>4. Create a new secret key</li>
                  <li>5. Copy and paste it here</li>
                </ol>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button onClick={saveApiKey} className="btn-primary flex-1">
                Save API Key
              </button>
              <button 
                onClick={() => setShowSettings(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TTS Settings Modal */}
      <TTSSettings 
        isOpen={showTTSSettings}
        onClose={() => setShowTTSSettings(false)}
        onSettingsChange={handleTTSSettingsChange}
      />
    </div>
  )
}

export default Chat