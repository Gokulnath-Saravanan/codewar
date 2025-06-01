// pages/ProblemPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProblemSolver from '../components/editor/ProblemSolver';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const ProblemPage = () => {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no problemId is provided, redirect to problems list
    if (!problemId) {
      navigate('/problems');
      return;
    }
    
    // Use AbortController to cancel previous requests
    const abortController = new AbortController();
    
    const fetchProblemData = async () => {
      try {
        setLoading(true);
        
        if (contestId) {
          // Fetch problem within contest context
          const [problemRes, contestRes] = await Promise.all([
            api.get(`/contests/${contestId}/problems/${problemId}`, {
              signal: abortController.signal
            }),
            api.get(`/contests/${contestId}`, {
              signal: abortController.signal
            })
          ]);
          setProblem(problemRes.data);
          setContest(contestRes.data);
        } else {
          // Fetch standalone problem
          const problemRes = await api.get(`/problems/${problemId}`, {
            signal: abortController.signal
          });
          setProblem(problemRes.data);
        }
      } catch (error) {
        // Don't show error if request was aborted
        if (error.name === 'AbortError') return;
        
        toast.error('Failed to load problem');
        console.error('Error fetching problem:', error);
        navigate('/problems');
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();

    // Cleanup function to abort ongoing requests when component unmounts
    // or when problemId/contestId changes
    return () => {
      abortController.abort();
    };
  }, [contestId, problemId, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Problem Not Found</h2>
          <button
            onClick={() => navigate('/problems')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProblemSolver 
        problem={problem} 
        contest={contest}
        contestId={contestId}
      />
    </div>
  );
};

export default ProblemPage;