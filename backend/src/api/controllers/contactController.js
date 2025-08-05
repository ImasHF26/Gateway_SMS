const Database = require('../../config/database');
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
};
