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
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    supabase.from('courses').select('*').then(({data}) => { if(data) setCourses(data); });
    fetchResults();
    
    // Listen for phase changes
    const handlePhaseChange = () => fetchResults();
    window.addEventListener('phaseChanged', handlePhaseChange);
    return () => window.removeEventListener('phaseChanged', handlePhaseChange);
  }, []);

  const fetchResults = async () => {
    const selectedPhase = localStorage.getItem('selectedPhaseId');
    let query = supabase.from('results').select('*, courses(name, phase_id)');
    
    const { data } = await query;
    if (data) {
      let finalData = data;
      if (selectedPhase) {
        finalData = data.filter(r => r.courses?.phase_id == selectedPhase);
      }
      setResults(finalData);
    }
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
    setEditNote(res.admin_note || '');
  };

  const handleSaveEdit = async (id) => {
    const { error } = await supabase.from('results').update({
      marks: parseInt(editMarks),
      grade: editGrade,
      admin_note: editNote
    }).eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchResults();
    } else {
      alert("Error updating result. Make sure 'admin_note' column exists in 'results' table.");
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
               {courses
                 .filter(c => {
                   const sp = localStorage.getItem('selectedPhaseId');
                   return sp ? c.phase_id == sp : true;
                 })
                 .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
               }
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
               <li key={res.id} className="list-item complex" style={{flexDirection: 'column', alignItems: 'stretch'}}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                   <div style={{ flex: 1 }}>
                     <strong>{res.courses?.name}</strong>
                     {editingId === res.id ? (
                       <div className="inline-form" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
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
                 </div>
                 
                 {/* Admin Notes Section */}
                 {editingId === res.id ? (
                    <textarea 
                      value={editNote} 
                      onChange={e => setEditNote(e.target.value)} 
                      placeholder="Add a note to be appended to the student's Phase PDF..."
                      style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem', borderRadius: '4px' }}
                      rows={2}
                    />
                 ) : (
                    res.admin_note && (
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        <strong>Note:</strong> {res.admin_note}
                      </div>
                    )
                 )}
               </li>
             ))}
             {results.length === 0 && <p className="empty-text">No results found for this phase.</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
