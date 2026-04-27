import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import CircularProgress from '../../components/CircularProgress';
import { supabase } from '../../supabaseClient';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Fetch courses with phase info attached
      const { data, error } = await supabase
        .from('courses')
        .select('*, phases(name)')
        .order('phase_id');
        
      if (error) {
        console.error("Supabase Error fetchCourses:", error);
        alert("Database error loading courses: " + error.message);
      } else if (data) {
        setCourses(data);
      }

      // Fetch attendance blocks
      const { data: attData, error: attError } = await supabase.from('attendance').select('*');
      if (attError) console.error("Attendance Error:", attError);
      if (attData) setAttendanceData(attData);

    } catch (err) {
      console.error("Exception in fetchCourses:", err);
      alert("App crashed while loading: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading your syllabus...</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">My Courses & Syllabus</h1>
      
      <div className="admin-grid">
       {courses.map(course => {
           // Aggregate attendance for this specific course
           const courseAtts = attendanceData.filter(a => a.course_id === course.id);
           const totalClasses = courseAtts.reduce((acc, curr) => acc + curr.total_classes, 0);
           const attendedClasses = courseAtts.reduce((acc, curr) => acc + curr.attended_classes, 0);
           const pct = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
           
           return (
             <Card key={course.id} title={course.name}>
               <span className="badge" style={{marginBottom: '1rem', marginLeft: 0}}>{course.phases?.name}</span>
               <h4 style={{marginTop: '1rem', color: 'var(--color-text-secondary)'}}>Syllabus Description:</h4>
               <p>{course.description || "No description provided."}</p>
               
               <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-surface-dark-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                 <div style={{flex: 1}}>
                   <h4>Attendance for {course.name}</h4>
                   {totalClasses > 0 && <small style={{display: 'block', marginTop: '0.5rem', color: 'var(--color-text-muted)'}}>{attendedClasses} / {totalClasses} classes</small>}
                 </div>
                 <div style={{ minWidth: '80px', minHeight: '80px', opacity: totalClasses === 0 ? 0.3 : 1 }}>
                   <CircularProgress percentage={pct} size={80} strokeWidth={8} color="var(--color-accent)" />
                 </div>
               </div>
             </Card>
           );
        })}
        {courses.length === 0 && <p className="empty-text">No courses assigned yet.</p>}
      </div>
    </div>
  );
}
