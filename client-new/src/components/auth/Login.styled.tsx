import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.primary[100]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[4]};
`;

export const Card = styled.div`
  max-width: 400px;
  width: 100%;
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius['2xl']};
  box-shadow: ${theme.shadows.xl};
  padding: ${theme.spacing[8]};

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[6]};
    max-width: 100%;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing[8]};
`;

export const Logo = styled.svg`
  height: 48px;
  width: 48px;
  color: ${theme.colors.primary[600]};
  margin-right: ${theme.spacing[3]};
`;

export const Title = styled.h1`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray[900]};

  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.fontSizes.xl};
  }
`;

export const Subtitle = styled.h2`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.semibold};
  text-align: center;
  margin-bottom: ${theme.spacing[2]};
  color: ${theme.colors.gray[900]};
`;

export const Description = styled.p`
  text-align: center;
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[6]};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  display: block;
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.gray[700]};
  margin-bottom: ${theme.spacing[1]};
`;

export const InputContainer = styled.div`
  position: relative;
`;

export const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${props => props.hasError ? theme.colors.red[500] : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSizes.base};
  transition: all 0.2s;

  &:focus {
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[500]}20;
  }

  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
`;

export const PasswordInput = styled(Input)`
  padding-right: 48px;
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  padding: ${theme.spacing[1]};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.base};

  &:hover {
    color: ${theme.colors.gray[700]};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ErrorMessage = styled.p`
  margin-top: ${theme.spacing[1]};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.red[600]};
`;

export const ForgotPassword = styled.div`
  text-align: right;

  a {
    font-size: ${theme.fontSizes.sm};
    color: ${theme.colors.primary[600]};
    text-decoration: none;
    font-weight: ${theme.fontWeights.medium};

    &:hover {
      color: ${theme.colors.primary[700]};
      text-decoration: underline;
    }
  }
`;

export const Button = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background-color: ${props => props.disabled ? theme.colors.gray[400] : theme.colors.primary[600]};
  color: ${theme.colors.white};
  font-weight: ${theme.fontWeights.medium};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  transition: all 0.2s;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: ${theme.fontSizes.base};

  &:hover:not(:disabled) {
    background-color: ${theme.colors.primary[700]};
  }

  &:disabled {
    opacity: 0.6;
  }
`;

export const Footer = styled.div`
  margin-top: ${theme.spacing[6]};
  text-align: center;

  p {
    font-size: ${theme.fontSizes.sm};
    color: ${theme.colors.gray[600]};

    a {
      color: ${theme.colors.primary[600]};
      text-decoration: none;
      font-weight: ${theme.fontWeights.medium};
      margin-left: ${theme.spacing[1]};

      &:hover {
        color: ${theme.colors.primary[700]};
        text-decoration: underline;
      }
    }
  }
`;