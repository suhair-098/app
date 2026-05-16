import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';

export default function StudentNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (data) setNotices(data);
    if (error) console.error("Error fetching notices:", error);
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Notice Board</h1>
      
      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {loading ? (
          <p>Loading notices...</p>
        ) : notices.length > 0 ? (
          notices.map(notice => (
            <Card key={notice.id} title={notice.title}>
              {notice.image_url && (
                <div style={{ margin: '-1.5rem -1.5rem 1rem -1.5rem', overflow: 'hidden', borderBottom: '1px solid var(--color-border)' }}>
                  <img 
                    src={notice.image_url} 
                    alt={notice.title} 
                    style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {notice.content}
              </p>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Posted on {new Date(notice.created_at).toLocaleString()}
              </div>
            </Card>
          ))
        ) : (
          <p className="empty-text">No active notices.</p>
        )}
      </div>
    </div>
  );
}
