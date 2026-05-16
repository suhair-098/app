import React, { useState, useEffect } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import './Header.css';

export default function Header({ role, onLogout }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <h1 className="header-title">ASAP</h1>
        <span className="header-subtitle">Additional Skill Acquisition Programme</span>
      </div>
      
      <div className="header-actions">
        <span className="role-badge">{role === 'admin' ? 'Administrator' : 'Student'}</span>
        
        <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <button onClick={onLogout} className="logout-btn" title="Logout">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
