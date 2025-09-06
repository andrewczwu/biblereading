import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
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
  Input,
  ErrorMessage,
  Button,
  Footer
} from './Login.styled';

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPassword: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, data.email);
      setEmailSent(true);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later');
      } else {
        toast.error('Failed to send reset email. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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

          <Subtitle>Check Your Email</Subtitle>
          <Description>
            We've sent a password reset link to your email address. 
            Please check your inbox and follow the instructions to reset your password.
          </Description>

          <Button onClick={() => navigate('/login')}>
            Back to Login
          </Button>

          <Footer>
            <p>
              Didn't receive the email?
              <Link to="#" onClick={(e) => {
                e.preventDefault();
                setEmailSent(false);
              }}>
                Try again
              </Link>
            </p>
          </Footer>
        </Card>
      </Container>
    );
  }

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

        <Subtitle>Reset Your Password</Subtitle>
        <Description>Enter your email address and we'll send you a link to reset your password.</Description>

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

          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Email'}
          </Button>
        </Form>

        <Footer>
          <p>
            Remember your password?
            <Link to="/login">
              Back to Login
            </Link>
          </p>
        </Footer>
      </Card>
    </Container>
  );
};