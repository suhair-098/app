import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Users, BookOpen, Layers } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function AdminDashboard() {
  const [coursesCount, setCoursesCount] = useState('Loading...');
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(localStorage.getItem('selectedPhaseId') || '');

  useEffect(() => {
    async function fetchData() {
      try {
        const { count: cCount, error: cErr } = await supabase.from('courses').select('*', { count: 'exact', head: true });
        if (cCount !== null) setCoursesCount(cCount);

        const { data: phasesData } = await supabase.from('phases').select('*');
        if (phasesData) setPhases(phasesData);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }
    fetchData();
  }, []);

  const handlePhaseChange = (e) => {
    const val = e.target.value;
    setSelectedPhase(val);
    if (val) {
      localStorage.setItem('selectedPhaseId', val);
    } else {
      localStorage.removeItem('selectedPhaseId');
    }
    // Optionally trigger a custom event if we want other mounted components to know
    window.dispatchEvent(new Event('phaseChanged'));
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 'bold' }}>Welcome, Admin</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card title="Global Phase Selection">
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Select a phase to focus your workspace. Other tabs (Courses, Attendance, Results) will filter data based on this selection.
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
              <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>Total Active Courses</p>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{coursesCount}</h2>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <Card title="Quick Actions">
          <p style={{ color: 'var(--color-text-secondary)' }}>You will manage phases, courses, upload results, and review submissions from the top navigation menu.</p>
        </Card>
      </div>
    </div>
  );
}
