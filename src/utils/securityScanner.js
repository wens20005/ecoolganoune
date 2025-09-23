// Advanced security scanner with virus detection and threat analysis
export class SecurityScanner {
  constructor() {
    this.scanDatabase = {
      virusSignatures: [
        'EICAR-STANDARD-ANTIVIRUS-TEST-FILE',
        'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR',
        'malware_signature_1',
        'trojan_pattern_2',
        'worm_detection_3'
      ],
      suspiciousPatterns: [
        /eval\s*\(/gi,
        /document\.write/gi,
        /window\.location/gi,
        /<script[^>]*>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload\s*=/gi,
        /onerror\s*=/gi,
        /onclick\s*=/gi
      ],
      dangerousExtensions: [
        'exe', 'bat', 'cmd', 'com', 'scr', 'pif', 'vbs', 'js', 'jar',
        'app', 'deb', 'pkg', 'dmg', 'iso', 'msi', 'dll', 'sys'
      ],
      quarantineReasons: {
        virus: 'Virus detected in file content',
        malware: 'Malicious code patterns found',
        suspicious: 'Suspicious file behavior detected',
        extension: 'Potentially dangerous file extension',
        size: 'File size exceeds security limits',
        name: 'Suspicious file name patterns'
      }
    }
  }

  // Main security scan function
  async performSecurityScan(file, options = {}) {
    const scanResult = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      scanStartTime: new Date().toISOString(),
      scanEndTime: null,
      status: 'scanning',
      threats: [],
      riskLevel: 'low',
      recommendations: [],
      quarantined: false,
      scanDuration: 0
    }

    try {
      // Start scanning process
      console.log(`🔍 Starting security scan for: ${file.name}`)
      
      // Simulate scanning time (1-4 seconds based on file size)
      const scanTime = Math.max(1000, Math.min(4000, file.size / 1024))
      await this.simulateDelay(scanTime)

      // Perform various security checks
      await this.checkFileExtension(file, scanResult)
      await this.checkFileSize(file, scanResult)
      await this.checkFileName(file, scanResult)
      await this.performVirusScan(file, scanResult)
      await this.checkForMaliciousContent(file, scanResult)
      await this.performHeuristicAnalysis(file, scanResult)

      // Calculate final risk level
      this.calculateRiskLevel(scanResult)
      
      // Generate recommendations
      this.generateRecommendations(scanResult)

      // Determine if file should be quarantined
      this.checkQuarantineStatus(scanResult)

      scanResult.scanEndTime = new Date().toISOString()
      scanResult.scanDuration = Date.now() - new Date(scanResult.scanStartTime).getTime()
      scanResult.status = scanResult.quarantined ? 'quarantined' : 'clean'

      console.log(`✅ Security scan completed for: ${file.name} (${scanResult.riskLevel} risk)`)
      return scanResult

    } catch (error) {
      scanResult.status = 'error'
      scanResult.threats.push({
        type: 'scan_error',
        severity: 'high',
        description: `Scan failed: ${error.message}`,
        detected: true
      })
      scanResult.quarantined = true
      console.error(`❌ Security scan failed for: ${file.name}`, error)
      return scanResult
    }
  }

  // Check file extension for dangerous types
  async checkFileExtension(file, scanResult) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (this.scanDatabase.dangerousExtensions.includes(extension)) {
      scanResult.threats.push({
        type: 'dangerous_extension',
        severity: 'high',
        description: `File extension ".${extension}" is potentially dangerous`,
        detected: true,
        recommendation: 'File blocked due to dangerous extension'
      })
    }
  }

  // Check file size limits
  async checkFileSize(file, scanResult) {
    const maxSize = 50 * 1024 * 1024 // 50MB
    const suspiciousSize = 100 * 1024 * 1024 // 100MB
    
    if (file.size > maxSize) {
      scanResult.threats.push({
        type: 'size_limit',
        severity: 'medium',
        description: `File size (${this.formatBytes(file.size)}) exceeds limit`,
        detected: true,
        recommendation: 'Reduce file size or split into smaller files'
      })
    }
    
    if (file.size > suspiciousSize) {
      scanResult.threats.push({
        type: 'suspicious_size',
        severity: 'low',
        description: 'Unusually large file size detected',
        detected: true
      })
    }
  }

  // Check filename for suspicious patterns
  async checkFileName(file, scanResult) {
    const suspiciousNamePatterns = [
      /[<>:"/\\|?*]/,  // Invalid characters
      /^\./,           // Hidden files
      /\s{2,}/,        // Multiple spaces
      /autorun|setup|install/i, // Common malware names
      /temp|tmp|cache/i        // Temporary file patterns
    ]

    for (const pattern of suspiciousNamePatterns) {
      if (pattern.test(file.name)) {
        scanResult.threats.push({
          type: 'suspicious_filename',
          severity: 'low',
          description: 'Filename contains suspicious patterns',
          detected: true,
          pattern: pattern.toString()
        })
      }
    }
  }

  // Simulate virus signature scanning
  async performVirusScan(file, scanResult) {
    // Read first 1KB of file for signature analysis
    try {
      const buffer = await this.readFileChunk(file, 0, 1024)
      const content = new TextDecoder().decode(buffer)
      
      for (const signature of this.scanDatabase.virusSignatures) {
        if (content.includes(signature)) {
          scanResult.threats.push({
            type: 'virus_signature',
            severity: 'critical',
            description: `Virus signature detected: ${signature}`,
            detected: true,
            action: 'quarantine_immediately'
          })
        }
      }
    } catch (error) {
      // If we can't read the file, it might be binary or corrupted
      console.log('Could not read file content for virus scan')
    }
  }

  // Check for malicious code patterns
  async checkForMaliciousContent(file, scanResult) {
    if (!file.type.startsWith('text/') && !file.name.endsWith('.js') && !file.name.endsWith('.html')) {
      return // Skip content analysis for non-text files
    }

    try {
      const buffer = await this.readFileChunk(file, 0, 5120) // Read first 5KB
      const content = new TextDecoder().decode(buffer)
      
      for (const pattern of this.scanDatabase.suspiciousPatterns) {
        if (pattern.test(content)) {
          scanResult.threats.push({
            type: 'malicious_code',
            severity: 'high',
            description: `Suspicious code pattern detected: ${pattern.toString()}`,
            detected: true,
            recommendation: 'Review file content before execution'
          })
        }
      }
    } catch (error) {
      console.log('Could not analyze file content for malicious patterns')
    }
  }

  // Perform heuristic analysis
  async performHeuristicAnalysis(file, scanResult) {
    // Analyze file structure and behavior patterns
    const heuristics = []

    // Check for double extensions
    const nameParts = file.name.split('.')
    if (nameParts.length > 2) {
      heuristics.push({
        type: 'double_extension',
        description: 'File has multiple extensions',
        risk: 'medium'
      })
    }

    // Check for suspicious MIME type mismatch
    const expectedType = this.getExpectedMimeType(file.name)
    if (expectedType && file.type !== expectedType) {
      heuristics.push({
        type: 'mime_mismatch',
        description: `MIME type mismatch: expected ${expectedType}, got ${file.type}`,
        risk: 'medium'
      })
    }

    // Check for unusual file size patterns
    if (file.size === 0) {
      heuristics.push({
        type: 'empty_file',
        description: 'File appears to be empty',
        risk: 'low'
      })
    }

    // Add heuristics to scan result
    heuristics.forEach(h => {
      scanResult.threats.push({
        type: 'heuristic',
        severity: h.risk,
        description: h.description,
        detected: true,
        heuristicType: h.type
      })
    })
  }

  // Calculate overall risk level
  calculateRiskLevel(scanResult) {
    const threatCounts = {
      critical: scanResult.threats.filter(t => t.severity === 'critical').length,
      high: scanResult.threats.filter(t => t.severity === 'high').length,
      medium: scanResult.threats.filter(t => t.severity === 'medium').length,
      low: scanResult.threats.filter(t => t.severity === 'low').length
    }

    if (threatCounts.critical > 0) {
      scanResult.riskLevel = 'critical'
    } else if (threatCounts.high > 0) {
      scanResult.riskLevel = 'high'
    } else if (threatCounts.medium > 1 || threatCounts.low > 3) {
      scanResult.riskLevel = 'medium'
    } else if (threatCounts.medium > 0 || threatCounts.low > 0) {
      scanResult.riskLevel = 'low'
    } else {
      scanResult.riskLevel = 'clean'
    }
  }

  // Generate security recommendations
  generateRecommendations(scanResult) {
    const recommendations = []

    scanResult.threats.forEach(threat => {
      switch (threat.type) {
        case 'virus_signature':
          recommendations.push('Immediately quarantine file and run full system scan')
          break
        case 'dangerous_extension':
          recommendations.push('Block file upload and notify user of policy violation')
          break
        case 'malicious_code':
          recommendations.push('Review file content manually before allowing upload')
          break
        case 'suspicious_filename':
          recommendations.push('Consider renaming file to remove suspicious patterns')
          break
        case 'size_limit':
          recommendations.push('Compress file or split into smaller parts')
          break
        default:
          if (threat.recommendation) {
            recommendations.push(threat.recommendation)
          }
      }
    })

    // Add general recommendations based on risk level
    switch (scanResult.riskLevel) {
      case 'critical':
        recommendations.push('DO NOT UPLOAD - File poses serious security risk')
        break
      case 'high':
        recommendations.push('Manual review required before upload')
        break
      case 'medium':
        recommendations.push('Upload with caution and monitor closely')
        break
      case 'low':
        recommendations.push('Upload allowed with standard monitoring')
        break
    }

    scanResult.recommendations = [...new Set(recommendations)] // Remove duplicates
  }

  // Check if file should be quarantined
  checkQuarantineStatus(scanResult) {
    const criticalThreats = scanResult.threats.filter(t => 
      t.severity === 'critical' || 
      ['virus_signature', 'dangerous_extension'].includes(t.type)
    )

    scanResult.quarantined = criticalThreats.length > 0 || scanResult.riskLevel === 'critical'
  }

  // Utility functions
  async simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async readFileChunk(file, start, length) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = e => reject(e.target.error)
      
      const chunk = file.slice(start, start + length)
      reader.readAsArrayBuffer(chunk)
    })
  }

  getExpectedMimeType(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    return mimeTypes[extension] || null
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Generate security report
  generateSecurityReport(scanResults) {
    const totalFiles = scanResults.length
    const cleanFiles = scanResults.filter(r => r.riskLevel === 'clean').length
    const quarantinedFiles = scanResults.filter(r => r.quarantined).length
    
    const riskDistribution = {
      clean: scanResults.filter(r => r.riskLevel === 'clean').length,
      low: scanResults.filter(r => r.riskLevel === 'low').length,
      medium: scanResults.filter(r => r.riskLevel === 'medium').length,
      high: scanResults.filter(r => r.riskLevel === 'high').length,
      critical: scanResults.filter(r => r.riskLevel === 'critical').length
    }

    const threatTypes = {}
    scanResults.forEach(result => {
      result.threats.forEach(threat => {
        threatTypes[threat.type] = (threatTypes[threat.type] || 0) + 1
      })
    })

    return {
      summary: {
        totalFiles,
        cleanFiles,
        quarantinedFiles,
        securityScore: Math.round((cleanFiles / totalFiles) * 100)
      },
      riskDistribution,
      threatTypes,
      scanDate: new Date().toISOString(),
      recommendations: this.generateSystemRecommendations(scanResults)
    }
  }

  generateSystemRecommendations(scanResults) {
    const recommendations = []
    const quarantinedCount = scanResults.filter(r => r.quarantined).length
    
    if (quarantinedCount > 0) {
      recommendations.push(`${quarantinedCount} files were quarantined - review security policies`)
    }
    
    const highRiskCount = scanResults.filter(r => ['high', 'critical'].includes(r.riskLevel)).length
    if (highRiskCount > 0) {
      recommendations.push('Consider implementing stricter file upload policies')
    }
    
    return recommendations
  }
}

// Create singleton instance
export const securityScanner = new SecurityScanner()

// Export convenience functions
export const scanFile = (file, options) => securityScanner.performSecurityScan(file, options)
export const generateReport = (scanResults) => securityScanner.generateSecurityReport(scanResults)

export default securityScanner