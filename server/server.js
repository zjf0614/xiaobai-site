// 服务器入口：创建 HTTP Server + 挂载 Express + 初始化 Socket.io
const http = require('http');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// 创建 HTTP 服务器
const server = http.createServer(app);

// 初始化 Socket.io（后续阶段会完善事件处理）
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// 将 io 实例挂载到 app 上，方便在控制器中使用
app.set('io', io);

// Socket.io 连接处理（骨架 —— 阶段 3 完善）
io.on('connection', (socket) => {
  console.log(`[Socket] 新连接: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket] 断开连接: ${socket.id}`);
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`🚀 服务器已启动: http://localhost:${PORT}`);
  console.log(`📡 Socket.io 已就绪`);
});
