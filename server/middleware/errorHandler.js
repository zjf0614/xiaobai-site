// 全局错误处理中间件
function errorHandler(err, req, res, next) {
  console.error('服务器错误:', err);

  // 数据库错误
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: '数据已存在，请检查输入' });
  }

  // 默认 500 错误
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误，请稍后重试'
  });
}

module.exports = errorHandler;
