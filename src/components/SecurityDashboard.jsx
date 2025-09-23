/**
 * Security Dashboard Component
 * Monitors security events, displays statistics, and manages security settings
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  BarChart3, 
  Clock,
  User,
  FileX,
  Lock,
  Zap,
  TrendingUp,
  RefreshCw,
  Download,
  Settings,
  Eye,
  Ban
} from 'lucide-react';
import { securityScanner } from '../services/securityScanner.js';

const SecurityDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityEvents, setSecurityEvents] = useState([]);
  const [securityStats, setSecurityStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSecurityData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const events = securityScanner.getSecurityEvents(50);
      const stats = securityScanner.getSecurityStats();
      
      setSecurityEvents(events);
      setSecurityStats(stats);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'SCAN_PASSED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'SCAN_FAILED': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'VIRUS_DETECTED': return <Ban className="h-4 w-4 text-red-600" />;
      case 'RATE_LIMIT_EXCEEDED': return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'BLACKLISTED_HASH': return <Lock className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'SCAN_PASSED': return 'border-l-green-500 bg-green-50';
      case 'SCAN_FAILED': return 'border-l-red-500 bg-red-50';
      case 'VIRUS_DETECTED': return 'border-l-red-500 bg-red-50';
      case 'RATE_LIMIT_EXCEEDED': return 'border-l-yellow-500 bg-yellow-50';
      case 'BLACKLISTED_HASH': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const tabs = [
    { id: 'overview', label: 'Security Overview', icon: Shield },
    { id: 'events', label: 'Security Events', icon: Activity },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'settings', label: 'Security Settings', icon: Settings }
  ];

  if (loading && !securityStats.totalScans) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Loading Security Dashboard</h3>
            <p className="text-gray-600">Gathering security data and statistics...</p>
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
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Security Dashboard</h2>
                <p className="text-red-100">Monitor and manage security events</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{securityStats.totalScans || 0}</div>
                <div className="text-sm text-red-100">Total Scans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">{securityStats.passedScans || 0}</div>
                <div className="text-sm text-red-100">Passed</div>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'bg-green-500' : 'bg-gray-500'}`}
                title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              >
                <RefreshCw className={`h-5 w-5 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
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
                      ? 'bg-red-600 text-white'
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
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Security Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h3 className="font-semibold text-green-800">Scans Passed</h3>
                    </div>
                    <div className="text-3xl font-bold text-green-900">{securityStats.passedScans || 0}</div>
                    <div className="text-sm text-green-700">
                      {securityStats.totalScans > 0 ? 
                        `${((securityStats.passedScans / securityStats.totalScans) * 100).toFixed(1)}% success rate` :
                        'No scans yet'
                      }
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      <h3 className="font-semibold text-red-800">Threats Blocked</h3>
                    </div>
                    <div className="text-3xl font-bold text-red-900">{securityStats.failedScans || 0}</div>
                    <div className="text-sm text-red-700">
                      Including {securityStats.virusDetections || 0} virus detections
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Zap className="h-6 w-6 text-yellow-600" />
                      <h3 className="font-semibold text-yellow-800">Rate Limits</h3>
                    </div>
                    <div className="text-3xl font-bold text-yellow-900">{securityStats.rateLimitViolations || 0}</div>
                    <div className="text-sm text-yellow-700">Violations detected</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Activity className="h-6 w-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">24h Activity</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-900">{securityStats.last24hActivity || 0}</div>
                    <div className="text-sm text-blue-700">Security events</div>
                  </div>
                </div>

                {/* Recent Security Events */}
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Security Events
                  </h3>
                  <div className="space-y-3">
                    {securityEvents.slice(0, 5).map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border-l-4 p-4 rounded ${getEventColor(event.type)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getEventIcon(event.type)}
                            <div>
                              <div className="font-medium text-gray-800">{event.type.replace(/_/g, ' ')}</div>
                              <div className="text-sm text-gray-600">{event.filename}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTimestamp(event.timestamp)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {securityEvents.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No security events recorded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">All Security Events</h3>
                  <button
                    onClick={loadSecurityData}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {securityEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-l-4 p-4 rounded-lg ${getEventColor(event.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getEventIcon(event.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-800">{event.type.replace(/_/g, ' ')}</span>
                              {event.userId && (
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                  <User className="h-3 w-3 inline mr-1" />
                                  {event.userId}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{event.filename}</div>
                            {event.details && Object.keys(event.details).length > 0 && (
                              <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                                <pre>{JSON.stringify(event.details, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {formatTimestamp(event.timestamp)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {securityEvents.length === 0 && (
                    <div className="text-center py-12">
                      <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
                      <p className="text-gray-500">Security events will appear here as they occur</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'statistics' && (
              <motion.div
                key="statistics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-800">Security Statistics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Scan Results</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Scans:</span>
                        <span className="font-semibold">{securityStats.totalScans || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Passed:</span>
                        <span className="font-semibold text-green-600">{securityStats.passedScans || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Failed:</span>
                        <span className="font-semibold text-red-600">{securityStats.failedScans || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                          style={{ 
                            width: securityStats.totalScans > 0 ? 
                              `${(securityStats.passedScans / securityStats.totalScans) * 100}%` : 
                              '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Threat Detection</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Virus Detections:</span>
                        <span className="font-semibold text-red-600">{securityStats.virusDetections || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rate Limit Violations:</span>
                        <span className="font-semibold text-yellow-600">{securityStats.rateLimitViolations || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Blacklisted Hashes:</span>
                        <span className="font-semibold text-red-600">{securityStats.blacklistedHashes || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">Security Configuration</h4>
                  <p className="text-gray-500">Security settings and configuration options will be available here.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SecurityDashboard;