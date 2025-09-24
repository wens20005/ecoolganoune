// Advanced security scanner for file uploads
import { fileUploadManager } from '../utils/fileUpload'

class SecurityScanner {
  constructor() {
    this.maxFileSize = 50 * 1024 * 1024 // 50MB as per memory
    this.dangerousExtensions = [
      'exe', 'bat', 'cmd', 'com', 'scr', 'pif', 'vbs', 'js', 'jar',
      'app', 'deb', 'pkg', 'dmg', 'sh', 'run', 'msi', 'gadget'
    ]
    this.allowedTypes = {
      documents: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
      images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
      videos: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'],
      audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
      presentations: ['ppt', 'pptx', 'odp'],
      spreadsheets: ['xls', 'xlsx', 'ods', 'csv']
    }
    this.suspiciousPatterns = [
      /script\s*:/i,
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onclick=/i,
      /eval\(/i,
      /document\.write/i
    ]
    this.securityEvents = []
    this.quarantineList = new Set()
    this.blacklistedHashes = new Set()
    this.rateLimitMap = new Map()
    this.maxUploadsPerHour = 20
  }

  // Main security scan function
  async scanFile(file, userId = null) {
    const results = {
      isSecure: true,
      riskScore: 0,
      warnings: [],
      errors: [],
      metadata: {},
      scanId: this.generateScanId(),
      timestamp: new Date().toISOString(),
      userId: userId
    }

    try {
      // Rate limiting check
      if (userId && !this.checkRateLimit(userId)) {
        results.errors.push('Upload rate limit exceeded')
        results.riskScore = 100
        this.logSecurityEvent('RATE_LIMIT_EXCEEDED', userId, file.name)
        return results
      }

      // Basic validation
      await this.validateBasicSecurity(file, results)
      
      // File hash validation
      await this.validateFileHash(file, results)
      
      // File type validation
      await this.validateFileType(file, results)
      
      // Size validation
      await this.validateFileSize(file, results)
      
      // Filename security
      await this.validateFilename(file, results)
      
      // Content validation
      await this.validateFileContent(file, results)
      
      // Content scanning (simulation)
      await this.simulateVirusScan(file, results)
      
      // Behavioral analysis
      await this.analyzeBehavioralPatterns(file, userId, results)
      
      // Threat analysis
      await this.analyzeThreatLevel(file, results)
      
      // Calculate final security status
      results.isSecure = results.riskScore < 70 && results.errors.length === 0
      
      // Log security event
      this.logSecurityEvent(
        results.isSecure ? 'SCAN_PASSED' : 'SCAN_FAILED', 
        userId, 
        file.name, 
        results
      )
      
    } catch (error) {
      console.error('Security scan failed:', error)
      results.isSecure = false
      results.errors.push('Security scan failed: ' + error.message)
      results.riskScore = 100
      this.logSecurityEvent('SCAN_ERROR', userId, file.name, { error: error.message })
    }

    return results
  }

  // Basic security validation
  async validateBasicSecurity(file, results) {
    if (!file) {
      results.errors.push('No file provided for scanning')
      results.riskScore += 100
      return
    }

    if (!file.type && !file.name) {
      results.errors.push('File appears to be corrupted or invalid')
      results.riskScore += 80
      return
    }

    // Check for null bytes or suspicious characters
    if (file.name.includes('\0') || file.name.includes('\x00')) {
      results.errors.push('File contains null bytes (potential security risk)')
      results.riskScore += 90
    }

    results.metadata.basicValidation = 'passed'
  }

  // File type validation with enhanced security
  async validateFileType(file, results) {
    const extension = this.getFileExtension(file.name).toLowerCase()
    
    // Check against dangerous extensions
    if (this.dangerousExtensions.includes(extension)) {
      results.errors.push(`File type '.${extension}' is not allowed for security reasons`)
      results.riskScore += 100
      return
    }

    // Check if extension is in allowed list
    const allAllowedTypes = Object.values(this.allowedTypes).flat()
    if (!allAllowedTypes.includes(extension)) {
      results.warnings.push(`File type '.${extension}' is not commonly supported`)
      results.riskScore += 20
    }

    // MIME type validation
    if (file.type) {
      const mimeValidation = this.validateMimeType(file.type, extension)
      if (!mimeValidation.valid) {
        results.warnings.push(mimeValidation.message)
        results.riskScore += 30
      }
    }

    results.metadata.fileType = {
      extension,
      mimeType: file.type,
      category: this.categorizeFile(extension)
    }
  }

  // Enhanced file size validation
  async validateFileSize(file, results) {
    if (file.size > this.maxFileSize) {
      results.errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum limit (${this.formatFileSize(this.maxFileSize)})`)
      results.riskScore += 50
    }

    if (file.size === 0) {
      results.warnings.push('File appears to be empty')
      results.riskScore += 40
    }

    // Extremely large files are suspicious
    if (file.size > 100 * 1024 * 1024) { // 100MB
      results.warnings.push('File is exceptionally large')
      results.riskScore += 20
    }

    results.metadata.fileSize = {
      bytes: file.size,
      formatted: this.formatFileSize(file.size),
      withinLimits: file.size <= this.maxFileSize
    }
  }

  // Filename security validation
  async validateFilename(file, results) {
    const filename = file.name

    // Check for suspicious patterns in filename
    this.suspiciousPatterns.forEach(pattern => {
      if (pattern.test(filename)) {
        results.warnings.push('Filename contains potentially suspicious content')
        results.riskScore += 25
      }
    })

    // Check for multiple extensions
    const extensions = filename.split('.').slice(1)
    if (extensions.length > 2) {
      results.warnings.push('File has multiple extensions (potentially suspicious)')
      results.riskScore += 15
    }

    // Check for very long filenames
    if (filename.length > 255) {
      results.warnings.push('Filename is exceptionally long')
      results.riskScore += 10
    }

    // Check for hidden file indicators
    if (filename.startsWith('.') && filename !== '.htaccess') {
      results.warnings.push('Hidden file detected')
      results.riskScore += 5
    }

    results.metadata.filename = {
      original: filename,
      sanitized: this.sanitizeFilename(filename),
      length: filename.length,
      extensionCount: extensions.length
    }
  }

  // Simulate virus scanning (in production, integrate with actual antivirus API)
  async simulateVirusScan(file, results) {
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))

    const scanResults = {
      scanned: true,
      threatsFound: 0,
      scanTime: Date.now(),
      engine: 'SimulatedAV v1.0'
    }

    // Simulate occasional threat detection based on filename patterns
    const suspiciousNames = ['virus', 'malware', 'trojan', 'hack', 'crack', 'keygen']
    const hasSupiciousName = suspiciousNames.some(name => 
      file.name.toLowerCase().includes(name)
    )

    if (hasSupiciousName) {
      scanResults.threatsFound = 1
      scanResults.threats = [{
        name: 'PotentialThreat.Generic',
        severity: 'medium',
        description: 'Suspicious filename pattern detected'
      }]
      results.warnings.push('Potential threat detected in filename')
      results.riskScore += 60
    }

    // Random very rare threat simulation (1% chance)
    if (Math.random() < 0.01) {
      scanResults.threatsFound = 1
      scanResults.threats = [{
        name: 'Test.Virus.Simulation',
        severity: 'high',
        description: 'Simulated virus for testing purposes'
      }]
      results.errors.push('Virus detected (simulation)')
      results.riskScore += 100
    }

    results.metadata.virusScan = scanResults
  }

  // Advanced threat level analysis
  async analyzeThreatLevel(file, results) {
    let threatAnalysis = {
      level: 'low',
      factors: [],
      recommendations: []
    }

    // Analyze various risk factors
    const extension = this.getFileExtension(file.name).toLowerCase()
    
    // Executable or script files
    if (['exe', 'bat', 'cmd', 'sh', 'ps1'].includes(extension)) {
      threatAnalysis.factors.push('Executable file type')
      threatAnalysis.level = 'high'
    }

    // Office documents (can contain macros)
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      threatAnalysis.factors.push('Office document (potential macro risk)')
      if (threatAnalysis.level === 'low') threatAnalysis.level = 'medium'
    }

    // Compressed files (can hide content)
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      threatAnalysis.factors.push('Compressed archive')
      results.riskScore += 10
    }

    // Generate recommendations
    if (threatAnalysis.level === 'high') {
      threatAnalysis.recommendations.push('Manual review required before processing')
      threatAnalysis.recommendations.push('Consider additional security measures')
    } else if (threatAnalysis.level === 'medium') {
      threatAnalysis.recommendations.push('Standard security protocols apply')
      threatAnalysis.recommendations.push('Monitor for suspicious behavior')
    }

    results.metadata.threatAnalysis = threatAnalysis
  }

  // Helper methods
  getFileExtension(filename) {
    return filename.split('.').pop() || ''
  }

  validateMimeType(mimeType, extension) {
    const mimeMap = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg'
    }

    const expectedMime = mimeMap[extension]
    if (expectedMime && mimeType !== expectedMime) {
      return {
        valid: false,
        message: `MIME type mismatch: expected ${expectedMime}, got ${mimeType}`
      }
    }

    return { valid: true }
  }

  categorizeFile(extension) {
    for (const [category, extensions] of Object.entries(this.allowedTypes)) {
      if (extensions.includes(extension)) {
        return category
      }
    }
    return 'unknown'
  }

  sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
      .replace(/^\.+/, '')
      .substring(0, 255)
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  generateScanId() {
    return 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
  }

  // Enhanced file hash validation
  async validateFileHash(file, results) {
    try {
      const fileHash = await this.calculateFileHash(file)
      
      if (this.blacklistedHashes.has(fileHash)) {
        results.errors.push('File matches known malicious content')
        results.riskScore += 100
        this.logSecurityEvent('BLACKLISTED_HASH', null, file.name, { hash: fileHash })
      }
      
      results.metadata.fileHash = fileHash
    } catch (error) {
      results.warnings.push('Unable to calculate file hash')
      results.riskScore += 10
    }
  }

  // Content validation for specific file types
  async validateFileContent(file, results) {
    const extension = this.getFileExtension(file.name).toLowerCase()
    
    // For text-based files, check content
    if (['txt', 'csv', 'xml', 'html', 'css', 'js'].includes(extension)) {
      try {
        const content = await this.readFileContent(file)
        
        // Check for suspicious patterns in content
        this.suspiciousPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            results.warnings.push('Suspicious content pattern detected')
            results.riskScore += 30
          }
        })
        
        // Check for very long lines (potential obfuscation)
        const lines = content.split('\n')
        const maxLineLength = Math.max(...lines.map(line => line.length))
        if (maxLineLength > 10000) {
          results.warnings.push('Extremely long lines detected (potential obfuscation)')
          results.riskScore += 20
        }
        
      } catch (error) {
        results.warnings.push('Unable to validate file content')
        results.riskScore += 5
      }
    }
  }

  // Behavioral pattern analysis
  async analyzeBehavioralPatterns(file, userId, results) {
    if (!userId) return
    
    const userEvents = this.securityEvents.filter(event => 
      event.userId === userId && 
      event.timestamp > Date.now() - (24 * 60 * 60 * 1000) // Last 24 hours
    )
    
    // Check for suspicious upload patterns
    const recentUploads = userEvents.filter(event => event.type === 'SCAN_PASSED')
    const failedUploads = userEvents.filter(event => event.type === 'SCAN_FAILED')
    
    if (failedUploads.length > 5) {
      results.warnings.push('Multiple failed uploads detected')
      results.riskScore += 25
    }
    
    if (recentUploads.length > this.maxUploadsPerHour) {
      results.warnings.push('Unusually high upload frequency')
      results.riskScore += 15
    }
    
    results.metadata.behavioralAnalysis = {
      recentUploads: recentUploads.length,
      failedUploads: failedUploads.length,
      riskLevel: failedUploads.length > 3 ? 'high' : 'normal'
    }
  }

  // Rate limiting functionality
  checkRateLimit(userId) {
    const now = Date.now()
    const userLimits = this.rateLimitMap.get(userId) || { count: 0, resetTime: now + 3600000 }
    
    if (now > userLimits.resetTime) {
      userLimits.count = 0
      userLimits.resetTime = now + 3600000 // Reset in 1 hour
    }
    
    if (userLimits.count >= this.maxUploadsPerHour) {
      return false
    }
    
    userLimits.count++
    this.rateLimitMap.set(userId, userLimits)
    return true
  }

  // Security event logging
  logSecurityEvent(type, userId, filename, details = {}) {
    const event = {
      id: this.generateScanId(),
      type,
      userId,
      filename,
      timestamp: Date.now(),
      details
    }
    
    this.securityEvents.push(event)
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000)
    }
    
    // Log critical events
    if (['BLACKLISTED_HASH', 'VIRUS_DETECTED', 'RATE_LIMIT_EXCEEDED'].includes(type)) {
      console.warn('Critical security event:', event)
    }
  }

  // File hash calculation
  async calculateFileHash(file) {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Read file content for text files
  async readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  // Get security events for monitoring
  getSecurityEvents(limit = 100) {
    return this.securityEvents.slice(-limit).reverse()
  }

  // Add hash to blacklist
  addToBlacklist(hash) {
    this.blacklistedHashes.add(hash)
  }

  // Get security statistics
  getSecurityStats() {
    const events = this.securityEvents
    const last24h = events.filter(e => e.timestamp > Date.now() - 86400000)
    
    return {
      totalScans: events.filter(e => e.type.includes('SCAN')).length,
      passedScans: events.filter(e => e.type === 'SCAN_PASSED').length,
      failedScans: events.filter(e => e.type === 'SCAN_FAILED').length,
      virusDetections: events.filter(e => e.type === 'VIRUS_DETECTED').length,
      rateLimitViolations: events.filter(e => e.type === 'RATE_LIMIT_EXCEEDED').length,
      last24hActivity: last24h.length,
      blacklistedHashes: this.blacklistedHashes.size
    }
  }

  // Quick security check for immediate validation
  quickSecurityCheck(file) {
    const extension = this.getFileExtension(file.name).toLowerCase()
    
    return {
      isAllowed: !this.dangerousExtensions.includes(extension),
      withinSizeLimit: file.size <= this.maxFileSize,
      hasValidName: file.name.length > 0 && file.name.length <= 255,
      isSafe: !this.dangerousExtensions.includes(extension) && 
              file.size <= this.maxFileSize && 
              file.name.length > 0
    }
  }
}

// Create singleton instance
export const securityScanner = new SecurityScanner()

// Export helper functions
export const scanFile = (file) => securityScanner.scanFile(file)
export const quickCheck = (file) => securityScanner.quickSecurityCheck(file)

export default securityScanner