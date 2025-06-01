import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ManageProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    category: ''
  });

  useEffect(() => {
    console.log('ManageProblems component mounted');
    fetchProblems();
  }, [filters]);

  const fetchProblems = async () => {
    try {
      console.log('Starting to fetch problems...');
      setLoading(true);
      console.log('Auth token:', localStorage.getItem('token'));
      console.log('Fetching problems with params:', filters);
      const response = await problemAPI.getProblems(filters);
      console.log('API Response:', response.data);
      setProblems(response.data.problems || []);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('Failed to fetch problems: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) {
      return;
    }

    try {
      await problemAPI.deleteProblem(problemId);
      setProblems(problems.filter(problem => problem._id !== problemId));
    } catch (err) {
      setError('Failed to delete problem: ' + err.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Problems</h1>
        <div className="space-x-4">
          <Link
            to="/admin/problems/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Problem
          </Link>
          <Link
            to="/admin/problems/ai-generate"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Generate with AI
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <select
          name="difficulty"
          value={filters.difficulty}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          <option value="arrays">Arrays</option>
          <option value="strings">Strings</option>
          <option value="dynamic-programming">Dynamic Programming</option>
          <option value="trees">Trees</option>
          <option value="graphs">Graphs</option>
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Success Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {problems.map((problem) => (
              <tr key={problem._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {problem.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                      problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {problem.category}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {problem.successRate ? `${(problem.successRate * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/admin/problems/${problem._id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(problem._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProblems; 