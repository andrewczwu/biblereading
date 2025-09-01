import React from 'react';
import { Navigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  animation: ${spin} 1s linear infinite;
  border-radius: 50%;
  height: 3rem;
  width: 3rem;
  border: 2px solid transparent;
  border-bottom: 2px solid ${theme.colors.primary[600]};
`;

interface PrivateRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireProfile = false }) => {
  const { currentUser, userProfile, loading, profileChecked } = useAuth();

  // Debug logging
  console.log('PrivateRoute - loading:', loading);
  console.log('PrivateRoute - currentUser:', !!currentUser);
  console.log('PrivateRoute - userProfile:', !!userProfile);
  console.log('PrivateRoute - profileChecked:', profileChecked);
  console.log('PrivateRoute - requireProfile:', requireProfile);

  if (loading) {
    console.log('PrivateRoute - Showing loading spinner (auth loading)');
    return (
      <LoadingContainer>
        <Spinner />
      </LoadingContainer>
    );
  }

  if (!currentUser) {
    console.log('PrivateRoute - Redirecting to login (no current user)');
    return <Navigate to="/login" />;
  }

  // If profile is required but we haven't checked yet, show loading
  if (requireProfile && !profileChecked) {
    console.log('PrivateRoute - Showing loading spinner (profile not checked)');
    return (
      <LoadingContainer>
        <Spinner />
      </LoadingContainer>
    );
  }

  // If profile is required and we've checked but no profile exists, redirect to register
  if (requireProfile && profileChecked && !userProfile) {
    console.log('PrivateRoute - Redirecting to register (no profile)');
    return <Navigate to="/register" />;
  }

  console.log('PrivateRoute - Allowing access to protected content');
  return <>{children}</>;
};