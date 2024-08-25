const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');

router.post('/', contactController.sendContact);

module.exports = router;