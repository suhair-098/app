import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import { Plus } from 'lucide-react';

export default function AdminAttendance() {
  const [courses, setCourses] = useState([]);
  const [records, setRecords] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [totalClasses, setTotalClasses] = useState('');
  const [attendedClasses, setAttendedClasses] = useState('');

  useEffect(() => {
    supabase.from('courses').select('id, name').then(({data}) => { if(data) setCourses(data); });
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    // Wait until schema allows course_id
    const { data, error } = await supabase.from('attendance').select('*, courses(name)');
    // Graceful fail if column doesnt exist yet before user runs SQL
    if (data) setRecords(data);
  };

  const handleLogAttendance = async (e) => {
    e.preventDefault();
    if (parseInt(attendedClasses) > parseInt(totalClasses)) {
       alert("Attended classes cannot comfortably exceed total classes!");
       return;
    }

    // Single student architecture: Attempt to find student ID
    let studentId = null;
    const { data: userData } = await supabase.from('users').select('id').eq('role', 'student').limit(1);
    if (userData && userData.length > 0) {
      studentId = userData[0].id;
    }

    const { error } = await supabase.from('attendance').insert([{
      course_id: selectedCourse,
      total_classes: parseInt(totalClasses),
      attended_classes: parseInt(attendedClasses),
      user_id: studentId
    }]);

    if (!error) {
       setTotalClasses('');
       setAttendedClasses('');
       fetchRecords();
    } else {
       alert(`Error: ${error.message} (Did you run the ALTER TABLE SQL command?)`);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Course-Wise Attendance</h1>
      
      <div className="admin-grid">
        <Card title="Upload Attendance Segment">
          <form onSubmit={handleLogAttendance} className="stacked-form">
            <label>Select Course</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required>
               <option value="">-- Choose Course --</option>
               {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            
            <label>Total Classes Conducted</label>
            <input type="number" value={totalClasses} onChange={e => setTotalClasses(e.target.value)} min="1" required />
            
            <label>Classes Attended by Student</label>
            <input type="number" value={attendedClasses} onChange={e => setAttendedClasses(e.target.value)} min="0" required />
            
            <button type="submit" className="btn-small"><Plus size={16}/> Record Attendance Block</button>
          </form>
        </Card>
        
        <Card title="Attendance History (Raw)">
          <ul className="item-list">
             {records.map(rec => (
               <li key={rec.id} className="list-item complex">
                 <div>
                   <strong>{rec.courses?.name || 'Unknown Course'}</strong>
                   <span className="badge">
                      {Math.round((rec.attended_classes / rec.total_classes) * 100)}%
                   </span>
                   <p className="desc">{rec.attended_classes} / {rec.total_classes} classes</p>
                 </div>
               </li>
             ))}
             {records.length === 0 && <p className="empty-text">No attendance logs.</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
