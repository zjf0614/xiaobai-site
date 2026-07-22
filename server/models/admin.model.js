const pool = require('../config/db');

class AdminModel {
  async getUsers(page = 1, limit = 20, search = '') {
    const offset = (page - 1) * limit;
    const searchQuery = search ? `AND (username LIKE ? OR email LIKE ?)` : '';
    const searchValues = search ? [`%${search}%`, `%${search}%`] : [];

    const [rows] = await pool.query(
      `SELECT id, username, email, avatar_url, role, is_online, last_seen, created_at 
       FROM users 
       WHERE 1=1 ${searchQuery}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...searchValues, limit, offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM users WHERE 1=1 ${searchQuery}`,
      searchValues
    );

    return { users: rows, total: countResult[0].total };
  }

  async getUserById(userId) {
    const [rows] = await pool.query(
      'SELECT id, username, email, avatar_url, role, is_online, last_seen, created_at FROM users WHERE id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  async updateUserRole(userId, role) {
    await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );
  }

  async deleteUser(userId) {
    await pool.query('DELETE FROM ai_messages WHERE conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = ?)', [userId]);
    await pool.query('DELETE FROM ai_conversations WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM private_messages WHERE sender_id = ? OR receiver_id = ?', [userId, userId]);
    await pool.query('DELETE FROM friends WHERE user_id = ? OR friend_id = ?', [userId, userId]);
    await pool.query('DELETE FROM public_messages WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM search_history WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
  }

  async getPublicMessages(page = 1, limit = 20, search = '') {
    const offset = (page - 1) * limit;
    const searchQuery = search ? `AND pm.content LIKE ?` : '';
    const searchValues = search ? [`%${search}%`] : [];

    const [rows] = await pool.query(
      `SELECT pm.*, u.username, u.avatar_url 
       FROM public_messages pm
       JOIN users u ON pm.user_id = u.id
       WHERE 1=1 ${searchQuery}
       ORDER BY pm.created_at DESC
       LIMIT ? OFFSET ?`,
      [...searchValues, limit, offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM public_messages pm WHERE 1=1 ${searchQuery}`,
      searchValues
    );

    return { messages: rows, total: countResult[0].total };
  }

  async deletePublicMessage(messageId) {
    await pool.query('DELETE FROM public_messages WHERE id = ?', [messageId]);
  }

  async getPrivateMessages(page = 1, limit = 20, search = '') {
    const offset = (page - 1) * limit;
    const searchQuery = search ? `AND pm.content LIKE ?` : '';
    const searchValues = search ? [`%${search}%`] : [];

    const [rows] = await pool.query(
      `SELECT pm.*, su.username as sender_username, ru.username as receiver_username
       FROM private_messages pm
       JOIN users su ON pm.sender_id = su.id
       JOIN users ru ON pm.receiver_id = ru.id
       WHERE 1=1 ${searchQuery}
       ORDER BY pm.created_at DESC
       LIMIT ? OFFSET ?`,
      [...searchValues, limit, offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM private_messages pm WHERE 1=1 ${searchQuery}`,
      searchValues
    );

    return { messages: rows, total: countResult[0].total };
  }

  async deletePrivateMessage(messageId) {
    await pool.query('DELETE FROM private_messages WHERE id = ?', [messageId]);
  }

  async getAdminLogs(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT al.*, u.username as admin_username
       FROM admin_actions_log al
       JOIN users u ON al.admin_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM admin_actions_log');

    return { logs: rows, total: countResult[0].total };
  }

  async addAdminLog(adminId, action, targetType, targetId, description) {
    await pool.query(
      'INSERT INTO admin_actions_log (admin_id, action, target_type, target_id, description) VALUES (?, ?, ?, ?, ?)',
      [adminId, action, targetType, targetId, description]
    );
  }

  async getStats() {
    const [userStats] = await pool.query('SELECT COUNT(*) as total, SUM(is_online) as online FROM users');
    const [msgStats] = await pool.query('SELECT COUNT(*) as public_count FROM public_messages');
    const [pmStats] = await pool.query('SELECT COUNT(*) as private_count FROM private_messages');
    const [friendStats] = await pool.query('SELECT COUNT(*) as friend_count FROM friends WHERE status = "accepted"');
    const [aiStats] = await pool.query('SELECT COUNT(*) as conversation_count FROM ai_conversations');

    return {
      users: {
        total: userStats[0].total,
        online: userStats[0].online
      },
      messages: {
        public: msgStats[0].public_count,
        private: pmStats[0].private_count
      },
      friends: friendStats[0].friend_count,
      aiConversations: aiStats[0].conversation_count
    };
  }
}

module.exports = new AdminModel();