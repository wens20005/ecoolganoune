<<<<<<< HEAD
# GANOUNE
=======
# Educational Web App 🎓

A comprehensive educational platform for students and teachers built with React, TailwindCSS, and Firebase.

## Features

### 📚 Courses Section
- Upload and organize lessons in sequence
- **File Upload System** - Upload PDFs, documents, videos, and images
- Sequential lesson progression (lesson 1 → lesson 2 → lesson 3)
- Track lesson completion status
- Lock/unlock mechanism for structured learning
- **Drag & Drop Interface** - Easy file management
- **Progress Tracking** - Visual upload progress indicators

### ✏️ Exercises Section  
- Create custom exercises with auto-correction
- **File Upload for Exercises** - Convert documents to interactive exercises
- Scoring system out of 20 points
- Interactive animations based on score:
  - 🎆 Fireworks for perfect scores (20/20)
  - ⭐ Stars for great scores (15-19/20)
  - 📚 Encouragement for lower scores
- Sound effects: "Bravo!" for correct answers, "Ohhh" for wrong answers
- **Smart File Processing** - Automatic exercise generation from uploaded materials

### 📅 Exams Section
- Schedule and manage exams
- Timeline view for past and upcoming exams
- Score tracking and progress visualization
- Exam duration and description management

### 🤖 AI Chat Assistant
- Integrated chatbot for student questions
- OpenAI API integration (API key required)
- Real-time conversation interface
- Local API key storage for security

### 📊 Analytics Dashboard
- Student performance monitoring
- Subject-wise performance tracking
- Teacher recommendations and insights
- Completion rates and revision needs
- Top performers leaderboard

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Backend**: Firebase (Firestore, Auth, Storage)
- **AI**: OpenAI API
- **Routing**: React Router DOM

## Prerequisites

Before running this application, you need to install:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - This will also install npm (Node Package Manager)

## Installation & Setup

### 1. Install Node.js
1. Go to https://nodejs.org/
2. Download the LTS version for Windows
3. Run the installer and follow the setup wizard
4. Restart your command prompt/PowerShell

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable Authentication, Firestore Database, and Storage
4. Get your Firebase config object from Project Settings
5. Replace the config in `src/firebase.js` with your actual Firebase config

### 4. OpenAI API Setup (Optional)
1. Go to https://platform.openai.com/
2. Create an account and get your API key
3. Enter the API key in the Chat section settings

## Running the Application

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── Navigation.jsx      # Main navigation component
├── pages/
│   ├── Courses.jsx         # Courses management
│   ├── Exercises.jsx       # Exercise creation and taking
│   ├── Exams.jsx          # Exam scheduling and tracking
│   ├── Chat.jsx           # AI chat assistant
│   └── Analytics.jsx      # Performance analytics
├── firebase.js            # Firebase configuration
├── App.jsx               # Main app component
├── main.jsx              # App entry point
└── index.css             # Global styles with Tailwind
```

## Key Features Implemented

✅ **File Upload System** - Complete drag & drop file upload with progress tracking  
✅ **Smart File Processing** - Automatic conversion of documents to lessons/exercises  
✅ **Error Handling** - Comprehensive upload error handling and user feedback  
✅ **File Validation** - Size limits, type checking, and security validation  
✅ **Multiple Storage Options** - Firebase Storage integration with mock fallback  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **Modern UI** - Clean, professional interface with TailwindCSS  
✅ **Sequential Learning** - Locked lessons until prerequisites are completed  
✅ **Auto-Correction** - Instant feedback on exercises  
✅ **Score Animations** - Visual feedback based on performance  
✅ **Sound Effects** - Audio feedback for correct/incorrect answers  
✅ **AI Integration** - ChatGPT-style assistant for student help  
✅ **Analytics Dashboard** - Comprehensive performance tracking  
✅ **Exam Management** - Schedule and track exam timeline  
✅ **Firebase Ready** - Database and authentication setup  

## Usage

### For Teachers:
1. **Courses**: Create courses and add lessons in sequence
2. **Exercises**: Design auto-corrected exercises with custom questions
3. **Exams**: Schedule exams and track student performance
4. **Analytics**: Monitor class performance and get teaching recommendations

### For Students:
1. **Courses**: Progress through lessons sequentially
2. **Exercises**: Complete exercises and get instant feedback with animations
3. **Exams**: Take scheduled exams and view results
4. **Chat**: Ask the AI assistant any study-related questions

## Customization

- **Colors**: Modify the color scheme in `tailwind.config.js`
- **Animations**: Add more animations in the TailwindCSS config
- **Sound Effects**: Replace the synthesized sounds with actual audio files
- **AI Responses**: Customize the AI response logic in `Chat.jsx`

## Security Notes

- API keys are stored locally in browser localStorage
- Firebase rules should be configured for production use
- OpenAI API usage will incur costs based on usage

## Support

For issues or questions about setup:
1. Ensure Node.js is properly installed (`node --version` should work)
2. Check that all dependencies are installed (`npm install`)
3. Verify Firebase configuration is correct
4. Make sure OpenAI API key is valid (if using chat feature)

## Future Enhancements

- Real-time collaboration features
- Video lesson support
- Advanced analytics with charts
- Mobile app version
- Offline mode support
- Multi-language support

---

Built with ❤️ for education
>>>>>>> 27d518d (first commit)
