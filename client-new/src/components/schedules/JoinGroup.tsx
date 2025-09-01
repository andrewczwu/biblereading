import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { groupScheduleAPI } from '../../services/api';
import { theme } from '../../styles/theme';

interface JoinGroupFormData {
  groupId: string;
}

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};
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

const Input = styled.input`
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinGroupFormData>();

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
        <InfoTitle>How to join a group</InfoTitle>
        <InfoText>
          Enter the Group ID provided by the group creator. You'll automatically be added to their reading schedule 
          and can track your progress alongside other group members.
        </InfoText>
      </InfoBox>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label htmlFor="groupId">Group ID *</Label>
          <Input
            id="groupId"
            {...register('groupId', {
              required: 'Group ID is required',
              minLength: {
                value: 3,
                message: 'Group ID must be at least 3 characters',
              },
              maxLength: {
                value: 50,
                message: 'Group ID must not exceed 50 characters',
              },
              pattern: {
                value: /^[a-zA-Z0-9-_]+$/,
                message: 'Group ID can only contain letters, numbers, hyphens, and underscores',
              },
            })}
            placeholder="Enter the group ID"
            autoComplete="off"
          />
          {errors.groupId && <ErrorMessage>{errors.groupId.message}</ErrorMessage>}
          <HelpText>Ask the group creator for this ID</HelpText>
        </FormGroup>

        <ButtonGroup>
          {onCancel && (
            <Button type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Group'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default JoinGroup;