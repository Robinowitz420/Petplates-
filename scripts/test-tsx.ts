import * as fs from 'fs';
import * as path from 'path';

console.log('TEST SCRIPT RUNNING');
const testFile = path.join(process.cwd(), 'tsx-test-success.txt');
fs.writeFileSync(testFile, 'TSX is working! ' + new Date().toISOString(), 'utf8');
console.log('Test file written:', testFile);
