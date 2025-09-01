import styled from 'styled-components';
import { theme } from '../../styles/theme';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Button = styled.button<ButtonProps>`
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  
  /* Size variants */
  ${props => {
    switch (props.size) {
      case 'sm':
        return `
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
          font-size: ${theme.fontSizes.sm};
        `;
      case 'lg':
        return `
          padding: ${theme.spacing[4]} ${theme.spacing[6]};
          font-size: ${theme.fontSizes.lg};
        `;
      default:
        return `
          padding: ${theme.spacing[3]} ${theme.spacing[4]};
          font-size: ${theme.fontSizes.base};
        `;
    }
  }}
  
  /* Width */
  ${props => props.fullWidth && `width: 100%;`}
  
  /* Color variants */
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: ${theme.colors.primary[600]};
          color: ${theme.colors.white};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary[700]};
          }
          
          &:focus {
            outline: none;
            box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
          }
        `;
      case 'secondary':
        return `
          background-color: ${theme.colors.white};
          color: ${theme.colors.gray[700]};
          border: 1px solid ${theme.colors.gray[300]};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.gray[50]};
            border-color: ${theme.colors.gray[400]};
          }
          
          &:focus {
            outline: none;
            box-shadow: 0 0 0 3px ${theme.colors.gray[100]};
          }
        `;
      case 'danger':
        return `
          background-color: ${theme.colors.red[600]};
          color: ${theme.colors.white};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.red[700]};
          }
          
          &:focus {
            outline: none;
            box-shadow: 0 0 0 3px ${theme.colors.red[100]};
          }
        `;
      default:
        return `
          background-color: ${theme.colors.primary[600]};
          color: ${theme.colors.white};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary[700]};
          }
          
          &:focus {
            outline: none;
            box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
          }
        `;
    }
  }}
  
  /* Disabled state */
  &:disabled {
    background-color: ${theme.colors.gray[400]};
    color: ${theme.colors.gray[600]};
    cursor: not-allowed;
    border-color: ${theme.colors.gray[400]};
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  justify-content: flex-end;
  flex-wrap: wrap;
  
  &.center {
    justify-content: center;
  }
  
  &.start {
    justify-content: flex-start;
  }
  
  &.space-between {
    justify-content: space-between;
  }
`;