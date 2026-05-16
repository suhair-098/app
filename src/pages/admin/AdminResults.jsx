import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [marks, setMarks] = useState('');
  const [grade, setGrade] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editMarks, setEditMarks] = useState('');
  const [editGrade, setEditGrade] = useState('');

  useEffect(() => {
    supabase.from('courses').select('*').then(({data}) => { if(data) setCourses(data); });
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const { data } = await supabase.from('results').select('*, courses(name)');
    if (data) setResults(data);
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('results').insert([{
      course_id: selectedCourse,
      marks: parseInt(marks),
      grade: grade
    }]);

    if (!error) {
       setMarks('');
       setGrade('');
       fetchResults();
    } else {
       alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      const { error } = await supabase.from('results').delete().eq('id', id);
      if (!error) {
        fetchResults();
      } else {
        alert("Error deleting result: " + error.message);
      }
    }
  };

  const handleEditClick = (res) => {
    setEditingId(res.id);
    setEditMarks(res.marks);
    setEditGrade(res.grade);
  };

  const handleSaveEdit = async (id) => {
    const { error } = await supabase.from('results').update({
      marks: parseInt(editMarks),
      grade: editGrade
    }).eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchResults();
    } else {
      alert("Error updating result: " + error.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Results Management</h1>
      
      <div className="admin-grid">
        <Card title="Publish Result">
          <form onSubmit={handleAddResult} className="stacked-form">
            <label>Course</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required>
               <option value="">-- Select Course --</option>
               {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            
            <label>Marks</label>
            <input type="number" value={marks} onChange={e => setMarks(e.target.value)} required />
            
            <label>Grade (A, B, C, F)</label>
            <input type="text" value={grade} onChange={e => setGrade(e.target.value)} required />
            
            <button type="submit" className="btn-small"><Plus size={16}/> Upload Result</button>
          </form>
        </Card>
        
        <Card title="Published Results">
          <ul className="item-list">
             {results.map(res => (
               <li key={res.id} className="list-item complex">
                 <div style={{ flex: 1 }}>
                   <strong>{res.courses?.name}</strong>
                   {editingId === res.id ? (
                     <div className="inline-form" style={{ marginTop: '0.5rem' }}>
                       <input 
                         type="number" 
                         value={editMarks} 
                         onChange={e => setEditMarks(e.target.value)} 
                         style={{ width: '80px', padding: '0.25rem' }} 
                         placeholder="Marks"
                       />
                       <input 
                         type="text" 
                         value={editGrade} 
                         onChange={e => setEditGrade(e.target.value)} 
                         style={{ width: '60px', padding: '0.25rem' }} 
                         placeholder="Grade"
                       />
                     </div>
                   ) : (
                     <>
                       <span className="badge">{res.grade}</span>
                       <p className="desc">Marks: {res.marks}</p>
                     </>
                   )}
                 </div>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {editingId === res.id ? (
                     <>
                       <button onClick={() => handleSaveEdit(res.id)} className="btn-icon" style={{ color: 'var(--color-success)' }} title="Save">
                         <Check size={18} />
                       </button>
                       <button onClick={() => setEditingId(null)} className="btn-icon" style={{ color: 'var(--color-error)' }} title="Cancel">
                         <X size={18} />
                       </button>
                     </>
                   ) : (
                     <>
                       <button onClick={() => handleEditClick(res)} className="btn-icon" title="Edit">
                         <Edit2 size={18} />
                       </button>
                       <button onClick={() => handleDelete(res.id)} className="btn-icon danger" title="Delete">
                         <Trash2 size={18} />
                       </button>
                     </>
                   )}
                 </div>
               </li>
             ))}
             {results.length === 0 && <p className="empty-text">No results added.</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
