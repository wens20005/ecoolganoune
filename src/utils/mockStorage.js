// Mock storage for testing when Firebase is not configured
export const createMockStorage = () => {
  return {
    ref: (path) => ({
      path: path,
      fullPath: path
    }),
    
    uploadBytesResumable: (ref, file) => {
      return {
        on: (event, onProgress, onError, onComplete) => {
          // Simulate upload progress
          let progress = 0
          const interval = setInterval(() => {
            progress += Math.random() * 20
            if (progress < 100) {
              onProgress({
                bytesTransferred: (progress / 100) * file.size,
                totalBytes: file.size,
                state: 'running'
              })
            } else {
              clearInterval(interval)
              onComplete()
            }
          }, 200)
          
          // Simulate potential error (5% chance)
          if (Math.random() < 0.05) {
            setTimeout(() => {
              clearInterval(interval)
              onError(new Error('Mock upload error'))
            }, 1000)
          }
        },
        
        snapshot: {
          ref: ref
        }
      }
    },
    
    getDownloadURL: (ref) => {
      // Generate a mock download URL
      const fileName = ref.path.split('/').pop()
      return Promise.resolve(`https://mock-storage.example.com/${ref.path}?file=${fileName}&timestamp=${Date.now()}`)
    },
    
    deleteObject: (ref) => {
      console.log('Mock: Deleting file at', ref.path)
      return Promise.resolve()
    }
  }
}

export default createMockStorage()