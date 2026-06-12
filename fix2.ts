import fs from 'fs';

const path = 'src/components/PrincipalDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/localStorage\.setItem\("m_logo", ev\.target\.result as string\);\n                            setAdminSchoolLogo\(ev\.target\.result as string\);/g, 'setSchoolConfig({ ...schoolConfig, printLogoUrl: ev.target.result as string });');

content = content.replace(/localStorage\.setItem\("m_urdu_logo", ev\.target\.result as string\);\n                            setAdminUrduLogo\(ev\.target\.result as string\);/g, 'setSchoolConfig({ ...schoolConfig, printUrduLogoUrl: ev.target.result as string });');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed uploads!');
