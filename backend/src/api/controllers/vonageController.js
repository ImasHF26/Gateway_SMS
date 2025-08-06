const VonageSmsService = require('../services/vonageSmsService');
const Database = require('../../config/database');

const db = new Database();
const vonageSmsService = new VonageSmsService({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

const sendVonageSms = async (req, res) => {
  try {
    console.log('Configuration Vonage SMS Service:');
    console.log('- API Key:', process.env.VONAGE_API_KEY ?
      'Configuré' : 'Non configuré');
    console.log('- API Secret:', process.env.VONAGE_API_SECRET ?
      'Configuré' : 'Non configuré');
    console.log('- Destinataires:', req.body.phoneNumbers || req.body.contactIds);
    console.log('- Message:', req.body.message.substring(0, 50) +
      (req.body.message.length > 50 ? '...' : ''));
      
    const { phoneNumbers, message, contactIds } = req.body;
    if (!phoneNumbers && !contactIds) {
      return res.status(400).json({ 
        success: false, 
        error: 'Aucun numéro de téléphone ou contact spécifié' 
      });
    }
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
    console.log('Envoi de SMS via Vonage:', targetPhones, message);
    const smsResult = await vonageSmsService.sendSms(targetPhones, message);
    console.log('Résultat de l\'envoi:', smsResult);
    // Optional: Log to your own database
    for (const phone of targetPhones) {
      const contact = contactData.find(c => c.phone === phone);
      await db.addSmsHistory({
        contact_id: contact ? contact.id : null,
        phone_number: phone,
        message: message,
        status: smsResult.success ? 'sent' : 'failed'
      });
    }

    res.json(smsResult);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  sendVonageSms,
};
