import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { problemAPI } from '../../services/api';

const AIGenerateProblem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    difficulty: 'medium',
    topics: [],
    constraints: '',
    preferredLanguages: ['javascript', 'python', 'java']
  });

  const difficultyLevels = ['easy', 'medium', 'hard'];
  const availableTopics = [
    'arrays',
    'strings',
    'linked-lists',
    'trees',
    'graphs',
    'dynamic-programming',
    'sorting',
    'searching',
    'recursion',
    'math'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTopicChange = (topic) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const response = await problemAPI.generateProblem(formData.difficulty, formData.topics[0]);
      navigate(`/admin/problems/${response.data.problem._id}`);
    } catch (err) {
      setError('Failed to generate problem: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Generate Problem with AI</h1>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {difficultyLevels.map(level => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topics
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableTopics.map(topic => (
              <label key={topic} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.topics.includes(topic)}
                  onChange={() => handleTopicChange(topic)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {topic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Constraints
          </label>
          <textarea
            name="constraints"
            value={formData.constraints}
            onChange={handleChange}
            placeholder="E.g., Time complexity requirements, space complexity requirements, or specific concepts to test"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || formData.topics.length === 0}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {loading ? 'Generating...' : 'Generate Problem'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/problems')}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>

      {loading && (
        <div className="mt-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Generating a high-quality problem. This may take a minute...
          </p>
        </div>
      )}
    </div>
  );
};

export default AIGenerateProblem; 