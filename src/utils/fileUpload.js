// File upload utility with Firebase Storage integration
import { storage } from '../firebase'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import mockStorage from './mockStorage'

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  try {
    return storage && typeof storage.app !== 'undefined'
  } catch (error) {
    return false
  }
}

// Get storage instance (real or mock)
const getStorage = () => {
  if (isFirebaseConfigured()) {
    return {
      ref: (path) => ref(storage, path),
      uploadBytesResumable,
      getDownloadURL,
      deleteObject
    }
  } else {
    console.warn('Firebase not configured, using mock storage for testing')
    return mockStorage
  }
}

export class FileUploadManager {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024 // 10MB
    this.allowedTypes = {
      documents: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
      images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      videos: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
      audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
      archives: ['zip', 'rar', '7z', 'tar', 'gz']
    }
  }

  // Validate file before upload
  validateFile(file) {
    const errors = []
    
    if (!file) {
      errors.push('No file selected')
      return errors
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size must be less than ${this.maxFileSize / (1024 * 1024)}MB`)
    }

    // Check file type
    const fileExtension = this.getFileExtension(file.name).toLowerCase()
    const allAllowedTypes = Object.values(this.allowedTypes).flat()
    
    if (!allAllowedTypes.includes(fileExtension)) {
      errors.push(`File type .${fileExtension} is not supported`)
    }

    // Check for malicious file names
    if (this.containsSuspiciousContent(file.name)) {
      errors.push('File name contains invalid characters')
    }

    return errors
  }

  // Get file extension
  getFileExtension(filename) {
    return filename.split('.').pop() || ''
  }

  // Check for suspicious content in filename
  containsSuspiciousContent(filename) {
    const suspiciousPatterns = [
      /[<>:"/\\|?*]/,  // Invalid file system characters
      /\.(exe|bat|cmd|scr|pif|com)$/i,  // Executable files
      /^\./,  // Hidden files starting with dot
    ]
    
    return suspiciousPatterns.some(pattern => pattern.test(filename))
  }

  // Generate unique filename
  generateUniqueFilename(originalName, prefix = '') {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = this.getFileExtension(originalName)
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName
    
    return `${prefix}${baseName}_${timestamp}_${randomString}.${extension}`
  }

  // Upload file to Firebase Storage
  async uploadFile(file, path = 'uploads', onProgress = null) {
    try {
      // Validate file first
      const validationErrors = this.validateFile(file)
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '))
      }

      // Generate unique filename
      const filename = this.generateUniqueFilename(file.name)
      const fullPath = `${path}/${filename}`
      
      // Get storage instance
      const storageInstance = getStorage()
      
      // Create storage reference
      const storageRef = storageInstance.ref(fullPath)
      
      // Create upload task
      const uploadTask = storageInstance.uploadBytesResumable(storageRef, file)
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress callback
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            if (onProgress) {
              onProgress({
                progress: Math.round(progress),
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                state: snapshot.state
              })
            }
          },
          (error) => {
            // Error callback
            console.error('Upload error:', error)
            let errorMessage = 'Upload failed'
            
            switch (error.code) {
              case 'storage/unauthorized':
                errorMessage = 'You do not have permission to upload files'
                break
              case 'storage/canceled':
                errorMessage = 'Upload was canceled'
                break
              case 'storage/quota-exceeded':
                errorMessage = 'Storage quota exceeded'
                break
              case 'storage/invalid-format':
                errorMessage = 'Invalid file format'
                break
              case 'storage/invalid-event-name':
                errorMessage = 'Invalid upload event'
                break
              default:
                errorMessage = error.message || 'Upload failed'
            }
            
            reject(new Error(errorMessage))
          },
          async () => {
            // Success callback
            try {
              const storageInstance = getStorage()
              const downloadURL = await storageInstance.getDownloadURL(uploadTask.snapshot.ref)
              resolve({
                url: downloadURL,
                path: fullPath,
                filename: filename,
                originalName: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
              })
            } catch (error) {
              reject(new Error('Failed to get download URL'))
            }
          }
        )
      })
    } catch (error) {
      throw error
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, path = 'uploads', onProgress = null) {
    const results = []
    const errors = []
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadFile(files[i], path, (progress) => {
          if (onProgress) {
            onProgress({
              fileIndex: i,
              fileName: files[i].name,
              ...progress,
              totalFiles: files.length,
              completedFiles: results.length
            })
          }
        })
        results.push(result)
      } catch (error) {
        errors.push({
          file: files[i].name,
          error: error.message
        })
      }
    }
    
    return { results, errors }
  }

  // Delete file from Firebase Storage
  async deleteFile(filePath) {
    try {
      const storageInstance = getStorage()
      const storageRef = storageInstance.ref(filePath)
      await storageInstance.deleteObject(storageRef)
      return true
    } catch (error) {
      console.error('Delete error:', error)
      throw new Error('Failed to delete file')
    }
  }

  // Get file category based on extension
  getFileCategory(filename) {
    const extension = this.getFileExtension(filename).toLowerCase()
    
    for (const [category, extensions] of Object.entries(this.allowedTypes)) {
      if (extensions.includes(extension)) {
        return category
      }
    }
    
    return 'unknown'
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Create file preview URL for images
  createPreviewURL(file) {
    if (file && file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return null
  }

  // Cleanup preview URLs
  revokePreviewURL(url) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }
}

// Create singleton instance
export const fileUploadManager = new FileUploadManager()

// Helper functions for easy access
export const uploadFile = (file, path, onProgress) => 
  fileUploadManager.uploadFile(file, path, onProgress)

export const uploadMultipleFiles = (files, path, onProgress) => 
  fileUploadManager.uploadMultipleFiles(files, path, onProgress)

export const validateFile = (file) => 
  fileUploadManager.validateFile(file)

export const formatFileSize = (bytes) => 
  fileUploadManager.formatFileSize(bytes)

export const getFileCategory = (filename) => 
  fileUploadManager.getFileCategory(filename)

export default fileUploadManager