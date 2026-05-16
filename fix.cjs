const fs = require('fs');
const files = [
    'src/pages/admin/AdminAttendance.jsx',
    'src/pages/admin/CoursePhaseManager.jsx',
    'src/pages/admin/AdminNotices.jsx',
    'src/pages/admin/AdminSubmissions.jsx',
    'src/pages/student/StudentCourses.jsx',
    'src/pages/student/StudentNotices.jsx',
    'src/pages/student/StudentSubmissions.jsx'
];
files.forEach(p => {
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    if (!content.includes('import BackButton')) {
        content = content.replace('import { supabase }', "import BackButton from '../../components/BackButton';\nimport { supabase }");
    }
    if (!content.includes('<BackButton />')) {
        content = content.replace('<div className="animate-fade-in">', '<div className="animate-fade-in">\n      <BackButton />');
    }
    fs.writeFileSync(p, content);
});
