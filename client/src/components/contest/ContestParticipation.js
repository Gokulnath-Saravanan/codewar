// components/contest/ContestParticipation.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiClock, FiUsers, FiAward, FiPlay } from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ContestParticipation = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isActive, setIsActive] = useState(false);

  const fetchContestDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [contestRes, problemsRes, submissionsRes] = await Promise.all([
        api.get(`/contests/${contestId}`),
        api.get(`/contests/${contestId}/problems`),
        api.get(`/contests/${contestId}/submissions/user`)
      ]);

      setContest(contestRes.data);
      setProblems(problemsRes.data);
      
      // Organize submissions by problem ID
      const submissionMap = {};
      submissionsRes.data.forEach(sub => {
        submissionMap[sub.problemId] = sub;
      });
      setUserSubmissions(submissionMap);
      
      setIsActive(contestRes.data.status === 'active');
    } catch (error) {
      toast.error('Failed to load contest details');
      console.error('Error fetching contest:', error);
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  const updateTimeRemaining = useCallback(() => {
    if (!contest) return;
    
    const now = new Date();
    const endTime = new Date(contest.endTime);
    const diff = endTime - now;

    if (diff <= 0) {
      setTimeRemaining('Contest Ended');
      setIsActive(false);
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    }
  }, [contest]);

  useEffect(() => {
    fetchContestDetails();
  }, [fetchContestDetails]);

  useEffect(() => {
    if (contest && contest.endTime) {
      const timer = setInterval(updateTimeRemaining, 1000);
      return () => clearInterval(timer);
    }
  }, [contest, updateTimeRemaining]);

  const handleJoinContest = async () => {
    try {
      await api.post(`/contests/${contestId}/join`);
      toast.success('Successfully joined the contest!');
      fetchContestDetails();
    } catch (error) {
      toast.error('Failed to join contest');
      console.error('Error joining contest:', error);
    }
  };

  const handleStartProblem = (problemId) => {
    navigate(`/contest/${contestId}/problem/${problemId}`);
  };

  const getSubmissionStatus = (problemId) => {
    const submission = userSubmissions[problemId];
    if (!submission) return { status: 'not_attempted', color: 'gray' };
    
    switch (submission.status) {
      case 'accepted':
        return { status: 'Solved', color: 'green' };
      case 'wrong_answer':
        return { status: 'Wrong Answer', color: 'red' };
      case 'time_limit_exceeded':
        return { status: 'TLE', color: 'orange' };
      case 'runtime_error':
        return { status: 'Runtime Error', color: 'purple' };
      default:
        return { status: 'Attempted', color: 'yellow' };
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contest Not Found</h2>
          <button
            onClick={() => navigate('/contests')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contest Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{contest.title}</h1>
              <p className="text-gray-600 mb-4">{contest.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  <span>Duration: {Math.floor((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60))} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="w-4 h-4" />
                  <span>Participants: {contest.participants?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiAward className="w-4 h-4" />
                  <span>Problems: {problems.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 lg:mt-0 lg:ml-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {timeRemaining}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isActive 
                    ? 'bg-green-100 text-green-800' 
                    : contest.status === 'upcoming'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {contest.status === 'active' ? 'Active' : 
                   contest.status === 'upcoming' ? 'Upcoming' : 'Ended'}
                </div>
              </div>
            </div>
          </div>

          {contest.status === 'upcoming' && (
            <div className="mt-6">
              <button
                onClick={handleJoinContest}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Join Contest
              </button>
            </div>
          )}
        </div>

        {/* Problems List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Problems</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {problems.map((problem, index) => {
              const submissionStatus = getSubmissionStatus(problem._id);
              
              return (
                <div key={problem._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {String.fromCharCode(65 + index)}. {problem.title}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${submissionStatus.color}-100 text-${submissionStatus.color}-800`}>
                          {submissionStatus.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{problem.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Points: {problem.points}</span>
                        <span>Time Limit: {problem.timeLimit}ms</span>
                        <span>Memory Limit: {problem.memoryLimit}MB</span>
                      </div>
                    </div>

                    <div className="ml-6">
                      <button
                        onClick={() => handleStartProblem(problem._id)}
                        disabled={!isActive}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <FiPlay className="w-4 h-4" />
                        Solve
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {problems.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FiAward className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Problems Available</h3>
            <p className="text-gray-600">Problems will be available when the contest starts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestParticipation;