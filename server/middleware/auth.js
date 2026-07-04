// JWT 认证中间件 —— 验证请求中的 token，将用户信息注入 req.user
const { verifyToken } = require('../utils/jwt');

/**
 * 认证中间件
 * 从 Authorization header 中提取 Bearer token，验证后注入 req.user
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录，请先登录' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }

  // 将解码后的用户信息挂载到 req 上，后续路由/控制器可直接使用
  req.user = decoded;
  next();
}

module.exports = authMiddleware;
