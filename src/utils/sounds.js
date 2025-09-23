// Sound utility functions for the educational app

export class SoundManager {
  constructor() {
    this.audioContext = null
    this.sounds = new Map()
    this.volume = 0.3
    this.enabled = true
  }

  // Initialize audio context
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  // Play success sound
  playSuccess() {
    if (!this.enabled) return
    this.init()
    this.playTone([523.25, 659.25, 783.99], [0, 0.1, 0.2], 0.3) // C-E-G chord
  }

  // Play error sound
  playError() {
    if (!this.enabled) return
    this.init()
    this.playTone([200, 150], [0, 0.1], 0.3) // Low descending tones
  }

  // Play notification sound
  playNotification() {
    if (!this.enabled) return
    this.init()
    this.playTone([440, 554.37], [0, 0.15], 0.2) // A-C# notes
  }

  // Play celebration sound (for perfect scores)
  playCelebration() {
    if (!this.enabled) return
    this.init()
    
    // Play a series of ascending notes
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25] // C-E-G-C-E
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone([freq], [0], 0.15)
      }, index * 100)
    })
  }

  // Helper method to play tones
  playTone(frequencies, timings, duration = 0.3) {
    if (!this.audioContext) return

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + timings[index])
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + timings[index])
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + timings[index] + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + timings[index] + duration)
      
      oscillator.start(this.audioContext.currentTime + timings[index])
      oscillator.stop(this.audioContext.currentTime + timings[index] + duration)
    })
  }

  // Play audio file (for when you want to use actual sound files)
  async playAudioFile(filename) {
    if (!this.enabled) return
    
    try {
      const audio = new Audio(`/sounds/${filename}`)
      audio.volume = this.volume
      await audio.play()
    } catch (error) {
      console.warn('Could not play audio file:', filename, error)
    }
  }

  // Text-to-speech for feedback
  speak(text, options = {}) {
    if (!this.enabled || !window.speechSynthesis) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.volume = this.volume
    utterance.rate = options.rate || 1
    utterance.pitch = options.pitch || 1
    utterance.lang = options.lang || 'en-US'
    
    window.speechSynthesis.speak(utterance)
  }

  // Speak common feedback messages
  speakBravo() {
    this.speak('Bravo! Excellent work!')
  }

  speakOhNo() {
    this.speak('Oh no! Try again.')
  }

  speakPerfectScore() {
    this.speak('Perfect score! Outstanding!')
  }

  speakGoodJob() {
    this.speak('Good job! Well done!')
  }

  speakKeepTrying() {
    this.speak('Keep trying! You can do it!')
  }

  // Settings
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  toggle() {
    this.enabled = !this.enabled
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }

  isEnabled() {
    return this.enabled
  }
}

// Create a singleton instance
export const soundManager = new SoundManager()

// Helper functions for common use cases
export const playSuccessSound = () => soundManager.playSuccess()
export const playErrorSound = () => soundManager.playError()
export const playNotificationSound = () => soundManager.playNotification()
export const playCelebrationSound = () => soundManager.playCelebration()
export const speakBravo = () => soundManager.speakBravo()
export const speakOhNo = () => soundManager.speakOhNo()
export const speakPerfectScore = () => soundManager.speakPerfectScore()
export const speakGoodJob = () => soundManager.speakGoodJob()
export const speakKeepTrying = () => soundManager.speakKeepTrying()

export default soundManager