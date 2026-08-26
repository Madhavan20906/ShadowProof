import fs from 'fs';
import path from 'path';

console.log('=== ShadowProof Clean Submission Packager ===');
console.log('Excluding: node_modules, .git, dist, .env, build logs, and temp timestamp files.');

const rootDir = process.cwd();
const files = fs.readdirSync(rootDir);

const cleanFiles = files.filter(f => {
  if (['node_modules', '.git', 'dist', '.env'].includes(f)) return false;
  if (f.includes('.timestamp-')) return false;
  if (f.endsWith('.log')) return false;
  return true;
});

console.log(`Clean source bundle includes ${cleanFiles.length} top-level entries:`);
cleanFiles.forEach(f => console.log(` - ${f}`));
console.log('Ready for hackathon submission distribution!');
