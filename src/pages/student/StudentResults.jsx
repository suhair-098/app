import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('results')
      .select('*, courses(name)');
      
    if (data) setResults(data);
    setLoading(false);
  };

  const exportToPDF = (result) => {
    const doc = new jsPDF();
    
    // Watermark
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(80);
    doc.text("ASAP", 40, 150, { angle: 45, opacity: 0.1 });
    
    // Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.text("ASAP Result Certificate", 20, 30);
    
    doc.setFontSize(14);
    doc.text(`Student: Student Name (Mock)`, 20, 50);
    doc.text(`Course: ${result.courses?.name || 'Unknown Course'}`, 20, 60);
    doc.text(`Marks Obtained: ${result.marks}`, 20, 70);
    doc.text(`Final Grade: ${result.grade}`, 20, 80);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 270);
    
    doc.save(`ASAP_Result_${result.courses?.name || 'course'}.pdf`);
  };

  if (loading) return <div>Loading results...</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">My Results</h1>
      
      <div className="admin-grid">
        {results.map(res => (
           <Card key={res.id}>
             <h3 style={{marginTop: 0, color: 'var(--color-primary-light)'}}>{res.courses?.name}</h3>
             
             <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-surface-dark-light)', borderRadius: '8px', margin: '1rem 0'}}>
               <div>
                 <span style={{color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block'}}>Marks</span>
                 <strong>{res.marks}</strong>
               </div>
               <div style={{textAlign: 'right'}}>
                 <span style={{color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block'}}>Grade</span>
                 <strong style={{color: 'var(--color-accent)'}}>{res.grade}</strong>
               </div>
             </div>
             
             <button onClick={() => exportToPDF(res)} className="btn-small" style={{width: 'auto'}}>
               <Download size={16}/> Export PDF
             </button>
           </Card>
        ))}
        {results.length === 0 && <p className="empty-text">No results published yet.</p>}
      </div>
    </div>
  );
}
