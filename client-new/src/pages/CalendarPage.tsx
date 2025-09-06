import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReadingCalendar } from '../components/calendar/ReadingCalendar';
import { WeekView } from '../components/calendar/WeekView';
import { userSchedulesAPI } from '../services/api';
import { theme } from '../styles/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[4]};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[2]};
  }
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.gray[300]};
  background: ${props => props.$active ? theme.colors.primary[600] : theme.colors.white};
  color: ${props => props.$active ? theme.colors.white : theme.colors.gray[700]};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:first-child {
    border-top-left-radius: ${theme.borderRadius.lg};
    border-bottom-left-radius: ${theme.borderRadius.lg};
    border-right: none;
  }

  &:last-child {
    border-top-right-radius: ${theme.borderRadius.lg};
    border-bottom-right-radius: ${theme.borderRadius.lg};
    border-left: none;
  }

  &:hover:not(:disabled) {
    background: ${props => props.$active ? theme.colors.primary[700] : theme.colors.gray[50]};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    font-size: ${theme.fontSizes.xs};
  }
`;

const MobileContainer = styled.div`
  @media (min-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const DesktopContainer = styled.div`
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const ScheduleSelector = styled.div`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[6]};
  box-shadow: ${theme.shadows.base};
`;

const SelectorTitle = styled.h2`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[4]};
  text-align: center;
`;

const ScheduleOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
  max-width: 500px;
  margin: 0 auto;
`;

const ScheduleOption = styled.button<{ $selected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[4]};
  border: 2px solid ${props => props.$selected ? theme.colors.primary[300] : theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.$selected ? theme.colors.primary[50] : theme.colors.white};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.primary[300]};
    background: ${theme.colors.primary[50]};
  }
`;

const OptionInfo = styled.div`
  text-align: left;
`;

const OptionTitle = styled.div`
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[1]};
`;

const OptionDescription = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.gray[500]};
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.red[50]};
  border: 1px solid ${theme.colors.red[200]};
  color: ${theme.colors.red[800]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  text-align: center;
  margin-bottom: ${theme.spacing[4]};
`;

const NoSchedulesMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]};
  color: ${theme.colors.gray[500]};

  h3 {
    font-size: ${theme.fontSizes.lg};
    margin-bottom: ${theme.spacing[2]};
  }

  p {
    margin-bottom: ${theme.spacing[4]};
  }

  button {
    background: ${theme.colors.primary[600]};
    color: ${theme.colors.white};
    border: none;
    border-radius: ${theme.borderRadius.md};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    font-size: ${theme.fontSizes.base};
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: ${theme.colors.primary[700]};
    }
  }
`;

interface Schedule {
  id: string;
  name: string;
  type: 'individual' | 'group';
  description: string;
}

export const CalendarPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>(() => {
    // Check URL parameter first
    const urlViewMode = searchParams.get('viewMode');
    if (urlViewMode === 'week' || urlViewMode === 'month') {
      return urlViewMode;
    }
    // Default to week view on mobile, month view on desktop
    return window.innerWidth <= 768 ? 'week' : 'month';
  });

  const fetchAvailableSchedules = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching user schedules for calendar...');
      const response = await userSchedulesAPI.get(currentUser.uid);
      
      const schedules: Schedule[] = [];

      // Add individual schedules
      if (response.individualSchedules) {
        response.individualSchedules.forEach((schedule: any) => {
          schedules.push({
            id: schedule.scheduleId,
            name: schedule.templateName,
            type: 'individual',
            description: `Personal reading schedule - ${schedule.durationDays} days`
          });
        });
      }

      // Add group schedules
      if (response.groupMemberships) {
        response.groupMemberships.forEach((group: any) => {
          schedules.push({
            id: group.groupId,
            name: group.groupName || group.templateName,
            type: 'group',
            description: `Group reading schedule - ${group.memberCount} members`
          });
        });
      }

      console.log('Available schedules:', schedules);

      // Check URL parameters for specific schedule selection
      const urlScheduleId = searchParams.get('scheduleId');
      const urlGroupId = searchParams.get('groupId');

      let preselectedSchedule: Schedule | null = null;

      if (urlScheduleId) {
        preselectedSchedule = schedules.find(s => s.type === 'individual' && s.id === urlScheduleId) || null;
      } else if (urlGroupId) {
        preselectedSchedule = schedules.find(s => s.type === 'group' && s.id === urlGroupId) || null;
      }

      if (schedules.length === 0) {
        setAvailableSchedules([]);
      } else {
        setAvailableSchedules(schedules);
        // Auto-select based on URL params or first available schedule
        setSelectedSchedule(preselectedSchedule || schedules[0]);
      }

    } catch (err: any) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load reading schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAvailableSchedules();
    }
  }, [currentUser, searchParams]);

  useEffect(() => {
    // Update view mode when URL parameter changes
    const urlViewMode = searchParams.get('viewMode');
    if (urlViewMode === 'week' || urlViewMode === 'month') {
      setViewMode(urlViewMode);
    }
  }, [searchParams]);

  const handleScheduleSelect = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading your reading schedules...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (availableSchedules.length === 0) {
    return (
      <Container>
        <NoSchedulesMessage>
          <h3>No Reading Schedules Found</h3>
          <p>You need to create or join a reading schedule before you can view the calendar.</p>
          <button onClick={() => window.location.href = '/schedules'}>
            Create Schedule
          </button>
        </NoSchedulesMessage>
      </Container>
    );
  }

  return (
    <Container>
      {availableSchedules.length > 1 && (
        <ScheduleSelector>
          <SelectorTitle>Select Reading Schedule</SelectorTitle>
          <ScheduleOptions>
            {availableSchedules.map((schedule) => (
              <ScheduleOption
                key={schedule.id}
                $selected={selectedSchedule?.id === schedule.id}
                onClick={() => handleScheduleSelect(schedule)}
              >
                <OptionInfo>
                  <OptionTitle>{schedule.name}</OptionTitle>
                  <OptionDescription>{schedule.description}</OptionDescription>
                </OptionInfo>
              </ScheduleOption>
            ))}
          </ScheduleOptions>
        </ScheduleSelector>
      )}

      {console.log('CalendarPage selectedSchedule:', selectedSchedule)}
      {selectedSchedule && (
        <>
          {/* View Toggle - show on both mobile and desktop */}
          <ViewToggle>
            <ToggleButton 
              $active={viewMode === 'month'} 
              onClick={() => setViewMode('month')}
            >
              Month View
            </ToggleButton>
            <ToggleButton 
              $active={viewMode === 'week'} 
              onClick={() => setViewMode('week')}
            >
              Week View
            </ToggleButton>
          </ViewToggle>

          {/* Conditional rendering based on view mode */}
          {viewMode === 'month' ? (
            <DesktopContainer>
              <ReadingCalendar
                scheduleId={selectedSchedule.type === 'individual' ? selectedSchedule.id : undefined}
                groupId={selectedSchedule.type === 'group' ? selectedSchedule.id : undefined}
              />
            </DesktopContainer>
          ) : (
            <WeekView
              scheduleId={selectedSchedule.type === 'individual' ? selectedSchedule.id : undefined}
              groupId={selectedSchedule.type === 'group' ? selectedSchedule.id : undefined}
            />
          )}
          
          {/* Show month view on mobile when week is not selected - for fallback */}
          {viewMode === 'month' && (
            <MobileContainer>
              <ReadingCalendar
                scheduleId={selectedSchedule.type === 'individual' ? selectedSchedule.id : undefined}
                groupId={selectedSchedule.type === 'group' ? selectedSchedule.id : undefined}
              />
            </MobileContainer>
          )}
        </>
      )}
    </Container>
  );
};