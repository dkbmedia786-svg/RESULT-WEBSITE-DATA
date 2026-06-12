import fs from 'fs';

const path = 'src/components/PrincipalDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/accept="image\/png"/g, 'accept="image/png, image/jpeg, image/jpg"');
content = content.replace(/if \(file\.type !== "image\/png"\) \{\n\s+alert\("Please upload a transparent \.png format logo only to avoid background errors!"\);\n\s+\}/g, '');
content = content.replace(/if \(file\.type !== "image\/png"\) \{\n\s+alert\("Please upload a transparent \.png format Urdu name logo only!"\);\n\s+\}/g, '');
content = content.replace(/if \(file\.type !== "image\/png"\) \{\n\s+alert\("Please upload a transparent \.png format signature only!"\);\n\s+\}/g, '');
content = content.replace(/if \(file\.type !== "image\/png"\) \{\n\s+alert\("Please select a transparent \.png format photo only!"\);\n\s+\}/g, '');
content = content.replace(/\(Transparent PNG \.png only prefer so back-ground behind looks pristine\)/g, '(PNG/JPG allowed)');
content = content.replace(/\(Transparent PNG \.png folder so backend doesn't black\)/g, '(PNG/JPG allowed)');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed png checks!');
