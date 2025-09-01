import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { groupScheduleAPI, templateAPI } from '../../services/api';
import { theme } from '../../styles/theme';
import { Button } from '../ui/Button';
import { Form, FormGroup, Label, Input, Select, ErrorMessage, HelpText } from '../ui/Form';
import { Container, Title } from '../ui/Layout';

interface CreateGroupFormData {
  groupName: string;
  templateId: string;
  startDate: string;
  isPublic: boolean;
  maxMembers: number | null;
  customGroupId: string;
  enableVerseText: boolean;
  enableFootnotes: boolean;
  enablePartner: boolean;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  durationDays: number;
  category?: string;
  difficulty?: string;
}

const StyledContainer = styled(Container)`
  max-width: 600px;
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

const CompletionTasksCheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  cursor: pointer;
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.gray[700]};
  
  &:hover {
    color: ${theme.colors.primary[600]};
  }
`;

const CompletionTasksCheckbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const CompletionTasksSection = styled.div`
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  background-color: ${theme.colors.gray[50]};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[3]};
`;

const SectionDescription = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[4]};
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
      enableVerseText: true,
      enableFootnotes: false,
      enablePartner: false,
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
        completionTasks: {
          verseText: data.enableVerseText,
          footnotes: data.enableFootnotes,
          partner: data.enablePartner,
        },
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
    <StyledContainer>
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

        <CompletionTasksSection>
          <SectionTitle>Completion Tracking Options</SectionTitle>
          <SectionDescription>
            Choose which aspects of reading group members will track. Each member can mark these tasks separately to monitor their progress.
          </SectionDescription>
          <CompletionTasksCheckboxGroup>
            <CheckboxLabel>
              <CompletionTasksCheckbox
                type="checkbox"
                {...register('enableVerseText')}
              />
              <span>
                <strong>Verse Text</strong> - Track completion of reading the Bible text itself
              </span>
            </CheckboxLabel>
            <CheckboxLabel>
              <CompletionTasksCheckbox
                type="checkbox"
                {...register('enableFootnotes')}
              />
              <span>
                <strong>Footnotes</strong> - Track reading of study notes and footnotes
              </span>
            </CheckboxLabel>
            <CheckboxLabel>
              <CompletionTasksCheckbox
                type="checkbox"
                {...register('enablePartner')}
              />
              <span>
                <strong>Partner</strong> - Track discussing the reading with a partner or group
              </span>
            </CheckboxLabel>
          </CompletionTasksCheckboxGroup>
        </CompletionTasksSection>

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
    </StyledContainer>
  );
};

export default CreateGroupSchedule;