import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (data) setNotices(data);
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    const { error } = await supabase.from('notices').insert([{ title, content, image_url: imageUrl }]);
    if (!error) {
      setTitle('');
      setContent('');
      setImageUrl('');
      fetchNotices();
    } else {
      alert("Error posting notice: Ensure 'image_url' column exists in 'notices' table. " + error.message);
    }
  };

  const handleDelete = async (id) => {
    await supabase.from('notices').delete().eq('id', id);
    fetchNotices();
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Notice Board Management</h1>
      
      <div className="admin-grid">
        <section>
          <Card title="Publish New Notice">
            <form onSubmit={handlePostNotice} className="stacked-form">
              <label>Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
              
              <label>Content</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows="4" required />
              
              <label>Image URL (Optional)</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
              
              <button type="submit" className="btn-small"><Plus size={16}/> Post Notice</button>
            </form>
          </Card>
        </section>

        <section>
          <Card title="Recent Notices">
            <ul className="item-list">
              {notices.map(notice => (
                <li key={notice.id} className="list-item complex" style={{alignItems: 'flex-start'}}>
                  <div style={{flex: 1}}>
                    <strong>{notice.title}</strong>
                    <p className="desc">{notice.content}</p>
                    {notice.image_url && (
                      <div style={{marginTop: '0.5rem'}}>
                        <img src={notice.image_url} alt="Notice attachment" style={{maxWidth: '100%', borderRadius: '8px', maxHeight: '150px', objectFit: 'cover'}} />
                      </div>
                    )}
                    <small style={{color: 'var(--color-primary-light)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block'}}>
                       {new Date(notice.created_at).toLocaleString()}
                    </small>
                  </div>
                  <button onClick={() => handleDelete(notice.id)} className="btn-icon danger"><Trash2 size={16}/></button>
                </li>
              ))}
              {notices.length === 0 && <p className="empty-text">No notices posted.</p>}
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
