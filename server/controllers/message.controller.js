const messageModel = require('../models/message.model');

exports.getRecentMessages = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const messages = await messageModel.getRecentMessages(limit);
    res.json(messages);
  } catch (error) {
    next(error);
  }
};