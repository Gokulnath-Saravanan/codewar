import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api, { userAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, calculateSuccessRate } from '../utils/helpers';
import { SUBMISSION_STATUS } from '../utils/constants';

const ProfilePage = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        fullName: '',
        bio: '',
        college: '',
        graduationYear: '',
        skills: [],
        socialLinks: {
            github: '',
            linkedin: '',
            portfolio: ''
        }
    });
    const [stats, setStats] = useState({
        totalSubmissions: 0,
        successfulSubmissions: 0,
        contestsParticipated: 0,
        currentRank: 0,
        totalScore: 0,
        solvedProblems: {
            easy: 0,
            medium: 0,
            hard: 0
        }
    });
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [errors, setErrors] = useState({});
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [profileRes, statsRes, submissionsRes, achievementsRes] = await Promise.all([
                api.get('/auth/profile'),
                api.get('/users/stats'),
                api.get('/submissions/recent'),
                userAPI.getAchievements()
            ]);

            setProfileData(profileRes.data);

            setStats({
                ...statsRes.data,
                solvedProblems: statsRes.data.solvedProblems || {
                    easy: 0,
                    medium: 0,
                    hard: 0
                }
            });
            setRecentSubmissions(submissionsRes.data.slice(0, 10));
            setAchievements(achievementsRes.data || []);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            // Set default values on error
            setProfileData({
                username: user?.username || '',
                email: user?.email || '',
                fullName: '',
                bio: '',
                college: '',
                graduationYear: '',
                skills: [],
                socialLinks: {
                    github: '',
                    linkedin: '',
                    portfolio: ''
                }
            });
            setStats({
                totalSubmissions: 0,
                successfulSubmissions: 0,
                contestsParticipated: 0,
                currentRank: 0,
                totalScore: 0,
                solvedProblems: {
                    easy: 0,
                    medium: 0,
                    hard: 0
                }
            });
            setRecentSubmissions([]);
            setAchievements([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProfileData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSkillsChange = (e) => {
        const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
        setProfileData(prev => ({ ...prev, skills }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!profileData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        
        if (!profileData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
            newErrors.email = 'Invalid email format';
        }
        
        if (profileData.graduationYear && (
            isNaN(profileData.graduationYear) || 
            profileData.graduationYear < 2000 || 
            profileData.graduationYear > 2030
        )) {
            newErrors.graduationYear = 'Please enter a valid graduation year';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            setUpdateLoading(true);
            const response = await api.put('/users/profile', profileData);
            updateUser(response.data);
            setEditMode(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setUpdateLoading(false);
        }
    };

    const getRankColor = (rank) => {
        if (rank <= 10) return 'text-yellow-600';
        if (rank <= 50) return 'text-gray-600';
        if (rank <= 100) return 'text-orange-600';
        return 'text-blue-600';
    };

    const getSubmissionStatusColor = (status) => {
        switch (status) {
            case SUBMISSION_STATUS.ACCEPTED:
                return 'bg-green-100 text-green-800';
            case SUBMISSION_STATUS.WRONG_ANSWER:
                return 'bg-red-100 text-red-800';
            case SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED:
                return 'bg-yellow-100 text-yellow-800';
            case SUBMISSION_STATUS.RUNTIME_ERROR:
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading your profile..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                    {profileData.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {profileData.fullName || user?.username}
                                </h1>
                                <p className="text-gray-600">@{user?.username}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className={`text-lg font-semibold ${getRankColor(stats.currentRank)}`}>
                                        Rank #{stats.currentRank || 'Unranked'}
                                    </span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-blue-600 font-medium">
                                        {stats.totalScore} points
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => editMode ? setEditMode(false) : setEditMode(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {editMode ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {profileData.bio && (
                        <p className="text-gray-600 mb-4">{profileData.bio}</p>
                    )}

                    {/* Social Links */}
                    <div className="flex space-x-4">
                        {profileData.socialLinks?.github && (
                            <a
                                href={profileData.socialLinks.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                GitHub
                            </a>
                        )}
                        {profileData.socialLinks?.linkedin && (
                            <a
                                href={profileData.socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                LinkedIn
                            </a>
                        )}
                        {profileData.socialLinks?.portfolio && (
                            <a
                                href={profileData.socialLinks.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Portfolio
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Stats and Achievements */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Statistics */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Submissions</span>
                                    <span className="font-semibold">{stats.totalSubmissions}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Success Rate</span>
                                    <span className="font-semibold text-green-600">
                                        {calculateSuccessRate(stats.successfulSubmissions, stats.totalSubmissions)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Contests Participated</span>
                                    <span className="font-semibold">{stats.contestsParticipated}</span>
                                </div>
                            </div>
                        </div>

                        {/* Problem Solving Stats */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Problems Solved</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                        Easy
                                    </span>
                                    <span className="font-semibold">{stats.solvedProblems?.easy || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                        Medium
                                    </span>
                                    <span className="font-semibold">{stats.solvedProblems?.medium || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                        Hard
                                    </span>
                                    <span className="font-semibold">{stats.solvedProblems?.hard || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h2>
                            {achievements.length > 0 ? (
                                <div className="space-y-3">
                                    {achievements.map((achievement, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <div className="text-2xl">{achievement.icon}</div>
                                            <div>
                                                <p className="font-medium text-gray-900">{achievement.title}</p>
                                                <p className="text-sm text-gray-600">{achievement.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No achievements yet. Start solving problems!</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Profile Form and Recent Submissions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Form */}
                        {editMode && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Profile</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={profileData.fullName}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.fullName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={profileData.email}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={profileData.bio}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                College/University
                                            </label>
                                            <input
                                                type="text"
                                                name="college"
                                                value={profileData.college}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Graduation Year
                                            </label>
                                            <input
                                                type="number"
                                                name="graduationYear"
                                                value={profileData.graduationYear}
                                                onChange={handleInputChange}
                                                min="2000"
                                                max="2030"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    errors.graduationYear ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.graduationYear && (
                                                <p className="text-red-500 text-sm mt-1">{errors.graduationYear}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Skills (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.skills.join(', ')}
                                            onChange={handleSkillsChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="JavaScript, Python, React, Node.js..."
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    GitHub
                                                </label>
                                                <input
                                                    type="url"
                                                    name="socialLinks.github"
                                                    value={profileData.socialLinks?.github || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="https://github.com/username"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    LinkedIn
                                                </label>
                                                <input
                                                    type="url"
                                                    name="socialLinks.linkedin"
                                                    value={profileData.socialLinks?.linkedin || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="https://linkedin.com/in/username"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Portfolio
                                                </label>
                                                <input
                                                    type="url"
                                                    name="socialLinks.portfolio"
                                                    value={profileData.socialLinks?.portfolio || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="https://yourportfolio.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setEditMode(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updateLoading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {updateLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Recent Submissions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Submissions</h2>
                            {recentSubmissions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Problem</th>
                                                <th className="px-4 py-2 text-left">Language</th>
                                                <th className="px-4 py-2 text-left">Status</th>
                                                <th className="px-4 py-2 text-left">Time</th>
                                                <th className="px-4 py-2 text-left">Submitted</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentSubmissions.map((submission) => (
                                                <tr key={submission._id} className="border-t">
                                                    <td className="px-4 py-2">
                                                        <div>
                                                            <p className="font-medium">{submission.problem?.title}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {submission.problem?.difficulty}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2">{submission.language}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${getSubmissionStatusColor(submission.status)}`}>
                                                            {submission.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {submission.executionTime ? `${submission.executionTime}ms` : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-500">
                                                        {formatDate(submission.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    No submissions yet. Start solving problems to see your progress here!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;