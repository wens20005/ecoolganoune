/**
 * AI Feedback Component
 * Displays AI-powered analysis, corrections, and personalized feedback
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Target,
  Lightbulb,
  MessageSquare,
  BarChart3,
  Zap,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { aiCorrectionService } from '../services/aiCorrection.js';

const AIFeedback = ({ 
  file, 
  assignment, 
  student, 
  onClose, 
  onRetryAnalysis 
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    if (file && assignment && student) {
      performAnalysis();
    }
  }, [file, assignment, student]);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      const result = await aiCorrectionService.analyzeSubmission(file, assignment, student);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div 
          className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-center">
            <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">AI Analysis in Progress</h3>
            <p className="text-gray-600 mb-4">
              Analyzing your submission with advanced AI algorithms...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!analysis) return null;

  if (analysis.error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div 
          className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analysis Failed</h3>
            <p className="text-gray-600 mb-4">{analysis.error}</p>
            <div className="flex space-x-3">
              <button
                onClick={onRetryAnalysis}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Retry
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'feedback', label: 'Detailed Feedback', icon: MessageSquare },
    { id: 'rubric', label: 'Rubric Assessment', icon: BarChart3 },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'quality', label: 'Quality Metrics', icon: Target }
  ];

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
              <Brain className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">AI Analysis Results</h2>
                <p className="text-blue-100">{file.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getGradeColor(analysis.rubricAssessment?.percentage || 0)}`}>
                  {analysis.smartGrade?.letterGrade || 'N/A'}
                </div>
                <div className="text-sm text-blue-100">
                  {analysis.rubricAssessment?.percentage?.toFixed(1) || 0}%
                </div>
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
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h3 className="font-semibold text-green-800">Strengths</h3>
                    </div>
                    <ul className="space-y-1">
                      {(analysis.contentAnalysis?.strengths || []).slice(0, 3).map((strength, index) => (
                        <li key={index} className="text-sm text-green-700">• {strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp className="h-6 w-6 text-yellow-600" />
                      <h3 className="font-semibold text-yellow-800">Areas for Growth</h3>
                    </div>
                    <ul className="space-y-1">
                      {(analysis.contentAnalysis?.weaknesses || []).slice(0, 3).map((weakness, index) => (
                        <li key={index} className="text-sm text-yellow-700">• {weakness}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <Award className="h-6 w-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Key Metrics</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Word Count:</span>
                        <span className="text-sm font-medium text-blue-800">{analysis.contentAnalysis?.wordCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Readability:</span>
                        <span className="text-sm font-medium text-blue-800">{analysis.contentAnalysis?.readabilityScore?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Confidence:</span>
                        <span className="text-sm font-medium text-blue-800">{analysis.smartGrade?.confidenceLevel?.toFixed(1) || 'N/A'}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Feedback Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-600" />
                    AI Analysis Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {analysis.contentAnalysis?.mainFeedback || 'Analysis completed successfully.'}
                  </p>
                </div>

                {/* Motivational Message */}
                {analysis.personalizedFeedback?.motivation && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Encouragement
                    </h3>
                    <p className="text-purple-700">{analysis.personalizedFeedback.motivation}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Detailed Feedback Sections */}
                {analysis.personalizedFeedback && (
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        What You Did Well
                      </h3>
                      <ul className="space-y-2">
                        {(analysis.personalizedFeedback.strengths || []).map((strength, index) => (
                          <li key={index} className="text-green-700 flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                      <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {(analysis.personalizedFeedback.improvements || []).map((improvement, index) => (
                          <li key={index} className="text-yellow-700 flex items-start">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Next Steps
                      </h3>
                      <ul className="space-y-2">
                        {(analysis.personalizedFeedback.nextSteps || []).map((step, index) => (
                          <li key={index} className="text-blue-700 flex items-start">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Plagiarism Check */}
                {analysis.plagiarismCheck && (
                  <div className={`rounded-xl p-6 border ${
                    analysis.plagiarismCheck.riskLevel === 'low' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      Originality Check
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Similarity Score:</span>
                        <div className="font-semibold">{analysis.plagiarismCheck.similarityScore?.toFixed(1) || 0}%</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Risk Level:</span>
                        <div className={`font-semibold capitalize ${
                          analysis.plagiarismCheck.riskLevel === 'low' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {analysis.plagiarismCheck.riskLevel}
                        </div>
                      </div>
                    </div>
                    {analysis.plagiarismCheck.recommendations?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {analysis.plagiarismCheck.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-700">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'rubric' && (
              <motion.div
                key="rubric"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Overall Score */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Overall Assessment</h3>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getGradeColor(analysis.rubricAssessment?.percentage || 0)}`}>
                        {analysis.smartGrade?.letterGrade || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {analysis.rubricAssessment?.totalScore || 0} / {analysis.rubricAssessment?.maxScore || 0} points
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${getScoreColor(analysis.rubricAssessment?.percentage || 0)}`}
                      style={{ width: `${analysis.rubricAssessment?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Criteria Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Criteria Assessment</h3>
                  {Object.entries(analysis.rubricAssessment?.criteria || {}).map(([criterion, data]) => (
                    <div key={criterion} className="border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800 capitalize">{criterion}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            data.level === 'Excellent' ? 'bg-green-100 text-green-800' :
                            data.level === 'Proficient' ? 'bg-blue-100 text-blue-800' :
                            data.level === 'Developing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {data.level}
                          </span>
                          <span className="text-sm font-medium text-gray-600">
                            {data.score} / {data.maxScore}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreColor((data.score / data.maxScore) * 100)}`}
                          style={{ width: `${(data.score / data.maxScore) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{data.feedback}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Personalized Learning Recommendations
                </h3>

                {(analysis.recommendations || []).map((rec, index) => (
                  <div key={index} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 capitalize">{rec.area}</h4>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{rec.suggestion}</p>

                    {rec.resources && rec.resources.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Recommended Resources:</h5>
                        <ul className="space-y-1">
                          {rec.resources.map((resource, resIndex) => (
                            <li key={resIndex} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                              • {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                {(!analysis.recommendations || analysis.recommendations.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No specific recommendations at this time. Great work!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'quality' && (
              <motion.div
                key="quality"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Quality Metrics Analysis
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(analysis.qualityMetrics || {}).map(([metric, score]) => (
                    <div key={metric} className="bg-white border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 capitalize">{metric}</h4>
                        <span className="text-2xl font-bold text-blue-600">{score}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ${getScoreColor(score)}`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Topics */}
                {analysis.contentAnalysis?.keyTopics?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Key Topics Identified</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.contentAnalysis.keyTopics.map((topic, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Analysis completed on {new Date().toLocaleDateString()}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={performAnalysis}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Re-analyze</span>
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

export default AIFeedback;