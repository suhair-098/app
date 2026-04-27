import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import { Layers, Plus, Trash2 } from 'lucide-react';
import './AdminStyles.css';

export default function CoursePhaseManager() {
  const [phases, setPhases] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Forms state
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [selectedPhaseId, setSelectedPhaseId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [phasesData, coursesData] = await Promise.all([
      supabase.from('phases').select('*').order('name'),
      supabase.from('courses').select('*, phases(name)').order('name')
    ]);
    
    if (phasesData.data) setPhases(phasesData.data);
    if (coursesData.data) setCourses(coursesData.data);
    setLoading(false);
  };

  const handleAddPhase = async (e) => {
    e.preventDefault();
    if (!newPhaseName) return;
    
    const { data, error } = await supabase.from('phases').insert([{ name: newPhaseName }]).select();
    if (error) {
      alert("Database error: " + error.message);
      return;
    }
    if (data) {
      setPhases([...phases, data[0]]);
      setNewPhaseName('');
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName || !selectedPhaseId) return;
    
    const { data, error } = await supabase.from('courses').insert([{
      name: newCourseName,
      description: newCourseDesc,
      phase_id: selectedPhaseId
    }]).select('*, phases(name)');
    
    if (error) {
      alert("Database error: " + error.message);
      return;
    }
    if (data) {
      setCourses([...courses, data[0]]);
      setNewCourseName('');
      setNewCourseDesc('');
    }
  };

  const handleDeletePhase = async (id) => {
    await supabase.from('phases').delete().eq('id', id);
    setPhases(phases.filter(p => p.id !== id));
    setCourses(courses.filter(c => c.phase_id !== id));
  };

  const handleDeleteCourse = async (id) => {
    await supabase.from('courses').delete().eq('id', id);
    setCourses(courses.filter(c => c.id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Manage Courses & Phases</h1>
      
      <div className="admin-grid">
        {/* Phases Column */}
        <section>
          <Card title="Phases">
            <form onSubmit={handleAddPhase} className="inline-form">
              <input 
                type="text" 
                placeholder="Phase Name (e.g. Phase 1)" 
                value={newPhaseName}
                onChange={e => setNewPhaseName(e.target.value)}
                required
              />
              <button type="submit" className="btn-small"><Plus size={16}/> Add</button>
            </form>
            
            <ul className="item-list">
              {phases.map(phase => (
                <li key={phase.id} className="list-item">
                  <span>{phase.name}</span>
                  <button onClick={() => handleDeletePhase(phase.id)} className="btn-icon danger"><Trash2 size={16}/></button>
                </li>
              ))}
              {phases.length === 0 && <p className="empty-text">No phases found.</p>}
            </ul>
          </Card>
        </section>

        {/* Courses Column */}
        <section>
          <Card title="Courses">
            <form onSubmit={handleAddCourse} className="stacked-form">
              <select 
                value={selectedPhaseId} 
                onChange={e => setSelectedPhaseId(e.target.value)}
                required
              >
                <option value="">-- Select Phase --</option>
                {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input 
                type="text" 
                placeholder="Course Name" 
                value={newCourseName}
                onChange={e => setNewCourseName(e.target.value)}
                required
              />
              <textarea 
                placeholder="Course Description" 
                value={newCourseDesc}
                onChange={e => setNewCourseDesc(e.target.value)}
                rows="3"
              />
              <button type="submit" className="btn-small"><Plus size={16}/> Add Course</button>
            </form>
            
            <ul className="item-list">
              {courses.map(course => (
                <li key={course.id} className="list-item complex">
                  <div>
                    <strong>{course.name}</strong>
                    <span className="badge">{course.phases?.name}</span>
                    <p className="desc">{course.description}</p>
                  </div>
                  <button onClick={() => handleDeleteCourse(course.id)} className="btn-icon danger"><Trash2 size={16}/></button>
                </li>
              ))}
              {courses.length === 0 && <p className="empty-text">No courses found.</p>}
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
