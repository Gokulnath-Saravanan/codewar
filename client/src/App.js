import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';
import LoadingSpinner from './components/common/LoadingSpinner';
import Navbar from './components/common/Navbar';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Pages
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
// import ContestPage from './pages/ContestPage';
import ProblemPage from './pages/ProblemPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

// Contest Components
import ContestList from './components/contest/ContestList';
import ContestDetails from './components/contest/ContestDetails';
import ContestParticipation from './components/contest/ContestParticipation';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import ContestManagement from './components/admin/ContestManagement';
import ProblemManagement from './components/admin/ProblemManagement';
import UserManagement from './components/admin/UserManagement';
import CreateContest from './components/admin/CreateContest';
import ManageContests from './components/admin/ManageContests';
import CreateProblem from './components/admin/CreateProblem';
import AIGenerateProblem from './components/admin/AIGenerateProblem';
import ManageProblems from './components/admin/ManageProblems';
import DailySettings from './components/admin/DailySettings';

// Problem Solver
import ProblemSolver from './components/editor/ProblemSolver';

// Leaderboard Components
import GlobalLeaderboard from './components/leaderboard/GlobalLeaderboard';
import WeeklyLeaderboard from './components/leaderboard/WeeklyLeaderboard';

import { ROUTES } from './utils/constants';
import './index.css';

// Configure React Router future flags
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
const router = NavigationContext.router;
if (router) {
  router.future = {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  };
}

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    // Set up theme on app initialization
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.REGISTER} element={<Register />} />
                
                {/* Public Contest and Problem Routes */}
                <Route path="/contests" element={<ContestList />} />
                <Route path="/contests/:id" element={<ContestDetails />} />
                <Route path="/problems" element={<ProblemPage />} />
                <Route path="/problems/:id" element={<ProblemSolver />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/leaderboard/global" element={<GlobalLeaderboard />} />
                <Route path="/leaderboard/weekly" element={<WeeklyLeaderboard />} />

                {/* Protected User Routes */}
                <Route 
                  path={ROUTES.DASHBOARD} 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path={ROUTES.PROFILE} 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/contests/:id/participate" 
                  element={
                    <ProtectedRoute>
                      <ContestParticipation />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/problems/:id/solve" 
                  element={
                    <ProtectedRoute>
                      <ProblemSolver />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                
                <Route 
                  path="/admin/contests/create" 
                  element={
                    <AdminRoute>
                      <CreateContest />
                    </AdminRoute>
                  } 
                />
                
                <Route 
                  path="/admin/contests" 
                  element={
                    <AdminRoute>
                      <ManageContests />
                    </AdminRoute>
                  } 
                />
                
                <Route 
                  path="/admin/problems/create" 
                  element={
                    <AdminRoute>
                      <CreateProblem />
                    </AdminRoute>
                  } 
                />
                
                <Route 
                  path="/admin/problems/ai-generate" 
                  element={
                    <AdminRoute>
                      <AIGenerateProblem />
                    </AdminRoute>
                  } 
                />
                
                <Route 
                  path="/admin/problems" 
                  element={
                    <AdminRoute>
                      <ManageProblems />
                    </AdminRoute>
                  } 
                />
                
                <Route 
                  path="/admin/problems/daily-settings" 
                  element={
                    <AdminRoute>
                      <DailySettings />
                    </AdminRoute>
                  } 
                />
                
                <Route 
                  path="/admin/users" 
                  element={
                    <AdminRoute>
                      <UserManagement />
                    </AdminRoute>
                  } 
                />

                {/* Catch all route - redirect to home */}
                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
              </Routes>
            </main>

            {/* Global Loading Spinner (can be controlled by a global state) */}
            <LoadingSpinner />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;