import { useState } from 'react';
import { Volume2, Play, Download, Languages } from 'lucide-react';
import { textToSpeechService } from '../services/textToSpeech';

const TTSDemo = () => {
  const [demoText, setDemoText] = useState(
    "Bonjour! Je suis votre assistant IA educatif. مرحبا! أنا مساعدك الذكي التعليمي. Hello! I am your educational AI assistant."
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');

  const languages = {
    'ar-SA': { name: 'العربية (Arabic)', sample: 'مرحبا! أنا مساعدك الذكي التعليمي. يمكنني مساعدتك في دراستك.' },
    'fr-FR': { name: 'Français (French)', sample: 'Bonjour! Je suis votre assistant IA educatif. Je peux vous aider.' },
    'en-US': { name: 'English (US)', sample: 'Hello! I am your educational AI assistant. I can help you with your studies.' },
    'en-GB': { name: 'English (UK)', sample: 'Hello! I am your educational AI assistant. I can help you with your studies.' }
  };

  const handlePlay = async () => {
    if (isPlaying) {
      textToSpeechService.stop();
      setIsPlaying(false);
    } else {
      try {
        setIsPlaying(true);
        await textToSpeechService.speak(demoText, { language: currentLanguage });
        setIsPlaying(false);
      } catch (error) {
        console.error('TTS Error:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleLanguageChange = (language) => {
    setCurrentLanguage(language);
    setDemoText(languages[language].sample);
    textToSpeechService.updateSettings({ language });
  };

  const handleDownload = async () => {
    try {
      await textToSpeechService.downloadAudio(demoText, `demo-${currentLanguage}.wav`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Volume2 className="h-8 w-8 mr-3 text-primary-600" />
          Text-to-Speech Demo
        </h1>
        <p className="text-gray-600">
          Test the multilingual voice capabilities of your AI assistant
        </p>
      </div>

      <div className="card space-y-6">
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Languages className="h-4 w-4 mr-2" />
            Select Language
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  currentLanguage === code
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">{lang.name}</div>
                <div className="text-sm text-gray-600 mt-1">{lang.sample.substring(0, 50)}...</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text to Speech */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text to Speak
          </label>
          <textarea
            value={demoText}
            onChange={(e) => setDemoText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows="4"
            placeholder="Enter text to speak..."
          />
        </div>

        {/* Controls */}
        <div className="flex space-x-3">
          <button
            onClick={handlePlay}
            disabled={!demoText.trim()}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-5 w-5" />
            <span>{isPlaying ? 'Stop Speaking' : 'Speak Text'}</span>
          </button>
          
          <button
            onClick={handleDownload}
            disabled={!demoText.trim()}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-5 w-5" />
            <span>Download Audio</span>
          </button>
        </div>

        {/* Status */}
        {isPlaying && (
          <div className="flex items-center space-x-2 text-primary-600">
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Speaking in {languages[currentLanguage].name}...</span>
          </div>
        )}

        {/* Browser Support */}
        {!textToSpeechService.isSupported() && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Your browser does not fully support Text-to-Speech. Please use a modern browser.
            </p>
          </div>
        )}
      </div>

      {/* Features List */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-lg mb-3">TTS Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Multi-language support (Arabic, French, English)</li>
            <li>✓ Male and female voice options</li>
            <li>✓ Adjustable speed, pitch, and volume</li>
            <li>✓ Real-time voice control</li>
            <li>✓ Audio download capability</li>
            <li>✓ Auto-play for AI responses</li>
          </ul>
        </div>
        
        <div className="card">
          <h3 className="font-semibold text-lg mb-3">Educational Benefits</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Accessibility for visually impaired students</li>
            <li>✓ Better pronunciation learning</li>
            <li>✓ Multisensory learning experience</li>
            <li>✓ Hands-free content consumption</li>
            <li>✓ Language learning support</li>
            <li>✓ Improved comprehension</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TTSDemo;