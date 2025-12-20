const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/profile/page.tsx');
console.log('Fixing:', filePath);

let content = fs.readFileSync(filePath, 'utf8');

// Check if already fixed
if (content.includes('Save each pet async')) {
  console.log('✅ Already fixed!');
  process.exit(0);
}

// Fix the line
const oldCode = 'savePetsToLocalStorage(userId, updatedPets);';
const newCode = `// Save each pet async
        updatedPets.forEach(pet => {
          savePet(userId, pet).catch(err => console.error('Failed to save pet:', err));
        });`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed successfully!');
  
  // Show the fix
  const lines = content.split('\n');
  const lineNum = lines.findIndex(l => l.includes('Save each pet async'));
  console.log('\nFixed at line', lineNum + 1);
  console.log(lines.slice(lineNum, lineNum + 4).join('\n'));
} else {
  console.log('❌ Could not find exact match.');
  
  // Try to find any variation
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('savePetsToLocalStorage')) {
      console.log(`Found at line ${i + 1}: ${lines[i]}`);
      console.log('Replacing...');
      lines[i] = lines[i].replace('savePetsToLocalStorage(userId, updatedPets);', newCode);
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log('✅ Fixed line', i + 1);
      break;
    }
  }
}
