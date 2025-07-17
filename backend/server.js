require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('./database');
const SmsService = require('./smsService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialisation de la base de données et du service SMS
const db = new Database();
const smsService = new SmsService({
  url: process.env.SMSGATE_URL,
  username: process.env.SMSGATE_USERNAME,
  password: process.env.SMSGATE_PASSWORD
});

// Routes pour les contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await db.getAllContacts();
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await db.getContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact non trouvé' });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le nom et le numéro de téléphone sont requis' 
      });
    }

    const contact = await db.addContact({ name, phone, email });
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ 
        success: false, 
        error: 'Ce numéro de téléphone existe déjà' 
      });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le nom et le numéro de téléphone sont requis' 
      });
    }

    const contact = await db.updateContact(req.params.id, { name, phone, email });
    res.json({ success: true, data: contact });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ 
        success: false, 
        error: 'Ce numéro de téléphone existe déjà' 
      });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const result = await db.deleteContact(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Contact non trouvé' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routes pour l'envoi de SMS
app.post('/api/sms/send', async (req, res) => {
  try {
    const { phoneNumbers, message, contactIds } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le message est requis' 
      });
    }

    let targetPhones = [];
    let contactData = [];

    // Si des IDs de contacts sont fournis
    if (contactIds && contactIds.length > 0) {
      for (const contactId of contactIds) {
        const contact = await db.getContactById(contactId);
        if (contact) {
          targetPhones.push(contact.phone);
          contactData.push(contact);
        }
      }
    }

    // Si des numéros de téléphone sont fournis directement
    if (phoneNumbers && phoneNumbers.length > 0) {
      targetPhones = [...targetPhones, ...phoneNumbers];
    }

    if (targetPhones.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Aucun destinataire spécifié' 
      });
    }

    // Envoi du SMS
    const smsResult = await smsService.sendSms(targetPhones, message);
    
    // Enregistrement dans l'historique
    for (const phone of targetPhones) {
      const contact = contactData.find(c => c.phone === phone);
      await db.addSmsHistory({
        contact_id: contact ? contact.id : null,
        phone_number: phone,
        message: message,
        status: smsResult.success ? 'sent' : 'failed'
      });
    }

    res.json({
      success: smsResult.success,
      data: {
        sentTo: targetPhones,
        message: message,
        smsGateResponse: smsResult.data
      },
      error: smsResult.error
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/sms/send-to-contact/:id', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le message est requis' 
      });
    }

    const contact = await db.getContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact non trouvé' });
    }

    const smsResult = await smsService.sendSmsToContact(contact, message);
    
    // Enregistrement dans l'historique
    await db.addSmsHistory({
      contact_id: contact.id,
      phone_number: contact.phone,
      message: message,
      status: smsResult.success ? 'sent' : 'failed'
    });

    res.json({
      success: smsResult.success,
      data: {
        contact: contact,
        message: message,
        smsGateResponse: smsResult.data
      },
      error: smsResult.error
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour l'historique des SMS
app.get('/api/sms/history', async (req, res) => {
  try {
    const history = await db.getSmsHistory();
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route de test de connectivité SMSGate
app.get('/api/test-smsgate', async (req, res) => {
  try {
    const testResult = await smsService.testConnection();
    res.json({ 
      success: testResult.success, 
      data: testResult,
      config: {
        url: process.env.SMSGATE_URL,
        username: process.env.SMSGATE_USERNAME ? 'Configuré' : 'Non configuré',
        password: process.env.SMSGATE_PASSWORD ? 'Configuré' : 'Non configuré'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend SMS Service fonctionnel',
    timestamp: new Date().toISOString()
  });
});

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
