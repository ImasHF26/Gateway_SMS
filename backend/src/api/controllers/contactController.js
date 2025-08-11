const Database = require('../../config/database');
const fs = require('fs');
const csv = require('csv-parser');
const db = new Database();

const getContacts = async (req, res) => {
  try {
    const contacts = await db.getAllContacts();
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getContactById = async (req, res) => {
  try {
    const contact = await db.getContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact non trouvé' });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createContact = async (req, res) => {
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
};
const createContactFromCsv = async (req, res) => {
  console.log('Processing CSV upload...');
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier CSV fourni' });
    }

    const contacts = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const { name, phone, email } = row;
        if (name && phone) {
          contacts.push({ name, phone, email: email || null });
        }
      })
      .on('end', async () => {
        fs.unlinkSync(filePath); // Supprimer le fichier temporaire

        if (contacts.length === 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'Le fichier CSV est vide ou ne contient pas les colonnes "name" et "phone" requises.' 
          });
        }

        try {
          const result = await db.addContacts(contacts);
          res.status(201).json({ 
            success: true, 
            message: `${result.length} contacts ajoutés avec succès.`, 
            data: result 
          });
        } catch (error) {
          if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ 
              success: false, 
              error: 'Un ou plusieurs numéros de téléphone existent déjà dans la base de données.' 
            });
          } else {
            res.status(500).json({ success: false, error: error.message });
          }
        }
      });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ 
        success: false, 
        error: 'Un ou plusieurs numéros de téléphone existent déjà' 
      });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

const updateContact = async (req, res) => {
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
};

const deleteContact = async (req, res) => {
  try {
    const result = await db.deleteContact(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Contact non trouvé' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  createContactFromCsv,
};
