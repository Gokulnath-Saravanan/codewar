// components/editor/ProblemSolver.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, Clock, Trophy, Users, CheckCircle, XCircle } from 'lucide-react';
import CodeEditor from './CodeEditor';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ProblemSolver = () => {
  const { contestId, problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [contest, setContest] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetchProblemData();
  }, [contestId, problemId]);

  useEffect(() => {
    // Timer for contest countdown
    const timer = setInterval(() => {
      if (contest) {
        const endTime = new Date(contest.startTime).getTime() + (contest.duration * 60 * 1000);
        const now = new Date().getTime();
        const remaining = Math.max(0, endTime - now);
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          clearInterval(timer);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [contest]);

  const fetchProblemData = async () => {
    try {
      const [problemRes, contestRes, submissionsRes] = await Promise.all([
        api.get(`/problems/${problemId}`),
        api.get(`/contests/${contestId}`),
        api.get(`/submissions?problemId=${problemId}&contestId=${contestId}`)
      ]);
      
      setProblem(problemRes.data);
      setContest(contestRes.data);
      setSubmissions(submissionsRes.data);
      
      // Set default code template
      setCode(getDefaultCode(language));
    } catch (error) {
      console.error('Error fetching problem data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCode = (lang) => {
    const templates = {
      python: `def solve():
    # Read input
    # Write your solution here
    pass

if __name__ == "__main__":
    solve()`,
      javascript: `function solve() {
    // Read input
    // Write your solution here
}

solve();`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`
    };
    return templates[lang] || '// Write your code here';
  };

  const handleSubmit = async (submissionCode) => {
    setSubmitting(true);
    try {
      const response = await api.post('/submissions', {
        problemId,
        contestId,
        code: submissionCode,
        language
      });
      
      setTestResults(response.data.testResults);
      await fetchProblemData(); // Refresh submissions
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!problem || !contest) return <div>Problem not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{problem.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Time Left: {formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Trophy className="h-4 w-4" />
                <span>{problem.points} points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Problem Statement</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4">{problem.description}</p>
                
                {problem.inputFormat && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Input Format</h3>
                    <p className="text-gray-700">{problem.inputFormat}</p>
                  </div>
                )}

                {problem.outputFormat && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Output Format</h3>
                    <p className="text-gray-700">{problem.outputFormat}</p>
                  </div>
                )}

                {problem.constraints && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Constraints</h3>
                    <p className="text-gray-700">{problem.constraints}</p>
                  </div>
                )}

                {problem.examples && problem.examples.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Examples</h3>
                    {problem.examples.map((example, index) => (
                      <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="mb-2">
                          <strong>Input:</strong>
                          <pre className="mt-1 p-2 bg-white rounded border text-sm">{example.input}</pre>
                        </div>
                        <div>
                          <strong>Output:</strong>
                          <pre className="mt-1 p-2 bg-white rounded border text-sm">{example.output}</pre>
                        </div>
                        {example.explanation && (
                          <div className="mt-2">
                            <strong>Explanation:</strong>
                            <p className="text-gray-700 text-sm">{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submissions History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Submissions</h2>
              {submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.slice(0, 5).map((submission, index) => (
                    <div key={submission._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {submission.status === 'accepted' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">
                            Submission #{submissions.length - index}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          submission.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {submission.status.toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {submission.language}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No submissions yet</p>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Code Editor</h2>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    setCode(getDefaultCode(e.target.value));
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              
              <CodeEditor
                code={code}
                language={language}
                onChange={setCode}
                onSubmit={handleSubmit}
                loading={submitting}
                testResults={testResults}
              />
            </div>

            {/* Test Results Summary */}
            {testResults && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Submission Result</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {testResults.every(r => r.passed) ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {testResults.every(r => r.passed) ? 'All Tests Passed!' : 'Some Tests Failed'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {testResults.filter(r => r.passed).length}/{testResults.length} test cases passed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      testResults.every(r => r.passed) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {testResults.every(r => r.passed) ? 'ACCEPTED' : 'FAILED'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolver;