// Express 应用配置
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// 导入路由
const authRoutes = require('./routes/auth.routes');
const messageRoutes = require('./routes/message.routes');
const friendRoutes = require('./routes/friend.routes');
const privateMessageRoutes = require('./routes/privateMessage.routes');
const aiRoutes = require('./routes/ai.routes');
const searchRoutes = require('./routes/search.routes');

const app = express();

// -------- 中间件 --------
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// -------- 路由挂载 --------
app.use('/api/auth', authRoutes);
app.use('/api', messageRoutes);
app.use('/api', friendRoutes);
app.use('/api', privateMessageRoutes);
app.use('/api', aiRoutes);
app.use('/api', searchRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// -------- 错误处理 --------
app.use(errorHandler);

module.exports = app;
