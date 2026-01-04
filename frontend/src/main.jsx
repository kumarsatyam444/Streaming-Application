/**
 * React Application Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Navigation } from './components/Navigation.jsx';

import { HomePage } from './pages/Home.jsx';
import { LoginPage } from './pages/Login.jsx';
import { RegisterPage } from './pages/Register.jsx';
import { DashboardPage } from './pages/Dashboard.jsx';
import { UploadPage } from './pages/Upload.jsx';
import { VideoPlayerPage } from './pages/VideoPlayer.jsx';
import { UsersPage } from './pages/Users.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload"
            element={
              <ProtectedRoute requiredRole="editor">
                <UploadPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/video/:id"
            element={
              <ProtectedRoute>
                <VideoPlayerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
