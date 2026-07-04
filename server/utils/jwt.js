// JWT 工具函数
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'xiaobai_site_jwt_secret_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * 生成 JWT token
 * @param {Object} payload - 要编码到 token 中的数据 (如 { id, username, role })
 * @returns {string} JWT token
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证 JWT token
 * @param {string} token - JWT token 字符串
 * @returns {Object|null} 解码后的 payload，验证失败返回 null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { signToken, verifyToken };
