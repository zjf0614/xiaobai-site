// 认证控制器 —— 处理注册和登录业务逻辑
const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

const authController = {
  /**
   * 用户注册
   * POST /api/auth/register
   * Body: { username, email, password }
   */
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      // 基础验证
      if (!username || !email || !password) {
        return res.status(400).json({ error: '用户名、邮箱和密码不能为空' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: '密码长度不能少于6位' });
      }
      if (username.length < 2 || username.length > 20) {
        return res.status(400).json({ error: '用户名长度需在2-20个字符之间' });
      }

      // 检查用户名是否已存在
      const existingUser = await userModel.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: '用户名已被注册' });
      }

      // 检查邮箱是否已存在
      const existingEmail = await userModel.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: '邮箱已被注册' });
      }

      // 加密密码
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // 创建用户
      const user = await userModel.create({ username, email, passwordHash });

      // 生成 token
      const token = signToken({
        id: user.id,
        username: user.username,
        role: 'user'
      });

      res.status(201).json({
        message: '注册成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: 'user'
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * 用户登录
   * POST /api/auth/login
   * Body: { username, password }
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
      }

      // 查找用户
      const user = await userModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      // 生成 token
      const token = signToken({
        id: user.id,
        username: user.username,
        role: user.role
      });

      res.json({
        message: '登录成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * 获取当前登录用户信息
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
