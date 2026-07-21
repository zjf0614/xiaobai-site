const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth');

router.get('/messages', authMiddleware, messageController.getRecentMessages);

module.exports = router;