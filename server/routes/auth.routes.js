// 认证相关路由
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/register - 用户注册
router.post('/register', authController.register);

// POST /api/auth/login - 用户登录
router.post('/login', authController.login);

// GET /api/auth/me - 获取当前用户信息（需登录）
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
