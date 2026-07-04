// 用户相关数据库操作
const pool = require('../config/db');

const userModel = {
  /**
   * 根据用户名查找用户
   */
  async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  },

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * 根据 ID 查找用户（不含密码）
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, email, avatar_url, role, is_online, last_seen, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * 创建新用户
   */
  async create({ username, email, passwordHash }) {
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    return { id: result.insertId, username, email };
  },

  /**
   * 更新用户在线状态
   */
  async setOnlineStatus(userId, isOnline) {
    await pool.query(
      'UPDATE users SET is_online = ?, last_seen = NOW() WHERE id = ?',
      [isOnline ? 1 : 0, userId]
    );
  },

  /**
   * 更新用户资料
   */
  async updateProfile(userId, { avatar_url, email }) {
    const fields = [];
    const values = [];
    if (avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(avatar_url); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (fields.length === 0) return;
    values.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }
};

module.exports = userModel;
