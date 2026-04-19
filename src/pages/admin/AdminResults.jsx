import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import { Plus } from 'lucide-react';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [marks, setMarks] = useState('');
  const [grade, setGrade] = useState('');

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
       alert(`Error: ${error.message} (Check RLS or Foreign Key constraints)`);
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
                 <div>
                   <strong>{res.courses?.name}</strong>
                   <span className="badge">{res.grade}</span>
                   <p className="desc">Marks: {res.marks}</p>
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
