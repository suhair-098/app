import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ links, title = "ASAP" }) {
  const { logout, user } = useAuth();

  return (
    <nav className="asap-navbar">
      <div className="navbar-left">
        <h2 className="text-gradient navbar-brand">{title}</h2>
      </div>

      <div className="navbar-center">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={link.end}
          >
            <link.icon size={18} className="nav-icon" />
            <span className="nav-label">{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="navbar-right">
        <div className="user-info">
          <div className="user-avatar">{user?.email?.charAt(0).toUpperCase()}</div>
        </div>
        <button className="btn-logout-icon" onClick={() => logout()} title="Sign Out">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
