const SmsService = require('../services/smsService');
const Database = require('../../config/database');

const db = new Database();
const smsService = new SmsService({
  url: process.env.SMSGATE_URL,
  username: process.env.SMSGATE_USERNAME,
  password: process.env.SMSGATE_PASSWORD
});

const sendSms = async (req, res) => {
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

    if (contactIds && contactIds.length > 0) {
      for (const contactId of contactIds) {
        const contact = await db.getContactById(contactId);
        if (contact) {
          targetPhones.push(contact.phone);
          contactData.push(contact);
        }
      }
    }

    if (phoneNumbers && phoneNumbers.length > 0) {
      targetPhones = [...targetPhones, ...phoneNumbers];
    }

    if (targetPhones.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Aucun destinataire spécifié' 
      });
    }

    const smsResult = await smsService.sendSms(targetPhones, message);
    
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
};

const sendSmsToContact = async (req, res) => {
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
  };

const getSmsHistory = async (req, res) => {
  try {
    const history = await db.getSmsHistory();
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  sendSms,
  sendSmsToContact,
  getSmsHistory,
};
