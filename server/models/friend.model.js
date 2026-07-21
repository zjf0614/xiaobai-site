const pool = require('../config/db');

const friendModel = {
  async sendRequest(userId, friendId) {
    if (userId === friendId) {
      throw new Error('不能添加自己为好友');
    }

    const [existing] = await pool.query(
      'SELECT status FROM friends WHERE user_id = ? AND friend_id = ?',
      [userId, friendId]
    );

    if (existing.length > 0) {
      const status = existing[0].status;
      if (status === 'accepted') throw new Error('已经是好友');
      if (status === 'pending') throw new Error('好友请求已发送');
      if (status === 'blocked') throw new Error('对方已被屏蔽');
    }

    const [reverse] = await pool.query(
      'SELECT status FROM friends WHERE user_id = ? AND friend_id = ?',
      [friendId, userId]
    );

    if (reverse.length > 0) {
      const status = reverse[0].status;
      if (status === 'accepted') throw new Error('已经是好友');
      if (status === 'pending') throw new Error('对方已发送好友请求，请等待');
    }

    const [result] = await pool.query(
      'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
      [userId, friendId, 'pending']
    );

    return { id: result.insertId };
  },

  async acceptRequest(requestId, userId) {
    const [request] = await pool.query(
      'SELECT * FROM friends WHERE id = ?',
      [requestId]
    );

    if (request.length === 0) {
      throw new Error('请求不存在');
    }

    if (request[0].friend_id !== userId) {
      throw new Error('无权操作此请求');
    }

    if (request[0].status !== 'pending') {
      throw new Error('请求状态无效');
    }

    await pool.query(
      'UPDATE friends SET status = ? WHERE id = ?',
      ['accepted', requestId]
    );

    const [reverse] = await pool.query(
      'SELECT id FROM friends WHERE user_id = ? AND friend_id = ?',
      [userId, request[0].user_id]
    );

    if (reverse.length === 0) {
      await pool.query(
        'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
        [userId, request[0].user_id, 'accepted']
      );
    } else {
      await pool.query(
        'UPDATE friends SET status = ? WHERE id = ?',
        ['accepted', reverse[0].id]
      );
    }

    return { success: true };
  },

  async rejectRequest(requestId, userId) {
    const [request] = await pool.query(
      'SELECT * FROM friends WHERE id = ?',
      [requestId]
    );

    if (request.length === 0) {
      throw new Error('请求不存在');
    }

    if (request[0].friend_id !== userId) {
      throw new Error('无权操作此请求');
    }

    await pool.query(
      'DELETE FROM friends WHERE id = ?',
      [requestId]
    );

    return { success: true };
  },

  async getFriends(userId) {
    const [rows] = await pool.query(
      `SELECT f.*, u.id as friend_user_id, u.username, u.avatar_url, u.is_online
       FROM friends f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = ? AND f.status = 'accepted'
       ORDER BY u.username ASC`,
      [userId]
    );
    return rows;
  },

  async getPendingRequests(userId) {
    const [rows] = await pool.query(
      `SELECT f.*, u.id as requester_id, u.username, u.avatar_url
       FROM friends f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = ? AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async searchUsers(query, excludeUserId) {
    const [rows] = await pool.query(
      `SELECT id, username, avatar_url, is_online
       FROM users
       WHERE username LIKE ? AND id != ?
       LIMIT 20`,
      [`%${query}%`, excludeUserId]
    );
    return rows;
  },

  async getFriendshipStatus(userId, friendId) {
    const [rows] = await pool.query(
      'SELECT status FROM friends WHERE user_id = ? AND friend_id = ?',
      [userId, friendId]
    );
    return rows.length > 0 ? rows[0].status : null;
  }
};

module.exports = friendModel;