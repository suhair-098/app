import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import CircularProgress from '../../components/CircularProgress';
import { supabase } from '../../supabaseClient';

export default function StudentDashboard() {
  const [notices, setNotices] = useState([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendedClasses, setAttendedClasses] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch notices
    const { data: noticeData } = await supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(5);
    if (noticeData) setNotices(noticeData);

    // Fetch aggregate attendance
    const { data: attData } = await supabase.from('attendance').select('total_classes, attended_classes');
    if (attData && attData.length > 0) {
      const overallTotal = attData.reduce((acc, curr) => acc + curr.total_classes, 0);
      const overallAttended = attData.reduce((acc, curr) => acc + curr.attended_classes, 0);
      
      setTotalClasses(overallTotal);
      setAttendedClasses(overallAttended);
      if (overallTotal > 0) {
        setAttendancePercentage(Math.round((overallAttended / overallTotal) * 100));
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Student Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <Card title="Attendance" className="attendance-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '1rem 0' }}>
            <CircularProgress percentage={attendancePercentage} color="var(--color-accent-light)" />
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{attendedClasses} <span style={{fontSize: '1.25rem', color: 'var(--color-text-muted)'}}>/ {totalClasses}</span></div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Total Attended</div>
            </div>
          </div>
        </Card>

        <Card title="Notice Board">
          <div style={{ padding: '1rem 0' }}>
            <ul className="item-list">
              {notices.map(notice => (
                <li key={notice.id} className="list-item" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                  <strong style={{color: 'var(--color-primary-light)'}}>{notice.title}</strong>
                  <p className="desc">{notice.content}</p>
                </li>
              ))}
              {notices.length === 0 && <p className="empty-text">No active notices.</p>}
            </ul>
          </div>
        </Card>
        
      </div>
    </div>
  );
}
