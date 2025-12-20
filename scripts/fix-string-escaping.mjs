import fs from 'fs';

const files = [
  'lib/data/vetted-products-generic.ts',
  'lib/data/vetted-products-UPDATED.ts'
];

files.forEach(filePath => {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix: Replace strings with apostrophes by escaping them properly
  // Match single-quoted strings containing unescaped apostrophes
  content = content.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'s([^'\\]*(?:\\.[^'\\]*)*)'/g, (match, before, after) => {
    // If the apostrophe is already escaped, leave it
    if (match.includes("\\'s")) return match;
    // Otherwise, escape it
    return `'${before}\\'s${after}'`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${filePath}`);
});

console.log('\nDone! All string escaping issues fixed.');
