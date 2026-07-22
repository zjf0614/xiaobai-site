const http = require('http');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const { Server } = require('socket.io');
const { verifyToken } = require('./utils/jwt');
const userModel = require('./models/user.model');
const messageModel = require('./models/message.model');
const privateMessageModel = require('./models/privateMessage.model');
const aiModel = require('./models/ai.model');

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const ONLINE_ROOM = 'public';
const userSockets = new Map();

app.set('io', io);
app.set('userSockets', userSockets);

io.on('connection', async (socket) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    socket.disconnect();
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    socket.disconnect();
    return;
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    socket.disconnect();
    return;
  }

  socket.data.user = user;
  socket.userId = user.id;

  if (!userSockets.has(user.id)) {
    userSockets.set(user.id, new Set());
    await userModel.setOnlineStatus(user.id, true);
  }
  userSockets.get(user.id).add(socket.id);

  await socket.join(ONLINE_ROOM);

  const onlineCount = io.sockets.adapter.rooms.get(ONLINE_ROOM)?.size || 0;
  io.to(ONLINE_ROOM).emit('chat:onlineCount', onlineCount);

  console.log(`[Socket] 用户 ${user.username} 已连接 (socket: ${socket.id})`);

  socket.on('chat:message', async (data) => {
    if (!data.content || data.content.trim().length === 0) {
      return;
    }

    if (data.content.length > 2000) {
      socket.emit('chat:error', { message: '消息内容过长' });
      return;
    }

    const messageId = await messageModel.createMessage(user.id, data.content.trim());
    const savedMessage = await messageModel.getMessageById(messageId);

    io.to(ONLINE_ROOM).emit('chat:message', savedMessage);
  });

  socket.on('dm:send', async (data) => {
    if (!data.receiverId || !data.content || data.content.trim().length === 0) {
      return;
    }

    if (data.content.length > 2000) {
      socket.emit('dm:error', { message: '消息内容过长' });
      return;
    }

    const message = await privateMessageModel.createMessage(user.id, data.receiverId, data.content.trim());

    if (userSockets.has(data.receiverId)) {
      userSockets.get(data.receiverId).forEach(socketId => {
        io.to(socketId).emit('dm:message', message);
      });
    }

    socket.emit('dm:message', message);
  });

  socket.on('ai:chat', async (data) => {
    if (!data.content || data.content.trim().length === 0) {
      return;
    }

    if (data.content.length > 2000) {
      socket.emit('ai:error', { message: '消息内容过长' });
      return;
    }

    const useLLM = process.env.USE_LLM === 'true';
    const aiReply = useLLM 
      ? await aiModel.generateReplyWithLLM(data.content.trim(), user.id)
      : await aiModel.generateReply(data.content.trim(), user.id);

    await aiModel.saveChatHistory(user.id, data.content.trim(), aiReply);

    socket.emit('ai:reply', {
      reply: aiReply,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('ai:typing', (data) => {
    socket.emit('ai:typing', { isTyping: data.isTyping });
  });

  socket.on('disconnect', async () => {
    console.log(`[Socket] 用户 ${user.username} 已断开连接`);
    
    if (userSockets.has(user.id)) {
      userSockets.get(user.id).delete(socket.id);
      
      if (userSockets.get(user.id).size === 0) {
        userSockets.delete(user.id);
        await userModel.setOnlineStatus(user.id, false);
      }
    }
    
    const onlineCount = io.sockets.adapter.rooms.get(ONLINE_ROOM)?.size || 0;
    io.to(ONLINE_ROOM).emit('chat:onlineCount', onlineCount);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 服务器已启动: http://localhost:${PORT}`);
  console.log(`📡 Socket.io 已就绪`);
});