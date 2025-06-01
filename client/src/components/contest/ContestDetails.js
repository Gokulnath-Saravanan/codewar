// components/contest/ContestDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Users, Trophy, Play, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { FiAward } from 'react-icons/fi';
const ContestDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchContestDetails();
  }, [id]);

  const fetchContestDetails = async () => {
    try {
      const [contestRes, problemsRes] = await Promise.all([
        api.get(`/contests/${id}`),
        api.get(`/contests/${id}/problems`)
      ]);
      
      setContest(contestRes.data);
      setProblems(problemsRes.data);
      setIsRegistered(contestRes.data.participants?.includes(user?.id));
    } catch (error) {
      console.error('Error fetching contest details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await api.post(`/contests/${id}/register`);
      setIsRegistered(true);
      setContest(prev => ({
        ...prev,
        participants: [...prev.participants, user.id]
      }));
    } catch (error) {
      console.error('Error registering for contest:', error);
    } finally {
      setRegistering(false);
    }
  };

  const canParticipate = () => {
    return contest?.status === 'ongoing' && isRegistered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!contest) return <div>Contest not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{contest.title}</h1>
            <p className="text-gray-600 text-lg">{contest.description}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(contest.status)}`}>
            {contest.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="font-semibold">{new Date(contest.startTime).toLocaleDateString()}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Clock className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-semibold">{contest.duration} minutes</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-sm text-gray-500">Participants</p>
            <p className="font-semibold">{contest.participants?.length || 0}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
            <p className="text-sm text-gray-500">Problems</p>
            <p className="font-semibold">{problems.length}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          {!isRegistered && contest.status !== 'completed' && (
            <button
              onClick={handleRegister}
              disabled={registering}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {registering ? 'Registering...' : 'Register for Contest'}
            </button>
          )}
          
          {canParticipate() && (
            <Link
              to={`/contest/${id}/participate`}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Contest
            </Link>
          )}

          {isRegistered && contest.status !== 'ongoing' && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Registered
            </div>
          )}
        </div>
      </div>

      {/* Problems List */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Problems</h2>
        <div className="space-y-4">
          {problems.map((problem, index) => (
            <div
              key={problem._id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {index + 1}. {problem.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{problem.description}</p>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-sm text-gray-500">
                      Points: {problem.points}
                    </span>
                  </div>
                </div>
                {canParticipate() && (
                  <Link
                    to={`/contest/${id}/problem/${problem._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Solve
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contest Rules */}
      <div className="bg-white rounded-xl shadow-md p-8 mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contest Rules </h2>
        <ul className="space-y-3 text-gray-700">
          <li>• You must register before the contest starts to participate</li>
          <li>• Once the contest begins, you'll have {contest.duration} minutes to solve all problems</li>
          <li>• You can submit multiple solutions for each problem</li>
          <li>• Your best submission for each problem will be considered for scoring</li>
          <li>• Rankings are based on total points and submission time</li>
          <li>• Plagiarism or cheating will result in disqualification</li>
        </ul>
      </div>
    </div>
  );
};

export default ContestDetails;