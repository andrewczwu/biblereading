import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
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

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  border: none;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s;
  margin: ${theme.spacing[2]};
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary[600]};
          color: ${theme.colors.white};
          &:hover {
            background: ${theme.colors.primary[700]};
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.gray[200]};
          color: ${theme.colors.gray[900]};
          &:hover {
            background: ${theme.colors.gray[300]};
          }
        `;
      case 'danger':
        return `
          background: ${theme.colors.red[600]};
          color: ${theme.colors.white};
          &:hover {
            background: ${theme.colors.red[700]};
          }
        `;
      default:
        return `
          background: ${theme.colors.primary[600]};
          color: ${theme.colors.white};
          &:hover {
            background: ${theme.colors.primary[700]};
          }
        `;
    }
  }}
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[6]};
`;

export const Dashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  console.log('Dashboard - currentUser:', currentUser);
  console.log('Dashboard - userProfile:', userProfile);

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
          
          <ButtonGroup>
            <Button $variant="primary" onClick={() => navigate('/schedules')}>
              Create Reading Schedule
            </Button>
            <Button $variant="secondary" onClick={() => navigate('/schedules')}>
              Join Group
            </Button>
            <Button $variant="danger" onClick={handleLogout}>
              Sign Out
            </Button>
          </ButtonGroup>
        </WelcomeMessage>
      </Card>
    </Container>
  );
};