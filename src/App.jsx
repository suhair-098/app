import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

import { Home, BookOpen, FileText, UploadCloud, Users, Layers, LayoutDashboard } from 'lucide-react';
import Sidebar from './components/Sidebar';

// Layouts with Sidebar
const AdminLayout = ({ children }) => {
  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/courses", label: "Courses & Phases", icon: Layers },
    { to: "/admin/submissions", label: "Submissions", icon: FileText },
    { to: "/admin/results", label: "Results Upload", icon: UploadCloud },
    { to: "/admin/attendance", label: "Attendance", icon: Users },
    { to: "/admin/notices", label: "Notices", icon: FileText },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Sidebar links={links} title="ASAP Admin" />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

const StudentLayout = ({ children }) => {
  const links = [
    { to: "/student/dashboard", label: "Dashboard", icon: Home, end: true },
    { to: "/student/courses", label: "My Courses", icon: BookOpen },
    { to: "/student/submissions", label: "Submissions", icon: UploadCloud },
    { to: "/student/results", label: "Results", icon: FileText },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Sidebar links={links} title="ASAP Student" />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
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
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
