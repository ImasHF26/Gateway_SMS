const SmsService = require('../services/smsService');

const smsService = new SmsService({
    url: process.env.SMSGATE_URL,
    username: process.env.SMSGATE_USERNAME,
    password: process.env.SMSGATE_PASSWORD
  });

const testSmsGate = async (req, res) => {
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
  };

  const testApi = (req, res) => {
    res.json({ 
      success: true, 
      message: 'Backend SMS Service fonctionnel',
      timestamp: new Date().toISOString()
    });
  };

  module.exports = {
    testSmsGate,
    testApi
  }
