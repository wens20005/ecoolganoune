/**
 * Upload History and Student Progress Tracking Component
 * Displays comprehensive upload timeline, progress metrics, and achievements
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  FileText, 
  TrendingUp, 
  Award, 
  Calendar, 
  BarChart3, 
  Target,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Brain,
  Star,
  Trophy,
  Filter,
  Search
} from 'lucide-react';
import { databaseService } from '../services/database.js';
import AIFeedback from './AIFeedback.jsx';

const UploadHistory = ({ userId, onClose }) => {
  const [uploads, setUploads] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [showAIFeedback, setShowAIFeedback] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [uploadsData, statsData, achievementsData] = await Promise.all([
        databaseService.getUserUploads(userId),
        databaseService.getUserStats(userId),
        databaseService.getUserAchievements(userId)
      ]);

      setUploads(uploadsData);
      setUserStats(statsData);
      setAchievements(achievementsData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUploads = uploads.filter(upload => {
    const matchesFilter = filterType === 'all' || upload.status === filterType;
    const matchesSearch = upload.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upload.course?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'graded': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'timeline', label: 'Upload Timeline', icon: Clock },
    { id: 'progress', label: 'Progress Overview', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Clock className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Loading Your Progress</h3>
            <p className="text-gray-600">Fetching your upload history and achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">My Learning Journey</h2>
                <p className="text-blue-100">Track your progress and achievements</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.level || 1}</div>
                <div className="text-sm text-blue-100">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.totalUploads || 0}</div>
                <div className="text-sm text-blue-100">Uploads</div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b bg-gray-50">
          <div className="flex space-x-1 p-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search uploads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="graded">Graded</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Upload Timeline */}
                <div className="space-y-4">
                  {filteredUploads.length > 0 ? (
                    filteredUploads.map((upload, index) => (
                      <motion.div
                        key={upload.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <h4 className="font-semibold text-gray-800">{upload.fileName}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(upload.status)}`}>
                                {upload.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              <div>
                                <span className="font-medium">Course:</span> {upload.course || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Size:</span> {formatFileSize(upload.size)}
                              </div>
                              <div>
                                <span className="font-medium">Uploaded:</span> {new Date(upload.uploadedAt).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Grade:</span> {upload.grade ? `${upload.grade}%` : 'Pending'}
                              </div>
                            </div>
                            {upload.feedback && (
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                {upload.feedback}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            {upload.hasAIFeedback && (
                              <button
                                onClick={() => {
                                  setSelectedUpload(upload);
                                  setShowAIFeedback(true);
                                }}
                                className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                              >
                                <Brain className="h-4 w-4" />
                                <span>AI Feedback</span>
                              </button>
                            )}
                            <button className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                            <button className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No uploads found</h3>
                      <p className="text-gray-500">Start uploading files to see your progress here!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Progress Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Total Uploads</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-900">{userStats.totalUploads || 0}</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h3 className="font-semibold text-green-800">Avg Grade</h3>
                    </div>
                    <div className="text-3xl font-bold text-green-900">{userStats.averageGrade?.toFixed(1) || 0}%</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <Star className="h-6 w-6 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Total XP</h3>
                    </div>
                    <div className="text-3xl font-bold text-purple-900">{userStats.totalPoints || 0}</div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <Trophy className="h-6 w-6 text-yellow-600" />
                      <h3 className="font-semibold text-yellow-800">Badges</h3>
                    </div>
                    <div className="text-3xl font-bold text-yellow-900">{userStats.badges?.length || 0}</div>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Level Progress</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">Level {userStats.level || 1}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{userStats.xp || 0} XP</span>
                        <span>{((userStats.level || 1) * 1000)} XP</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${((userStats.xp || 0) % 1000) / 10}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Next Level</div>
                      <div className="font-semibold">{1000 - ((userStats.xp || 0) % 1000)} XP</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-800">Your Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.length > 0 ? (
                    achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 text-center"
                      >
                        <div className="text-4xl mb-3">{achievement.icon}</div>
                        <h4 className="font-semibold text-gray-800 mb-2">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                        <div className="text-xs text-gray-500">
                          Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No achievements yet</h3>
                      <p className="text-gray-500">Keep uploading and completing assignments to earn badges!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-800">Performance Analytics</h3>
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">Analytics Coming Soon</h4>
                  <p className="text-gray-500">Detailed performance analytics and insights will be available here.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* AI Feedback Modal */}
      {showAIFeedback && selectedUpload && (
        <AIFeedback
          file={selectedUpload}
          assignment={{ id: selectedUpload.assignmentId, rubric: { criteria: [] } }}
          student={{ id: userId, learningProfile: {} }}
          onClose={() => setShowAIFeedback(false)}
          onRetryAnalysis={() => setShowAIFeedback(false)}
        />
      )}
    </div>
  );
};

export default UploadHistory;