// components/leaderboard/GlobalLeaderboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Award, Star, User, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { leaderboardAPI } from '../../services/api';

const GlobalLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const { user } = useAuth();

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await leaderboardAPI.getGlobalLeaderboard({ timeRange });
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchLeaderboard();
    if (user?._id) {
      fetchCurrentUserRank();
    }
  }, [fetchLeaderboard, user?._id]);

  const fetchCurrentUserRank = async () => {
    if (!user?._id) return;
    
    try {
      const response = await leaderboardAPI.getUserRank(user._id);
      if (response.data) {
        setCurrentUser({
          ...user,
          rank: {
            global: response.data.global || 'N/A',
            weekly: response.data.weekly || 'N/A',
            monthly: response.data.monthly || 'N/A'
          },
          totalScore: user.stats?.totalPoints || 0
        });
      }
    } catch (error) {
      // Only log the error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching user rank:', error);
      }
      // Don't show the current user rank section if there's an error
      setCurrentUser(null);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return <Star className="w-6 h-6 text-gray-300" />;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Trophy className="w-8 h-8" />
                Global Leaderboard
              </h1>
              <p className="text-purple-100 mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {timeRange === 'all' ? 'All Time Rankings' : 
                 timeRange === 'month' ? 'This Month\'s Rankings' : 
                 'This Week\'s Rankings'}
              </p>
            </div>
            <div className="flex gap-2">
              {['all', 'month', 'week'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    timeRange === range
                      ? 'bg-white text-purple-600'
                      : 'bg-purple-500 text-white hover:bg-purple-400'
                  }`}
                >
                  {range === 'all' ? 'All Time' : 
                   range === 'month' ? 'This Month' : 'This Week'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current User Rank */}
        {currentUser && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div className="flex flex-col">
                  <span className="font-medium text-blue-800">
                    Global Rank: #{currentUser.rank.global}
                  </span>
                  <span className="text-sm text-blue-600">
                    Weekly: #{currentUser.rank.weekly} • Monthly: #{currentUser.rank.monthly}
                  </span>
                </div>
              </div>
              <div className="text-blue-600">
                <span className="font-bold">{currentUser.totalScore}</span> points
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="p-6">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No rankings yet
              </h3>
              <p className="text-gray-500">
                Be the first to participate in contests and claim your spot!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={user._id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${getRankBg(
                    index + 1
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index + 1)}
                        <span className="text-2xl font-bold text-gray-700">
                          #{index + 1}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">
                            {user.username || 'Unknown User'}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {user.totalScore || 0}
                      </div>
                      <div className="text-sm text-gray-600">points</div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{user.contestsParticipated || 0} contests</span>
                        <span>{user.problemsSolved || 0} solved</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats for Top 3 */}
                  {index < 3 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-800">
                            {user.averageScore || 0}
                          </div>
                          <div className="text-xs text-gray-600">Avg Score</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-800">
                            {user.bestRank || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-600">Best Rank</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-800">
                            {user.winRate || 0}%
                          </div>
                          <div className="text-xs text-gray-600">Win Rate</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalLeaderboard;