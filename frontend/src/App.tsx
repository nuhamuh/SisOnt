import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import DataONT from './pages/DataONT';
import HistoriPemantauan from './pages/HistoriPemantauan';
import Grafik from './pages/Grafik';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Navigate to="/dashboard" replace />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-ont"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DataONT />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/histori-pemantauan"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <HistoriPemantauan />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/grafik"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Grafik />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Users />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
