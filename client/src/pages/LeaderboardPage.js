// pages/LeaderboardPage.js
import React, { useState } from 'react';
import { FiAward, FiCalendar, FiUsers, FiTarget } from 'react-icons/fi';
import GlobalLeaderboard from '../components/leaderboard/GlobalLeaderboard';
import WeeklyLeaderboard from '../components/leaderboard/WeeklyLeaderboard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('global');

  const tabs = [
    {
      id: 'weekly',
      name: 'Weekly',
      icon: FiCalendar,
      description: 'Top performers this week'
    },
    {
      id: 'global',
      name: 'Global', 
      icon: FiAward,
      description: 'All-time rankings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Leaderboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how you rank among the coding community. Compete, improve, and climb the ranks!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAward className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Performers</h3>
            <p className="text-gray-600">Celebrating the best coders</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Community</h3>
            <p className="text-gray-600">Thousands of active participants</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTarget className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fair Competition</h3>
            <p className="text-gray-600">Skill-based ranking system</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Description */}
          <div className="px-6 py-4 bg-gray-50">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="bg-white rounded-lg shadow-md">
          {activeTab === 'global' ? <GlobalLeaderboard /> : <WeeklyLeaderboard />}
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              How Rankings Work
            </h3>
            <p className="text-blue-700 mb-4">
              Your rank is calculated based on problems solved, contest performance, and consistency. 
              Keep participating to improve your position!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-600">
              <div className="bg-white rounded-lg p-4">
                <strong>Contest Performance</strong>
                <br />
                Higher ranks in contests give more points
              </div>
              <div className="bg-white rounded-lg p-4">
                <strong>Problem Difficulty</strong>
                <br />
                Harder problems contribute more to your score
              </div>
              <div className="bg-white rounded-lg p-4">
                <strong>Consistency</strong>
                <br />
                Regular participation boosts your ranking
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;