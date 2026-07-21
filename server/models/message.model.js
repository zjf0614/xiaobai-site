const pool = require('../config/db');

const messageModel = {
  async getRecentMessages(limit = 50) {
    const [rows] = await pool.query(
      `SELECT pm.*, u.username, u.avatar_url
       FROM public_messages pm
       JOIN users u ON pm.user_id = u.id
       ORDER BY pm.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows.reverse();
  },

  async createMessage(userId, content) {
    const [result] = await pool.query(
      'INSERT INTO public_messages (user_id, content) VALUES (?, ?)',
      [userId, content]
    );
    return result.insertId;
  },

  async getMessageById(id) {
    const [rows] = await pool.query(
      `SELECT pm.*, u.username, u.avatar_url
       FROM public_messages pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.id = ?`,
      [id]
    );
    return rows[0] || null;
  }
};

module.exports = messageModel;