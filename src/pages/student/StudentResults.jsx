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
      .select('*, courses(name, phases(name))');
      
    if (data) setResults(data);
    setLoading(false);
  };

  const exportPhasePDF = (phaseName, phaseResults) => {
    const doc = new jsPDF();
    
    // Watermark
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(100);
    doc.text("ASAP", 105, 160, { angle: 45, align: "center", opacity: 0.1 });
    
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
    doc.text("Marks Obtained", 130, 100);
    doc.text("Grade", 170, 100);
    doc.line(20, 104, 190, 104);
    
    let y = 115;
    phaseResults.forEach((res) => {
      doc.text(res.courses?.name || 'Unknown Course', 20, y);
      doc.text(String(res.marks || 0), 130, y);
      doc.text(res.grade || 'N/A', 170, y);
      y += 12;
    });
    
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
               {phaseResults.map(res => (
                 <li key={res.id} className="list-item" style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--color-surface-dark-light)', borderRadius: '8px', marginBottom: '0.5rem', border: 'none'}}>
                   <span>{res.courses?.name}</span>
                   <span><strong>{res.grade}</strong> ({res.marks})</span>
                 </li>
               ))}
             </ul>
             
             <button onClick={() => exportPhasePDF(phaseName, phaseResults)} className="btn-small" style={{marginTop: '1.5rem'}}>
               <Download size={16}/> Export Phase PDF
             </button>
           </Card>
        ))}
        {Object.keys(groupedByPhase).length === 0 && <p className="empty-text">No results published yet.</p>}
      </div>
    </div>
  );
}
