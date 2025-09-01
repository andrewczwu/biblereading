import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { individualScheduleAPI, templateAPI } from '../../services/api';
import { theme } from '../../styles/theme';

interface CreateIndividualScheduleFormData {
  templateId: string;
  startDate: string;
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

const TemplateCard = styled.div`
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[4]};
`;

const TemplateTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[2]};
`;

const TemplateDescription = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[3]};
`;

const TemplateDuration = styled.span`
  background-color: ${theme.colors.primary[100]};
  color: ${theme.colors.primary[800]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.xs};
  font-weight: ${theme.fontWeights.medium};
`;

const InfoBox = styled.div`
  background-color: ${theme.colors.green[50]};
  border: 1px solid ${theme.colors.green[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
`;

const InfoTitle = styled.h3`
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.semibold};
  color: ${theme.colors.green[900]};
  margin-bottom: ${theme.spacing[2]};
`;

const InfoText = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.green[800]};
  margin: 0;
`;

interface CreateIndividualScheduleProps {
  onSuccess?: (schedule: any) => void;
  onCancel?: () => void;
}

const CreateIndividualSchedule: React.FC<CreateIndividualScheduleProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateIndividualScheduleFormData>({
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const watchedTemplateId = watch('templateId');

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

  useEffect(() => {
    const template = templates.find(t => t.id === watchedTemplateId);
    setSelectedTemplate(template || null);
  }, [watchedTemplateId, templates]);

  const onSubmit = async (data: CreateIndividualScheduleFormData) => {
    if (!currentUser) {
      toast.error('You must be logged in to create a reading schedule');
      return;
    }

    setIsLoading(true);
    try {
      const scheduleData = {
        userId: currentUser.uid,
        templateId: data.templateId,
        startDate: data.startDate,
      };

      const response = await individualScheduleAPI.create(scheduleData);
      toast.success('Personal reading schedule created successfully!');
      
      if (onSuccess) {
        onSuccess(response.schedule);
      }
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create reading schedule';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateDescription = (template: Template) => {
    return template.description || 'Complete this reading plan to deepen your biblical knowledge.';
  };

  return (
    <Container>
      <Title>Create Personal Reading Schedule</Title>
      
      <InfoBox>
        <InfoTitle>Personal Reading Schedule</InfoTitle>
        <InfoText>
          Create your own personal Bible reading schedule. You can track your progress privately 
          and stay committed to your reading goals.
        </InfoText>
      </InfoBox>

      <Form onSubmit={handleSubmit(onSubmit)}>
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

        {selectedTemplate && (
          <TemplateCard>
            <TemplateTitle>{selectedTemplate.name}</TemplateTitle>
            <TemplateDescription>
              {getTemplateDescription(selectedTemplate)}
            </TemplateDescription>
            <TemplateDuration>
              {selectedTemplate.durationDays} days
            </TemplateDuration>
          </TemplateCard>
        )}

        <FormGroup>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.startDate && <ErrorMessage>{errors.startDate.message}</ErrorMessage>}
          <HelpText>Choose when you want to begin your reading schedule</HelpText>
        </FormGroup>

        <ButtonGroup>
          {onCancel && (
            <Button type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Schedule'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default CreateIndividualSchedule;