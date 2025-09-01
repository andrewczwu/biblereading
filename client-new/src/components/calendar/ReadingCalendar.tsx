import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { progressAPI } from '../../services/api';
import { theme } from '../../styles/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[4]};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]};
    margin: 0;
    max-width: 100%;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing[4]};
  }
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray[900]};
`;

const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
`;

const NavButton = styled.button`
  background: ${theme.colors.primary[600]};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  font-size: ${theme.fontSizes.sm};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${theme.colors.primary[700]};
  }

  &:disabled {
    background: ${theme.colors.gray[300]};
    cursor: not-allowed;
  }
`;

const MonthTitle = styled.h2`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.gray[900]};
  min-width: 200px;
  text-align: center;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: ${theme.spacing[6]};
  width: 100%;

  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.md};
  }
`;

const DayHeader = styled.div`
  background: ${theme.colors.gray[100]};
  padding: ${theme.spacing[3]};
  text-align: center;
  font-weight: ${theme.fontWeights.semibold};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[700]};

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]};
    font-size: ${theme.fontSizes.xs};
  }
`;

const DayCell = styled.div<{ $isCurrentMonth: boolean; $isToday: boolean; $hasReading: boolean }>`
  background: ${theme.colors.white};
  min-height: 120px;
  padding: ${theme.spacing[2]};
  display: flex;
  flex-direction: column;
  position: relative;
  opacity: ${props => props.$isCurrentMonth ? 1 : 0.4};
  
  ${props => !props.$hasReading && props.$isCurrentMonth && `
    background: ${theme.colors.gray[50]};
  `}

  ${props => props.$isToday && `
    background: ${theme.colors.primary[100]} !important;
    border: 2px solid ${theme.colors.primary[500]};
    box-shadow: 0 0 0 1px ${theme.colors.primary[300]};
  `}

  @media (max-width: ${theme.breakpoints.md}) {
    min-height: 100px;
    padding: ${theme.spacing[1]};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    min-height: 80px;
  }
`;

const DayNumber = styled.div<{ $isToday?: boolean }>`
  font-weight: ${theme.fontWeights.semibold};
  font-size: ${theme.fontSizes.sm};
  color: ${props => props.$isToday ? theme.colors.primary[800] : theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[1]};
  ${props => props.$isToday && `
    background: ${theme.colors.primary[600]};
    color: ${theme.colors.white};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${theme.fontSizes.xs};
  `}
`;

const ReadingInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.gray[700]};
  line-height: 1.2;
`;

const BookName = styled.div`
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.primary[700]};
  margin-bottom: ${theme.spacing[1]};
`;

const ChapterVerse = styled.div`
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[2]};
`;


const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
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

const NoScheduleMessage = styled.div`
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
`;

interface ReadingDay {
  date: string;
  dayNumber: number;
  bookName: string;
  chapterVerse: string;
  isCompleted: boolean;
  portions: Array<{
    bookName: string;
    startChapter: number;
    startVerse: number;
    endChapter: number;
    endVerse: number;
  }>;
}

interface ReadingCalendarProps {
  scheduleId?: string;
  groupId?: string;
}

export const ReadingCalendar: React.FC<ReadingCalendarProps> = ({ scheduleId, groupId }) => {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [readings, setReadings] = useState<ReadingDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        userId: currentUser.uid
        // Remove limit to get all readings in the schedule
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
      
      if (response.readings) {
        const readingDays: ReadingDay[] = response.readings.map((reading: any) => ({
          date: reading.scheduledDate,
          dayNumber: reading.dayNumber,
          bookName: reading.startBookName,
          chapterVerse: formatChapterVerse(reading.portions),
          isCompleted: reading.isCompleted || false,
          portions: reading.portions
        }));
        
        setReadings(readingDays);
      } else {
        setReadings([]);
      }
    } catch (err: any) {
      console.error('Error fetching readings:', err);
      setError(err.response?.data?.error || 'Failed to load reading schedule');
    } finally {
      setLoading(false);
    }
  };

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

  const formatChapterVerse = (portions: any[]): string => {
    if (!portions || portions.length === 0) return '';
    
    if (portions.length === 1) {
      return formatSinglePortion(portions[0]);
    } else {
      // For multiple portions, show each one
      return portions.map(formatSinglePortion).join(', ');
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


  useEffect(() => {
    if (currentUser && (scheduleId || groupId)) {
      fetchReadings();
    }
  }, [currentUser, scheduleId, groupId, currentDate]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      
      const reading = readings.find(r => r.date === dateStr);
      
      days.push({
        date: date,
        dateStr,
        isCurrentMonth,
        isToday,
        reading
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading reading calendar...</LoadingSpinner>
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

  if (readings.length === 0) {
    return (
      <Container>
        <NoScheduleMessage>
          <h3>No Reading Schedule Found</h3>
          <p>Please create or join a reading schedule to view your calendar.</p>
        </NoScheduleMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Reading Calendar</Title>
        <MonthNavigation>
          <NavButton onClick={() => navigateMonth('prev')}>
            Previous
          </NavButton>
          <MonthTitle>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </MonthTitle>
          <NavButton onClick={() => navigateMonth('next')}>
            Next
          </NavButton>
        </MonthNavigation>
      </Header>

      <CalendarGrid>
        {dayHeaders.map(day => (
          <DayHeader key={day}>{day}</DayHeader>
        ))}
        
        {generateCalendarDays().map((day, index) => (
          <DayCell
            key={index}
            $isCurrentMonth={day.isCurrentMonth}
            $isToday={day.isToday}
            $hasReading={!!day.reading}
          >
            <DayNumber $isToday={day.isToday}>{day.date.getDate()}</DayNumber>
            
            {day.reading && (
              <>
                <ReadingInfo>
                  {groupPortionsByBook(day.reading.portions).map((bookGroup, index) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      <BookName>{bookGroup.bookName.substring(0, 4)}</BookName>
                      <ChapterVerse>{bookGroup.formattedVerse}</ChapterVerse>
                    </div>
                  ))}
                </ReadingInfo>
              </>
            )}
          </DayCell>
        ))}
      </CalendarGrid>
    </Container>
  );
};