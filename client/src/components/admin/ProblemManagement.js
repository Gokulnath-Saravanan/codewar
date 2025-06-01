// components/admin/ProblemManagement.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ManageProblems from './ManageProblems';
import CreateProblem from './CreateProblem';
import AIGenerateProblem from './AIGenerateProblem';
import DailySettings from './DailySettings';

const ProblemManagement = () => {
  return (
    <Routes>
      <Route path="/" element={<ManageProblems />} />
      <Route path="/create" element={<CreateProblem />} />
      <Route path="/ai-generate" element={<AIGenerateProblem />} />
      <Route path="/daily-settings" element={<DailySettings />} />
    </Routes>
  );
};

export default ProblemManagement;