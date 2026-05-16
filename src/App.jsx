import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

import { Home, BookOpen, FileText, UploadCloud, Users, Layers, LayoutDashboard } from 'lucide-react';
import Header from './components/Header';
import { supabase } from './supabaseClient';

// Layouts with Header
const AdminLayout = ({ children }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Header role="admin" onLogout={handleLogout} />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
};

const StudentLayout = ({ children }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Header role="student" onLogout={handleLogout} />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
};

// Basic Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  
  if (loading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />; // Or unauthorized page
  
  return children;
};

// Route Decider when authenticated but going to '/'
const HomeDecider = () => {
  const { role } = useAuth();
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'student') return <Navigate to="/student/dashboard" replace />;
  // Fallback if role is not strictly defined or fetched yet (should not happen often)
  return <div>Loading role...</div>;
};

import AdminDashboard from './pages/admin/AdminDashboard';
import CoursePhaseManager from './pages/admin/CoursePhaseManager';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminResults from './pages/admin/AdminResults';
import AdminNotices from './pages/admin/AdminNotices';
import AdminAttendance from './pages/admin/AdminAttendance';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentSubmissions from './pages/student/StudentSubmissions';
import StudentResults from './pages/student/StudentResults';
import StudentNotices from './pages/student/StudentNotices';

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><HomeDecider /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="courses" element={<CoursePhaseManager />} />
              <Route path="submissions" element={<AdminSubmissions />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="attendance" element={<AdminAttendance />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* Student Routes */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="submissions" element={<StudentSubmissions />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="notices" element={<StudentNotices />} />
            </Routes>
          </StudentLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
