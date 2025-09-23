import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  Play, 
  Pause, 
  Download,
  Mic,
  Languages,
  Sliders,
  TestTube
} from 'lucide-react';
import { textToSpeechService } from '../services/textToSpeech';

const TTSSettings = ({ isOpen, onClose, onSettingsChange }) => {
  const [settings, setSettings] = useState(textToSpeechService.getSettings());
  const [testText, setTestText] = useState('Hello! This is a test of the text-to-speech system. How does it sound?');
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [languages] = useState(textToSpeechService.getLanguages());

  useEffect(() => {
    if (isOpen) {
      loadVoices();
      setSettings(textToSpeechService.getSettings());
    }
  }, [isOpen]);

  useEffect(() => {
    // Set up TTS event callbacks
    textToSpeechService.setEventCallbacks({
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onPause: () => setIsPlaying(false),
      onResume: () => setIsPlaying(true),
      onError: (error) => {
        setIsPlaying(false);
        console.error('TTS Error:', error);
      }
    });
  }, []);

  const loadVoices = () => {
    const availableVoices = textToSpeechService.getAvailableVoices();
    setVoices(availableVoices);
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    textToSpeechService.updateSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const testVoice = async () => {
    if (isPlaying) {
      textToSpeechService.stop();
      setIsPlaying(false);
    } else {
      try {
        await textToSpeechService.speak(testText);
      } catch (error) {
        console.error('Test speech failed:', error);
      }
    }
  };

  const downloadTestAudio = async () => {
    try {
      await textToSpeechService.downloadAudio(testText, 'test-speech.wav');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      enabled: true,
      language: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voiceGender: 'female',
      autoPlay: false
    };
    setSettings(defaultSettings);
    textToSpeechService.updateSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <Volume2 className="h-6 w-6 mr-2 text-primary-600" />
            Text-to-Speech Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable TTS */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {settings.enabled ? (
                <Volume2 className="h-5 w-5 text-green-600 mr-3" />
              ) : (
                <VolumeX className="h-5 w-5 text-red-600 mr-3" />
              )}
              <div>
                <h4 className="font-medium">Enable Text-to-Speech</h4>
                <p className="text-sm text-gray-600">
                  Read AI responses aloud automatically
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Auto-play Setting */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Play className="h-5 w-5 text-primary-600 mr-3" />
              <div>
                <h4 className="font-medium">Auto-play Responses</h4>
                <p className="text-sm text-gray-600">
                  Automatically read new AI responses
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) => handleSettingChange('autoPlay', e.target.checked)}
                className="sr-only peer"
                disabled={!settings.enabled}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 disabled:opacity-50"></div>
            </label>
          </div>

          {settings.enabled && (
            <>
              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Languages className="h-4 w-4 mr-2" />
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(languages).map(([code, lang]) => (
                    <option key={code} value={code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSettingChange('voiceGender', 'female')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      settings.voiceGender === 'female'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Female Voice
                  </button>
                  <button
                    onClick={() => handleSettingChange('voiceGender', 'male')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      settings.voiceGender === 'male'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Male Voice
                  </button>
                </div>
              </div>

              {/* Voice Controls */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <Sliders className="h-4 w-4 mr-2" />
                  Voice Controls
                </h4>
                
                {/* Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speed: {settings.rate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.rate}
                    onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>

                {/* Pitch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pitch: {settings.pitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.pitch}
                    onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Normal</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Volume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume: {Math.round(settings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.volume}
                    onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Quiet</span>
                    <span>Normal</span>
                    <span>Loud</span>
                  </div>
                </div>
              </div>

              {/* Test Voice */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center">
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Voice
                </h4>
                <div className="space-y-3">
                  <textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Enter text to test the voice..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={testVoice}
                      disabled={!testText.trim()}
                      className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Test Voice</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadTestAudio}
                      disabled={!testText.trim()}
                      className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button onClick={resetToDefaults} className="btn-secondary flex-1">
              Reset to Defaults
            </button>
            <button onClick={onClose} className="btn-primary flex-1">
              Save & Close
            </button>
          </div>

          {/* Browser Support Info */}
          {!textToSpeechService.isSupported() && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Your browser doesn't fully support Text-to-Speech. Please use a modern browser like Chrome, Firefox, or Safari for the best experience.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default TTSSettings;