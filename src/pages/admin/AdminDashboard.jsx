import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import { Users, BookOpen, Layers, FileText, UploadCloud } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function AdminDashboard() {
  const [coursesCount, setCoursesCount] = useState('Loading...');
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(localStorage.getItem('selectedPhaseId') || '');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchPhases();
  }, [selectedPhase]);

  const fetchPhases = async () => {
    try {
      const { data: phasesData } = await supabase.from('phases').select('*');
      if (phasesData) setPhases(phasesData);
    } catch (err) {
      console.error("Error fetching phases:", err);
    }
  };

  const fetchStats = async () => {
    try {
      let query = supabase.from('courses').select('id', { count: 'exact' });
      if (selectedPhase) {
        query = query.eq('phase_id', selectedPhase);
      }
      const { count: cCount, error: cErr } = await query;
      if (cCount !== null) setCoursesCount(cCount);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handlePhaseChange = (e) => {
    const val = e.target.value;
    setSelectedPhase(val);
    if (val) {
      localStorage.setItem('selectedPhaseId', val);
    } else {
      localStorage.removeItem('selectedPhaseId');
    }
    window.dispatchEvent(new Event('phaseChanged'));
  };

  const menuItems = [
    { title: "Courses & Phases", icon: <Layers size={32} />, path: "/admin/courses", color: "var(--color-primary)" },
    { title: "Submissions", icon: <FileText size={32} />, path: "/admin/submissions", color: "var(--color-secondary)" },
    { title: "Results Upload", icon: <UploadCloud size={32} />, path: "/admin/results", color: "var(--color-success)" },
    { title: "Attendance", icon: <Users size={32} />, path: "/admin/attendance", color: "var(--color-warning)" },
    { title: "Notices", icon: <BookOpen size={32} />, path: "/admin/notices", color: "var(--color-accent)" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card title="Global Phase Selection">
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Select a phase to focus your workspace. All other modules will automatically filter their data based on this selection.
          </p>
          <div className="inline-form" style={{ maxWidth: '400px' }}>
            <div style={{ padding: '0.75rem', background: 'var(--color-primary-transparent)', borderRadius: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
               <Layers size={20} />
            </div>
            <select value={selectedPhase} onChange={handlePhaseChange} style={{ flex: 1 }}>
              <option value="">-- All Phases --</option>
              {phases.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--color-primary-transparent)', borderRadius: '12px', color: 'var(--color-primary)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>Active Courses (Selected Phase)</p>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{coursesCount}</h2>
            </div>
          </div>
        </Card>
      </div>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--color-text-secondary)' }}>Navigation Menu</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {menuItems.map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => navigate(item.path)}
            style={{
              background: 'var(--color-surface-dark)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = item.color;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            <div style={{ color: item.color, background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%' }}>
              {item.icon}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
