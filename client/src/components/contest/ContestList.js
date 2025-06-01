// components/contest/ContestList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Trophy, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import axios from 'axios';

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;  // Track if component is mounted
    
    const fetchContests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/contests', {
          signal: abortController.signal
        });
        
        // Only update state if component is still mounted
        if (isMounted) {
          setContests(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        // Only set error if it's not a cancellation and component is mounted
        if (isMounted && !axios.isCancel(error)) {
          console.error('Error fetching contests:', error);
          setError(error.message || 'Failed to fetch contests');
          setContests([]); // Ensure contests is an empty array on error
        }
      } finally {
        // Only update loading state if component is mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchContests();

    // Cleanup function
    return () => {
      isMounted = false;  // Mark component as unmounted
      abortController.abort();  // Cancel any pending requests
    };
  }, []); // Only fetch on mount

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContests = contests.filter(contest => {
    if (filter === 'all') return true;
    return contest.status === filter;
  });

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Contests</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Programming Contests</h1>
        <div className="flex space-x-4">
          {['all', 'upcoming', 'ongoing', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContests.map(contest => (
          <div
            key={contest._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                {contest.title}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contest.status)}`}>
                {contest.status}
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{contest.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(contest.startTime).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                Duration: {contest.duration} minutes
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2" />
                {contest.participants?.length || 0} participants
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Trophy className="h-4 w-4 mr-2" />
                {contest.problems?.length || 0} problems
              </div>
            </div>

            <Link to={`/contest/${contest._id}`}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              View Contest
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        ))}
      </div>

      {filteredContests.length === 0 && !error && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contests found</h3>
          <p className="text-gray-500">Check back later for new contests!</p>
        </div>
      )}
    </div>
  );
};

export default ContestList;