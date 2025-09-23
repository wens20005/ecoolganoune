@echo off
echo Educational Web App Setup
echo =========================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Choose the LTS version and restart this script after installation.
    pause
    exit /b 1
)

echo Node.js is installed. Version:
node --version
echo.

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available!
    echo This usually means Node.js installation was incomplete.
    echo Please reinstall Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo npm is available. Version:
npm --version
echo.

echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo Setup completed successfully! 🎉
echo ===============================================
echo.
echo To start the development server, run:
echo npm run dev
echo.
echo Don't forget to:
echo 1. Set up your Firebase configuration in src/firebase.js
echo 2. Get an OpenAI API key for the chat feature (optional)
echo.
echo The app will be available at: http://localhost:3000
echo.
pause