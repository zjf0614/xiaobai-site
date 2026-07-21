const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friend.controller');
const authMiddleware = require('../middleware/auth');

router.get('/friends', authMiddleware, friendController.getFriends);
router.get('/friends/requests', authMiddleware, friendController.getPendingRequests);
router.post('/friends/request', authMiddleware, friendController.sendFriendRequest);
router.put('/friends/accept/:requestId', authMiddleware, friendController.acceptFriendRequest);
router.delete('/friends/reject/:requestId', authMiddleware, friendController.rejectFriendRequest);
router.get('/users/search', authMiddleware, friendController.searchUsers);

module.exports = router;