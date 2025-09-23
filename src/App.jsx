import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Courses from './pages/Courses'
import Exercises from './pages/Exercises'
import Exams from './pages/Exams'
import Chat from './pages/Chat'
import Analytics from './pages/Analytics'
import FileUploadDemo from './pages/FileUploadDemo'
import TTSDemo from './pages/TTSDemo'
import CSSTest from './pages/CSSTest'

function App() {
  const [activeTab, setActiveTab] = useState('courses')

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<FileUploadDemo />} />
            <Route path="/demo" element={<FileUploadDemo />} />
            <Route path="/tts-demo" element={<TTSDemo />} />
            <Route path="/css-test" element={<CSSTest />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App