const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'pages/Dashboard.tsx',
  'pages/BasicDashboard.tsx',
  'pages/ProDashboard.tsx',
  'pages/Students.tsx'
];

const patterns = [
  { search: /\bbg-white\b/g, replace: 'bg-surface' },
  { search: /\bbg-gray-900\b/g, replace: 'bg-bg-app' },
  { search: /\bbg-slate-900\b/g, replace: 'bg-bg-app' },
  { search: /\btext-black\b/g, replace: 'text-text-main' },
  { search: /\btext-gray-900\b/g, replace: 'text-text-main' },
  { search: /\btext-slate-900\b/g, replace: 'text-text-main' },
  { search: /\btext-gray-500\b/g, replace: 'text-text-muted' },
  { search: /\btext-slate-500\b/g, replace: 'text-text-muted' }
];

for (const fileRel of filesToUpdate) {
  const filePath = path.join(__dirname, fileRel);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const pattern of patterns) {
      content = content.replace(pattern.search, pattern.replace);
    }
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${fileRel}`);
    } else {
      console.log(`No changes made to ${fileRel}`);
    }
  } else {
    console.log(`File not found: ${fileRel}`);
  }
}
