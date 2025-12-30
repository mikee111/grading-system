import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { DataProvider, useData } from './context/DataContext';
import { FormVisibilityProvider, useFormVisibility } from './context/FormVisibilityContext';
import StudentsPage from './pages/StudentsPage';
import SubjectsPage from './pages/SubjectsPage';
import GradesPage from './pages/GradesPage';
import MultiStepSignupPage from './pages/MultiStepSignupPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
  return (
    <DataProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <FormVisibilityProvider>
          <AppContent />
        </FormVisibilityProvider>
      </Router>
    </DataProvider>
  );
}

function AppContent() {
  const { currentUser, isLoading } = useData();
  const location = useLocation();
  const showHeader = location.pathname !== '/';



  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showHeader && <Header />}
      <div style={{ flexGrow: 1, height: '100%' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/grades" element={<GradesPage />} />
          {currentUser && currentUser.role === 'admin' ? (
            <Route path="/admin/*" element={<AdminDashboard />} />
          ) : (
            <Route path="/admin/*" element={<Navigate to="/login" replace />} />
          )}

          {currentUser && currentUser.role === 'teacher' ? (
            <Route path="/teacher" element={<TeacherDashboard />} />
          ) : (
            <Route path="/teacher" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;
