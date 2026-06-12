import fs from 'fs';

const path = 'src/components/PrincipalDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// The typical pattern is:
// reader.onload = (ev) => {
//   if (ev.target?.result) {
//     setXXX(... ev.target.result as string ... );
//   }
// };

content = content.replace(/reader\.onload \= \(ev\) => \{\n\s+if \(ev\.target\?\.result\) \{\n\s+setAdminPhoto\(ev\.target\.result as string\);\n\s+\}\n\s+\};/g, 
`reader.onload = async (ev) => {
  if (ev.target?.result) {
    try {
      const compressed = await compressImageBase64(ev.target.result as string);
      setAdminPhoto(compressed);
    } catch {
      setAdminPhoto(ev.target.result as string);
    }
  }
};`);

content = content.replace(/reader\.onload \= \(ev\) => \{\n\s+if \(ev\.target\?\.result\) \{\n\s+setNewTeacher\(prev => \(\{ \.\.\.prev, photoUrl: ev\.target!\.result as string \}\)\);\n\s+\}\n\s+\};/g, 
`reader.onload = async (ev) => {
  if (ev.target?.result) {
    try {
      const compressed = await compressImageBase64(ev.target.result as string);
      setNewTeacher(prev => ({ ...prev, photoUrl: compressed }));
    } catch {
      setNewTeacher(prev => ({ ...prev, photoUrl: ev.target!.result as string }));
    }
  }
};`);

content = content.replace(/reader\.onload \= \(ev\) => \{\n\s+if \(ev\.target\?\.result\) \{\n\s+setEditingTeacher\(prev => prev \? \(\{ \.\.\.prev, photoUrl: ev\.target!\.result as string \}\) : null\);\n\s+\}\n\s+\};/g, 
`reader.onload = async (ev) => {
  if (ev.target?.result) {
    try {
      const compressed = await compressImageBase64(ev.target.result as string);
      setEditingTeacher(prev => prev ? ({ ...prev, photoUrl: compressed }) : null);
    } catch {
      setEditingTeacher(prev => prev ? ({ ...prev, photoUrl: ev.target!.result as string }) : null);
    }
  }
};`);

content = content.replace(/reader\.onload \= \(ev\) => \{\n\s+if \(ev\.target\?\.result\) \{\n\s+setSchoolConfig\(\{ \.\.\.schoolConfig, principalPhotoUrl: ev\.target\.result as string \}\);\n\s+\}\n\s+\};/g, 
`reader.onload = async (ev) => {
  if (ev.target?.result) {
    try {
      const compressed = await compressImageBase64(ev.target.result as string);
      setSchoolConfig({ ...schoolConfig, principalPhotoUrl: compressed });
    } catch {
      setSchoolConfig({ ...schoolConfig, principalPhotoUrl: ev.target.result as string });
    }
  }
};`);

content = content.replace(/reader\.onload \= \(ev\) => \{\n\s+if \(ev\.target\?\.result\) \{\n\s+setSchoolConfig\(\{ \.\.\.schoolConfig, principalSignatureUrl: ev\.target\.result as string \}\);\n\s+\}\n\s+\};/g, 
`reader.onload = async (ev) => {
  if (ev.target?.result) {
    try {
      const compressed = await compressImageBase64(ev.target.result as string);
      setSchoolConfig({ ...schoolConfig, principalSignatureUrl: compressed });
    } catch {
      setSchoolConfig({ ...schoolConfig, principalSignatureUrl: ev.target.result as string });
    }
  }
};`);


content = content.replace(/reader\.onload \= \(ev\) => \{\n\s+if \(ev\.target\?\.result\) \{\n\s+setSchoolConfig\(\{ \.\.\.schoolConfig, printLogoUrl: ev\.target\.result as string \}\);\n\s+\}\n\s+\};/g, 
`reader.onload = async (ev) => {
  if (ev.target?.result) {
    try {
      const compressed = await compressImageBase64(ev.target.result as string);
      setSchoolConfig({ ...schoolConfig, printLogoUrl: compressed });
    } catch {
      setSchoolConfig({ ...schoolConfig, printLogoUrl: ev.target.result as string });
    }
  }
};`);


content = content.replace(/reader\.onload \= \(ev\) => \{\n\s+if \(ev\.target\?\.result\) \{\n\s+setSchoolConfig\(\{ \.\.\.schoolConfig, printUrduLogoUrl: ev\.target\.result as string \}\);\n\s+\}\n\s+\};/g, 
`reader.onload = async (ev) => {
  if (ev.target?.result) {
    try {
      const compressed = await compressImageBase64(ev.target.result as string);
      setSchoolConfig({ ...schoolConfig, printUrduLogoUrl: compressed });
    } catch {
      setSchoolConfig({ ...schoolConfig, printUrduLogoUrl: ev.target.result as string });
    }
  }
};`);


fs.writeFileSync(path, content, 'utf8');
console.log('Fixed photo compression blocks!');
