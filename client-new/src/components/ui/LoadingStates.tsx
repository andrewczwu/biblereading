import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing[4]};
  color: ${theme.colors.gray[600]};
  font-size: ${theme.fontSizes.base};
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid ${theme.colors.gray[200]};
  border-radius: 50%;
  border-top-color: ${theme.colors.primary[600]};
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[8]};
  min-height: 200px;
`;

export const ErrorMessage = styled.div`
  background-color: ${theme.colors.red[50]};
  border: 1px solid ${theme.colors.red[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
  color: ${theme.colors.red[800]};
  font-size: ${theme.fontSizes.sm};
  text-align: center;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  color: ${theme.colors.gray[600]};
`;

export const EmptyStateTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.gray[700]};
  margin-bottom: ${theme.spacing[2]};
`;

export const EmptyStateText = styled.p`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.gray[600]};
  margin: 0;
`;