// Remove unused React import since JSX transform handles it
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import styled from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Header } from './components/layout/Header';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Dashboard } from './components/Dashboard';
import Schedules from './pages/Schedules';
import { GroupMembersPage } from './pages/GroupMembersPage';
import { CalendarPage } from './pages/CalendarPage';
import { ProfilePage } from './pages/ProfilePage';
import { JoinGroupPage } from './pages/JoinGroupPage';
import { cacheUtils } from './utils/cache';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
`;

// Initialize cache on app start
cacheUtils.initCache();

function App() {
  return (
    <Router>
      <GlobalStyles />
      <AuthProvider>
        <AppContainer>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          
          <Header />
          
          <MainContent>
            <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute requireProfile>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/schedules" element={
            <PrivateRoute requireProfile>
              <Schedules />
            </PrivateRoute>
          } />
          
          <Route path="/join-group" element={
            <PrivateRoute requireProfile>
              <JoinGroupPage />
            </PrivateRoute>
          } />
          
          <Route path="/group/:groupId/members" element={
            <PrivateRoute requireProfile>
              <GroupMembersPage />
            </PrivateRoute>
          } />
          
          <Route path="/calendar" element={
            <PrivateRoute requireProfile>
              <CalendarPage />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute requireProfile>
              <ProfilePage />
            </PrivateRoute>
          } />
          
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </MainContent>
        </AppContainer>
      </AuthProvider>
    </Router>
  );
}

export default App
