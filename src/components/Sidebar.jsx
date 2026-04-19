import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, BookOpen, FileText, UploadCloud, Users } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ links, title = "ASAP" }) {
  const { logout, user } = useAuth();

  return (
    <aside className="asap-sidebar">
      <div className="sidebar-header">
        <h2 className="text-gradient">{title}</h2>
      </div>
      
      <div className="sidebar-user">
        <div className="user-avatar">{user?.email?.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <span className="user-email">{user?.email}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={link.end}
          >
            <link.icon size={20} className="nav-icon" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={() => logout()}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
