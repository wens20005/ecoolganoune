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
  Loader
} from 'lucide-react'
import { fileUploadManager } from '../utils/fileUpload'

const FileUpload = ({ 
  onUploadSuccess, 
  onUploadError, 
  path = 'uploads',
  multiple = false,
  maxFiles = 5,
  acceptedTypes = null,
  className = '',
  showPreview = true,
  children
}) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
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

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles) => {
    const fileArray = Array.from(selectedFiles)
    
    // Limit number of files
    const limitedFiles = multiple 
      ? fileArray.slice(0, maxFiles - files.length)
      : [fileArray[0]]
    
    // Add preview URLs for images
    const filesWithPreviews = limitedFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      preview: fileUploadManager.createPreviewURL(file),
      status: 'ready', // ready, uploading, success, error
      progress: 0,
      error: null
    }))
    
    setFiles(prev => multiple ? [...prev, ...filesWithPreviews] : filesWithPreviews)
  }, [files.length, maxFiles, multiple])

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
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  // Handle input change
  const handleInputChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files)
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

  // Upload single file
  const uploadSingleFile = async (fileItem) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ))

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

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'success', progress: 100 }
          : f
      ))

      if (onUploadSuccess) {
        onUploadSuccess(result, fileItem.file)
      }

      return result

    } catch (error) {
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

  // Upload all files
  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    
    try {
      const readyFiles = files.filter(f => f.status === 'ready')
      
      for (const fileItem of readyFiles) {
        await uploadSingleFile(fileItem)
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

  const hasReadyFiles = files.some(f => f.status === 'ready')
  const hasUploadingFiles = files.some(f => f.status === 'uploading')

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
              Max file size: {fileUploadManager.formatFileSize(fileUploadManager.maxFileSize)}
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
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {fileUploadManager.formatFileSize(fileItem.file.size)}
                </p>
                
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

      {/* Upload Button */}
      {hasReadyFiles && (
        <div className="mt-4 flex space-x-3">
          <button
            onClick={uploadFiles}
            disabled={uploading || hasUploadingFiles}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
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

export default FileUpload