// pages/HomePage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FiCode, 
  FiUsers, 
  FiZap,
  FiTarget,
  FiArrowRight,
  FiPlay,
  FiCalendar,
  FiAward,
  FiTrendingUp
} from 'react-icons/fi';
import api from '../services/api';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContests: 0,
    totalProblems: 0,
    activeContests: 0
  });
  const [featuredContests, setFeaturedContests] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    try {
      const [statsRes, contestsRes, leaderboardRes] = await Promise.all([
        api.get('/stats/platform'),
        api.get('/contests?featured=true&limit=3'),
        api.get('/leaderboard/global?limit=5')
      ]);

      setStats(statsRes.data || {});
      setFeaturedContests(contestsRes.data?.contests || []);
      setTopPerformers(leaderboardRes.data || []);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth/register');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Coding Through
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Competition
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join thousands of developers in daily coding challenges, compete in contests, 
              and track your progress on our comprehensive leaderboard system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
                <FiArrowRight className="inline-block ml-2" />
              </button>
              <Link
                to="/contests"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                Browse Contests
              </Link>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalUsers?.toLocaleString()}</div>
                <div className="text-gray-600">Active Coders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalContests?.toLocaleString()}</div>
                <div className="text-gray-600">Contests Hosted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalProblems?.toLocaleString()}</div>
                <div className="text-gray-600">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.activeContests}</div>
                <div className="text-gray-600">Live Contests</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to improve your coding skills and compete with developers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Daily Challenges</h3>
              <p className="text-gray-600">
                AI-generated problems every day to keep your skills sharp and learning continuous
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiAward className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Contests</h3>
              <p className="text-gray-600">
                Participate in real-time coding competitions and climb the global leaderboard
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Progress Tracking</h3>
              <p className="text-gray-600">
                Detailed analytics and performance metrics to track your coding journey
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Contests */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Contests</h2>
              <p className="text-gray-600">Join these exciting contests and test your skills</p>
            </div>
            <Link
              to="/contests"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View All Contests
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredContests.map(contest => (
              <div key={contest._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      contest.status === 'active' ? 'bg-green-100 text-green-800' :
                      contest.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contest.status === 'active' ? 'Live Now' : contest.status}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <FiUsers className="w-4 h-4 mr-1" />
                      {contest.participants?.length || 0}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{contest.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{contest.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      {formatDate(contest.startTime)}
                    </div>
                    <div className="flex items-center">
                      <FiZap className="w-4 h-4 mr-1" />
                      {contest.problems?.length || 0} Problems
                    </div>
                  </div>
                  
                  <Link
                    to={`/contest/${contest._id}`}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-center font-medium flex items-center justify-center"
                  >
                    {contest.status === 'active' ? 'Join Now' : 'View Details'}
                    <FiPlay className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {featuredContests.length === 0 && (
            <div className="text-center py-12">
              <FiAward className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Contests</h3>
              <p className="text-gray-600">Check back soon for exciting contests!</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Performers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Top Performers</h2>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer._id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{performer.name}</h4>
                      <p className="text-sm text-gray-600">{performer.problemsSolved} problems solved</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{performer.rating}</div>
                      <div className="text-sm text-gray-500">Rating</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/leaderboard"
                className="inline-flex items-center mt-6 text-blue-600 hover:text-blue-700 font-medium"
              >
                View Full Leaderboard
                <FiArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
              <p className="text-blue-100 mb-6">
                Join our community of passionate developers and start improving your coding skills today. 
                Participate in contests, solve daily challenges, and climb the leaderboard!
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <FiTarget className="w-5 h-5 mr-3 text-blue-200" />
                  <span>Personalized learning path</span>
                </div>
                <div className="flex items-center">
                  <FiAward className="w-5 h-5 mr-3 text-blue-200" />
                  <span>Earn badges and achievements</span>
                </div>
                <div className="flex items-center">
                  <FiUsers className="w-5 h-5 mr-3 text-blue-200" />
                  <span>Connect with other developers</span>
                </div>
              </div>
              
              <button
                onClick={handleGetStarted}
                className="w-full mt-6 bg-white text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {user ? 'Continue Coding' : 'Sign Up Now'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Your Coding Journey Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers who are already improving their skills through our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              {user ? 'Go to Dashboard' : 'Create Free Account'}
            </button>
            <Link
              to="/contests"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              Explore Contests
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;