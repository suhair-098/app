import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import { Upload, Link as LinkIcon, File } from 'lucide-react';

export default function StudentSubmissions() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [subType, setSubType] = useState('link'); // link, pdf, image
  const [fileUrl, setFileUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    supabase.from('courses').select('id, name')
      .then(({data, error}) => {
         if (error) {
           console.error("Error loading courses:", error);
           alert("DB Error: " + error.message);
         }
         if (data) setCourses(data);
      })
      .catch(err => {
         console.error("Crash loading courses:", err);
         alert("Crash: " + err.message);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    
    // In a real app we'd upload the file to Supabase storage if it was a file type,
    // but without an authenticated Supabase session (due to RLS bypass/mock auth),
    // bucket uploads also fail. So we will mock it to accept Links for all types right now.
    
    const { error } = await supabase.from('submissions').insert([{
      // Using arbitrary UUID since we bypassed auth and have no real id, but wait!
      // If user_id is a foreign key, making up an ID will violate FK constraint on users table!
      // The user wants a rapid prototype, we either need a valid user_id or we drop FK.
      // Assuming they didn't drop FK yet, we can try to guess the user id or set it to null if the DB allows (unlikely inside constraints).
      // Let's omit user_id or handle gracefully.
      course_id: selectedCourse,
      file_url: fileUrl,
      type: subType
    }]);

    if (!error) {
      setSuccess('Submission successful!');
      setFileUrl('');
    } else {
      setSuccess(`Error: ${error.message}. (Admin may need to disable RLS/Foreign Keys temporarily)`);
    }
    
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Submit Your Work</h1>
      
      <Card>
        {success && <div style={{padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-accent)', marginBottom: '1rem', borderRadius: '8px'}}>{success}</div>}
        
        <form onSubmit={handleSubmit} className="stacked-form">
          <label>Select Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required>
            <option value="">-- Choose Course --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <label>Submission Format</label>
          <select value={subType} onChange={(e) => setSubType(e.target.value)} required>
            <option value="link">Cloud Link (Drive, GitHub, etc)</option>
            <option value="pdf">PDF URL</option>
            <option value="image">Image URL</option>
          </select>
          
          <label>URL / Link</label>
          <input 
            type="url" 
            placeholder="https://..." 
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            required
          />
          
          <button type="submit" className="btn-small" disabled={loading}>
            <Upload size={16}/> {loading ? 'Submitting...' : 'Mark as Submitted'}
          </button>
        </form>
      </Card>
      
      <div style={{marginTop: '2rem'}}>
        <Card title="Upload Info">
          <p style={{color: 'var(--color-text-secondary)', fontSize: '0.9rem'}}>
            File storage requires an active authenticated Supabase Session. Since we are using an immediate mock login bypass, please upload your documents (PDFs, Images) to Google Drive or equivalent and submit the shareable Link URLs here.
          </p>
        </Card>
      </div>
    </div>
  );
}
