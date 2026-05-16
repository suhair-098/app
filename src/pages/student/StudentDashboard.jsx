import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import CircularProgress from '../../components/CircularProgress';
import { Layers, BookOpen, UploadCloud, FileText } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function StudentDashboard() {
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendedClasses, setAttendedClasses] = useState(0);
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(localStorage.getItem('selectedPhaseId') || '');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [selectedPhase]);

  const fetchData = async () => {
    const { data: phasesData } = await supabase.from('phases').select('*');
    if (phasesData) setPhases(phasesData);

    let query = supabase.from('attendance').select('total_classes, attended_classes, courses(phase_id)');
    
    const { data: attData } = await query;
    if (attData && attData.length > 0) {
      // Filter in memory if selectedPhase exists since inner join filtering might be complex
      const filteredAtt = selectedPhase 
        ? attData.filter(a => a.courses?.phase_id == selectedPhase)
        : attData;

      const overallTotal = filteredAtt.reduce((acc, curr) => acc + curr.total_classes, 0);
      const overallAttended = filteredAtt.reduce((acc, curr) => acc + curr.attended_classes, 0);
      
      setTotalClasses(overallTotal);
      setAttendedClasses(overallAttended);
      if (overallTotal > 0) {
        setAttendancePercentage(Math.round((overallAttended / overallTotal) * 100));
      } else {
        setAttendancePercentage(0);
      }
    } else {
      setTotalClasses(0);
      setAttendedClasses(0);
      setAttendancePercentage(0);
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
    { title: "My Courses", icon: <BookOpen size={32} />, path: "/student/courses", color: "var(--color-primary)" },
    { title: "Submissions", icon: <UploadCloud size={32} />, path: "/student/submissions", color: "var(--color-secondary)" },
    { title: "Results", icon: <FileText size={32} />, path: "/student/results", color: "var(--color-success)" },
    { title: "Notice Board", icon: <BookOpen size={32} />, path: "/student/notices", color: "var(--color-accent)" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 'bold' }}>Student Dashboard</h1>
      
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--color-text-secondary)' }}>Navigation Menu</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
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
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card title="Global Phase Selection">
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Select a phase to view its specific courses, results, and attendance.
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <Card title="Attendance" className="attendance-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '1rem 0' }}>
            <CircularProgress percentage={attendancePercentage} color="var(--color-accent)" />
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{attendedClasses} <span style={{fontSize: '1.25rem', color: 'var(--color-text-muted)'}}>/ {totalClasses}</span></div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Total Attended</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
