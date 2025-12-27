import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Configuration pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'build')));

// Gestion des routes React (pour React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Port configuré pour Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {  // Important: '0.0.0.0' pour Render
  console.log(`Server is running on port ${PORT}`);
});