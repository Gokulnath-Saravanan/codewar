import React, { useState, useEffect } from 'react';
import { problemAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const DailySettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    generateTime: '00:00',
    difficulties: {
      easy: true,
      medium: true,
      hard: true
    },
    topics: {
      arrays: true,
      strings: true,
      'dynamic-programming': true,
      trees: true,
      graphs: true
    },
    retentionDays: 7
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await problemAPI.getDailySettings();
      setSettings(response.data);
    } catch (err) {
      setError('Failed to fetch settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.startsWith('difficulties.')) {
        const difficulty = name.split('.')[1];
        setSettings(prev => ({
          ...prev,
          difficulties: {
            ...prev.difficulties,
            [difficulty]: checked
          }
        }));
      } else if (name.startsWith('topics.')) {
        const topic = name.split('.')[1];
        setSettings(prev => ({
          ...prev,
          topics: {
            ...prev.topics,
            [topic]: checked
          }
        }));
      }
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await problemAPI.updateDailySettings(settings);
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError('Failed to update settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateNow = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await problemAPI.generateDailyProblems();
      setSuccess('Daily problems generated successfully');
    } catch (err) {
      setError('Failed to generate problems: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Daily Problem Settings</h1>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generation Time (UTC)
          </label>
          <input
            type="time"
            name="generateTime"
            value={settings.generateTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Problem Difficulties
          </label>
          <div className="space-y-2">
            {Object.keys(settings.difficulties).map(difficulty => (
              <label key={difficulty} className="flex items-center">
                <input
                  type="checkbox"
                  name={`difficulties.${difficulty}`}
                  checked={settings.difficulties[difficulty]}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Problem Topics
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(settings.topics).map(topic => (
              <label key={topic} className="flex items-center">
                <input
                  type="checkbox"
                  name={`topics.${topic}`}
                  checked={settings.topics[topic]}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
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
            Problem Retention (days)
          </label>
          <input
            type="number"
            name="retentionDays"
            value={settings.retentionDays}
            onChange={handleChange}
            min="1"
            max="30"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            Save Settings
          </button>
          <button
            type="button"
            onClick={generateNow}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400"
          >
            Generate Now
          </button>
        </div>
      </form>
    </div>
  );
};

export default DailySettings; 