import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourceDir = './src';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<Grid\s+item\s+xs=\{([^}]+)\}\s+md=\{([^}]+)\}/g, '<Grid size={{ xs: $1, md: $2 }}');
  content = content.replace(/<Grid\s+item\s+xs=\{([^}]+)\}/g, '<Grid size={{ xs: $1 }}');
  content = content.replace(/<Grid\s+item\s+md=\{([^}]+)\}/g, '<Grid size={{ md: $1 }}');
  content = content.replace(/<Grid\s+item(\s|>)/g, '<Grid$1');
  content = content.replace(/<ListItem\s+button(\s|>)/g, '<ListItem className="cursor-pointer"$1');
  content = content.replace(/<ListItem\s+button\s+onClick=/g, '<ListItem className="cursor-pointer" onClick=');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(\`✓ \${filePath}\`);
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) walk(filePath);
    else if (file.endsWith('.jsx') || file.endsWith('.tsx')) fixFile(filePath);
  });
}

console.log('Correction en cours...');
walk(sourceDir);
console.log('✓ Terminé !');
