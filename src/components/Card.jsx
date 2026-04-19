import React from 'react';
import './Card.css';

export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`asap-card glass-panel animate-fade-in ${className}`}>
      {(title || action) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}
