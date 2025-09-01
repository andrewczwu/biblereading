import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../styles/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[4]};
  }
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[2]};

  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.fontSizes['2xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.gray[600]};
`;

const Card = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.base};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.gray[200]};
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]} ${theme.spacing[4]};

  h2 {
    font-size: ${theme.fontSizes['2xl']};
    font-weight: ${theme.fontWeights.semibold};
    color: ${theme.colors.gray[900]};
    margin-bottom: ${theme.spacing[4]};
  }

  p {
    font-size: ${theme.fontSizes.base};
    color: ${theme.colors.gray[600]};
    line-height: 1.6;
  }
`;

const LogoutButton = styled.button`
  background: ${theme.colors.red[600]};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s;
  margin-top: ${theme.spacing[4]};

  &:hover {
    background: ${theme.colors.red[700]};
  }
`;

export const Dashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Container>
      <Header>
        <Title>
          {getGreeting()}, {userProfile?.firstName || userProfile?.displayName || 'Reader'}!
        </Title>
        <Subtitle>Welcome to your Bible reading dashboard</Subtitle>
      </Header>

      <Card>
        <WelcomeMessage>
          <h2>Your Bible Reading Journey Starts Here</h2>
          <p>
            You've successfully created your account and logged in! Your reading schedule and progress 
            will be displayed here once you set up your first Bible reading plan.
          </p>
          <p>
            Email: {currentUser?.email}
          </p>
          {userProfile && (
            <>
              <p>Display Name: {userProfile.displayName}</p>
              <p>Preferred Translation: {userProfile.readingPreferences?.preferredTranslation}</p>
              <p>Timezone: {userProfile.timezone}</p>
            </>
          )}
          <LogoutButton onClick={handleLogout}>
            Sign Out
          </LogoutButton>
        </WelcomeMessage>
      </Card>
    </Container>
  );
};