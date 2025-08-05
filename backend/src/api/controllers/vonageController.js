const VonageSmsService = require('../services/vonageSmsService');
const Database = require('../../config/database');

const db = new Database();
const vonageSmsService = new VonageSmsService({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
});

const sendVonageSms = async (req, res) => {
  try {
    const { to, text } = req.body;

    if (!to || !text) {
      return res.status(400).json({
        success: false,
        error: 'Le numéro de téléphone et le message sont requis'
      });
    }

    const smsResult = await vonageSmsService.sendSms(to, text);

    // Optional: Log to your own database
    await db.addSmsHistory({
        contact_id: null, // Or find contact by number if you want
        phone_number: to,
        message: text,
        status: smsResult.success ? 'sent_vonage' : 'failed_vonage'
      });

    res.json(smsResult);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  sendVonageSms,
};
