import * as fs from 'fs';
import * as path from 'path';

const output: string[] = [];

function log(msg: string) {
  console.log(msg);
  output.push(msg);
}

const recipesPath = path.join(process.cwd(), 'lib', 'data', 'recipes-complete.ts');
log('Reading file: ' + recipesPath);
log('File exists: ' + fs.existsSync(recipesPath));

if (fs.existsSync(recipesPath)) {
  const fileContent = fs.readFileSync(recipesPath, 'utf8');
  log('File size: ' + fileContent.length);
  log('First 200 chars: ' + fileContent.substring(0, 200));
  
  const arrayStart = fileContent.indexOf('export const recipes: Recipe[] = [');
  log('Array start position: ' + arrayStart);
  
  if (arrayStart === -1) {
    const altStart = fileContent.indexOf('export const recipes = [');
    log('Alt start position: ' + altStart);
  }
}

// Write output to file
fs.writeFileSync('test-output.txt', output.join('\n'), 'utf8');
log('Output written to test-output.txt');
