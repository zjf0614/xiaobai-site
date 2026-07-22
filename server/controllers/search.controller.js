const searchModel = require('../models/search.model');

class SearchController {
  async search(req, res) {
    try {
      const { q, type, limit = 10 } = req.query;
      const userId = req.user.id;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({ error: '搜索关键词不能为空' });
      }

      if (q.length > 200) {
        return res.status(400).json({ error: '搜索关键词过长' });
      }

      const query = q.trim();
      let results;

      switch (type) {
        case 'users':
          results = { users: await searchModel.searchUsers(query, userId, parseInt(limit)) };
          break;
        case 'public':
          results = { publicMessages: await searchModel.searchPublicMessages(query, parseInt(limit)) };
          break;
        case 'private':
          results = { privateMessages: await searchModel.searchPrivateMessages(query, userId, parseInt(limit)) };
          break;
        case 'ai':
          results = { aiHistory: await searchModel.searchAIHistory(query, userId, parseInt(limit)) };
          break;
        default:
          results = await searchModel.searchAll(query, userId, parseInt(limit));
      }

      const totalCount = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
      await searchModel.saveSearchHistory(userId, query, totalCount);

      res.json({
        success: true,
        query,
        type,
        results,
        total: totalCount
      });
    } catch (error) {
      console.error('[Search Controller] Search error:', error.message);
      res.status(500).json({ error: '搜索失败' });
    }
  }

  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      const history = await searchModel.getSearchHistory(userId, parseInt(limit));

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('[Search Controller] Get history error:', error.message);
      res.status(500).json({ error: '获取搜索历史失败' });
    }
  }

  async clearHistory(req, res) {
    try {
      const userId = req.user.id;

      await searchModel.clearSearchHistory(userId);

      res.json({ success: true, message: '搜索历史已清空' });
    } catch (error) {
      console.error('[Search Controller] Clear history error:', error.message);
      res.status(500).json({ error: '清空失败' });
    }
  }

  async getTrending(req, res) {
    try {
      const { limit = 10 } = req.query;

      const trending = await searchModel.getTrendingSearches(parseInt(limit));

      res.json({
        success: true,
        data: trending
      });
    } catch (error) {
      console.error('[Search Controller] Get trending error:', error.message);
      res.status(500).json({ error: '获取热门搜索失败' });
    }
  }
}

module.exports = new SearchController();