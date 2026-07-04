// 管理员权限中间件 —— 必须在 auth 中间件之后使用
// 检查 req.user.role 是否为 'admin'

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '权限不足，需要管理员权限' });
  }
  next();
}

module.exports = adminMiddleware;
