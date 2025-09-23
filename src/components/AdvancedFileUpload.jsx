import React, { useState, useRef, useCallback } from 'react'
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  Music, 
  Archive,
  CheckCircle, 
  AlertCircle,
  Loader,
  Shield,
  Zap,
  Award,
  Eye,
  Download
} from 'lucide-react'
import { fileUploadManager } from '../utils/fileUpload'
import { securityScanner } from '../services/securityScanner'
import { databaseService } from '../services/database'

const AdvancedFileUpload = ({ 
  onUploadSuccess, 
  onUploadError, 
  path = 'uploads',
  multiple = false,
  maxFiles = 5,
  acceptedTypes = null,
  className = '',
  showPreview = true,
  userId,
  courseId = null,
  exerciseId = null,
  category = 'general',
  children
}) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadSession, setUploadSession] = useState(null)
  const fileInputRef = useRef(null)

  // Get file icon based on category
  const getFileIcon = (filename) => {
    const category = fileUploadManager.getFileCategory(filename)
    const iconProps = { className: "h-6 w-6" }
    
    switch (category) {
      case 'images':
        return <Image {...iconProps} className="h-6 w-6 text-green-500" />
      case 'videos':
        return <Video {...iconProps} className="h-6 w-6 text-blue-500" />
      case 'audio':
        return <Music {...iconProps} className="h-6 w-6 text-purple-500" />
      case 'archives':
        return <Archive {...iconProps} className="h-6 w-6 text-orange-500" />
      default:
        return <File {...iconProps} className="h-6 w-6 text-gray-500" />
    }
  }

  // Enhanced file selection with security scanning
  const handleFileSelect = useCallback(async (selectedFiles) => {
    const fileArray = Array.from(selectedFiles)
    
    // Limit number of files
    const limitedFiles = multiple 
      ? fileArray.slice(0, maxFiles - files.length)
      : [fileArray[0]]

    // Create upload session in database
    const sessionId = await databaseService.createUploadSession({
      userId,
      totalFiles: limitedFiles.length,
      successfulUploads: 0,
      failedUploads: 0,
      uploadMethod: 'click-select',
      courseId,
      exerciseId,
      category
    })
    setUploadSession(sessionId)

    // Process each file with security scanning
    const filesWithSecurity = await Promise.all(limitedFiles.map(async (file) => {
      const fileId = Date.now() + Math.random()
      
      // Quick security check first
      const quickCheck = securityScanner.quickSecurityCheck(file)
      
      const fileItem = {
        file,
        id: fileId,
        preview: fileUploadManager.createPreviewURL(file),
        status: quickCheck.isSafe ? 'ready' : 'security-failed',
        progress: 0,
        error: null,
        securityScan: null,
        dbFileId: null
      }

      // Perform full security scan if quick check passes
      if (quickCheck.isSafe) {
        try {
          fileItem.status = 'scanning'
          const scanResults = await securityScanner.scanFile(file)
          fileItem.securityScan = scanResults
          
          if (scanResults.isSecure) {
            fileItem.status = 'ready'
          } else {
            fileItem.status = 'security-failed'
            fileItem.error = scanResults.errors.join(', ') || 'Security scan failed'
          }
        } catch (error) {
          fileItem.status = 'security-failed'
          fileItem.error = 'Security scan error: ' + error.message
        }
      } else {
        fileItem.error = 'File failed basic security checks'
      }

      return fileItem
    }))
    
    setFiles(prev => multiple ? [...prev, ...filesWithSecurity] : filesWithSecurity)
  }, [files.length, maxFiles, multiple, userId, courseId, exerciseId, category])

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  // Handle input change
  const handleInputChange = async (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      await handleFileSelect(e.target.files)
    }
  }

  // Remove file from list
  const removeFile = (fileId) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      // Cleanup preview URLs
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove && fileToRemove.preview) {
        fileUploadManager.revokePreviewURL(fileToRemove.preview)
      }
      return updated
    })
  }

  // Upload single file with database integration
  const uploadSingleFile = async (fileItem) => {
    try {
      // Create database record first
      const dbFileId = await databaseService.createFile({
        userId,
        originalName: fileItem.file.name,
        fileName: fileUploadManager.generateUniqueFilename(fileItem.file.name),
        fileSize: fileItem.file.size,
        fileType: fileItem.file.type,
        fileExtension: fileUploadManager.getFileExtension(fileItem.file.name),
        category,
        courseId,
        exerciseId,
        status: 'uploading',
        virusScanned: true,
        scanResults: fileItem.securityScan
      })

      fileItem.dbFileId = dbFileId

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'uploading', progress: 0, dbFileId }
          : f
      ))

      // Upload to storage
      const result = await fileUploadManager.uploadFile(
        fileItem.file, 
        path,
        (progressData) => {
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, progress: progressData.progress }
              : f
          ))
        }
      )

      // Update database with storage info
      await databaseService.update('files', dbFileId, {
        storageUrl: result.url,
        storagePath: result.path,
        status: 'ready'
      })

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'success', progress: 100 }
          : f
      ))

      // Update user stats
      await databaseService.updateUserStats(userId, {
        totalUploads: increment(1)
      })

      // Check for achievements
      await checkAndAwardAchievements(userId, 'upload')

      if (onUploadSuccess) {
        onUploadSuccess({...result, dbFileId}, fileItem.file)
      }

      return result

    } catch (error) {
      // Update database status
      if (fileItem.dbFileId) {
        await databaseService.updateFileStatus(fileItem.dbFileId, 'failed', error.message)
      }

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'error', error: error.message }
          : f
      ))

      if (onUploadError) {
        onUploadError(error, fileItem.file)
      }

      throw error
    }
  }

  // Check and award achievements
  const checkAndAwardAchievements = async (userId, actionType) => {
    try {
      // Get user's current stats
      const user = await databaseService.getUserById(userId)
      if (!user) return

      const stats = user.stats || {}

      // Check for first upload achievement
      if (stats.totalUploads === 1) {
        await databaseService.awardAchievement(userId, 'first_upload', {
          actionType: 'upload',
          timestamp: new Date().toISOString()
        })
      }

      // Check for upload milestones
      const milestones = [5, 10, 25, 50, 100]
      if (milestones.includes(stats.totalUploads)) {
        await databaseService.awardAchievement(userId, `upload_milestone_${stats.totalUploads}`, {
          actionType: 'milestone',
          count: stats.totalUploads
        })
      }

    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }

  // Upload all files
  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    
    try {
      const readyFiles = files.filter(f => f.status === 'ready')
      let successCount = 0
      let failCount = 0
      
      for (const fileItem of readyFiles) {
        try {
          await uploadSingleFile(fileItem)
          successCount++
        } catch (error) {
          failCount++
        }
      }

      // Update upload session
      if (uploadSession) {
        await databaseService.updateUploadSession(uploadSession, {
          successfulUploads: successCount,
          failedUploads: failCount,
          completedAt: new Date(),
          duration: Math.floor((Date.now() - Date.parse(uploadSession.startedAt)) / 1000)
        })
      }

    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  // Clear all files
  const clearFiles = () => {
    // Cleanup preview URLs
    files.forEach(f => {
      if (f.preview) {
        fileUploadManager.revokePreviewURL(f.preview)
      }
    })
    setFiles([])
  }

  // Get security status icon
  const getSecurityStatusIcon = (fileItem) => {
    if (fileItem.status === 'scanning') {
      return <Loader className="h-4 w-4 text-blue-600 animate-spin" />
    }
    
    if (fileItem.securityScan) {
      const scan = fileItem.securityScan
      if (scan.isSecure) {
        return <Shield className="h-4 w-4 text-green-600" />
      } else if (scan.riskScore < 50) {
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      } else {
        return <AlertCircle className="h-4 w-4 text-red-600" />
      }
    }

    return null
  }

  const hasReadyFiles = files.some(f => f.status === 'ready')
  const hasUploadingFiles = files.some(f => f.status === 'uploading')
  const hasSecurityIssues = files.some(f => f.status === 'security-failed')

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          dragActive 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleInputChange}
          className="hidden"
        />
        
        {children || (
          <>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {dragActive ? 'Drop files here' : 'Upload Files'}
            </h3>
            <p className="text-gray-500">
              Drag and drop files here, or click to select
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Max file size: 50MB • Secure upload with virus scanning
            </p>
          </>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({files.length})
            </h4>
            <button
              onClick={clearFiles}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          
          {files.map((fileItem) => (
            <div key={fileItem.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {/* File Icon/Preview */}
              <div className="flex-shrink-0">
                {showPreview && fileItem.preview ? (
                  <img 
                    src={fileItem.preview} 
                    alt="Preview" 
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  getFileIcon(fileItem.file.name)
                )}
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileItem.file.name}
                  </p>
                  {getSecurityStatusIcon(fileItem)}
                </div>
                <p className="text-xs text-gray-500">
                  {fileUploadManager.formatFileSize(fileItem.file.size)}
                </p>
                
                {/* Security Status */}
                {fileItem.securityScan && (
                  <div className="mt-1">
                    <p className={`text-xs ${
                      fileItem.securityScan.isSecure ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Security: {fileItem.securityScan.isSecure ? 'Secure' : 'Risk detected'}
                      {fileItem.securityScan.riskScore > 0 && ` (${fileItem.securityScan.riskScore}% risk)`}
                    </p>
                  </div>
                )}
                
                {/* Progress Bar */}
                {fileItem.status === 'uploading' && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${fileItem.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {fileItem.progress}% uploaded
                    </p>
                  </div>
                )}
                
                {/* Error Message */}
                {fileItem.status === 'error' && (
                  <p className="text-xs text-red-600 mt-1">
                    {fileItem.error}
                  </p>
                )}

                {/* Security Warnings */}
                {fileItem.securityScan?.warnings?.length > 0 && (
                  <div className="mt-1">
                    {fileItem.securityScan.warnings.slice(0, 2).map((warning, idx) => (
                      <p key={idx} className="text-xs text-yellow-600">
                        ⚠️ {warning}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {fileItem.status === 'uploading' && (
                  <Loader className="h-4 w-4 text-primary-600 animate-spin" />
                )}
                {fileItem.status === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {fileItem.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                {fileItem.status === 'security-failed' && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                {fileItem.status === 'scanning' && (
                  <Shield className="h-4 w-4 text-blue-600 animate-pulse" />
                )}
                {fileItem.status === 'ready' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(fileItem.id)
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Alert */}
      {hasSecurityIssues && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800 font-medium">Security Issues Detected</p>
          </div>
          <p className="text-xs text-red-700 mt-1">
            Some files failed security validation. Review the issues above before proceeding.
          </p>
        </div>
      )}

      {/* Upload Button */}
      {hasReadyFiles && (
        <div className="mt-4 flex space-x-3">
          <button
            onClick={uploadFiles}
            disabled={uploading || hasUploadingFiles}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {uploading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            <span>{uploading ? 'Uploading...' : 'Upload Secure Files'}</span>
          </button>
          
          {!uploading && (
            <button
              onClick={clearFiles}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedFileUpload