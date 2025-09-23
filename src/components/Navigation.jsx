import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  BookOpen, 
  FileEdit, 
  Calendar, 
  MessageCircle, 
  BarChart3,
  GraduationCap,
  Upload,
  TestTube
} from 'lucide-react'

const Navigation = () => {
  const location = useLocation()
  
  const tabs = [
    { id: 'demo', name: 'File Upload Demo', icon: Upload, path: '/demo' },
    { id: 'css-test', name: 'CSS Test', icon: TestTube, path: '/css-test' },
    { id: 'courses', name: 'Courses', icon: BookOpen, path: '/courses' },
    { id: 'exercises', name: 'Exercises', icon: FileEdit, path: '/exercises' },
    { id: 'exams', name: 'Exams', icon: Calendar, path: '/exams' },
    { id: 'chat', name: 'AI Chat', icon: MessageCircle, path: '/chat' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, path: '/analytics' },
  ]

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-800">EduApp</span>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = location.pathname === tab.path || 
                             (location.pathname === '/' && tab.path === '/courses')
              
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-primary-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t bg-gray-50">
          <div className="grid grid-cols-7 gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = location.pathname === tab.path || 
                             (location.pathname === '/' && tab.path === '/demo')
              
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation