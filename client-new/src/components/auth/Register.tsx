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
  Select,
  PasswordInput,
  PasswordToggle,
  CheckboxContainer,
  Checkbox,
  CheckboxLabel,
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
  phoneNumber?: string;
  dateOfBirth?: string;
  timezone: string;
  preferredLanguage: string;
  reminderTime: string;
  enableReminders: boolean;
  preferredTranslation: string;
}

export const Register: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const { signup } = useAuth();
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
        phoneNumber: data.phoneNumber || null,
        dateOfBirth: data.dateOfBirth || null,
        timezone: data.timezone,
        preferredLanguage: data.preferredLanguage,
        readingPreferences: {
          reminderTime: data.reminderTime,
          enableReminders: data.enableReminders,
          preferredTranslation: data.preferredTranslation,
          readingGoal: 'daily'
        },
        privacy: {
          profileVisibility: 'public',
          showReadingProgress: true,
          allowGroupInvitations: true
        }
      };

      await userProfileAPI.create(profileData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account');
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

              <FormGroup>
                <Label>Phone Number (Optional)</Label>
                <Input
                  {...register('phoneNumber')}
                  type="tel"
                  placeholder="+1234567890"
                />
              </FormGroup>

              <FormGroup>
                <Label>Date of Birth (Optional)</Label>
                <Input
                  {...register('dateOfBirth')}
                  type="date"
                />
              </FormGroup>
            </GridContainer>
          </Section>

          {/* Reading Preferences */}
          <Section>
            <SectionTitle>Reading Preferences</SectionTitle>
            
            <GridContainer>
              <FormGroup>
                <Label>Timezone *</Label>
                <Select
                  {...register('timezone', { required: 'Timezone is required' })}
                  $hasError={!!errors.timezone}
                >
                  <option value="">Select timezone</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="UTC">UTC</option>
                </Select>
                {errors.timezone && <ErrorMessage>{errors.timezone.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Preferred Language *</Label>
                <Select
                  {...register('preferredLanguage', { required: 'Language is required' })}
                  $hasError={!!errors.preferredLanguage}
                >
                  <option value="">Select language</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </Select>
                {errors.preferredLanguage && <ErrorMessage>{errors.preferredLanguage.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Daily Reminder Time *</Label>
                <Input
                  {...register('reminderTime', { required: 'Reminder time is required' })}
                  type="time"
                  defaultValue="08:00"
                  $hasError={!!errors.reminderTime}
                />
                {errors.reminderTime && <ErrorMessage>{errors.reminderTime.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Preferred Translation *</Label>
                <Select
                  {...register('preferredTranslation', { required: 'Translation is required' })}
                  $hasError={!!errors.preferredTranslation}
                >
                  <option value="">Select translation</option>
                  <option value="NIV">NIV</option>
                  <option value="ESV">ESV</option>
                  <option value="KJV">KJV</option>
                  <option value="NKJV">NKJV</option>
                  <option value="NLT">NLT</option>
                </Select>
                {errors.preferredTranslation && <ErrorMessage>{errors.preferredTranslation.message}</ErrorMessage>}
              </FormGroup>
            </GridContainer>

            <CheckboxContainer>
              <Checkbox
                {...register('enableReminders')}
                type="checkbox"
                defaultChecked
                id="enableReminders"
              />
              <CheckboxLabel htmlFor="enableReminders">
                Enable daily reminders
              </CheckboxLabel>
            </CheckboxContainer>
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