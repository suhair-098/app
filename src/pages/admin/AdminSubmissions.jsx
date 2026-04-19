import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import { Download, ExternalLink } from 'lucide-react';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('submissions')
      .select('*, courses(name), users(name)');
    
    if (data) setSubmissions(data);
    setLoading(false);
  };

  if (loading) return <div>Loading submissions...</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Received Submissions</h1>
      
      <Card>
        <ul className="item-list">
          {submissions.map((sub) => (
            <li key={sub.id} className="list-item complex">
              <div>
                <strong>Student: {sub.users?.name || 'Student'}</strong>
                <span className="badge">{sub.courses?.name || 'Course'}</span>
                <p className="desc">Type: {sub.type.toUpperCase()}</p>
              </div>
              
              {sub.type === 'link' ? (
                <a href={sub.file_url} target="_blank" rel="noreferrer" className="btn-small">
                  <ExternalLink size={16}/> View Link
                </a>
              ) : (
                <a href={sub.file_url} target="_blank" rel="noreferrer" className="btn-small">
                  <Download size={16}/> Download {sub.type.toUpperCase()}
                </a>
              )}
            </li>
          ))}
          {submissions.length === 0 && <p className="empty-text">No submissions received yet.</p>}
        </ul>
      </Card>
    </div>
  );
}
