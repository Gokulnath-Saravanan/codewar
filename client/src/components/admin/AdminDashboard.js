// components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Code, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  Activity,
  Plus,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { adminAPI, problemAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getActivities()
      ]);
      setStats(statsRes.data);
      setRecentActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyProblem = async () => {
    try {
      setLoading(true);
      const response = await problemAPI.generateDailyProblems();
      setMessage('Problem generated successfully!');
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      setMessage('Error generating problem: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
              {change.value}% {change.type}
            </p>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${
        activity.type === 'user_registered' ? 'bg-green-100' :
        activity.type === 'contest_created' ? 'bg-blue-100' :
        activity.type === 'problem_solved' ? 'bg-purple-100' : 'bg-gray-100'
      }`}>
        {activity.type === 'user_registered' && <Users className="w-4 h-4 text-green-600" />}
        {activity.type === 'contest_created' && <Calendar className="w-4 h-4 text-blue-600" />}
        {activity.type === 'problem_solved' && <Code className="w-4 h-4 text-purple-600" />}
        {activity.type === 'submission_made' && <Activity className="w-4 h-4 text-gray-600" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contest Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Contest Management</h2>
          <div className="space-y-4">
            <Link 
              to="/admin/contests/create" 
              className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700"
            >
              Create New Contest
            </Link>
            <Link 
              to="/admin/contests" 
              className="block w-full bg-gray-100 text-gray-800 text-center py-2 px-4 rounded hover:bg-gray-200"
            >
              Manage Contests
            </Link>
          </div>
        </div>

        {/* Problem Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Problem Management</h2>
          <div className="space-y-4">
            <Link 
              to="/admin/problems/create" 
              className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded hover:bg-green-700"
            >
              Create Problem Manually
            </Link>
            <Link 
              to="/admin/problems/ai-generate" 
              className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded hover:bg-purple-700"
            >
              Generate with AI
            </Link>
            <Link 
              to="/admin/problems" 
              className="block w-full bg-gray-100 text-gray-800 text-center py-2 px-4 rounded hover:bg-gray-200"
            >
              Manage Problems
            </Link>
          </div>
        </div>

        {/* Daily Problem Generation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Daily Problems</h2>
          <div className="space-y-4">
            <button
              onClick={generateDailyProblem}
              disabled={loading}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 disabled:bg-yellow-400"
            >
              {loading ? 'Generating...' : 'Generate Daily Problem'}
            </button>
            <Link 
              to="/admin/problems/daily-settings" 
              className="block w-full bg-gray-100 text-gray-800 text-center py-2 px-4 rounded hover:bg-gray-200"
            >
              Configure Daily Generation
            </Link>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <Link 
            to="/admin/users" 
            className="inline-block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Manage Users
          </Link>
        </div>
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;