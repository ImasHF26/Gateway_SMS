const express = require('express');
const router = express.Router();
const vonageController = require('../controllers/vonageController');

router.post('/send', vonageController.sendVonageSms);

module.exports = router;
