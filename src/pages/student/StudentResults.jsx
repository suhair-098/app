import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const handlePhaseChange = () => fetchData();
    window.addEventListener('phaseChanged', handlePhaseChange);
    return () => window.removeEventListener('phaseChanged', handlePhaseChange);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const selectedPhase = localStorage.getItem('selectedPhaseId');
      
      let query = supabase
        .from('results')
        .select('*, courses(name, phases(name), phase_id)');
        
      const { data: resData, error: resError } = await query;
        
      if (resError) {
        console.error("Error fetching results:", resError);
        alert("DB Error in results: " + resError.message);
      } else if (resData) {
        let finalRes = resData;
        if (selectedPhase) {
           finalRes = resData.filter(r => r.courses?.phase_id == selectedPhase);
        }
        setResults(finalRes);
      }
      
      // Fetch attendance
      const { data: attData, error: attError } = await supabase
        .from('attendance')
        .select('*');
      if (attError) console.error("Error fetching attendance:", attError);
      if (attData) setAttendance(attData);
    } catch (err) {
      console.error("Exception in fetchResults:", err);
      alert("App crashed while loading results: " + err.message);
    } finally {
      setLoading(false);
    }
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
    
    const tableData = phaseResults.map(res => {
      const courseAtts = attendance.filter(a => a.course_id === res.course_id);
      const ttClasses = courseAtts.reduce((acc, curr) => acc + curr.total_classes, 0);
      const atClasses = courseAtts.reduce((acc, curr) => acc + curr.attended_classes, 0);
      const attPct = ttClasses > 0 ? Math.round((atClasses / ttClasses) * 100) + '%' : 'N/A';
      
      return [
        res.courses?.name || 'Unknown Course',
        String(res.marks || 0),
        res.grade || 'N/A',
        attPct
      ];
    });

    autoTable(doc, {
      startY: 90,
      head: [['Course Name', 'Marks', 'Grade', 'Attendance']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] }, // Primary color
      styles: { fontSize: 11, cellPadding: 4 },
      margin: { top: 90 }
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    // Notes block (check if admin added note to any result in this phase)
    const adminNotes = phaseResults.map(r => r.admin_note).filter(Boolean);
    if (adminNotes.length > 0) {
      doc.setFontSize(12);
      doc.text("Notes:", 20, finalY);
      finalY += 7;
      doc.setFontSize(10);
      
      const combinedNotes = adminNotes.join('\n');
      const splitNotes = doc.splitTextToSize(combinedNotes, 170);
      doc.text(splitNotes, 20, finalY);
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
