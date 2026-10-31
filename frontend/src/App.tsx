import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ApplicationStatusPage } from './pages/auth/ApplicationStatusPage';

// Student Pages
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { InterviewSetupPage } from './pages/student/InterviewSetupPage';
import { VoiceInterviewRoom } from './pages/student/VoiceInterviewRoom';
import { InterviewResultsPage } from './pages/student/InterviewResultsPage';

// Faculty Pages
import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage';
import { FacultyApprovalsPage } from './pages/faculty/FacultyApprovalsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminApprovalsPage } from './pages/admin/AdminApprovalsPage';
import { FacultyManagementPage } from './pages/admin/FacultyManagementPage';
import { EvaluationWeightsPage } from './pages/admin/EvaluationWeightsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { FlaggedIncidentsPage } from './pages/admin/FlaggedIncidentsPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  // Hide Navbar/Footer inside the live interview room for concentrated screen focus
  const isInterviewRoom = location.pathname.includes('/student/interview-room');

  return (
    <div className="flex flex-col min-h-screen">
      {!isInterviewRoom && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Student Application Status (Accessible to pending, active, rejected, suspended students) */}
          <Route
            path="/status"
            element={
              <ProtectedRoute allowedRoles={['student']} requireActiveAccount={false}>
                <ApplicationStatusPage />
              </ProtectedRoute>
            }
          />

          {/* Student Protected Routes (Strictly requires active account) */}
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student']} requireActiveAccount={true}>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']} requireActiveAccount={true}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/interview-setup"
            element={
              <ProtectedRoute allowedRoles={['student']} requireActiveAccount={true}>
                <InterviewSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/interview-room/:interviewId"
            element={
              <ProtectedRoute allowedRoles={['student']} requireActiveAccount={true}>
                <VoiceInterviewRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results/:interviewId"
            element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']} requireActiveAccount={false}>
                <InterviewResultsPage />
              </ProtectedRoute>
            }
          />

          {/* Faculty Routes */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/approvals"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']} requiredPermission="student_approval">
                <FacultyApprovalsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminApprovalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faculty"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FacultyManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/weights"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EvaluationWeightsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/incidents"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FlaggedIncidentsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      {!isInterviewRoom && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
