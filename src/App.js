import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import { DataProvider, useData } from './context/DataContext';
import StudentsPage from './pages/StudentsPage';
import SubjectsPage from './pages/SubjectsPage';
import GradesPage from './pages/GradesPage';
import MultiStepSignupPage from './pages/MultiStepSignupPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <DataProvider>
      <Router>
        <AppContent />
      </Router>
    </DataProvider>
  );
}

function AppContent() {
  const { currentUser } = useData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ flexGrow: 1, height: '100%' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/signup" element={<MultiStepSignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          {currentUser && currentUser.role === 'admin' ? (
            <Route path="/admin/*" element={<AdminDashboard />} />
          ) : (
            <Route path="/admin/*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;