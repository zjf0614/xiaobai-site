const express = require('express');
const router = express.Router();
const privateMessageController = require('../controllers/privateMessage.controller');
const authMiddleware = require('../middleware/auth');

router.get('/dm/:friendId', authMiddleware, privateMessageController.getConversation);
router.post('/dm/:friendId', authMiddleware, privateMessageController.sendPrivateMessage);
router.get('/dm', authMiddleware, privateMessageController.getRecentConversations);
router.get('/dm/:friendId/unread', authMiddleware, privateMessageController.getUnreadCount);

module.exports = router;