import fs from 'fs';

const path = 'src/components/PrincipalDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// remove states
content = content.replace(/const \[adminSchoolLogo, setAdminSchoolLogo\] = useState\(\"\"\);\n/g, '');
content = content.replace(/const \[adminUrduLogo, setAdminUrduLogo\] = useState\(\"\"\);\n/g, '');

// remove useEffect localStorage
content = content.replace(/  useEffect\(\(\) => \{\n    const sLogo = localStorage.getItem\(\"m_logo\"\);\n    if \(sLogo\) setAdminSchoolLogo\(sLogo\);\n    const uLogo = localStorage.getItem\(\"m_urdu_logo\"\);\n    if \(uLogo\) setAdminUrduLogo\(uLogo\);\n  \}, \[\]\);\n/g, '');

// map usage
content = content.replace(/adminSchoolLogo/g, 'schoolConfig.printLogoUrl');
content = content.replace(/adminUrduLogo/g, 'schoolConfig.printUrduLogoUrl');

fs.writeFileSync(path, content, 'utf8');
console.log('Done replacing principal dashboard');
