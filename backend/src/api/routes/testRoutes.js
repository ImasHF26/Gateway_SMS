const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/test-smsgate', testController.testSmsGate);
router.get('/test', testController.testApi);

module.exports = router;
