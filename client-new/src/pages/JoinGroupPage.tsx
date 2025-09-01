import React from 'react';
import { useNavigate } from 'react-router-dom';
import JoinGroup from '../components/schedules/JoinGroup';

export const JoinGroupPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (group: any) => {
    // Navigate to dashboard after successfully joining a group
    navigate('/dashboard');
  };

  const handleCancel = () => {
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  return (
    <JoinGroup 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};