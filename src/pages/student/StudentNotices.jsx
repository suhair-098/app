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
    if (data) {
       setNotices(data.filter(n => !n.title.startsWith('PHASE_NOTE|')));
    }
    if (error) console.error("Error fetching notices:", error);
    setLoading(false);
  };

  const parseContent = (rawContent) => {
    const match = rawContent.match(/\[IMG:(.*?)\]/);
    if (match) {
      return {
        text: rawContent.replace(match[0], '').trim(),
        img: match[1]
      };
    }
    return { text: rawContent, img: null };
  };

  return (
    <div className="animate-fade-in">
      <BackButton />
      <h1 className="page-title">Notice Board</h1>
      
      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {loading ? (
          <p>Loading notices...</p>
        ) : notices.length > 0 ? (
          notices.map(notice => {
            const { text, img } = parseContent(notice.content);
            return (
              <Card key={notice.id} title={notice.title}>
                {img && (
                  <div style={{ margin: '-1.5rem -1.5rem 1rem -1.5rem', overflow: 'hidden', borderBottom: '1px solid var(--color-border)' }}>
                    <img 
                      src={img} 
                      alt={notice.title} 
                      style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {text}
                </p>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Posted on {new Date(notice.created_at).toLocaleString()}
                </div>
              </Card>
            );
          })
        ) : (
          <p className="empty-text">No active notices.</p>
        )}
      </div>
    </div>
  );
}
