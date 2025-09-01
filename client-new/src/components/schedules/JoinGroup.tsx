import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { groupScheduleAPI } from '../../services/api';
import { theme } from '../../styles/theme';

interface JoinGroupFormData {
  groupId: string;
}

interface AvailableGroup {
  groupId: string;
  groupName: string;
  templateName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  currentDay: number;
  memberCount: number;
  maxMembers?: number;
  isFull: boolean;
  completionTasks: {
    verseText: boolean;
    footnotes: boolean;
    partner: boolean;
  };
}

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[4]};
  }
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[8]};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const Label = styled.label`
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.gray[700]};
  font-size: ${theme.fontSizes.sm};
`;

const Select = styled.select`
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  background-color: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &:invalid {
    border-color: ${theme.colors.red[500]};
  }
`;

const GroupCard = styled.div`
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
  margin-top: ${theme.spacing[3]};
  background-color: ${theme.colors.gray[50]};
`;

const GroupName = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[1]};
`;

const GroupDetails = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
  margin: ${theme.spacing[1]} 0;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing[4]};
  color: ${theme.colors.gray[600]};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.fontWeights.medium};
  font-size: ${theme.fontSizes.base};
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? `
    background-color: ${theme.colors.primary[600]};
    color: white;
    border: none;
    
    &:hover {
      background-color: ${theme.colors.primary[700]};
    }
    
    &:disabled {
      background-color: ${theme.colors.gray[400]};
      cursor: not-allowed;
    }
  ` : `
    background-color: white;
    color: ${theme.colors.gray[700]};
    border: 1px solid ${theme.colors.gray[300]};
    
    &:hover {
      background-color: ${theme.colors.gray[50]};
    }
  `}
`;

const ErrorMessage = styled.span`
  color: ${theme.colors.red[600]};
  font-size: ${theme.fontSizes.sm};
`;

const HelpText = styled.span`
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.xs};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  justify-content: flex-end;
`;

const InfoBox = styled.div`
  background-color: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
`;

const InfoTitle = styled.h3`
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.primary[900]};
  margin-bottom: ${theme.spacing[2]};
`;

const InfoText = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.primary[800]};
  margin: 0;
`;

interface JoinGroupProps {
  onSuccess?: (group: any) => void;
  onCancel?: () => void;
}

const JoinGroup: React.FC<JoinGroupProps> = ({ onSuccess, onCancel }) => {
  const { currentUser, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<AvailableGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<JoinGroupFormData>();

  const watchedGroupId = watch('groupId');
  const selectedGroup = availableGroups.find(group => group.groupId === watchedGroupId);

  useEffect(() => {
    fetchAvailableGroups();
  }, []);

  const fetchAvailableGroups = async () => {
    try {
      setGroupsLoading(true);
      const response = await groupScheduleAPI.getAvailableGroups();
      setAvailableGroups(response.groups || []);
    } catch (error) {
      console.error('Error fetching available groups:', error);
      toast.error('Failed to load available groups');
    } finally {
      setGroupsLoading(false);
    }
  };

  const onSubmit = async (data: JoinGroupFormData) => {
    if (!currentUser || !userProfile) {
      toast.error('You must be logged in with a complete profile to join a group');
      return;
    }

    setIsLoading(true);
    try {
      const joinData = {
        userId: currentUser.uid,
        groupId: data.groupId.trim(),
        userName: userProfile.displayName,
        email: userProfile.email,
      };

      const response = await groupScheduleAPI.join(joinData);
      toast.success(`Successfully joined ${response.group.groupName}!`);
      
      if (onSuccess) {
        onSuccess(response.group);
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      const errorMessage = error.response?.data?.error || 'Failed to join group';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>Join Reading Group</Title>
      
      <InfoBox>
        <InfoTitle>Join a reading group</InfoTitle>
        <InfoText>
          Select from the available public reading groups below. You'll be added to their reading schedule 
          and can track your progress alongside other group members.
        </InfoText>
      </InfoBox>

      {groupsLoading && (
        <LoadingMessage>Loading available groups...</LoadingMessage>
      )}

      {!groupsLoading && availableGroups.length === 0 && (
        <InfoBox>
          <InfoTitle>No groups available</InfoTitle>
          <InfoText>
            There are no public groups available to join at this time. 
            Check back later or ask a group admin to create a public group.
          </InfoText>
        </InfoBox>
      )}

      {!groupsLoading && availableGroups.length > 0 && (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label htmlFor="groupId">Select a Reading Group *</Label>
            <Select
              id="groupId"
              {...register('groupId', {
                required: 'Please select a group to join',
              })}
            >
              <option value="">Choose a group...</option>
              {availableGroups.map((group) => (
                <option 
                  key={group.groupId} 
                  value={group.groupId}
                  disabled={group.isFull}
                >
                  {group.groupName} ({group.memberCount}/{group.maxMembers || '∞'} members) 
                  {group.isFull && ' - FULL'}
                </option>
              ))}
            </Select>
            {errors.groupId && <ErrorMessage>{errors.groupId.message}</ErrorMessage>}
          </FormGroup>

          {selectedGroup && (
            <GroupCard>
              <GroupName>{selectedGroup.groupName}</GroupName>
              <GroupDetails><strong>Reading Plan:</strong> {selectedGroup.templateName}</GroupDetails>
              <GroupDetails><strong>Duration:</strong> {selectedGroup.durationDays} days</GroupDetails>
              <GroupDetails><strong>Start Date:</strong> {new Date(selectedGroup.startDate).toLocaleDateString()}</GroupDetails>
              <GroupDetails><strong>End Date:</strong> {new Date(selectedGroup.endDate).toLocaleDateString()}</GroupDetails>
              <GroupDetails><strong>Current Day:</strong> Day {selectedGroup.currentDay}</GroupDetails>
              <GroupDetails><strong>Members:</strong> {selectedGroup.memberCount}{selectedGroup.maxMembers ? `/${selectedGroup.maxMembers}` : ''}</GroupDetails>
              <GroupDetails>
                <strong>Completion Tasks:</strong> {
                  [
                    selectedGroup.completionTasks.verseText && 'Verse Text',
                    selectedGroup.completionTasks.footnotes && 'Footnotes',
                    selectedGroup.completionTasks.partner && 'Partner'
                  ].filter(Boolean).join(', ')
                }
              </GroupDetails>
            </GroupCard>
          )}

          <ButtonGroup>
            {onCancel && (
              <Button type="button" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading || !watchedGroupId || (selectedGroup?.isFull)}
            >
              {isLoading ? 'Joining...' : 'Join Group'}
            </Button>
          </ButtonGroup>
        </Form>
      )}
    </Container>
  );
};

export default JoinGroup;