# 小白网站 (Xiaobai Website)

一个全栈实时聊天与 AI 助手网站，专为技术初学者打造。

## ✨ 功能

| 模块 | 说明 |
|------|------|
| 🔐 登录注册 | JWT 认证，安全密码加密 |
| 💬 公屏聊天 | 实时消息，在线人数统计 |
| 📩 私信系统 | 一对一私聊，好友管理 |
| 🤖 AI 助手 | 智能对话（支持接入 OpenAI/Claude） |
| 🔍 内容搜索 | 搜索用户和消息内容 |
| 🛡️ 管理员后台 | 用户管理、消息管理、操作日志 |

## 🛠 技术栈

| 层面 | 技术 |
|------|------|
| 前端 | React 18 + Vite + React Router v6 |
| 后端 | Node.js + Express 4 |
| 数据库 | MySQL 8 |
| 实时通信 | Socket.io 4 |
| 认证 | JWT + bcryptjs |
| 部署 | Nginx + PM2 |

## 🚀 本地开发

### 前置要求

- Node.js 18+
- MySQL 8.0+
- Git

### 快速启动

```bash
# 1. 克隆项目
git clone https://github.com/你的用户名/xiaobai-site.git
cd xiaobai-site

# 2. 安装依赖
npm install
cd client && npm install && cd ../server && npm install && cd ..

# 3. 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS xiaobai_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. 导入表结构和初始数据
mysql -u root -p xiaobai_site < database/schema.sql
mysql -u root -p xiaobai_site < database/seed.sql

# 5. 配置环境变量
cp server/.env.example server/.env
# 编辑 server/.env，填入你的 MySQL 密码和 JWT_SECRET

# 6. 启动开发服务器
npm run dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:3000

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 用户 | testuser | admin123 |
| 用户 | alice | admin123 |
| 用户 | bob | admin123 |

> ⚠️ 生产环境请立即修改默认密码！

## 📦 部署

详见 [DEPLOY.md](DEPLOY.md) 完整部署指南。

```bash
# 快速部署（Ubuntu/Debian）
sudo ./deploy/deploy.sh all
```

## 📁 项目结构

```
xiaobai-site/
├── client/             ← React 前端 (Vite)
│   └── src/
│       ├── api/        ← axios + JWT 拦截器
│       ├── contexts/   ← AuthContext + SocketContext
│       ├── pages/      ← 页面组件（9 个）
│       └── components/ ← 共享组件
├── server/             ← Express 后端
│   ├── routes/         ← API 路由（7 个模块）
│   ├── controllers/    ← 业务逻辑
│   ├── models/         ← 数据库模型
│   └── middleware/     ← 认证/管理员中间件
├── database/           ← SQL 建表 + 种子数据
├── deploy/             ← Nginx 配置 + 部署脚本
├── CLAUDE.md           ← AI 开发指南
├── DEPLOY.md           ← 部署指南
└── ecosystem.config.js ← PM2 配置
```

## 📄 许可证

MIT License
