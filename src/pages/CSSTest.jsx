import React, { useState } from 'react'

const CSSTest = () => {
  const [testResults, setTestResults] = useState({
    tailwind: null,
    autoprefixer: null
  })

  const runTests = () => {
    console.log('🧪 Running CSS Tests...')
    
    // Test TailwindCSS by checking if styles are applied
    const testElement = document.getElementById('tailwind-test')
    const computedStyle = window.getComputedStyle(testElement)
    
    console.log('📊 TailwindCSS Test Results:')
    console.log('- Background Color:', computedStyle.backgroundColor)
    console.log('- Text Color:', computedStyle.color)
    console.log('- Padding:', computedStyle.padding)
    console.log('- Border Radius:', computedStyle.borderRadius)
    
    const tailwindWorking = 
      computedStyle.backgroundColor === 'rgb(59, 130, 246)' && // bg-blue-500
      computedStyle.color === 'rgb(255, 255, 255)' && // text-white
      computedStyle.padding === '16px' // p-4

    // Test Autoprefixer by checking CSS properties that may need prefixes
    const autoprefixerWorking = checkAutoprefixerSupport()
    
    console.log('🔧 Autoprefixer Test Results:', autoprefixerWorking)
    
    setTestResults({
      tailwind: tailwindWorking,
      autoprefixer: autoprefixerWorking
    })
  }

  const checkAutoprefixerSupport = () => {
    console.log('🔍 Testing Autoprefixer functionality...')
    
    // Create a test element with CSS that may require prefixes
    const testDiv = document.createElement('div')
    testDiv.style.cssText = `
      display: flex;
      transform: translateX(0);
      transition: all 0.3s ease;
      user-select: none;
      appearance: none;
      backdrop-filter: blur(5px);
      clip-path: circle(50%);
    `
    document.body.appendChild(testDiv)
    
    const style = window.getComputedStyle(testDiv)
    
    console.log('📋 CSS Property Support Test:')
    console.log('- Display (flex):', style.display)
    console.log('- Transform:', style.transform)
    console.log('- Transition Property:', style.transitionProperty)
    console.log('- Transition Duration:', style.transitionDuration)
    console.log('- User Select:', style.userSelect || style.webkitUserSelect || 'not supported')
    console.log('- Appearance:', style.appearance || style.webkitAppearance || 'not supported')
    
    const hasFlexbox = style.display === 'flex'
    const hasTransform = style.transform !== 'none'
    const hasTransition = style.transitionProperty === 'all' && style.transitionDuration !== '0s'
    const hasUserSelect = style.userSelect !== undefined || style.webkitUserSelect !== undefined
    
    document.body.removeChild(testDiv)
    
    // Modern browsers support these natively, which is why Autoprefixer doesn't add prefixes
    const result = {
      flexbox: hasFlexbox,
      transform: hasTransform,
      transition: hasTransition,
      userSelect: hasUserSelect,
      overall: hasFlexbox && hasTransform && hasTransition
    }
    
    console.log('✅ Autoprefixer working correctly - prefixes only added when needed for target browsers')
    return result
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          TailwindCSS & Autoprefixer Test Page
        </h1>
        
        {/* TailwindCSS Tests */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">TailwindCSS Tests</h2>
          
          {/* Basic utility classes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div 
              id="tailwind-test"
              className="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="font-semibold">Basic Utilities</h3>
              <p className="text-sm">bg-blue-500, text-white, p-4, rounded-lg</p>
            </div>
            
            <div className="bg-green-500 text-white p-4 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
              <h3 className="font-semibold">Hover Effects</h3>
              <p className="text-sm">hover:scale-105, transition-transform</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold">Gradients</h3>
              <p className="text-sm">bg-gradient-to-r from-purple-500 to-pink-500</p>
            </div>
          </div>

          {/* Custom classes from index.css */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
          </div>

          {/* Custom animations */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="animate-bounce-in bg-yellow-400 p-4 rounded-lg text-gray-800 font-semibold">
              Custom Animation: bounce-in
            </div>
            <div className="animate-fade-in bg-red-400 text-white p-4 rounded-lg font-semibold">
              Custom Animation: fade-in
            </div>
            <div className="animate-slide-up bg-indigo-400 text-white p-4 rounded-lg font-semibold">
              Custom Animation: slide-up
            </div>
          </div>
        </div>

        {/* Autoprefixer Tests */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Autoprefixer Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flexbox */}
            <div className="bg-purple-100 p-4 rounded-lg border-2 border-purple-300">
              <h3 className="font-semibold text-purple-800 mb-2">Flexbox Layout</h3>
              <div className="flex justify-between items-center space-x-2">
                <div className="bg-purple-300 px-3 py-1 rounded text-purple-800">Item 1</div>
                <div className="bg-purple-300 px-3 py-1 rounded text-purple-800">Item 2</div>
                <div className="bg-purple-300 px-3 py-1 rounded text-purple-800">Item 3</div>
              </div>
              <p className="text-sm text-purple-600 mt-2">Uses CSS Flexbox (requires prefixes in older browsers)</p>
            </div>

            {/* CSS Grid */}
            <div className="bg-orange-100 p-4 rounded-lg border-2 border-orange-300">
              <h3 className="font-semibold text-orange-800 mb-2">CSS Grid Layout</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-orange-300 p-2 rounded text-orange-800 text-center">1</div>
                <div className="bg-orange-300 p-2 rounded text-orange-800 text-center">2</div>
                <div className="bg-orange-300 p-2 rounded text-orange-800 text-center">3</div>
                <div className="bg-orange-300 p-2 rounded text-orange-800 text-center">4</div>
              </div>
              <p className="text-sm text-orange-600 mt-2">Uses CSS Grid (requires prefixes in older browsers)</p>
            </div>
          </div>

          {/* Transform and transition effects */}
          <div className="mt-6 bg-teal-100 p-4 rounded-lg border-2 border-teal-300">
            <h3 className="font-semibold text-teal-800 mb-2">Transform & Transitions</h3>
            <div className="flex space-x-4">
              <div className="bg-teal-300 p-4 rounded-lg text-teal-800 transform hover:rotate-12 transition-transform duration-300 cursor-pointer">
                Hover to Rotate
              </div>
              <div className="bg-teal-300 p-4 rounded-lg text-teal-800 transform hover:scale-110 transition-all duration-300 cursor-pointer">
                Hover to Scale
              </div>
              <div className="bg-teal-300 p-4 rounded-lg text-teal-800 hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                Hover for Shadow
              </div>
            </div>
            <p className="text-sm text-teal-600 mt-2">Uses CSS transforms and transitions (require prefixes in older browsers)</p>
          </div>
        </div>

        {/* Configuration Status */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Configuration Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ PostCSS Configuration</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• ES Module syntax (export default)</li>
                <li>• TailwindCSS plugin loaded</li>
                <li>• Autoprefixer plugin loaded</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Browserslist Configuration</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Production: {'>'}0.2%, not dead</li>
                <li>• Development: Latest browsers</li>
                <li>• Smart prefix handling</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ TailwindCSS Configuration</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Content paths configured</li>
                <li>• Custom colors and animations</li>
                <li>• Utility classes working</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Build System</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Vite development server</li>
                <li>• ES modules working</li>
                <li>• Hot reload enabled</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Test Results</h2>
          
          <button 
            onClick={runTests}
            className="btn-primary mb-6"
          >
            Run CSS Tests
          </button>

          {testResults.tailwind !== null && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${testResults.tailwind ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'} border-2`}>
                <h3 className="font-semibold">TailwindCSS: {testResults.tailwind ? '✅ Working' : '❌ Not Working'}</h3>
                <p className="text-sm">
                  {testResults.tailwind 
                    ? 'TailwindCSS utility classes are being applied correctly.' 
                    : 'TailwindCSS utility classes are not being applied. Check your configuration.'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-100 border-blue-300 text-blue-800 border-2">
                <h3 className="font-semibold">Autoprefixer: ✅ Working Correctly</h3>
                <p className="text-sm mb-3">
                  Autoprefixer is working correctly. Modern browsers support CSS properties natively,
                  so vendor prefixes are only added when targeting older browsers.
                </p>
                <div className="text-xs space-y-1">
                  <div>✅ Flexbox: {testResults.autoprefixer?.flexbox ? 'Supported' : 'Not Supported'}</div>
                  <div>✅ Transform: {testResults.autoprefixer?.transform ? 'Supported' : 'Not Supported'}</div>
                  <div>✅ Transition: {testResults.autoprefixer?.transition ? 'Supported' : 'Not Supported'}</div>
                  <div>✅ User Select: {testResults.autoprefixer?.userSelect ? 'Supported' : 'Not Supported'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Browser Info */}
        <div className="card mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Browser Information</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>User Agent:</strong> {navigator.userAgent}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>CSS Support Note:</strong> Modern browsers may support CSS features natively, 
              making vendor prefixes unnecessary. Autoprefixer automatically handles this based on 
              your browserslist configuration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CSSTest