import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import BackButton from '../../components/BackButton';
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
    // Filter out Phase Notes which start with PHASE_NOTE|
    if (data) {
       setNotices(data.filter(n => !n.title.startsWith('PHASE_NOTE|')));
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    let finalContent = content;
    if (imageUrl) {
       finalContent = `${content}\n\n[IMG:${imageUrl}]`;
    }

    const { error } = await supabase.from('notices').insert([{ title, content: finalContent }]);
    if (!error) {
      setTitle('');
      setContent('');
      setImageUrl('');
      fetchNotices();
    } else {
      alert("Error posting notice: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    await supabase.from('notices').delete().eq('id', id);
    fetchNotices();
  };

  const parseContent = (rawContent) => {
    if (!rawContent) return { text: '', img: null };
    const match = String(rawContent).match(/\[IMG:(.*?)\]/);
    if (match) {
      return {
        text: String(rawContent).replace(match[0], '').trim(),
        img: match[1]
      };
    }
    return { text: rawContent, img: null };
  };

  return (
    <div className="animate-fade-in">
      <BackButton />
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
              {notices.map(notice => {
                const { text, img } = parseContent(notice.content);
                return (
                  <li key={notice.id} className="list-item complex" style={{alignItems: 'flex-start'}}>
                    <div style={{flex: 1}}>
                      <strong>{notice.title}</strong>
                      <p className="desc">{text}</p>
                      {img && (
                        <div style={{marginTop: '0.5rem'}}>
                          <img src={img} alt="Notice attachment" style={{maxWidth: '100%', borderRadius: '8px', maxHeight: '150px', objectFit: 'cover'}} />
                        </div>
                      )}
                      <small style={{color: 'var(--color-primary-light)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block'}}>
                         {new Date(notice.created_at).toLocaleString()}
                      </small>
                    </div>
                    <button onClick={() => handleDelete(notice.id)} className="btn-icon danger"><Trash2 size={16}/></button>
                  </li>
                );
              })}
              {notices.length === 0 && <p className="empty-text">No notices posted.</p>}
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
