const privateMessageModel = require('../models/privateMessage.model');

exports.getConversation = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const messages = await privateMessageModel.getConversation(req.user.id, friendId);
    await privateMessageModel.markAsRead(req.user.id, friendId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

exports.sendPrivateMessage = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }
    
    if (content.length > 2000) {
      return res.status(400).json({ error: '消息内容过长' });
    }
    
    const message = await privateMessageModel.createMessage(req.user.id, friendId, content.trim());
    res.json(message);
  } catch (error) {
    next(error);
  }
};

exports.getRecentConversations = async (req, res, next) => {
  try {
    const conversations = await privateMessageModel.getRecentConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const count = await privateMessageModel.getUnreadCount(req.user.id, friendId);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};