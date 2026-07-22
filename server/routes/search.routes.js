const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const auth = require('../middleware/auth');

router.get('/search', auth, searchController.search);
router.get('/search/history', auth, searchController.getHistory);
router.delete('/search/history', auth, searchController.clearHistory);
router.get('/search/trending', auth, searchController.getTrending);

module.exports = router;