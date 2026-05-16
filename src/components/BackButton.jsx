import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ label = "Back to Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    if (location.pathname.startsWith('/admin')) {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };
  
  return (
    <button 
      onClick={handleBack}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'transparent',
        border: 'none',
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        padding: '0.5rem 0',
        marginBottom: '1rem',
        transition: 'color 0.2s ease'
      }}
      onMouseOver={e => e.currentTarget.style.color = 'var(--color-primary-light)'}
      onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
    >
      <ArrowLeft size={20} />
      {label}
    </button>
  );
}
