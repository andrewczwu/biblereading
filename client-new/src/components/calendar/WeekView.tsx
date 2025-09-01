import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { progressAPI } from '../../services/api';
import { theme } from '../../styles/theme';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 120px); /* Account for header and navigation */
  max-width: 100vw;
  background: ${theme.colors.gray[50]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    min-height: calc(100vh - 80px);
  }
`;

const Header = styled.div`
  background: ${theme.colors.white};
  padding: ${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[2]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  box-shadow: ${theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const WeekNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[3]};
`;

const NavButton = styled.button`
  background: ${theme.colors.primary[600]};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 80px;

  &:hover:not(:disabled) {
    background: ${theme.colors.primary[700]};
  }

  &:disabled {
    background: ${theme.colors.gray[300]};
    cursor: not-allowed;
  }
`;

const WeekTitle = styled.h2`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.gray[900]};
  text-align: center;
  margin: 0;
`;


const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const WeekContent = styled.div`
  padding: ${theme.spacing[2]};
`;

const DayCard = styled.div<{ $isToday: boolean; $hasReading: boolean }>`
  background: ${theme.colors.white};
  margin-bottom: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  overflow: hidden;
  border: 1px solid ${theme.colors.gray[200]};
  position: relative;
  transition: all 0.2s ease;
  
  ${props => props.$isToday && `
    background: ${theme.colors.primary[25]};
    border: 3px solid ${theme.colors.primary[500]};
    box-shadow: 0 8px 25px -5px ${theme.colors.primary[500]}40, 0 10px 20px -6px ${theme.colors.primary[500]}20;
    transform: scale(1.02);
    margin: ${theme.spacing[4]} ${theme.spacing[2]};
    
    &::before {
      content: "TODAY";
      position: absolute;
      top: -1px;
      right: -1px;
      background: ${theme.colors.primary[600]};
      color: ${theme.colors.white};
      font-size: ${theme.fontSizes.xs};
      font-weight: ${theme.fontWeights.bold};
      padding: ${theme.spacing[1]} ${theme.spacing[2]};
      border-radius: 0 ${theme.borderRadius.lg} 0 ${theme.borderRadius.md};
      z-index: 10;
      letter-spacing: 0.5px;
    }
  `}
`;

const DayCardHeader = styled.div<{ $isToday: boolean }>`
  background: ${props => props.$isToday ? `linear-gradient(135deg, ${theme.colors.primary[100]} 0%, ${theme.colors.primary[50]} 100%)` : theme.colors.gray[50]};
  padding: ${theme.spacing[3]};
  border-bottom: 1px solid ${props => props.$isToday ? theme.colors.primary[200] : theme.colors.gray[200]};
  
  ${props => props.$isToday && `
    background: linear-gradient(135deg, ${theme.colors.primary[100]} 0%, ${theme.colors.primary[50]} 100%);
    border-bottom: 2px solid ${theme.colors.primary[300]};
  `}
`;

const DayInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DayNumber = styled.div<{ $isToday: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const DayNumberCircle = styled.div<{ $isToday: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.fontWeights.bold};
  font-size: ${theme.fontSizes.sm};
  transition: all 0.2s ease;
  
  ${props => props.$isToday ? `
    background: linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[700]} 100%);
    color: ${theme.colors.white};
    width: 40px;
    height: 40px;
    font-size: ${theme.fontSizes.base};
    box-shadow: 0 4px 12px ${theme.colors.primary[500]}40;
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0% {
        box-shadow: 0 4px 12px ${theme.colors.primary[500]}40;
      }
      50% {
        box-shadow: 0 6px 20px ${theme.colors.primary[500]}60;
      }
      100% {
        box-shadow: 0 4px 12px ${theme.colors.primary[500]}40;
      }
    }
  ` : `
    background: ${theme.colors.white};
    color: ${theme.colors.gray[700]};
    border: 1px solid ${theme.colors.gray[300]};
  `}
`;

const DayName = styled.div<{ $isToday: boolean }>`
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  color: ${props => props.$isToday ? theme.colors.primary[800] : theme.colors.gray[700]};
`;

const DateText = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.gray[500]};
`;

const DayCardContent = styled.div<{ $isToday: boolean }>`
  padding: ${theme.spacing[4]};
  
  ${props => props.$isToday && `
    background: ${theme.colors.primary[5]};
  `}
`;

const NoReading = styled.div<{ $isToday?: boolean }>`
  text-align: center;
  padding: ${theme.spacing[6]} ${theme.spacing[4]};
  color: ${props => props.$isToday ? theme.colors.primary[600] : theme.colors.gray[500]};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${props => props.$isToday ? theme.fontWeights.medium : theme.fontWeights.normal};
  
  ${props => props.$isToday && `
    background: ${theme.colors.primary[50]};
    border: 1px dashed ${theme.colors.primary[300]};
    border-radius: ${theme.borderRadius.md};
    margin: ${theme.spacing[2]};
    padding: ${theme.spacing[4]};
    
    &::before {
      content: "📅 ";
      font-size: ${theme.fontSizes.lg};
      margin-right: ${theme.spacing[1]};
    }
  `}
`;

const ReadingSection = styled.div`
  margin-bottom: ${theme.spacing[4]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const BookName = styled.div`
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.primary[700]};
  margin-bottom: ${theme.spacing[1]};
`;

const ChapterVerse = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[3]};
  line-height: 1.4;
`;

const CompletionSection = styled.div`
  padding-top: ${theme.spacing[3]};
  border-top: 1px solid ${theme.colors.gray[200]};
`;

const TasksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const TaskRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  margin-right: ${theme.spacing[2]};
  cursor: pointer;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[700]};
  cursor: pointer;
  flex: 1;
  
  &:hover {
    color: ${theme.colors.primary[600]};
  }
`;

const TaskName = styled.span`
  font-weight: ${theme.fontWeights.medium};
`;

const CompletedBadge = styled.div`
  background: ${theme.colors.green[100]};
  color: ${theme.colors.green[800]};
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.medium};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[8]};
  color: ${theme.colors.gray[500]};
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${theme.spacing[6]};
  color: ${theme.colors.red[600]};
`;

interface CompletionTasks {
  verseText: boolean;
  footnotes: boolean;
  partner: boolean;
}

interface ReadingDay {
  date: string;
  dayNumber: number;
  bookName: string;
  chapterVerse: string;
  isCompleted: boolean;
  completionTasks?: CompletionTasks;
  portions: Array<{
    bookName: string;
    startChapter: number;
    startVerse: number;
    endChapter: number;
    endVerse: number;
  }>;
}

interface WeekViewProps {
  scheduleId?: string;
  groupId?: string;
}

export const WeekView: React.FC<WeekViewProps> = ({ scheduleId, groupId }) => {
  const { currentUser } = useAuth();
  const [readings, setReadings] = useState<ReadingDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduleConfig, setScheduleConfig] = useState<CompletionTasks>({
    verseText: true,
    footnotes: false,
    partner: false
  });
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    return start;
  });

  const formatSinglePortion = (portion: any): string => {
    if (portion.startChapter === portion.endChapter) {
      if (portion.startVerse === portion.endVerse) {
        return `${portion.startChapter}:${portion.startVerse}`;
      } else {
        return `${portion.startChapter}:${portion.startVerse}-${portion.endVerse}`;
      }
    } else {
      return `${portion.startChapter}:${portion.startVerse}-${portion.endChapter}:${portion.endVerse}`;
    }
  };

  const groupPortionsByBook = (portions: any[]) => {
    if (!portions || portions.length === 0) return [];
    
    const grouped = portions.reduce((acc: any, portion: any) => {
      const bookName = portion.bookName;
      if (!acc[bookName]) {
        acc[bookName] = [];
      }
      acc[bookName].push(portion);
      return acc;
    }, {});

    return Object.entries(grouped).map(([bookName, bookPortions]: [string, any[]]) => ({
      bookName,
      portions: bookPortions,
      formattedVerse: bookPortions.map(formatSinglePortion).join(', ')
    }));
  };

  const fetchWeekReadings = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        userId: currentUser.uid
      };

      if (scheduleId) {
        params.scheduleId = scheduleId;
      } else if (groupId) {
        params.groupId = groupId;
      } else {
        setError('No schedule or group specified');
        return;
      }

      const response = await progressAPI.getScheduleWithProgress(params);
      
      // Set schedule configuration for completion tasks
      if (response.schedule?.completionTasks) {
        setScheduleConfig(response.schedule.completionTasks);
      }
      
      if (response.readings) {
        const readingDays: ReadingDay[] = response.readings.map((reading: any) => ({
          date: reading.scheduledDate,
          dayNumber: reading.dayNumber,
          bookName: reading.startBookName,
          chapterVerse: reading.portions?.map(formatSinglePortion).join(', ') || '',
          isCompleted: reading.isCompleted || false,
          completionTasks: reading.completionTasks || {
            verseText: reading.isCompleted || false,
            footnotes: false,
            partner: false
          },
          portions: reading.portions
        }));
        
        setReadings(readingDays);
      } else {
        setReadings([]);
      }
    } catch (err: any) {
      console.error('Error fetching readings:', err);
      setError('Failed to load readings');
    } finally {
      setLoading(false);
    }
  };

  const generateWeekDays = () => {
    const days = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      
      const reading = readings.find(r => r.date === dateStr);
      
      days.push({
        date: date,
        dateStr,
        isToday,
        reading,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        shortDayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => {
      const newStart = new Date(prev);
      newStart.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newStart;
    });
  };

  const handleTaskChange = async (dayNumber: number, taskType: keyof CompletionTasks, isChecked: boolean) => {
    if (!currentUser) return;

    // Find the current reading to get its completion tasks
    const currentReading = readings.find(r => r.dayNumber === dayNumber);
    if (!currentReading) return;

    // Update the specific task
    let updatedTasks = {
      ...(currentReading.completionTasks || { verseText: false, footnotes: false, partner: false }),
      [taskType]: isChecked
    };

    // If verse text is unchecked, also uncheck footnotes and partner
    if (taskType === 'verseText' && !isChecked) {
      updatedTasks.footnotes = false;
      updatedTasks.partner = false;
    }

    // Overall completion is based only on verse text being checked
    const overallCompleted = updatedTasks.verseText;

    // Store previous state for potential rollback
    const previousState = {
      isCompleted: currentReading.isCompleted,
      completionTasks: currentReading.completionTasks
    };

    // OPTIMISTIC UPDATE: Update UI immediately for instant feedback
    setReadings(prev => prev.map(reading => 
      reading.dayNumber === dayNumber 
        ? { ...reading, isCompleted: overallCompleted, completionTasks: updatedTasks } 
        : reading
    ));

    try {
      const progressData: any = {
        userId: currentUser.uid,
        dayNumber,
        completionTasks: updatedTasks
      };

      if (scheduleId) {
        progressData.scheduleId = scheduleId;
      } else if (groupId) {
        progressData.groupId = groupId;
      }

      await progressAPI.markCompleted(progressData);
      
    } catch (error) {
      console.error('Error updating progress:', error);
      
      // ROLLBACK: Revert to previous state on error
      setReadings(prev => prev.map(reading => 
        reading.dayNumber === dayNumber 
          ? { ...reading, isCompleted: previousState.isCompleted, completionTasks: previousState.completionTasks } 
          : reading
      ));
      
      // Show error message to user
      toast.error('Failed to update progress. Please try again.');
    }
  };

  useEffect(() => {
    fetchWeekReadings();
  }, [currentUser, scheduleId, groupId, currentWeekStart]);

  const getWeekDateRange = () => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    
    const startMonth = currentWeekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const startDay = currentWeekStart.getDate();
    const endDay = weekEnd.getDate();
    const year = currentWeekStart.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>Loading week view...</LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>{error}</ErrorContainer>
      </Container>
    );
  }

  const weekDays = generateWeekDays();

  return (
    <Container>
      <Header>
        <WeekNavigation>
          <NavButton onClick={() => navigateWeek('prev')}>
            ← Prev
          </NavButton>
          <WeekTitle>{getWeekDateRange()}</WeekTitle>
          <NavButton onClick={() => navigateWeek('next')}>
            Next →
          </NavButton>
        </WeekNavigation>
      </Header>

      <ScrollContainer>
        <WeekContent>
          {weekDays.map((day, index) => (
            <DayCard key={index} $isToday={day.isToday} $hasReading={!!day.reading}>
              <DayCardHeader $isToday={day.isToday}>
                <DayInfo>
                  <DayNumber $isToday={day.isToday}>
                    <DayNumberCircle $isToday={day.isToday}>
                      {day.date.getDate()}
                    </DayNumberCircle>
                    <div>
                      <DayName $isToday={day.isToday}>{day.dayName}</DayName>
                      <DateText>{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</DateText>
                    </div>
                  </DayNumber>
                  {day.reading?.isCompleted && (
                    <CompletedBadge>Completed</CompletedBadge>
                  )}
                </DayInfo>
              </DayCardHeader>

              <DayCardContent $isToday={day.isToday}>
                {day.reading ? (
                  <>
                    {groupPortionsByBook(day.reading.portions).map((bookGroup, idx) => (
                      <ReadingSection key={idx}>
                        <BookName>{bookGroup.bookName}</BookName>
                        <ChapterVerse>{bookGroup.formattedVerse}</ChapterVerse>
                      </ReadingSection>
                    ))}
                    
                    <CompletionSection>
                      <TasksContainer>
                        {scheduleConfig.verseText && (
                          <TaskRow>
                            <CheckboxLabel>
                              <Checkbox
                                type="checkbox"
                                checked={day.reading.completionTasks?.verseText || false}
                                onChange={(e) => handleTaskChange(day.reading!.dayNumber, 'verseText', e.target.checked)}
                              />
                              <TaskName>Verse Text</TaskName>
                            </CheckboxLabel>
                          </TaskRow>
                        )}
                        {scheduleConfig.footnotes && (
                          <TaskRow>
                            <CheckboxLabel>
                              <Checkbox
                                type="checkbox"
                                checked={day.reading.completionTasks?.footnotes || false}
                                disabled={!(day.reading.completionTasks?.verseText || false)}
                                onChange={(e) => handleTaskChange(day.reading!.dayNumber, 'footnotes', e.target.checked)}
                              />
                              <TaskName style={{ 
                                opacity: (day.reading.completionTasks?.verseText || false) ? 1 : 0.5 
                              }}>
                                Footnotes
                              </TaskName>
                            </CheckboxLabel>
                          </TaskRow>
                        )}
                        {scheduleConfig.partner && (
                          <TaskRow>
                            <CheckboxLabel>
                              <Checkbox
                                type="checkbox"
                                checked={day.reading.completionTasks?.partner || false}
                                disabled={!(day.reading.completionTasks?.verseText || false)}
                                onChange={(e) => handleTaskChange(day.reading!.dayNumber, 'partner', e.target.checked)}
                              />
                              <TaskName style={{ 
                                opacity: (day.reading.completionTasks?.verseText || false) ? 1 : 0.5 
                              }}>
                                Partner
                              </TaskName>
                            </CheckboxLabel>
                          </TaskRow>
                        )}
                      </TasksContainer>
                    </CompletionSection>
                  </>
                ) : (
                  <NoReading $isToday={day.isToday}>No reading scheduled for this day</NoReading>
                )}
              </DayCardContent>
            </DayCard>
          ))}
        </WeekContent>
      </ScrollContainer>
    </Container>
  );
};