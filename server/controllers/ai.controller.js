const aiModel = require('../models/ai.model');

class AIController {
  async chat(req, res) {
    try {
      const { message } = req.body;
      const userId = req.user.id;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: '消息内容不能为空' });
      }

      if (message.length > 2000) {
        return res.status(400).json({ error: '消息内容过长' });
      }

      const useLLM = process.env.USE_LLM === 'true';
      const aiReply = useLLM 
        ? await aiModel.generateReplyWithLLM(message.trim(), userId)
        : await aiModel.generateReply(message.trim(), userId);

      await aiModel.saveChatHistory(userId, message.trim(), aiReply);

      res.json({
        success: true,
        reply: aiReply,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[AI Controller] Chat error:', error.message);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }

  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 50 } = req.query;

      const history = await aiModel.getChatHistory(userId, parseInt(limit));

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('[AI Controller] Get history error:', error.message);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }

  async clearHistory(req, res) {
    try {
      const userId = req.user.id;

      const success = await aiModel.clearChatHistory(userId);

      if (success) {
        res.json({ success: true, message: '聊天记录已清空' });
      } else {
        res.status(500).json({ error: '清空失败' });
      }
    } catch (error) {
      console.error('[AI Controller] Clear history error:', error.message);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }

  async config(req, res) {
    try {
      res.json({
        success: true,
        config: {
          useLLM: process.env.USE_LLM === 'true',
          model: process.env.LLM_MODEL || 'simulated',
          features: ['chat', 'history', 'clear']
        }
      });
    } catch (error) {
      console.error('[AI Controller] Config error:', error.message);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
}

module.exports = new AIController();