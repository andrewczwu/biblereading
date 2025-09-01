import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { groupScheduleAPI, templateAPI } from '../../services/api';
import { theme } from '../../styles/theme';

interface CreateGroupFormData {
  groupName: string;
  templateId: string;
  startDate: string;
  isPublic: boolean;
  maxMembers: number | null;
  customGroupId: string;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  durationDays: number;
  category?: string;
  difficulty?: string;
}

const Container = styled.div`
  max-width: 600px;
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
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const Checkbox = styled.input`
  width: ${theme.spacing[4]};
  height: ${theme.spacing[4]};
  accent-color: ${theme.colors.primary[600]};
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

interface CreateGroupScheduleProps {
  onSuccess?: (group: any) => void;
  onCancel?: () => void;
}

const CreateGroupSchedule: React.FC<CreateGroupScheduleProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateGroupFormData>({
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
      isPublic: true,
      maxMembers: null,
      customGroupId: '',
    },
  });

  const maxMembersEnabled = watch('maxMembers') !== null;

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templateData = await templateAPI.getAll();
        setTemplates(templateData);
      } catch (error) {
        console.error('Error loading templates:', error);
        toast.error('Failed to load reading templates');
      }
    };

    loadTemplates();
  }, []);

  const onSubmit = async (data: CreateGroupFormData) => {
    if (!currentUser) {
      toast.error('You must be logged in to create a group');
      return;
    }

    setIsLoading(true);
    try {
      const groupData = {
        groupName: data.groupName,
        templateId: data.templateId,
        startDate: data.startDate,
        createdBy: currentUser.uid,
        isPublic: data.isPublic,
        maxMembers: data.maxMembers || undefined,
        customGroupId: data.customGroupId || undefined,
      };

      const response = await groupScheduleAPI.create(groupData);
      toast.success('Group created successfully!');
      
      if (onSuccess) {
        onSuccess(response.group);
      }
    } catch (error: any) {
      console.error('Error creating group:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create group';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>Create Reading Group</Title>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label htmlFor="groupName">Group Name *</Label>
          <Input
            id="groupName"
            {...register('groupName', {
              required: 'Group name is required',
              minLength: {
                value: 3,
                message: 'Group name must be at least 3 characters',
              },
              maxLength: {
                value: 50,
                message: 'Group name must not exceed 50 characters',
              },
            })}
            placeholder="Enter group name"
          />
          {errors.groupName && <ErrorMessage>{errors.groupName.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="templateId">Reading Plan *</Label>
          <Select
            id="templateId"
            {...register('templateId', { required: 'Please select a reading plan' })}
          >
            <option value="">Select a reading plan</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.durationDays} days)
              </option>
            ))}
          </Select>
          {errors.templateId && <ErrorMessage>{errors.templateId.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.startDate && <ErrorMessage>{errors.startDate.message}</ErrorMessage>}
          <HelpText>The date when the group will begin reading together</HelpText>
        </FormGroup>

        <FormGroup>
          <CheckboxGroup>
            <Checkbox
              id="isPublic"
              type="checkbox"
              {...register('isPublic')}
            />
            <Label htmlFor="isPublic">Make this group public</Label>
          </CheckboxGroup>
          <HelpText>Public groups can be found and joined by anyone</HelpText>
        </FormGroup>

        <FormGroup>
          <CheckboxGroup>
            <Checkbox
              id="enableMaxMembers"
              type="checkbox"
              checked={maxMembersEnabled}
              onChange={(e) => {
                if (e.target.checked) {
                  setValue('maxMembers', 10);
                } else {
                  setValue('maxMembers', null);
                }
              }}
            />
            <Label htmlFor="enableMaxMembers">Limit group size</Label>
          </CheckboxGroup>
          
          {maxMembersEnabled && (
            <>
              <Input
                type="number"
                {...register('maxMembers', {
                  min: { value: 2, message: 'Group must allow at least 2 members' },
                  max: { value: 100, message: 'Group cannot exceed 100 members' },
                })}
                placeholder="Maximum number of members"
                min="2"
                max="100"
              />
              {errors.maxMembers && <ErrorMessage>{errors.maxMembers.message}</ErrorMessage>}
            </>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="customGroupId">Custom Group ID (optional)</Label>
          <Input
            id="customGroupId"
            {...register('customGroupId', {
              pattern: {
                value: /^[a-z0-9-]*$/,
                message: 'Group ID can only contain lowercase letters, numbers, and hyphens',
              },
              maxLength: {
                value: 50,
                message: 'Group ID must not exceed 50 characters',
              },
            })}
            placeholder="custom-group-name"
          />
          {errors.customGroupId && <ErrorMessage>{errors.customGroupId.message}</ErrorMessage>}
          <HelpText>Leave empty to auto-generate from group name</HelpText>
        </FormGroup>

        <ButtonGroup>
          {onCancel && (
            <Button type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Group'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default CreateGroupSchedule;