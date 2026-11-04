require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('./src/config/database');

const contactRoutes = require('./src/api/routes/contactRoutes');
const smsRoutes = require('./src/api/routes/smsRoutes');
const vonageRoutes = require('./src/api/routes/vonageRoutes');
const testRoutes = require('./src/api/routes/testRoutes');
const templateRoutes = require('./src/api/routes/templateRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Initialisation de la base de données
const db = new Database();

// Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/vonage-sms', vonageRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api', testRoutes); // Routes de test et de santé



// Gestion de la fermeture propre
process.on('SIGINT', () => {
  console.log('Arrêt du serveur...');
  db.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`API disponible à l'adresse: http://localhost:${PORT}/api`);
});
