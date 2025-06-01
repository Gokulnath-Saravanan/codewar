// pages/ContestPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ContestParticipation from '../components/contest/ContestParticipation';
import ContestDetails from '../components/contest/ContestDetails';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';

const ContestPage = () => {
  const { contestId } = useParams();
  const [contest, setContest] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContestStatus();
  }, [contestId]);

  const fetchContestStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contests/${contestId}`);
      const contestData = response.data;
      setContest(contestData);

      // Check if user is a participant
      const userResponse = await api.get('/auth/profile');
      const userId = userResponse.data._id;
      setIsParticipant(contestData.participants?.includes(userId) || false);
    } catch (error) {
      console.error('Error fetching contest status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show participation view if user is registered for the contest
  if (isParticipant && contest?.status !== 'upcoming') {
    return <ContestParticipation />;
  }

  // Show contest details for registration/information
  return <ContestDetails />;
};

export default ContestPage;