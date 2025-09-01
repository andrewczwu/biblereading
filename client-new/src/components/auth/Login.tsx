import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Container,
  Card,
  Header,
  Logo,
  Title,
  Subtitle,
  Description,
  Form,
  FormGroup,
  Label,
  InputContainer,
  Input,
  PasswordInput,
  PasswordToggle,
  ErrorMessage,
  ForgotPassword,
  Button,
  Footer
} from './Login.styled';

interface LoginFormData {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later');
      } else {
        toast.error('Failed to sign in. Please try again');
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
          <Title>Bible Reading</Title>
        </Header>

        <Subtitle>Welcome Back</Subtitle>
        <Description>Sign in to continue your reading journey</Description>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>Email Address</Label>
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
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
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
                placeholder="••••••••"
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
            {errors.password && (
              <ErrorMessage>{errors.password.message}</ErrorMessage>
            )}
          </FormGroup>

          <ForgotPassword>
            <Link to="/forgot-password">
              Forgot your password?
            </Link>
          </ForgotPassword>

          <Button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Form>

        <Footer>
          <p>
            Don't have an account?
            <Link to="/register">
              Create Account
            </Link>
          </p>
        </Footer>
      </Card>
    </Container>
  );
};