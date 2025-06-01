// components/leaderboard/WeeklyLeaderboard.js
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, Calendar } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiAward } from 'react-icons/fi';
const WeeklyLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [weekOptions, setWeekOptions] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
    generateWeekOptions();
  }, [selectedWeek]);

  function getCurrentWeek() {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return startOfWeek.toISOString().split('T')[0];
  }

  const generateWeekOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + (i * 7)));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      options.push({
        value: weekStart.toISOString().split('T')[0],
        label: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
        isCurrent: i === 0
      });
    }
    
    setWeekOptions(options);
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get(`/leaderboard/weekly?week=${selectedWeek}`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="font-bold text-lg text-gray-600">#{rank}</span>;
    }
  };

  const getRankBackground = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 1000) return 'bg-purple-100 text-purple-800';
    if (score >= 500) return 'bg-blue-100 text-blue-800';
    if (score >= 200) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Leaderboard</h1>
            <p className="text-gray-600">Top performers of the week based on contest participation</p>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {weekOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {leaderboard.length > 0 ? (
          <div className="space-y-4">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <div className="text-center order-1">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-gray-200">
                    <div className="flex justify-center mb-3">
                      <Medal className="h-12 w-12 text-gray-400" />
                    </div>
                    <img
                      src={leaderboard[1]?.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[1]?.user?.username}`}
                      alt={leaderboard[1]?.user?.username}
                      className="w-16 h-16 rounded-full mx-auto mb-3"
                    />
                    <h3 className="font-semibold text-lg">{leaderboard[1]?.user?.username}</h3>
                    <p className="text-2xl font-bold text-gray-600">{leaderboard[1]?.totalScore}</p>
                    <p className="text-sm text-gray-500">{leaderboard[1]?.contestsParticipated} contests</p>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center order-2">
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 border-2 border-yellow-200 transform scale-105">
                    <div className="flex justify-center mb-3">
                      <Trophy className="h-16 w-16 text-yellow-500" />
                    </div>
                    <img
                      src={leaderboard[0]?.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[0]?.user?.username}`}
                      alt={leaderboard[0]?.user?.username}
                      className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-yellow-300"
                    />
                    <h3 className="font-semibold text-xl">{leaderboard[0]?.user?.username}</h3>
                    <p className="text-3xl font-bold text-yellow-600">{leaderboard[0]?.totalScore}</p>
                    <p className="text-sm text-gray-600">{leaderboard[0]?.contestsParticipated} contests</p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center order-3">
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-6 border-2 border-amber-200">
                    <div className="flex justify-center mb-3">
                      <Award className="h-12 w-12 text-amber-600" />
                    </div>
                    <img
                      src={leaderboard[2]?.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[2]?.user?.username}`}
                      alt={leaderboard[2]?.user?.username}
                      className="w-16 h-16 rounded-full mx-auto mb-3"
                    />
                    <h3 className="font-semibold text-lg">{leaderboard[2]?.user?.username}</h3>
                    <p className="text-2xl font-bold text-amber-600">{leaderboard[2]?.totalScore}</p>
                    <p className="text-sm text-gray-500">{leaderboard[2]?.contestsParticipated} contests</p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user._id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-md ${getRankBackground(index + 1)}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(index + 1)}
                    </div>
                    
                    <img
                      src={entry.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.user.username}`}
                      alt={entry.user.username}
                      className="w-12 h-12 rounded-full"
                    />
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {entry.user.username}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {entry.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Contests</p>
                      <p className="text-lg font-semibold">{entry.contestsParticipated}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Problems</p>
                      <p className="text-lg font-semibold">{entry.problemsSolved}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Score</p>
                      <span className={`px-3 py-1 rounded-full text-lg font-bold ${getScoreBadgeColor(entry.totalScore)}`}>
                        {entry.totalScore}
                      </span>
                    </div>

                    {entry.badges && entry.badges.length > 0 && (
                      <div className="flex space-x-1">
                        {entry.badges.slice(0, 3).map((badge, badgeIndex) => (
                          <Star key={badgeIndex} className="h-5 w-5 text-yellow-400" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data for this week</h3>
            <p className="text-gray-500">Participate in contests to see your ranking!</p>
          </div>
        )}

        {/* Statistics */}
        {leaderboard.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Week Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{leaderboard.length}</p>
                <p className="text-sm text-gray-600">Total Participants</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {Math.max(...leaderboard.map(e => e.totalScore))}
                </p>
                <p className="text-sm text-gray-600">Highest Score</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(leaderboard.reduce((sum, e) => sum + e.totalScore, 0) / leaderboard.length)}
                </p>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {leaderboard.reduce((sum, e) => sum + e.problemsSolved, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Problems Solved</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyLeaderboard;