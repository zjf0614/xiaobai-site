const friendModel = require('../models/friend.model');

exports.getFriends = async (req, res, next) => {
  try {
    const friends = await friendModel.getFriends(req.user.id);
    res.json(friends);
  } catch (error) {
    next(error);
  }
};

exports.getPendingRequests = async (req, res, next) => {
  try {
    const requests = await friendModel.getPendingRequests(req.user.id);
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

exports.sendFriendRequest = async (req, res, next) => {
  try {
    const { friendId } = req.body;
    const result = await friendModel.sendRequest(req.user.id, friendId);
    
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    
    if (userSockets.has(friendId)) {
      userSockets.get(friendId).forEach(socketId => {
        io.to(socketId).emit('friend:request', {
          userId: req.user.id,
          username: req.user.username
        });
      });
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.acceptFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const result = await friendModel.acceptRequest(requestId, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.rejectFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const result = await friendModel.rejectRequest(requestId, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const users = await friendModel.searchUsers(q || '', req.user.id);
    res.json(users);
  } catch (error) {
    next(error);
  }
};