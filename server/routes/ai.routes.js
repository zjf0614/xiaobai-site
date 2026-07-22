const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const auth = require('../middleware/auth');

router.post('/ai/chat', auth, aiController.chat);
router.get('/ai/history', auth, aiController.getHistory);
router.delete('/ai/history', auth, aiController.clearHistory);
router.get('/ai/config', auth, aiController.config);

module.exports = router;