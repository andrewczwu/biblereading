import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { userProfileAPI } from '../services/api';
import { theme } from '../styles/theme';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[4]};
  }
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing[8]};
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes['3xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[2]};
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[4]};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.gray[700]};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: ${theme.spacing[3]};
  border: 1px solid ${props => props.$hasError ? theme.colors.red[300] : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? theme.colors.red[500] : theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? theme.colors.red[100] : theme.colors.primary[100]};
  }

  &:disabled {
    background-color: ${theme.colors.gray[100]};
    cursor: not-allowed;
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: ${theme.spacing[3]};
  border: 1px solid ${props => props.$hasError ? theme.colors.red[300] : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  background-color: ${theme.colors.white};
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? theme.colors.red[500] : theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? theme.colors.red[100] : theme.colors.primary[100]};
  }

  &:disabled {
    background-color: ${theme.colors.gray[100]};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.red[600]};
  margin-top: ${theme.spacing[1]};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  justify-content: flex-end;
  margin-top: ${theme.spacing[6]};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  font-weight: ${theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;

  ${props => {
    if (props.$variant === 'secondary') {
      return `
        background: ${theme.colors.gray[200]};
        color: ${theme.colors.gray[700]};
        
        &:hover:not(:disabled) {
          background: ${theme.colors.gray[300]};
        }
      `;
    }
    return `
      background: ${theme.colors.primary[600]};
      color: ${theme.colors.white};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.primary[700]};
      }
    `;
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
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

interface ProfileFormData {
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
}

export const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>();

  useEffect(() => {
    if (userProfile) {
      reset({
        displayName: userProfile.displayName || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        phoneNumber: userProfile.phoneNumber || ''
      });
    }
  }, [userProfile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      await userProfileAPI.update(currentUser.uid, updateData);
      await refreshUserProfile();
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (!currentUser) {
    return (
      <Container>
        <Header>
          <Title>Access Denied</Title>
          <Subtitle>You must be logged in to view your profile.</Subtitle>
        </Header>
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container>
        <LoadingSpinner>Loading your profile...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>My Profile</Title>
        <Subtitle>Manage your account settings and reading preferences</Subtitle>
      </Header>

      <Card>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={currentUser.email || ''}
              disabled
              title="Email cannot be changed"
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                disabled={!isEditing}
                $hasError={!!errors.firstName}
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <ErrorMessage>{errors.firstName.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                disabled={!isEditing}
                {...register('lastName')}
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              disabled={!isEditing}
              $hasError={!!errors.displayName}
              {...register('displayName', { required: 'Display name is required' })}
            />
            {errors.displayName && <ErrorMessage>{errors.displayName.message}</ErrorMessage>}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                disabled={!isEditing}
                {...register('dateOfBirth')}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                disabled={!isEditing}
                {...register('phoneNumber')}
              />
            </FormGroup>
          </FormRow>


          <ButtonGroup>
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  $variant="secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !isDirty}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </ButtonGroup>
        </Form>
      </Card>
    </Container>
  );
};