import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userSchedulesAPI } from '../services/api';
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

const GroupMembersSection = styled.div`
  margin-top: ${theme.spacing[8]};
  padding-top: ${theme.spacing[6]};
  border-top: 1px solid ${theme.colors.gray[200]};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[4]};
  text-align: center;
`;

const GroupIdForm = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  align-items: stretch;
  max-width: 400px;
  margin: 0 auto;

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const GroupIdInput = styled.input`
  flex: 1;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }

  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
`;

const ViewMembersButton = styled(Button)`
  white-space: nowrap;
  min-width: 120px;
`;

const SchedulesSection = styled.div`
  margin-top: ${theme.spacing[8]};
`;

const SchedulesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
`;

const SchedulesTitle = styled.h2`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray[900]};
`;

const SchedulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const ScheduleCard = styled.div<{ $type: 'individual' | 'group' }>`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  box-shadow: ${theme.shadows.base};
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.primary[300]};
    box-shadow: ${theme.shadows.md};
  }

  ${props => props.$type === 'group' && `
    border-left: 4px solid ${theme.colors.blue[500]};
  `}
`;

const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[3]};
`;

const ScheduleInfo = styled.div`
  flex: 1;
`;

const ScheduleName = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[1]};
`;

const ScheduleMeta = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[2]};
`;

const ScheduleBadges = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  flex-wrap: wrap;
`;

const Badge = styled.span<{ $variant: 'individual' | 'group' | 'admin' | 'member' | 'active' | 'inactive' }>`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;

  ${props => {
    switch (props.$variant) {
      case 'individual':
        return `
          background: ${theme.colors.green[100]};
          color: ${theme.colors.green[800]};
        `;
      case 'group':
        return `
          background: ${theme.colors.blue[100]};
          color: ${theme.colors.blue[800]};
        `;
      case 'admin':
        return `
          background: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[800]};
        `;
      case 'member':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
      case 'active':
        return `
          background: ${theme.colors.green[100]};
          color: ${theme.colors.green[800]};
        `;
      case 'inactive':
        return `
          background: ${theme.colors.red[100]};
          color: ${theme.colors.red[800]};
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
    }
  }}
`;

const ProgressSection = styled.div`
  margin-top: ${theme.spacing[3]};
  padding-top: ${theme.spacing[3]};
  border-top: 1px solid ${theme.colors.gray[200]};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  margin-bottom: ${theme.spacing[2]};
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  background: ${props => 
    props.$percentage >= 80 ? theme.colors.green[500] :
    props.$percentage >= 50 ? theme.colors.primary[500] :
    theme.colors.gray[400]
  };
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
`;

const ScheduleActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[3]};
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${props => props.$variant === 'primary' ? theme.colors.primary[600] : theme.colors.gray[200]};
  color: ${props => props.$variant === 'primary' ? theme.colors.white : theme.colors.gray[700]};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  font-size: ${theme.fontSizes.sm};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.$variant === 'primary' ? theme.colors.primary[700] : theme.colors.gray[300]};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  color: ${theme.colors.gray[500]};

  h3 {
    font-size: ${theme.fontSizes.lg};
    margin-bottom: ${theme.spacing[2]};
  }

  p {
    margin-bottom: ${theme.spacing[4]};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.gray[500]};
`;

interface UserSchedule {
  scheduleId?: string;
  groupId?: string;
  type: 'individual' | 'group';
  templateId: string;
  templateName: string;
  groupName?: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  currentDay: number;
  status: string;
  memberRole?: string;
  memberStatus?: string;
  joinedAt?: string;
  createdAt?: string;
  memberCount?: number; // Legacy field, dynamically populated
  isPublic?: boolean;
  progress: {
    totalReadings: number;
    completedReadings: number;
    completionPercentage: number;
    currentStreak: number;
    longestStreak: number;
  };
}

export const Dashboard: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [groupId, setGroupId] = useState('');
  const [userSchedules, setUserSchedules] = useState<UserSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [schedulesError, setSchedulesError] = useState<string | null>(null);

  // Debug logging
  console.log('Dashboard - currentUser:', currentUser);
  console.log('Dashboard - userProfile:', userProfile);

  const fetchUserSchedules = async () => {
    if (!currentUser) return;

    try {
      setSchedulesLoading(true);
      setSchedulesError(null);

      console.log('Dashboard - Fetching schedules for user:', currentUser.uid);
      const response = await userSchedulesAPI.get(currentUser.uid);
      
      console.log('Dashboard - Schedules response:', response);
      setUserSchedules(response.allSchedules || []);
    } catch (error: any) {
      console.error('Dashboard - Error fetching schedules:', error);
      setSchedulesError(error.response?.data?.error || 'Failed to load schedules');
    } finally {
      setSchedulesLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserSchedules();
    }
  }, [currentUser]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleViewMembers = () => {
    if (groupId.trim()) {
      navigate(`/group/${groupId.trim()}/members`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScheduleDisplayName = (schedule: UserSchedule) => {
    if (schedule.type === 'group') {
      return schedule.groupName || schedule.templateName;
    }
    return schedule.templateName;
  };

  const handleViewCalendar = (schedule: UserSchedule) => {
    // Navigate to calendar with specific schedule
    if (schedule.type === 'individual') {
      navigate(`/calendar?scheduleId=${schedule.scheduleId}`);
    } else {
      navigate(`/calendar?groupId=${schedule.groupId}`);
    }
  };

  const handleViewGroupMembers = (schedule: UserSchedule) => {
    if (schedule.type === 'group' && schedule.groupId) {
      navigate(`/group/${schedule.groupId}/members`);
    }
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
            </>
          )}
          
          <ButtonGroup>
            <Button $variant="primary" onClick={() => navigate('/schedules')}>
              Create Reading Schedule
            </Button>
            <Button $variant="secondary" onClick={() => navigate('/schedules')}>
              Join Group
            </Button>
            <Button $variant="primary" onClick={() => navigate('/calendar')}>
              View Calendar
            </Button>
          </ButtonGroup>

          <GroupMembersSection>
            <SectionTitle>View Group Members</SectionTitle>
            <GroupIdForm>
              <GroupIdInput
                type="text"
                placeholder="Enter group ID (e.g. bellevue-yp-2024-spring)"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleViewMembers();
                  }
                }}
              />
              <ViewMembersButton 
                $variant="primary" 
                onClick={handleViewMembers}
                disabled={!groupId.trim()}
              >
                View Members
              </ViewMembersButton>
            </GroupIdForm>
          </GroupMembersSection>
        </WelcomeMessage>
      </Card>

      <SchedulesSection>
        <SchedulesHeader>
          <SchedulesTitle>Your Reading Schedules</SchedulesTitle>
        </SchedulesHeader>

        {schedulesLoading && (
          <LoadingSpinner>Loading your schedules...</LoadingSpinner>
        )}

        {schedulesError && (
          <div style={{ 
            background: theme.colors.red[50], 
            border: `1px solid ${theme.colors.red[200]}`, 
            color: theme.colors.red[800], 
            borderRadius: theme.borderRadius.lg, 
            padding: theme.spacing[4], 
            textAlign: 'center',
            marginBottom: theme.spacing[4] 
          }}>
            {schedulesError}
          </div>
        )}

        {!schedulesLoading && !schedulesError && userSchedules.length === 0 && (
          <EmptyState>
            <h3>No Reading Schedules Yet</h3>
            <p>You haven't created any individual schedules or joined any groups yet.</p>
            <Button onClick={() => navigate('/schedules')}>
              Get Started
            </Button>
          </EmptyState>
        )}

        {!schedulesLoading && userSchedules.length > 0 && (
          <SchedulesGrid>
            {userSchedules.map((schedule, index) => (
              <ScheduleCard key={`${schedule.type}-${schedule.scheduleId || schedule.groupId}-${index}`} $type={schedule.type}>
                <ScheduleHeader>
                  <ScheduleInfo>
                    <ScheduleName>{getScheduleDisplayName(schedule)}</ScheduleName>
                    <ScheduleMeta>
                      {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)} • Day {schedule.currentDay} of {schedule.durationDays}
                    </ScheduleMeta>
                  </ScheduleInfo>
                  <ScheduleBadges>
                    <Badge $variant={schedule.type}>{schedule.type}</Badge>
                    {schedule.type === 'group' && schedule.memberRole && (
                      <Badge $variant={schedule.memberRole as 'admin' | 'member'}>{schedule.memberRole}</Badge>
                    )}
                    <Badge $variant={schedule.status as 'active' | 'inactive'}>{schedule.status}</Badge>
                  </ScheduleBadges>
                </ScheduleHeader>

                {schedule.type === 'group' && (
                  <ScheduleMeta>
                    👥 {schedule.memberCount} members • {schedule.isPublic ? 'Public' : 'Private'} group
                  </ScheduleMeta>
                )}

                <ProgressSection>
                  <ProgressBar>
                    <ProgressFill $percentage={schedule.progress.completionPercentage} />
                  </ProgressBar>
                  <ProgressText>
                    <span>{schedule.progress.completedReadings} of {schedule.progress.totalReadings} readings</span>
                    <span>{schedule.progress.completionPercentage}% complete</span>
                  </ProgressText>
                </ProgressSection>

                <ScheduleActions>
                  <ActionButton 
                    $variant="primary" 
                    onClick={() => handleViewCalendar(schedule)}
                  >
                    View Calendar
                  </ActionButton>
                  
                  {schedule.type === 'group' && (
                    <ActionButton 
                      $variant="secondary" 
                      onClick={() => handleViewGroupMembers(schedule)}
                    >
                      View Members
                    </ActionButton>
                  )}
                </ScheduleActions>
              </ScheduleCard>
            ))}
          </SchedulesGrid>
        )}
      </SchedulesSection>
    </Container>
  );
};