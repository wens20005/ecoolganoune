// Firebase configuration
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your Firebase config object
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com", // Make sure this is set correctly
  messagingSenderId: "123456789",
  appId: "your-app-id"
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