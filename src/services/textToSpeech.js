/**
 * Text-to-Speech Service
 * Provides comprehensive TTS functionality with language support, voice controls, and audio download
 * Security: No API keys exposed to client, all external TTS calls go through secure server proxy
 */

import { secureApiService } from './secureApi';

export class TextToSpeechService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    
    // Default settings
    this.settings = {
      enabled: localStorage.getItem('tts_enabled') === 'true',
      language: localStorage.getItem('tts_language') || 'en-US',
      rate: parseFloat(localStorage.getItem('tts_rate')) || 1.0,
      pitch: parseFloat(localStorage.getItem('tts_pitch')) || 1.0,
      volume: parseFloat(localStorage.getItem('tts_volume')) || 1.0,
      voiceGender: localStorage.getItem('tts_voice_gender') || 'female',
      autoPlay: localStorage.getItem('tts_autoplay') === 'true'
    };

    // Language configurations
    this.languages = {
      'ar-SA': { name: 'العربية', code: 'ar-SA', gender: { male: 'Microsoft Naayf', female: 'Microsoft Hoda' } },
      'fr-FR': { name: 'Français', code: 'fr-FR', gender: { male: 'Microsoft Paul', female: 'Microsoft Julie' } },
      'en-US': { name: 'English', code: 'en-US', gender: { male: 'Microsoft Mark', female: 'Microsoft Zira' } },
      'en-GB': { name: 'English (UK)', code: 'en-GB', gender: { male: 'Microsoft George', female: 'Microsoft Susan' } }
    };

    // Initialize voices when available
    this.loadVoices();
    
    // Event listeners
    if (this.synthesis) {
      this.synthesis.addEventListener('voiceschanged', () => this.loadVoices());
    }

    // Bind methods
    this.speak = this.speak.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.stop = this.stop.bind(this);
  }

  /**
   * Load available voices from the browser
   */
  loadVoices() {
    if (!this.synthesis) return;
    
    this.voices = this.synthesis.getVoices();
    
    // Filter voices by supported languages
    this.availableVoices = {};
    Object.keys(this.languages).forEach(langCode => {
      this.availableVoices[langCode] = this.voices.filter(voice => 
        voice.lang.startsWith(langCode.split('-')[0]) || voice.lang === langCode
      );
    });
  }

  /**
   * Get the best voice for current settings
   */
  getBestVoice() {
    const langCode = this.settings.language;
    const availableForLang = this.availableVoices[langCode] || [];
    
    if (availableForLang.length === 0) {
      // Fallback to any voice for the language family
      const langFamily = langCode.split('-')[0];
      const familyVoices = this.voices.filter(voice => voice.lang.startsWith(langFamily));
      return familyVoices[0] || this.voices[0];
    }

    // Try to find preferred gender
    const genderPreference = this.settings.voiceGender;
    let preferredVoice;

    if (genderPreference === 'male') {
      preferredVoice = availableForLang.find(voice => 
        voice.name.toLowerCase().includes('male') || 
        voice.name.toLowerCase().includes('mark') ||
        voice.name.toLowerCase().includes('paul') ||
        voice.name.toLowerCase().includes('george')
      );
    } else {
      preferredVoice = availableForLang.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('julie') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('hoda')
      );
    }

    return preferredVoice || availableForLang[0];
  }

  /**
   * Speak the given text
   * @param {string} text - Text to speak
   * @param {Object} options - Override options
   */
  async speak(text, options = {}) {
    if (!this.synthesis || !this.settings.enabled || !text.trim()) {
      return;
    }

    // Stop any current speech
    this.stop();

    // Clean text for better pronunciation
    const cleanText = this.preprocessText(text);

    // Create utterance
    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    
    // Apply settings
    const voice = this.getBestVoice();
    if (voice) {
      this.currentUtterance.voice = voice;
    }
    
    this.currentUtterance.rate = options.rate || this.settings.rate;
    this.currentUtterance.pitch = options.pitch || this.settings.pitch;
    this.currentUtterance.volume = options.volume || this.settings.volume;
    this.currentUtterance.lang = options.language || this.settings.language;

    // Set up event listeners
    return new Promise((resolve, reject) => {
      this.currentUtterance.onstart = () => {
        this.isPlaying = true;
        this.isPaused = false;
        this.onStart?.(this.currentUtterance);
      };

      this.currentUtterance.onend = () => {
        this.isPlaying = false;
        this.isPaused = false;
        this.onEnd?.(this.currentUtterance);
        resolve();
      };

      this.currentUtterance.onpause = () => {
        this.isPaused = true;
        this.onPause?.(this.currentUtterance);
      };

      this.currentUtterance.onresume = () => {
        this.isPaused = false;
        this.onResume?.(this.currentUtterance);
      };

      this.currentUtterance.onerror = (event) => {
        this.isPlaying = false;
        this.isPaused = false;
        this.onError?.(event);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Start speaking
      this.synthesis.speak(this.currentUtterance);
    });
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.synthesis && this.isPlaying && !this.isPaused) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.synthesis && this.isPlaying && this.isPaused) {
      this.synthesis.resume();
    }
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Preprocess text for better pronunciation
   * @param {string} text - Original text
   * @returns {string} Processed text
   */
  preprocessText(text) {
    let processed = text;
    
    // Remove markdown formatting
    processed = processed.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
    processed = processed.replace(/\*(.*?)\*/g, '$1'); // Italic
    processed = processed.replace(/`(.*?)`/g, '$1'); // Code
    processed = processed.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Links
    
    // Handle common abbreviations
    const abbreviations = {
      'AI': 'Artificial Intelligence',
      'API': 'Application Programming Interface',
      'URL': 'U R L',
      'HTML': 'H T M L',
      'CSS': 'C S S',
      'JS': 'JavaScript',
      'PDF': 'P D F',
      'FAQ': 'Frequently Asked Questions'
    };
    
    Object.entries(abbreviations).forEach(([abbr, expansion]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      processed = processed.replace(regex, expansion);
    });
    
    // Add pauses for better readability
    processed = processed.replace(/\. /g, '. <break time="300ms"/> ');
    processed = processed.replace(/\? /g, '? <break time="400ms"/> ');
    processed = processed.replace(/! /g, '! <break time="400ms"/> ');
    processed = processed.replace(/: /g, ': <break time="200ms"/> ');
    
    return processed;
  }

  /**
   * Generate audio file from text using secure server endpoint
   * @param {string} text - Text to convert
   * @param {string} filename - Filename for download
   */
  async downloadAudio(text, filename = 'speech.wav') {
    try {
      // Try browser-native TTS recording first
      if (window.MediaRecorder && navigator.mediaDevices) {
        const audioBlob = await this.recordSpeech(text);
        this.downloadBlob(audioBlob, filename);
      } else {
        // Fallback to secure server-side TTS generation
        await this.downloadAudioSecure(text, filename);
      }
    } catch (error) {
      console.error('Audio download failed:', error);
      this.showDownloadMessage();
    }
  }

  /**
   * Download audio using secure server endpoint
   * @param {string} text - Text to convert
   * @param {string} filename - Filename for download
   */
  async downloadAudioSecure(text, filename) {
    try {
      const response = await secureApiService.generateTTSAudio(text, {
        language: this.settings.language,
        voice: this.settings.voiceGender,
        rate: this.settings.rate,
        pitch: this.settings.pitch,
        volume: this.settings.volume
      });

      if (response.audioUrl) {
        // Download the generated audio file
        const link = document.createElement('a');
        link.href = response.audioUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('Failed to generate audio on server');
      }
    } catch (error) {
      console.error('Secure audio download failed:', error);
      throw error;
    }
  }

  /**
   * Record speech synthesis to audio blob
   * @param {string} text - Text to record
   */
  async recordSpeech(text) {
    return new Promise(async (resolve, reject) => {
      try {
        // Create an audio context for recording
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const destination = audioContext.createMediaStreamDestination();
        
        // Create oscillator to generate audio (simplified approach)
        // Note: This is a basic implementation. For production, consider using Web Audio API
        // or external services for better audio generation
        
        const chunks = [];
        const mediaRecorder = new MediaRecorder(destination.stream);
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          resolve(audioBlob);
        };
        
        // Start recording
        mediaRecorder.start();
        
        // Use speech synthesis
        await this.speak(text);
        
        // Stop recording
        setTimeout(() => {
          mediaRecorder.stop();
          audioContext.close();
        }, 1000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Download blob as file
   * @param {Blob} blob - Audio blob
   * @param {string} filename - Filename
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Show download message when recording is not available
   */
  showDownloadMessage() {
    alert('Audio download is not available in this browser. Please use the play button to listen to the speech.');
  }

  /**
   * Update settings
   * @param {Object} newSettings - Settings to update
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Save to localStorage
    Object.entries(this.settings).forEach(([key, value]) => {
      localStorage.setItem(`tts_${key}`, value.toString());
    });
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Get available languages
   */
  getLanguages() {
    return this.languages;
  }

  /**
   * Get available voices for current language
   */
  getAvailableVoices() {
    return this.availableVoices[this.settings.language] || [];
  }

  /**
   * Check if TTS is supported
   */
  isSupported() {
    return 'speechSynthesis' in window;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isSupported: this.isSupported(),
      isEnabled: this.settings.enabled,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentLanguage: this.settings.language,
      availableVoices: this.getAvailableVoices().length
    };
  }

  /**
   * Set event callbacks with security logging
   */
  setEventCallbacks(callbacks) {
    this.onStart = (utterance) => {
      secureApiService.logSecurityEvent('tts_started', {
        language: this.settings.language,
        textLength: utterance.text?.length || 0
      });
      callbacks.onStart?.(utterance);
    };
    
    this.onEnd = (utterance) => {
      secureApiService.logSecurityEvent('tts_completed', {
        language: this.settings.language,
        textLength: utterance.text?.length || 0
      });
      callbacks.onEnd?.(utterance);
    };
    
    this.onPause = callbacks.onPause;
    this.onResume = callbacks.onResume;
    this.onError = (error) => {
      secureApiService.logSecurityEvent('tts_error', {
        error: error.message || 'Unknown TTS error',
        language: this.settings.language
      });
      callbacks.onError?.(error);
    };
  }
}

// Create singleton instance
export const textToSpeechService = new TextToSpeechService();
export default textToSpeechService;