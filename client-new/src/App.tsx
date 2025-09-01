import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Header } from './components/layout/Header';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Dashboard } from './components/Dashboard';
import Schedules from './pages/Schedules';

function App() {
  return (
    <Router>
      <GlobalStyles />
      <AuthProvider>
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
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App
