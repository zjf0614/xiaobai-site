const pool = require('../config/db');

class SearchModel {
  async searchUsers(query, userId, limit = 20) {
    const [rows] = await pool.query(
      `SELECT id, username, avatar_url, is_online, created_at
       FROM users
       WHERE id != ? AND (username LIKE ? OR email LIKE ?)
       ORDER BY is_online DESC, created_at DESC
       LIMIT ?`,
      [userId, `%${query}%`, `%${query}%`, limit]
    );
    return rows;
  }

  async searchPublicMessages(query, limit = 20) {
    const [rows] = await pool.query(
      `SELECT pm.*, u.username, u.avatar_url
       FROM public_messages pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.content LIKE ?
       ORDER BY pm.created_at DESC
       LIMIT ?`,
      [`%${query}%`, limit]
    );
    return rows;
  }

  async searchPrivateMessages(query, userId, limit = 20) {
    const [rows] = await pool.query(
      `SELECT pm.*, su.username as sender_username, su.avatar_url as sender_avatar,
              ru.username as receiver_username, ru.avatar_url as receiver_avatar
       FROM private_messages pm
       JOIN users su ON pm.sender_id = su.id
       JOIN users ru ON pm.receiver_id = ru.id
       WHERE (pm.sender_id = ? OR pm.receiver_id = ?) AND pm.content LIKE ?
       ORDER BY pm.created_at DESC
       LIMIT ?`,
      [userId, userId, `%${query}%`, limit]
    );
    return rows;
  }

  async searchAIHistory(query, userId, limit = 20) {
    const [conversations] = await pool.query(
      'SELECT id FROM ai_conversations WHERE user_id = ?',
      [userId]
    );

    if (conversations.length === 0) {
      return [];
    }

    const conversationIds = conversations.map(c => c.id).join(',');
    
    const [rows] = await pool.query(
      `SELECT am.*
       FROM ai_messages am
       WHERE am.conversation_id IN (${conversationIds}) AND am.content LIKE ?
       ORDER BY am.created_at DESC
       LIMIT ?`,
      [`%${query}%`, limit]
    );
    return rows;
  }

  async searchAll(query, userId, limit = 10) {
    const [users, publicMessages, privateMessages, aiHistory] = await Promise.all([
      this.searchUsers(query, userId, limit),
      this.searchPublicMessages(query, limit),
      this.searchPrivateMessages(query, userId, limit),
      this.searchAIHistory(query, userId, limit)
    ]);

    return {
      users: users.map(u => ({ type: 'user', ...u })),
      publicMessages: publicMessages.map(m => ({ type: 'public_message', ...m })),
      privateMessages: privateMessages.map(m => ({ type: 'private_message', ...m })),
      aiHistory: aiHistory.map(m => ({ type: 'ai_message', ...m }))
    };
  }

  async saveSearchHistory(userId, query, resultCount) {
    try {
      await pool.query(
        'INSERT INTO search_history (user_id, query, result_count) VALUES (?, ?, ?)',
        [userId, query, resultCount]
      );
    } catch (error) {
      console.error('[Search] Save history error:', error.message);
    }
  }

  async getSearchHistory(userId, limit = 10) {
    const [rows] = await pool.query(
      'SELECT query, created_at FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  }

  async clearSearchHistory(userId) {
    await pool.query('DELETE FROM search_history WHERE user_id = ?', [userId]);
  }

  async getTrendingSearches(limit = 10) {
    const [rows] = await pool.query(
      `SELECT query, COUNT(*) as count
       FROM search_history
       GROUP BY query
       ORDER BY count DESC, MAX(created_at) DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
}

module.exports = new SearchModel();