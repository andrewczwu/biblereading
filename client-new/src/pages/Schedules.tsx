import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import CreateIndividualSchedule from '../components/schedules/CreateIndividualSchedule';
import CreateGroupSchedule from '../components/schedules/CreateGroupSchedule';
import JoinGroup from '../components/schedules/JoinGroup';
import { theme } from '../styles/theme';

type ActiveView = 'menu' | 'individual' | 'createGroup' | 'joinGroup';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[4]};
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[8]};
  text-align: center;
`;

const MenuContainer = styled.div`
  display: grid;
  gap: ${theme.spacing[4]};
  
  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing[6]};
  }
`;

const MenuCard = styled.button`
  background: white;
  border: 2px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  
  &:hover {
    border-color: ${theme.colors.primary[300]};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const MenuIcon = styled.div`
  width: 48px;
  height: 48px;
  background-color: ${theme.colors.primary[100]};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing[4]};
  font-size: 24px;
`;

const MenuTitle = styled.h2`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[2]};
`;

const MenuDescription = styled.p`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.gray[600]};
  margin: 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary[600]};
  font-size: ${theme.fontSizes.base};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[6]};
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${theme.colors.primary[50]};
  }
`;

const Schedules: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('menu');
  const navigate = useNavigate();

  const handleSuccess = (result: any) => {
    // Navigate to dashboard or a success page
    navigate('/dashboard');
  };

  const handleBack = () => {
    setActiveView('menu');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'individual':
        return (
          <CreateIndividualSchedule
            onSuccess={handleSuccess}
            onCancel={handleBack}
          />
        );
      
      case 'createGroup':
        return (
          <CreateGroupSchedule
            onSuccess={handleSuccess}
            onCancel={handleBack}
          />
        );
      
      case 'joinGroup':
        return (
          <JoinGroup
            onSuccess={handleSuccess}
            onCancel={handleBack}
          />
        );
      
      default:
        return (
          <>
            <Title>Reading Schedules</Title>
            <Subtitle>
              Start your Bible reading journey by creating a personal schedule or joining a group
            </Subtitle>
            
            <MenuContainer>
              <MenuCard onClick={() => setActiveView('individual')}>
                <MenuIcon>📖</MenuIcon>
                <MenuTitle>Personal Schedule</MenuTitle>
                <MenuDescription>
                  Create your own private reading schedule and track your progress at your own pace
                </MenuDescription>
              </MenuCard>
              
              <MenuCard onClick={() => setActiveView('createGroup')}>
                <MenuIcon>👥</MenuIcon>
                <MenuTitle>Create Group</MenuTitle>
                <MenuDescription>
                  Start a new reading group and invite friends to read together
                </MenuDescription>
              </MenuCard>
              
              <MenuCard onClick={() => setActiveView('joinGroup')}>
                <MenuIcon>🤝</MenuIcon>
                <MenuTitle>Join Group</MenuTitle>
                <MenuDescription>
                  Join an existing reading group with a Group ID from the creator
                </MenuDescription>
              </MenuCard>
              
              <MenuCard onClick={() => navigate('/dashboard')}>
                <MenuIcon>📊</MenuIcon>
                <MenuTitle>My Progress</MenuTitle>
                <MenuDescription>
                  View your current reading schedules and track your progress
                </MenuDescription>
              </MenuCard>
            </MenuContainer>
          </>
        );
    }
  };

  return (
    <Container>
      {activeView !== 'menu' && (
        <BackButton onClick={handleBack}>
          ← Back to Menu
        </BackButton>
      )}
      {renderContent()}
    </Container>
  );
};

export default Schedules;