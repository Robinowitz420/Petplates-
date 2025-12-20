console.log('Starting import test...');
try {
  const { dogCelebrities } = require('../lib/data/celebrity-pets-complete');
  console.log('Import successful!');
  console.log('Dog celebrities count:', dogCelebrities?.length || 0);
  const fs = require('fs');
  fs.writeFileSync('import-test-success.txt', 'SUCCESS', 'utf8');
} catch (error: any) {
  console.error('Import failed:', error.message);
  const fs = require('fs');
  fs.writeFileSync('import-test-error.txt', error.message + '\n' + error.stack, 'utf8');
}
