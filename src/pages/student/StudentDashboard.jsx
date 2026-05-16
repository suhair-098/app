import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import CircularProgress from '../../components/CircularProgress';
import { Layers } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function StudentDashboard() {
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendedClasses, setAttendedClasses] = useState(0);
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(localStorage.getItem('selectedPhaseId') || '');

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

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 'bold' }}>Student Dashboard</h1>
      
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
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
