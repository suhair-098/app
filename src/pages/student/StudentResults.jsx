import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import BackButton from '../../components/BackButton';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [phaseNotes, setPhaseNotes] = useState({});
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

      // Fetch phase notes
      const { data: notesData } = await supabase.from('notices').select('title, content').like('title', 'PHASE_NOTE|%');
      if (notesData) {
        const notesMap = {};
        notesData.forEach(n => {
           const phaseId = n.title.split('|')[1];
           notesMap[phaseId] = n.content;
        });
        setPhaseNotes(notesMap);
      }
      
    } catch (err) {
      console.error("Exception in fetchResults:", err);
      alert("App crashed while loading results: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportPhasePDF = (phaseName, phaseResults, phaseId) => {
    const doc = new jsPDF();
    
    // Header Background
    doc.setFillColor(139, 92, 246); // Primary Purple
    doc.rect(0, 0, 210, 50, 'F');
    
    // Headings
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("ASAP", 105, 22, { align: "center" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Additional Skill Acquisition Programme", 105, 32, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Results Certificate: ${phaseName}`, 105, 42, { align: "center" });
    
    doc.setTextColor(0, 0, 0); // Reset text color to black for body
    
    const tableData = phaseResults.map(res => {
      const courseAtts = attendance.filter(a => a.course_id === res.course_id);
      const ttClasses = courseAtts.reduce((acc, curr) => acc + curr.total_classes, 0);
      const atClasses = courseAtts.reduce((acc, curr) => acc + curr.attended_classes, 0);
      const attPct = ttClasses > 0 ? Math.round((atClasses / ttClasses) * 100) + '%' : 'N/A';
      
      return [
        res.courses?.name || 'Unknown Course',
        res.grade || 'N/A',
        attPct,
        String(res.marks || 0)
      ];
    });

    autoTable(doc, {
      startY: 60,
      head: [['Course Name', 'Grade', 'Attendance', 'Marks']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] }, // Primary color
      styles: { fontSize: 11, cellPadding: 6 },
      margin: { top: 60 }
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    // Phase Note block
    const note = phaseNotes[phaseId];
    if (note) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Admin Remarks:", 20, finalY);
      finalY += 7;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      const splitNotes = doc.splitTextToSize(note, 170);
      doc.text(splitNotes, 20, finalY);
    }
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 280);
    
    doc.save(`ASAP_Results_${phaseName.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading results...</div>;

  const groupedByPhase = results.reduce((acc, result) => {
    const pName = result.courses?.phases?.name || 'Unknown Phase';
    const pId = result.courses?.phase_id;
    if (!acc[pName]) acc[pName] = { id: pId, results: [] };
    acc[pName].results.push(result);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <BackButton />
      <h1 className="page-title">My Results</h1>
      
      <div className="admin-grid" style={{ gridTemplateColumns: '1fr' }}>
        {Object.entries(groupedByPhase).map(([phaseName, phaseData]) => (
           <Card key={phaseName} title={phaseName}>
             
             <div style={{ overflowX: 'auto', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                 <thead>
                   <tr style={{ background: 'var(--color-primary-transparent)', borderBottom: '1px solid var(--color-border)' }}>
                     <th style={{ padding: '1rem' }}>Course Name</th>
                     <th style={{ padding: '1rem' }}>Grade</th>
                     <th style={{ padding: '1rem' }}>Attendance</th>
                     <th style={{ padding: '1rem' }}>Marks</th>
                   </tr>
                 </thead>
                 <tbody>
                   {phaseData.results.map((res, index) => {
                     const courseAtts = attendance.filter(a => a.course_id === res.course_id);
                     const ttClasses = courseAtts.reduce((acc, curr) => acc + curr.total_classes, 0);
                     const atClasses = courseAtts.reduce((acc, curr) => acc + curr.attended_classes, 0);
                     const attPct = ttClasses > 0 ? Math.round((atClasses / ttClasses) * 100) + '%' : 'N/A';
                     return (
                       <tr key={res.id} style={{ borderBottom: index === phaseData.results.length - 1 ? 'none' : '1px solid var(--color-border)' }}>
                         <td style={{ padding: '1rem' }}>{res.courses?.name}</td>
                         <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--color-primary-light)' }}>{res.grade}</td>
                         <td style={{ padding: '1rem' }}>{attPct}</td>
                         <td style={{ padding: '1rem' }}>{res.marks}</td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
             
             {phaseNotes[phaseData.id] && (
               <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
                 <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Remarks</h4>
                 <p style={{ margin: 0 }}>{phaseNotes[phaseData.id]}</p>
               </div>
             )}
             
             <button onClick={() => exportPhasePDF(phaseName, phaseData.results, phaseData.id)} className="btn-small">
               <Download size={16}/> Download PDF
             </button>
           </Card>
        ))}
        {Object.keys(groupedByPhase).length === 0 && <p className="empty-text">No results published yet.</p>}
      </div>
    </div>
  );
}
