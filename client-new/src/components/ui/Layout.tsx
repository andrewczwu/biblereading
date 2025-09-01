import styled from 'styled-components';
import { theme } from '../../styles/theme';

export interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
}

export const Container = styled.div<ContainerProps>`
  margin: 0 auto;
  width: 100%;
  
  /* Max width variants */
  ${props => {
    switch (props.maxWidth) {
      case 'sm':
        return `max-width: 500px;`;
      case 'md':
        return `max-width: 800px;`;
      case 'lg':
        return `max-width: 1200px;`;
      case 'xl':
        return `max-width: 1400px;`;
      case 'full':
        return `max-width: 100%;`;
      default:
        return `max-width: 800px;`;
    }
  }}
  
  /* Padding variants */
  ${props => {
    switch (props.padding) {
      case 'sm':
        return `
          padding: ${theme.spacing[4]};
          @media (max-width: ${theme.breakpoints.sm}) {
            padding: ${theme.spacing[3]};
          }
        `;
      case 'lg':
        return `
          padding: ${theme.spacing[8]};
          @media (max-width: ${theme.breakpoints.sm}) {
            padding: ${theme.spacing[6]};
          }
        `;
      default:
        return `
          padding: ${theme.spacing[6]};
          @media (max-width: ${theme.breakpoints.sm}) {
            padding: ${theme.spacing[4]};
          }
        `;
    }
  }}
`;

export const Card = styled.div<{ variant?: 'default' | 'outline' | 'elevated' }>`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  
  ${props => {
    switch (props.variant) {
      case 'outline':
        return `
          border: 1px solid ${theme.colors.gray[200]};
          box-shadow: none;
        `;
      case 'elevated':
        return `
          border: 1px solid ${theme.colors.gray[200]};
          box-shadow: ${theme.shadows.lg};
        `;
      default:
        return `
          border: 1px solid ${theme.colors.gray[200]};
          box-shadow: ${theme.shadows.base};
        `;
    }
  }}
  
  padding: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[4]};
  }
`;

export const Section = styled.section`
  margin-bottom: ${theme.spacing[8]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const Header = styled.div`
  margin-bottom: ${theme.spacing[6]};
  text-align: center;
  
  &.left {
    text-align: left;
  }
  
  &.right {
    text-align: right;
  }
`;

export const Title = styled.h1<{ size?: 'sm' | 'md' | 'lg' | 'xl' }>`
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray[900]};
  margin-bottom: ${theme.spacing[2]};
  
  ${props => {
    switch (props.size) {
      case 'sm':
        return `
          font-size: ${theme.fontSizes.xl};
          @media (max-width: ${theme.breakpoints.sm}) {
            font-size: ${theme.fontSizes.lg};
          }
        `;
      case 'lg':
        return `
          font-size: ${theme.fontSizes['4xl']};
          @media (max-width: ${theme.breakpoints.sm}) {
            font-size: ${theme.fontSizes['3xl']};
          }
        `;
      case 'xl':
        return `
          font-size: ${theme.fontSizes['4xl']};
          @media (max-width: ${theme.breakpoints.sm}) {
            font-size: ${theme.fontSizes['3xl']};
          }
        `;
      default:
        return `
          font-size: ${theme.fontSizes['3xl']};
          @media (max-width: ${theme.breakpoints.sm}) {
            font-size: ${theme.fontSizes['2xl']};
          }
        `;
    }
  }}
`;

export const Subtitle = styled.p`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing[4]};
`;

export const Grid = styled.div<{ columns?: number; gap?: 'sm' | 'md' | 'lg' }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  
  ${props => props.columns && `
    grid-template-columns: repeat(${props.columns}, 1fr);
  `}
  
  ${props => {
    switch (props.gap) {
      case 'sm':
        return `gap: ${theme.spacing[3]};`;
      case 'lg':
        return `gap: ${theme.spacing[6]};`;
      default:
        return `gap: ${theme.spacing[4]};`;
    }
  }}
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const Flex = styled.div<{ 
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: ${props => {
    switch (props.align) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'stretch': return 'stretch';
      default: return 'flex-start';
    }
  }};
  justify-content: ${props => {
    switch (props.justify) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'between': return 'space-between';
      case 'around': return 'space-around';
      default: return 'flex-start';
    }
  }};
  
  ${props => {
    switch (props.gap) {
      case 'sm':
        return `gap: ${theme.spacing[2]};`;
      case 'lg':
        return `gap: ${theme.spacing[6]};`;
      default:
        return `gap: ${theme.spacing[4]};`;
    }
  }}
  
  ${props => props.wrap && `flex-wrap: wrap;`}
`;