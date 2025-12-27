import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// servir le build React
app.use(express.static(path.join(__dirname, 'build')));

// fallback React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ⚠️ OBLIGATOIRE SUR RENDER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
