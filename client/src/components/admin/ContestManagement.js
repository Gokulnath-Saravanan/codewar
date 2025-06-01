import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ManageContests from './ManageContests';
import CreateContest from './CreateContest';

const ContestManagement = () => {
  return (
    <Routes>
      <Route path="/" element={<ManageContests />} />
      <Route path="/create" element={<CreateContest />} />
    </Routes>
  );
};

export default ContestManagement;