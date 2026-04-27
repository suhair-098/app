import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch results
    const { data: resData } = await supabase
      .from('results')
      .select('*, courses(name, phases(name))');
      
    if (resData) setResults(resData);
    
    // Fetch attendance
    const { data: attData } = await supabase
      .from('attendance')
      .select('*').catch(()=> ({ data: [] }));
    if (attData) setAttendance(attData);

    setLoading(false);
  };
  
  const handleNoteChange = (phaseName, val) => {
    setNotes(prev => ({...prev, [phaseName]: val}));
  };

  const exportPhasePDF = (phaseName, phaseResults) => {
    const doc = new jsPDF();
    
    // Headings
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(28);
    doc.text("ASAP", 105, 30, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("Additional Skill Acquisition Programme", 105, 45, { align: "center" });
    
    doc.setFontSize(14);
    doc.text(`Phase: ${phaseName}`, 105, 60, { align: "center" });
    doc.text("Results Certificate", 105, 70, { align: "center" });
    
    // Table Header
    doc.setFontSize(12);
    doc.text("Course Name", 20, 100);
    doc.text("Marks", 110, 100);
    doc.text("Grade", 140, 100);
    doc.text("Attendance", 170, 100);
    doc.line(20, 104, 190, 104);
    
    let y = 115;
    phaseResults.forEach((res) => {
      // Find matching attendance
      const courseAtts = attendance.filter(a => a.course_id === res.course_id);
      const ttClasses = courseAtts.reduce((acc, curr) => acc + curr.total_classes, 0);
      const atClasses = courseAtts.reduce((acc, curr) => acc + curr.attended_classes, 0);
      const attPct = ttClasses > 0 ? Math.round((atClasses / ttClasses) * 100) + '%' : 'N/A';

      doc.text(res.courses?.name || 'Unknown Course', 20, y);
      doc.text(String(res.marks || 0), 110, y);
      doc.text(res.grade || 'N/A', 140, y);
      doc.text(attPct, 170, y);
      y += 12;
    });
    
    // Notes block
    if (notes[phaseName] && notes[phaseName].trim() !== '') {
      y += 15;
      doc.setFontSize(12);
      doc.text("Notes:", 20, y);
      y += 7;
      doc.setFontSize(10);
      
      const splitNotes = doc.splitTextToSize(notes[phaseName], 170);
      doc.text(splitNotes, 20, y);
    }
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 280);
    
    doc.save(`ASAP_Results_${phaseName.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return <div>Loading results...</div>;

  const groupedByPhase = results.reduce((acc, result) => {
    const pName = result.courses?.phases?.name || 'Unknown Phase';
    if (!acc[pName]) acc[pName] = [];
    acc[pName].push(result);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">My Results</h1>
      
      <div className="admin-grid">
        {Object.entries(groupedByPhase).map(([phaseName, phaseResults]) => (
           <Card key={phaseName} title={phaseName}>
             <ul className="item-list">
               {phaseResults.map(res => {
                 const courseAtts = attendance.filter(a => a.course_id === res.course_id);
                 const ttClasses = courseAtts.reduce((acc, curr) => acc + curr.total_classes, 0);
                 const atClasses = courseAtts.reduce((acc, curr) => acc + curr.attended_classes, 0);
                 const attPct = ttClasses > 0 ? Math.round((atClasses / ttClasses) * 100) + '%' : 'N/A';
                 return (
                   <li key={res.id} className="list-item" style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--color-surface-dark-light)', borderRadius: '8px', marginBottom: '0.5rem', border: 'none'}}>
                     <span>{res.courses?.name}</span>
                     <span><strong>{res.grade}</strong> ({res.marks}) | Att: {attPct}</span>
                   </li>
                 )
               })}
             </ul>
             
             <div style={{marginTop: '1rem'}}>
               <textarea 
                 value={notes[phaseName] || ''}
                 onChange={(e) => handleNoteChange(phaseName, e.target.value)}
                 placeholder="Optional: Add a note to be appended to the PDF..."
                 style={{width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'var(--color-background-dark)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)'}}
                 rows={3}
               />
             </div>
             
             <button onClick={() => exportPhasePDF(phaseName, phaseResults)} className="btn-small" style={{marginTop: '1rem'}}>
               <Download size={16}/> Export Phase PDF
             </button>
           </Card>
        ))}
        {Object.keys(groupedByPhase).length === 0 && <p className="empty-text">No results published yet.</p>}
      </div>
    </div>
  );
}
