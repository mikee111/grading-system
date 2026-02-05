import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { DataProvider, useData } from './context/DataContext';
import { FormVisibilityProvider } from './context/FormVisibilityContext';
import StudentsPage from './pages/StudentsPage';
import StudentListPage from './pages/StudentListPage';
import SubjectsPage from './pages/SubjectsPage';
import GradesPage from './pages/GradesPage';
import MultiStepSignupPage from './pages/MultiStepSignupPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import OverviewPage from './pages/OverviewPage';
import AcademicSetupPage from './pages/AcademicSetupPage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminChangePasswordPage from './pages/AdminChangePasswordPage';
import AdminRoleManagementPage from './pages/AdminRoleManagementPage';
import AdminUserRoleAssignmentPage from './pages/AdminUserRoleAssignmentPage';
import AdminTeacherAccountsPage from './pages/AdminTeacherAccountsPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<MultiStepSignupPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route
            path="/admin"
            element={
              isLoading ? null : currentUser && currentUser.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="student-list" element={<StudentListPage />} />
            <Route path="subjects" element={<AcademicSetupPage initialTab="subjects" />} />
            <Route path="courses" element={<AcademicSetupPage initialTab="courses" />} />
            <Route path="sections" element={<AcademicSetupPage initialTab="sections" />} />
            <Route path="year-levels" element={<AcademicSetupPage initialTab="year-levels" />} />
            <Route path="school-years" element={<AcademicSetupPage initialTab="school-years" />} />
            <Route path="semesters" element={<AcademicSetupPage initialTab="semesters" />} />
            <Route path="grades" element={<GradesPage />} />
            <Route path="teachers" element={<AdminTeacherAccountsPage />} />
            <Route path="profile/view-edit" element={<AdminProfilePage />} />
            <Route path="profile/change-password" element={<AdminChangePasswordPage />} />
            <Route path="role-management" element={<AdminRoleManagementPage />} />
            <Route path="user-roles" element={<AdminUserRoleAssignmentPage />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Route>

          <Route
            path="/teacher"
            element={
              isLoading ? null : currentUser && currentUser.role === 'teacher' ? (
                <TeacherDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/student"
            element={
              isLoading ? null : currentUser && currentUser.role === 'student' ? (
                <StudentDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
