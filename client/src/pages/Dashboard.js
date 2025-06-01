// pages/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FiUsers, 
  FiCode, 
  FiTrendingUp,
  FiCalendar,
  FiTarget,
  FiAward
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentContests: [],
    upcomingContests: [],
    recentSubmissions: [],
    performanceData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, contestsRes, submissionsRes, performanceRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/contests?limit=5'),
        api.get('/submissions/recent?limit=5'),
        api.get('/users/performance')
      ]);

      setDashboardData({
        stats: statsRes.data,
        recentContests: contestsRes.data.contests || [],
        upcomingContests: contestsRes.data.contests?.filter(c => c.status === 'upcoming') || [],
        recentSubmissions: submissionsRes.data || [],
        performanceData: performanceRes.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'wrong_answer': return 'text-red-600 bg-red-100';
      case 'time_limit_exceeded': return 'text-orange-600 bg-orange-100';
      case 'runtime_error': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const { stats, recentContests, upcomingContests, recentSubmissions, performanceData } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Coder'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your coding journey overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Problems Solved</p>
                <p className="text-3xl font-bold text-gray-900">{stats.problemsSolved || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiCode className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contests Participated</p>
                <p className="text-3xl font-bold text-gray-900">{stats.contestsParticipated || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiAward className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Rank</p>
                <p className="text-3xl font-bold text-gray-900">#{stats.globalRank || 'N/A'}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FiAward className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.successRate || 0}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiTrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Contests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Contests</h2>
              <Link 
                to="/contests" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {upcomingContests.length > 0 ? (
              <div className="space-y-4">
                {upcomingContests.slice(0, 3).map(contest => (
                  <div key={contest._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{contest.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            <span>{formatDate(contest.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiUsers className="w-4 h-4" />
                            <span>{contest.participants?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/contest/${contest._id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Join
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No upcoming contests</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Submissions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
              <Link 
                to="/submissions" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.map(submission => (
                  <div key={submission._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{submission.problemTitle}</h4>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(submission.submittedAt)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubmissionStatusColor(submission.status)}`}>
                      {submission.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiCode className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent submissions</p>
              </div>
            )}
          </div>

          {/* Recent Contests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Contests</h2>
              <Link 
                to="/contests" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {recentContests.length > 0 ? (
              <div className="space-y-3">
                {recentContests.slice(0, 4).map(contest => (
                  <div key={contest._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{contest.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{formatDate(contest.startTime)}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          contest.status === 'active' ? 'bg-green-100 text-green-600' :
                          contest.status === 'upcoming' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {contest.status}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/contest/${contest._id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiAward className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent contests</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/contests"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiAward className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Browse Contests</span>
            </Link>
            
            <Link
              to="/problems"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCode className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">Practice Problems</span>
            </Link>
            
            <Link
              to="/leaderboard"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiAward className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="font-medium text-gray-900">Leaderboard</span>
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiTarget className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">View Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;