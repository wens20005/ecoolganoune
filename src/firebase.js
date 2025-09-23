// Firebase configuration
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Validate required environment variables
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-firebase-api-key') {
  console.warn('Firebase configuration not properly set. Using mock services for development.')
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// For development/testing without Firebase, you can use a mock storage
// Comment out the line above and uncomment the lines below for local testing
// export const storage = {
//   ref: () => ({}),
//   uploadBytesResumable: () => ({
//     on: (event, progress, error, complete) => {
//       setTimeout(() => progress({ bytesTransferred: 50, totalBytes: 100 }), 500)
//       setTimeout(() => complete(), 1000)
//     },
//     snapshot: { ref: {} }
//   }),
//   getDownloadURL: () => Promise.resolve('https://example.com/mock-file.pdf'),
//   deleteObject: () => Promise.resolve()
// }

export default app