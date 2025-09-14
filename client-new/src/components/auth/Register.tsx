import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Container,
  Card,
  Header,
  Logo,
  Title,
  Subtitle,
  Form,
  Section,
  SectionTitle,
  GridContainer,
  FormGroup,
  Label,
  InputContainer,
  Input,
  PasswordInput,
  PasswordToggle,
  ErrorMessage,
  ButtonContainer,
  Button,
  Footer
} from './Register.styled';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

export const Register: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const { signup, setUserProfileDirect } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Create Firebase Auth user
      const user = await signup(data.email, data.password, data.displayName);

      // Create user profile in backend
      const profileData = {
        uid: user.uid,
        email: data.email,
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: null,
        dateOfBirth: null,
        timezone: 'UTC', // Default timezone
        preferredLanguage: 'en', // Default language
        readingPreferences: {
          reminderTime: '08:00',
          enableReminders: true,
          preferredTranslation: 'ESV', // Default translation
          readingGoal: 'daily'
        },
        privacy: {
          profileVisibility: 'public',
          showReadingProgress: true,
          allowGroupInvitations: true
        }
      };

      console.log('Register - Creating profile with data:', profileData);
      const createResponse = await userProfileAPI.create(profileData);
      console.log('Register - Profile created successfully, response:', createResponse);
      
      // Set the profile directly from the creation response to avoid UID mismatch issues
      if (createResponse.profile) {
        console.log('Register - Setting profile directly from creation response');
        setUserProfileDirect(createResponse.profile);
      } else {
        console.error('Register - No profile in creation response, cannot proceed');
        throw new Error('Profile creation response missing profile data');
      }
      
      toast.success('Account created successfully!');
      console.log('Register - Navigating to dashboard');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        toast.error('An account with this email already exists');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <Logo viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </Logo>
          <Title>Bible Reading Schedule</Title>
        </Header>

        <Subtitle>Create Your Account</Subtitle>

        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* Account Information */}
          <Section>
            <SectionTitle>Account Information</SectionTitle>
            
            <GridContainer>
              <FormGroup>
                <Label>Email Address *</Label>
                <Input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  placeholder="john@example.com"
                  $hasError={!!errors.email}
                />
                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Display Name *</Label>
                <Input
                  {...register('displayName', { required: 'Display name is required' })}
                  type="text"
                  placeholder="JohnDoe"
                  $hasError={!!errors.displayName}
                />
                {errors.displayName && <ErrorMessage>{errors.displayName.message}</ErrorMessage>}
              </FormGroup>
            </GridContainer>

            <GridContainer>
              <FormGroup>
                <Label>Password *</Label>
                <InputContainer>
                  <PasswordInput
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    $hasError={!!errors.password}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L17.94 17.94z"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.84-6.84z"/>
                        <path d="M1 1l22 22"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </PasswordToggle>
                </InputContainer>
                {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Confirm Password *</Label>
                <InputContainer>
                  <PasswordInput
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    $hasError={!!errors.confirmPassword}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L17.94 17.94z"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.84-6.84z"/>
                        <path d="M1 1l22 22"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </PasswordToggle>
                </InputContainer>
                {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
              </FormGroup>
            </GridContainer>
          </Section>

          {/* Personal Information */}
          <Section>
            <SectionTitle>Personal Information</SectionTitle>
            
            <GridContainer>
              <FormGroup>
                <Label>First Name *</Label>
                <Input
                  {...register('firstName', { required: 'First name is required' })}
                  type="text"
                  placeholder="John"
                  $hasError={!!errors.firstName}
                />
                {errors.firstName && <ErrorMessage>{errors.firstName.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Last Name *</Label>
                <Input
                  {...register('lastName', { required: 'Last name is required' })}
                  type="text"
                  placeholder="Doe"
                  $hasError={!!errors.lastName}
                />
                {errors.lastName && <ErrorMessage>{errors.lastName.message}</ErrorMessage>}
              </FormGroup>

            </GridContainer>
          </Section>


          <ButtonContainer>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Footer>
              Already have an account?{' '}
              <Link to="/login">
                Sign In
              </Link>
            </Footer>
          </ButtonContainer>
        </Form>
      </Card>
    </Container>
  );
};