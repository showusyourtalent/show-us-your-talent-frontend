// fix-mui-grid.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = './src';

function fixMuiGridInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Corriger <Grid item xs={...} md={...}>
  content = content.replace(
    /<Grid\s+item\s+xs=\{([^}]+)\}\s+md=\{([^}]+)\}/g,
    (match, xs, md) => {
      return `<Grid size={{ xs: ${xs.trim()}, md: ${md.trim()} }}`;
    }
  );
  
  // 2. Corriger <Grid item xs={...}>
  content = content.replace(
    /<Grid\s+item\s+xs=\{([^}]+)\}/g,
    (match, xs) => {
      return `<Grid size={{ xs: ${xs.trim()} }}`;
    }
  );
  
  // 3. Corriger <Grid item md={...}>
  content = content.replace(
    /<Grid\s+item\s+md=\{([^}]+)\}/g,
    (match, md) => {
      return `<Grid size={{ md: ${md.trim()} }}`;
    }
  );
  
  // 4. Supprimer prop "item" seule
  content = content.replace(/<Grid\s+item(\s|>)/g, '<Grid$1');
  
  // 5. Corriger <ListItem button>
  content = content.replace(
    /<ListItem\s+button(\s|>)/g,
    (match, space) => {
      return `<ListItem className="cursor-pointer"${space}`;
    }
  );
  
  // 6. Corriger <ListItem button onClick
  content = content.replace(
    /<ListItem\s+button\s+onClick=/g,
    '<ListItem className="cursor-pointer" onClick='
  );
  
  // 7. Corriger Grid container spacing
  content = content.replace(
    /<Grid\s+container\s+spacing=\{([^}]+)\}/g,
    '<Grid container spacing={$1}'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Corrigé: ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
      fixMuiGridInFile(filePath);
    }
  });
}

// Exécuter
console.log('Correction des fichiers MUI Grid...');
walkDir(sourceDir);
console.log('✓ Tous les fichiers ont été corrigés !');