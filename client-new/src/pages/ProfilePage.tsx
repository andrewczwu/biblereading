import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { userProfileAPI } from '../services/api';
import { theme } from '../styles/theme';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Form, FormGroup, FormRow, Label, Input, ErrorMessage } from '../components/ui/Form';
import { Container, Card, Header, Title, Subtitle } from '../components/ui/Layout';
import { LoadingSpinner } from '../components/ui/LoadingStates';

const StyledContainer = styled(Container)`
  max-width: 800px;
`;

const StyledInput = styled(Input)<{ $hasError?: boolean }>`
  &:disabled {
    background-color: ${theme.colors.gray[100]};
    cursor: not-allowed;
  }
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
      <StyledContainer>
        <Header>
          <Title>Access Denied</Title>
          <Subtitle>You must be logged in to view your profile.</Subtitle>
        </Header>
      </StyledContainer>
    );
  }

  if (!userProfile) {
    return (
      <StyledContainer>
        <LoadingSpinner />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Header>
        <Title>My Profile</Title>
        <Subtitle>Manage your account settings and reading preferences</Subtitle>
      </Header>

      <Card>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>Email Address</Label>
            <StyledInput
              type="email"
              value={currentUser.email || ''}
              disabled
              title="Email cannot be changed"
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="firstName">First Name</Label>
              <StyledInput
                id="firstName"
                type="text"
                disabled={!isEditing}
                hasError={!!errors.firstName}
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <ErrorMessage>{errors.firstName.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="lastName">Last Name</Label>
              <StyledInput
                id="lastName"
                type="text"
                disabled={!isEditing}
                {...register('lastName')}
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="displayName">Display Name</Label>
            <StyledInput
              id="displayName"
              type="text"
              disabled={!isEditing}
              hasError={!!errors.displayName}
              {...register('displayName', { required: 'Display name is required' })}
            />
            {errors.displayName && <ErrorMessage>{errors.displayName.message}</ErrorMessage>}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <StyledInput
                id="dateOfBirth"
                type="date"
                disabled={!isEditing}
                {...register('dateOfBirth')}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <StyledInput
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
                  variant="secondary"
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
    </StyledContainer>
  );
};