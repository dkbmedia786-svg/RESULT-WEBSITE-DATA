import fs from 'fs';

const path = 'src/components/PrincipalDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace remaining onload assignments with compressed versions
content = content.replace(/reader\.onload \= \(ev\) => \{\n\s+if \(ev\.target\?\.result\) \{\n\s+setNewGallery\(prev => \(\{ \.\.\.prev, url: ev\.target!\.result as string \}\)\);\n\s+\}\n\s+\};/g, 
`reader.onload = async (ev) => {
  if (ev.target?.result) {
    try {
      const compressed = await compressImageBase64(ev.target.result as string);
      setNewGallery(prev => ({ ...prev, url: compressed }));
    } catch {
      setNewGallery(prev => ({ ...prev, url: ev.target!.result as string }));
    }
  }
};`);

['heroBg1', 'heroBg2', 'heroBg3', 'fac1Img', 'fac2Img', 'fac3Img'].forEach(field => {
  const regex = new RegExp(`reader\\.onload \\= \\(ev\\) => \\{\\n\\s+if \\(ev\\.target\\?\\.result\\) \\{\\n\\s+setSchoolConfig\\(\\{ \\.\\.\\.schoolConfig, ${field}: ev\\.target\\.result as string \\}\\);\\n\\s+\\}\\n\\s+\\};`, 'g');
  content = content.replace(regex, 
`reader.onload = async (ev) => {
  if (ev.target?.result) {
    try {
      const compressed = await compressImageBase64(ev.target.result as string);
      setSchoolConfig({ ...schoolConfig, ${field}: compressed });
    } catch {
      setSchoolConfig({ ...schoolConfig, ${field}: ev.target.result as string });
    }
  }
};`);
});

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed extra photos!');
