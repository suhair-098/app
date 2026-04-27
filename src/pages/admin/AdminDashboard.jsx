import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Users, BookOpen, Clock } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function AdminDashboard() {
  const [coursesCount, setCoursesCount] = useState('Loading...');
  const [submissionsCount, setSubmissionsCount] = useState('Loading...');

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: cCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
        if (cCount !== null) setCoursesCount(cCount);
        
        const { count: sCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        if (sCount !== null) setSubmissionsCount(sCount);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Welcome, Admin</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--color-primary-transparent)', borderRadius: '12px', color: 'var(--color-primary)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>Active Courses</p>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{coursesCount}</h2>
            </div>
          </div>
        </Card>
        
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--color-primary-transparent)', borderRadius: '12px', color: 'var(--color-secondary)' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>Pending Submissions</p>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{submissionsCount}</h2>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <Card title="Quick Actions">
          <p style={{ color: 'var(--color-text-secondary)' }}>You will manage phases, courses, upload results, and review submissions from the side navigation menu.</p>
        </Card>
      </div>
    </div>
  );
}
