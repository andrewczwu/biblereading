import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
  width: 100%;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing[3]};
  }
`;

export const Label = styled.label`
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.gray[700]};
  font-size: ${theme.fontSizes.sm};
  margin-bottom: ${theme.spacing[1]};
`;

export interface InputProps {
  hasError?: boolean;
  fullWidth?: boolean;
}

export const Input = styled.input<InputProps>`
  padding: ${theme.spacing[3]};
  border: 1px solid ${props => props.hasError ? theme.colors.red[500] : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  transition: all 0.2s;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? theme.colors.red[500] : theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.hasError ? theme.colors.red[100] : theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[50]};
    color: ${theme.colors.gray[500]};
    cursor: not-allowed;
  }
`;

export const Select = styled.select<InputProps>`
  padding: ${theme.spacing[3]};
  border: 1px solid ${props => props.hasError ? theme.colors.red[500] : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  background-color: ${theme.colors.white};
  transition: all 0.2s;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? theme.colors.red[500] : theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.hasError ? theme.colors.red[100] : theme.colors.primary[100]};
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[50]};
    color: ${theme.colors.gray[500]};
    cursor: not-allowed;
  }
`;

export const Textarea = styled.textarea<InputProps>`
  padding: ${theme.spacing[3]};
  border: 1px solid ${props => props.hasError ? theme.colors.red[500] : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? theme.colors.red[500] : theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.hasError ? theme.colors.red[100] : theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[50]};
    color: ${theme.colors.gray[500]};
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.span`
  color: ${theme.colors.red[600]};
  font-size: ${theme.fontSizes.sm};
  margin-top: ${theme.spacing[1]};
`;

export const HelpText = styled.span`
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.xs};
  margin-top: ${theme.spacing[1]};
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  cursor: pointer;
  font-size: ${theme.fontSizes.sm};
  
  input[type="checkbox"] {
    margin: 0;
  }
`;