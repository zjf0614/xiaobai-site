const pool = require('../config/db');

const privateMessageModel = {
  async getConversation(userId, friendId, limit = 50) {
    const [rows] = await pool.query(
      `SELECT pm.*, 
              su.id as sender_user_id, su.username as sender_username, su.avatar_url as sender_avatar,
              ru.id as receiver_user_id, ru.username as receiver_username, ru.avatar_url as receiver_avatar
       FROM private_messages pm
       JOIN users su ON pm.sender_id = su.id
       JOIN users ru ON pm.receiver_id = ru.id
       WHERE (pm.sender_id = ? AND pm.receiver_id = ?) 
          OR (pm.sender_id = ? AND pm.receiver_id = ?)
       ORDER BY pm.created_at DESC
       LIMIT ?`,
      [userId, friendId, friendId, userId, limit]
    );
    return rows.reverse();
  },

  async createMessage(senderId, receiverId, content) {
    const [result] = await pool.query(
      'INSERT INTO private_messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, receiverId, content]
    );

    const [message] = await pool.query(
      `SELECT pm.*, 
              su.id as sender_user_id, su.username as sender_username, su.avatar_url as sender_avatar,
              ru.id as receiver_user_id, ru.username as receiver_username, ru.avatar_url as receiver_avatar
       FROM private_messages pm
       JOIN users su ON pm.sender_id = su.id
       JOIN users ru ON pm.receiver_id = ru.id
       WHERE pm.id = ?`,
      [result.insertId]
    );

    return message[0] || null;
  },

  async markAsRead(userId, friendId) {
    await pool.query(
      'UPDATE private_messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
      [friendId, userId]
    );
  },

  async getUnreadCount(userId, friendId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM private_messages WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
      [friendId, userId]
    );
    return rows[0].count;
  },

  async getRecentConversations(userId) {
    const [rows] = await pool.query(
      `SELECT 
          CASE WHEN pm.sender_id = ? THEN pm.receiver_id ELSE pm.sender_id END as other_user_id,
          u.username, u.avatar_url, u.is_online,
          MAX(pm.created_at) as last_message_time,
          pm.content as last_message,
          SUM(CASE WHEN pm.receiver_id = ? AND pm.is_read = 0 THEN 1 ELSE 0 END) as unread_count
       FROM private_messages pm
       JOIN users u ON (CASE WHEN pm.sender_id = ? THEN pm.receiver_id ELSE pm.sender_id END) = u.id
       WHERE pm.sender_id = ? OR pm.receiver_id = ?
       GROUP BY other_user_id
       ORDER BY last_message_time DESC
       LIMIT 50`,
      [userId, userId, userId, userId, userId]
    );
    return rows;
  }
};

module.exports = privateMessageModel;