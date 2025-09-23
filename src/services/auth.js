/**
 * Authentication Service with Role-Based Access Control
 * Handles user authentication, registration, and role management
 */

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { secureApiService } from './secureApi';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    this.listeners = new Set();
    
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        await this.loadUserRole();
        await secureApiService.logSecurityEvent('user_login', {
          uid: user.uid,
          email: user.email
        });
      } else {
        this.userRole = null;
      }
      
      // Notify listeners
      this.listeners.forEach(callback => callback(user, this.userRole));
    });
  }

  /**
   * Register new user with role assignment
   */
  async register(email, password, userData = {}) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set default role (student)
      const role = userData.role || 'student';
      
      // Validate role
      if (!['student', 'teacher', 'admin'].includes(role)) {
        throw new Error('Invalid role specified');
      }

      // Create user document
      const userDoc = {
        uid: user.uid,
        email: user.email,
        role: role,
        profile: {
          displayName: userData.displayName || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          avatar: userData.avatar || '',
          bio: userData.bio || '',
          preferences: {
            language: userData.language || 'en',
            theme: 'light',
            notifications: true
          }
        },
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        metadata: {
          registrationIP: await this.getClientIP(),
          userAgent: navigator.userAgent
        }
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);

      // Update display name
      if (userData.displayName) {
        await updateProfile(user, { displayName: userData.displayName });
      }

      await secureApiService.logSecurityEvent('user_registration', {
        uid: user.uid,
        email: user.email,
        role: role
      });

      return user;
    } catch (error) {
      await secureApiService.logSecurityEvent('registration_failed', {
        email: email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Sign in user
   */
  async signIn(email, password, rememberMe = false) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date().toISOString(),
        'metadata.lastLoginIP': await this.getClientIP()
      });

      return user;
    } catch (error) {
      await secureApiService.logSecurityEvent('login_failed', {
        email: email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      if (this.currentUser) {
        await secureApiService.logSecurityEvent('user_logout', {
          uid: this.currentUser.uid
        });
      }
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      await secureApiService.logSecurityEvent('password_reset_requested', {
        email: email
      });
    } catch (error) {
      await secureApiService.logSecurityEvent('password_reset_failed', {
        email: email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Load user role from Firestore
   */
  async loadUserRole() {
    if (!this.currentUser) return null;

    try {
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
      if (userDoc.exists()) {
        this.userRole = userDoc.data().role || 'student';
        return this.userRole;
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
    
    this.userRole = 'student'; // default fallback
    return this.userRole;
  }

  /**
   * Get user profile data
   */
  async getUserProfile() {
    if (!this.currentUser) return null;

    try {
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
    
    return null;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates) {
    if (!this.currentUser) throw new Error('No user signed in');

    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', this.currentUser.uid), updatedData);
      
      // Update Firebase Auth profile if display name changed
      if (updates['profile.displayName']) {
        await updateProfile(this.currentUser, { 
          displayName: updates['profile.displayName'] 
        });
      }

      await secureApiService.logSecurityEvent('profile_updated', {
        uid: this.currentUser.uid,
        fields: Object.keys(updates)
      });

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.userRole === role;
  }

  /**
   * Check if user is teacher or admin
   */
  isTeacherOrAdmin() {
    return this.hasRole('teacher') || this.hasRole('admin');
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get client IP (best effort)
   */
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get current user role
   */
  getCurrentUserRole() {
    return this.userRole;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }
}

export const authService = new AuthService();
export default authService;