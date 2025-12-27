const express = require('express');
const path = require('path');
const app = express();

// Sert les fichiers statiques du build React
app.use(express.static(path.join(__dirname, 'build')));

// Redirige toutes les requêtes vers index.html pour React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Définit le port depuis l'environnement Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
