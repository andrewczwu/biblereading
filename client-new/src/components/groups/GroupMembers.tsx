import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { groupScheduleAPI } from '../../services/api';
import { theme } from '../../styles/theme';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[4]};
  }
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[2]};
`;

const GroupInfo = styled.div`
  background: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};

  h2 {
    font-size: ${theme.fontSizes.lg};
    font-weight: ${theme.fontWeights.semibold};
    color: ${theme.colors.primary[900]};
    margin-bottom: ${theme.spacing[2]};
  }

  p {
    color: ${theme.colors.primary[700]};
    margin-bottom: ${theme.spacing[1]};
    font-size: ${theme.fontSizes.sm};
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
  gap: ${theme.spacing[4]};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Stats = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};

  @media (max-width: ${theme.breakpoints.sm}) {
    justify-content: center;
  }
`;

const StatItem = styled.span`
  white-space: nowrap;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? theme.colors.primary[600] : theme.colors.gray[200]};
  color: ${props => props.$active ? theme.colors.white : theme.colors.gray[700]};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  font-size: ${theme.fontSizes.sm};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? theme.colors.primary[700] : theme.colors.gray[300]};
  }
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const MemberCard = styled.div<{ $isInactive: boolean }>`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  transition: all 0.2s;
  opacity: ${props => props.$isInactive ? 0.7 : 1};

  &:hover {
    border-color: ${theme.colors.primary[300]};
    box-shadow: ${theme.shadows.base};
  }
`;

const MemberHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[2]};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing[2]};
  }
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[1]};
`;

const MemberEmail = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[1]};
`;

const MemberBadges = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  flex-wrap: wrap;

  @media (max-width: ${theme.breakpoints.sm}) {
    justify-content: flex-start;
  }
`;

const Badge = styled.span<{ $variant: 'admin' | 'member' | 'inactive' }>`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;

  ${props => {
    switch (props.$variant) {
      case 'admin':
        return `
          background: ${theme.colors.green[100]};
          color: ${theme.colors.green[800]};
        `;
      case 'member':
        return `
          background: ${theme.colors.blue[100]};
          color: ${theme.colors.blue[800]};
        `;
      case 'inactive':
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[600]};
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[600]};
        `;
    }
  }}
`;

const MemberProgress = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[3]};
  padding-top: ${theme.spacing[3]};
  border-top: 1px solid ${theme.colors.gray[200]};
`;

const ProgressItem = styled.div`
  text-align: center;

  .label {
    font-size: ${theme.fontSizes.xs};
    color: ${theme.colors.gray[500]};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: ${theme.spacing[1]};
  }

  .value {
    font-size: ${theme.fontSizes.lg};
    font-weight: ${theme.fontWeights.semibold};
    color: ${theme.colors.gray[900]};
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

const ErrorMessage = styled.div`
  background: ${theme.colors.red[50]};
  border: 1px solid ${theme.colors.red[200]};
  color: ${theme.colors.red[800]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  color: ${theme.colors.gray[500]};

  h3 {
    font-size: ${theme.fontSizes.lg};
    margin-bottom: ${theme.spacing[2]};
  }
`;

interface GroupMember {
  userId: string;
  userName: string;
  email: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  joinedAt: string;
  leftAt: string | null;
  currentDay: number;
  completedDays: number;
  lastActiveAt: string;
  userProfile: {
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    timezone: string;
    preferredLanguage: string;
  } | null;
}

interface GroupInfo {
  groupId: string;
  groupName: string;
  templateName: string;
  startDate: string;
  endDate: string;
  currentDay: number;
  status: string;
  memberCount: number;
  createdBy: string;
  isPublic: boolean;
  maxMembers: number | null;
}

interface GroupMembersProps {
  groupId: string;
}

export const GroupMembers: React.FC<GroupMembersProps> = ({ groupId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [admins, setAdmins] = useState(0);

  const fetchGroupMembers = async (includeInactive: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching members for group ${groupId}, includeInactive: ${includeInactive}`);
      const response = await groupScheduleAPI.getMembers(groupId, includeInactive);
      
      setGroupInfo(response.group);
      setMembers(response.members || []);
      setTotalMembers(response.totalMembers || 0);
      setActiveMembers(response.activeMembers || 0);
      setAdmins(response.admins || 0);
      
      console.log('Group members fetched successfully:', response);
    } catch (err: any) {
      console.error('Error fetching group members:', err);
      if (err.response?.status === 404) {
        setError('Group not found');
      } else {
        setError(err.response?.data?.error || 'Failed to load group members');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupMembers(showInactive);
    }
  }, [groupId, showInactive]);

  const handleToggleInactive = () => {
    setShowInactive(!showInactive);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDisplayName = (member: GroupMember) => {
    if (member.userProfile?.displayName) {
      return member.userProfile.displayName;
    }
    if (member.userProfile?.firstName && member.userProfile?.lastName) {
      return `${member.userProfile.firstName} ${member.userProfile.lastName}`;
    }
    if (member.userName) {
      return member.userName;
    }
    return member.email.split('@')[0];
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading group members...</LoadingSpinner>
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

  return (
    <Container>
      <Header>
        <Title>Group Members</Title>
      </Header>

      {groupInfo && (
        <GroupInfo>
          <h2>{groupInfo.groupName}</h2>
          <p><strong>Reading Plan:</strong> {groupInfo.templateName}</p>
          <p><strong>Started:</strong> {formatDate(groupInfo.startDate)} • <strong>Ends:</strong> {formatDate(groupInfo.endDate)}</p>
          <p><strong>Current Day:</strong> {groupInfo.currentDay} • <strong>Status:</strong> {groupInfo.status}</p>
        </GroupInfo>
      )}

      <Controls>
        <Stats>
          <StatItem><strong>{totalMembers}</strong> Total</StatItem>
          <StatItem><strong>{activeMembers}</strong> Active</StatItem>
          <StatItem><strong>{admins}</strong> Admin{admins !== 1 ? 's' : ''}</StatItem>
        </Stats>

        <ToggleButton
          $active={showInactive}
          onClick={handleToggleInactive}
        >
          {showInactive ? 'Hide Inactive' : 'Show All'}
        </ToggleButton>
      </Controls>

      {members.length === 0 ? (
        <EmptyState>
          <h3>No members found</h3>
          <p>This group doesn't have any {showInactive ? '' : 'active '}members yet.</p>
        </EmptyState>
      ) : (
        <MembersList>
          {members.map((member) => (
            <MemberCard key={member.userId} $isInactive={member.status === 'inactive'}>
              <MemberHeader>
                <MemberInfo>
                  <MemberName>{getDisplayName(member)}</MemberName>
                  <MemberEmail>{member.email}</MemberEmail>
                </MemberInfo>
                
                <MemberBadges>
                  <Badge $variant={member.role}>{member.role}</Badge>
                  {member.status === 'inactive' && <Badge $variant="inactive">Inactive</Badge>}
                </MemberBadges>
              </MemberHeader>

              <MemberProgress>
                <ProgressItem>
                  <div className="label">Current Day</div>
                  <div className="value">{member.currentDay}</div>
                </ProgressItem>
                
                <ProgressItem>
                  <div className="label">Completed</div>
                  <div className="value">{member.completedDays}</div>
                </ProgressItem>
                
                <ProgressItem>
                  <div className="label">Joined</div>
                  <div className="value">{formatDate(member.joinedAt)}</div>
                </ProgressItem>
                
                <ProgressItem>
                  <div className="label">Last Active</div>
                  <div className="value">{formatDate(member.lastActiveAt)}</div>
                </ProgressItem>

                {member.userProfile && (
                  <>
                    <ProgressItem>
                      <div className="label">Timezone</div>
                      <div className="value">{member.userProfile.timezone}</div>
                    </ProgressItem>
                    
                    <ProgressItem>
                      <div className="label">Language</div>
                      <div className="value">{member.userProfile.preferredLanguage.toUpperCase()}</div>
                    </ProgressItem>
                  </>
                )}
              </MemberProgress>
            </MemberCard>
          ))}
        </MembersList>
      )}
    </Container>
  );
};