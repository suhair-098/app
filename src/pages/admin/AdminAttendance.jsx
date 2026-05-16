import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function AdminAttendance() {
  const [courses, setCourses] = useState([]);
  const [records, setRecords] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [totalClasses, setTotalClasses] = useState('');
  const [attendedClasses, setAttendedClasses] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTotalClasses, setEditTotalClasses] = useState('');
  const [editAttendedClasses, setEditAttendedClasses] = useState('');

  useEffect(() => {
    supabase.from('courses').select('id, name').then(({data}) => { if(data) setCourses(data); });
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase.from('attendance').select('*, courses(name)');
    if (data) setRecords(data);
  };

  const handleLogAttendance = async (e) => {
    e.preventDefault();
    if (parseInt(attendedClasses) > parseInt(totalClasses)) {
       alert("Attended classes cannot comfortably exceed total classes!");
       return;
    }

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
       alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      const { error } = await supabase.from('attendance').delete().eq('id', id);
      if (!error) {
        fetchRecords();
      } else {
        alert("Error deleting record: " + error.message);
      }
    }
  };

  const handleEditClick = (rec) => {
    setEditingId(rec.id);
    setEditTotalClasses(rec.total_classes);
    setEditAttendedClasses(rec.attended_classes);
  };

  const handleSaveEdit = async (id) => {
    if (parseInt(editAttendedClasses) > parseInt(editTotalClasses)) {
      alert("Attended classes cannot exceed total classes!");
      return;
    }
    const { error } = await supabase.from('attendance').update({
      total_classes: parseInt(editTotalClasses),
      attended_classes: parseInt(editAttendedClasses)
    }).eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchRecords();
    } else {
      alert("Error updating record: " + error.message);
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
                 <div style={{ flex: 1 }}>
                   <strong>{rec.courses?.name || 'Unknown Course'}</strong>
                   <span className="badge">
                      {Math.round((rec.attended_classes / rec.total_classes) * 100)}%
                   </span>
                   {editingId === rec.id ? (
                     <div className="inline-form" style={{ marginTop: '0.5rem' }}>
                       <input 
                         type="number" 
                         value={editAttendedClasses} 
                         onChange={e => setEditAttendedClasses(e.target.value)} 
                         min="0"
                         style={{ width: '80px', padding: '0.25rem' }} 
                       />
                       <span style={{ padding: '0.25rem' }}>/</span>
                       <input 
                         type="number" 
                         value={editTotalClasses} 
                         onChange={e => setEditTotalClasses(e.target.value)} 
                         min="1"
                         style={{ width: '80px', padding: '0.25rem' }} 
                       />
                     </div>
                   ) : (
                     <p className="desc">{rec.attended_classes} / {rec.total_classes} classes</p>
                   )}
                 </div>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {editingId === rec.id ? (
                     <>
                       <button onClick={() => handleSaveEdit(rec.id)} className="btn-icon" style={{ color: 'var(--color-success)' }} title="Save">
                         <Check size={18} />
                       </button>
                       <button onClick={() => setEditingId(null)} className="btn-icon" style={{ color: 'var(--color-error)' }} title="Cancel">
                         <X size={18} />
                       </button>
                     </>
                   ) : (
                     <>
                       <button onClick={() => handleEditClick(rec)} className="btn-icon" title="Edit">
                         <Edit2 size={18} />
                       </button>
                       <button onClick={() => handleDelete(rec.id)} className="btn-icon danger" title="Delete">
                         <Trash2 size={18} />
                       </button>
                     </>
                   )}
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
