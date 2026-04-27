import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check localStorage for persisted session
    const saved = localStorage.getItem('asap_mock_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('asap_mock_session');
    return saved ? JSON.parse(saved).role : null;
  });
  const [loading, setLoading] = useState(false);

  // Persist session changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('asap_mock_session', JSON.stringify(user));
      setRole(user.role);
    } else {
      localStorage.removeItem('asap_mock_session');
      setRole(null);
    }
  }, [user]);

  // Removing Supabase onAuthStateChange since we are mocking auth

  const login = async (username, password) => {
    const userLower = username.trim().toLowerCase();
    
    if (userLower === 'admin' && password === '1234') {
      setUser({ id: 'admin-1', username: 'admin', role: 'admin', email: 'Admin' });
    } else if (userLower === 'student' && password === '1234') {
      setUser({ id: 'student-1', username: 'student', role: 'student', email: 'Student' });
    } else {
      throw new Error('Invalid credentials. Use student/1234 or admin/1234');
    }
  };

  const logout = async () => {
    setUser(null);
  };

  const value = {
    user,
    role,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
