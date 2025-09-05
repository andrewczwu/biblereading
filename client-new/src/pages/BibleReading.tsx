import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { progressAPI } from '../services/api';
import { generateBibleUrl, parseReadingLabel } from '../utils/bibleBooks';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../components/ui/LoadingStates';
import { theme } from '../styles/theme';

const SmallSpinner = styled(LoadingSpinner)`
  width: 16px;
  height: 16px;
  border-width: 2px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${theme.colors.gray[50]};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing[4]};
  background: white;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray[900]};
  margin: 0;

  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.fontSizes.base};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  font-weight: 600;
  font-size: ${theme.fontSizes.sm};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};

  ${props => props.variant === 'primary' ? `
    background: ${theme.colors.primary[600]};
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      background: ${theme.colors.primary[700]};
    }
    
    &:disabled {
      background: ${theme.colors.gray[300]};
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: ${theme.colors.gray[700]};
    border: 1px solid ${theme.colors.gray[300]};
    
    &:hover:not(:disabled) {
      background: ${theme.colors.gray[50]};
    }
  `}
`;

const IframeContainer = styled.div`
  flex: 1;
  position: relative;
  background: white;
`;

const Iframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${theme.spacing[8]};
  text-align: center;
`;

const ErrorTitle = styled.h2`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[2]};
`;

const ErrorText = styled.p`
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[4]};
`;

export const BibleReading: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser: user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const label = searchParams.get('label');
  const scheduleId = searchParams.get('scheduleId');
  const scheduleType = searchParams.get('scheduleType');
  const dayNumber = searchParams.get('dayNumber');
  const returnPath = searchParams.get('return') || '/calendar';

  console.log('URL params:', { label, scheduleId, scheduleType, dayNumber, returnPath });
  console.log('Auth state:', { user: user ? { uid: user.uid } : null, authLoading });

  const bibleUrl = label ? generateBibleUrl(label) : null;

  useEffect(() => {
    // Show loading for a minimum time to prevent flash
    const timer = setTimeout(() => {
      if (iframeLoaded) {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [iframeLoaded]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    if (loading) {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleMarkComplete = async () => {
    console.log('handleMarkComplete called', { 
      user: user ? { uid: user.uid, email: user.email } : null, 
      scheduleId, 
      dayNumber, 
      scheduleType 
    });
    
    const validations = {
      hasUser: !!user,
      hasScheduleId: !!scheduleId && scheduleId !== '',
      hasDayNumber: !!dayNumber,
      hasScheduleType: !!scheduleType
    };
    console.log('Validation checks:', validations);
    
    if (!user || !scheduleId || scheduleId === '' || !dayNumber || !scheduleType) {
      console.error('Missing required data:', { user: !!user, scheduleId, dayNumber, scheduleType });
      toast.error('Missing schedule information. Cannot mark as complete.');
      return;
    }

    setMarking(true);
    try {
      const params: any = {
        userId: user.uid,
        dayNumber: parseInt(dayNumber),
        completionTasks: {
          verseText: true,
          footnotes: false,
          partner: false
        }
      };

      // API expects either scheduleId or groupId based on type
      if (scheduleType === 'group') {
        params.groupId = scheduleId;
      } else {
        params.scheduleId = scheduleId;
      }

      console.log('Sending params to API:', params);
      await progressAPI.markCompleted(params);

      toast.success('Reading marked as complete!');
      
      // Give a brief moment for the toast to show
      setTimeout(() => {
        navigate(returnPath);
      }, 500);
    } catch (error) {
      console.error('Error marking reading complete:', error);
      toast.error('Failed to mark reading as complete');
      setMarking(false);
    }
  };

  const handleBack = () => {
    navigate(returnPath);
  };

  // Show loading while authentication is being resolved
  if (authLoading) {
    return (
      <Container>
        <Header>
          <Title>Bible Reading</Title>
        </Header>
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      </Container>
    );
  }

  if (!label || !bibleUrl) {
    return (
      <Container>
        <Header>
          <Title>Bible Reading</Title>
          <Button onClick={handleBack}>
            Back
          </Button>
        </Header>
        <ErrorMessage>
          <ErrorTitle>Invalid Reading</ErrorTitle>
          <ErrorText>
            The reading reference could not be parsed. Please go back and try again.
          </ErrorText>
          <Button variant="primary" onClick={handleBack}>
            Go Back
          </Button>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>{label}</Title>
        <Actions>
          {console.log('Render check:', { scheduleId, dayNumber, scheduleType, scheduleIdTruthy: !!scheduleId && scheduleId !== '' })}
          {scheduleId && scheduleId !== '' && dayNumber && scheduleType ? (
            <Button 
              variant="primary" 
              onClick={handleMarkComplete}
              disabled={marking}
            >
              {marking ? (
                <>
                  <SmallSpinner />
                  Marking...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path 
                      d="M16.667 5L7.5 14.167L3.333 10" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  Mark Complete
                </>
              )}
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              Mark Complete (No Schedule Info)
            </Button>
          )}
          <Button onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path 
                d="M12.5 5L7.5 10L12.5 15" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Button>
        </Actions>
      </Header>
      
      <IframeContainer>
        {loading && (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        )}
        <Iframe 
          src={bibleUrl}
          title={`Bible Reading: ${label}`}
          onLoad={handleIframeLoad}
          sandbox="allow-same-origin allow-scripts"
        />
      </IframeContainer>
    </Container>
  );
};