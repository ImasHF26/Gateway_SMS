const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');

router.post('/send', smsController.sendSms);
router.post('/send-to-contact/:id', smsController.sendSmsToContact);
router.get('/history', smsController.getSmsHistory);
router.get('/status/:messageId', smsController.checkSmsStatus);

module.exports = router;
