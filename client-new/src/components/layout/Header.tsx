import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

const HeaderContainer = styled.header`
  background-color: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  box-shadow: ${theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[6]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[4]};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  cursor: pointer;
`;

const LogoIcon = styled.svg`
  height: 32px;
  width: 32px;
  color: ${theme.colors.primary[600]};
`;

const LogoText = styled.h1`
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  color: ${theme.colors.gray[900]};
  margin: 0;

  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.fontSizes.lg};
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
`;

const ProfileButton = styled.button`
  background-color: ${theme.colors.white};
  color: ${theme.colors.gray[700]};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};

  &:hover {
    background-color: ${theme.colors.gray[50]};
    border-color: ${theme.colors.gray[400]};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]};
    
    span {
      display: none;
    }
  }
`;

const ProfileIcon = styled.svg`
  width: 16px;
  height: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  text-align: right;

  @media (max-width: ${theme.breakpoints.sm}) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  color: ${theme.colors.gray[900]};
`;

const UserEmail = styled.span`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.gray[600]};
`;

const LogoutButton = styled.button`
  background-color: ${theme.colors.gray[100]};
  color: ${theme.colors.gray[700]};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  font-size: ${theme.fontSizes.sm};
  font-weight: ${theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};

  &:hover {
    background-color: ${theme.colors.gray[200]};
    border-color: ${theme.colors.gray[400]};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]};
    
    span {
      display: none;
    }
  }
`;

const LogoutIcon = styled.svg`
  width: 16px;
  height: 16px;
`;

export const Header: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  if (!currentUser) {
    return null; // Don't show header for non-authenticated users
  }

  const displayName = userProfile?.firstName 
    ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
    : userProfile?.displayName 
    || currentUser.displayName 
    || 'User';

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo onClick={handleLogoClick}>
          <LogoIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </LogoIcon>
          <LogoText>Bible Reading</LogoText>
        </Logo>

        <UserSection>
          <UserInfo>
            <UserName>{displayName}</UserName>
            <UserEmail>{currentUser.email}</UserEmail>
          </UserInfo>
          
          <ProfileButton onClick={handleProfileClick}>
            <ProfileIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </ProfileIcon>
            <span>Profile</span>
          </ProfileButton>
          
          <LogoutButton onClick={handleLogout}>
            <LogoutIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </LogoutIcon>
            <span>Sign Out</span>
          </LogoutButton>
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
};