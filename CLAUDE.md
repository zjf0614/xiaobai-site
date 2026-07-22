# 小白网站 (Xiaobai Website) - 项目开发指南

## 项目概述

一个全栈实时聊天与 AI 助手网站，面向技术初学者设计。项目采用前后端分离架构，Monorepo 单仓库管理。

**当前状态：全部 8 阶段完成** — 所有功能模块已实现，可部署上线。

## 技术栈

| 层面 | 技术 | 说明 |
|------|------|------|
| 前端 | React 18 + Vite + React Router v6 | 使用 JSX（非 TypeScript） |
| 后端 | Node.js + Express 4 | MVC-lite 架构 (Routes/Controllers/Models) |
| 数据库 | MySQL 8 (mysql2 驱动) | utf8mb4 编码，参数化查询 |
| 实时通信 | Socket.io 4 | JWT 认证，房间广播 |
| 认证 | JWT (jsonwebtoken) | localStorage 存储，axios 拦截器注入 |
| 密码加密 | bcryptjs | 10 轮 salt |
| CSS | 普通 CSS + CSS 变量 | 不用 Tailwind，不用 CSS-in-JS |
| HTTP 客户端 | axios | 封装在 `client/src/api/client.js` |
| 部署 | Nginx + PM2 | 静态服务 + 反向代理 + 进程守护 |

## 快速启动

```bash
# 1. 安装所有依赖
npm install && cd client && npm install && cd ../server && npm install && cd ..

# 2. 创建 MySQL 数据库（需要已安装 MySQL）
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS xiaobai_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. 运行建表 + 种子数据
mysql -u root -p xiaobai_site < database/schema.sql
mysql -u root -p xiaobai_site < database/seed.sql

# 4. 配置 server/.env（修改数据库密码和 JWT_SECRET）
cp server/.env.example server/.env

# 5. 启动开发服务器
npm run dev
# 前端: http://localhost:5173
# 后端: http://localhost:3000
```

**默认管理员账号：** admin / admin123（请立即修改！）

## 项目结构

```
小白网站/
├── CLAUDE.md                    ← 本文件（AI 开发指南）
├── README.md                    ← 项目说明
├── DEPLOY.md                    ← 部署指南
├── package.json                 ← 根脚本（concurrently 启动前后端）
├── ecosystem.config.js          ← PM2 配置
├── .gitignore
│
├── client/                      ← React 前端 (Vite)
│   ├── vite.config.js           ← Vite 配置 + API 代理 + 构建优化
│   ├── src/
│   │   ├── main.jsx             ← 入口
│   │   ├── App.jsx              ← 路由配置（9 个页面）
│   │   ├── index.css            ← 全局样式 + CSS 变量（含侧边栏/聊天/搜索等）
│   │   ├── api/client.js        ← axios 实例 + JWT 拦截器
│   │   ├── contexts/            ← React Context
│   │   │   ├── AuthContext.jsx  ← 认证状态
│   │   │   └── SocketContext.jsx ← 实时通信状态
│   │   ├── hooks/               ← 自定义 Hook (useAuth 等)
│   │   ├── pages/               ← 页面组件
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ChatPage.jsx     ← 公屏聊天
│   │   │   ├── FriendsPage.jsx  ← 好友 + 私信
│   │   │   ├── AiPage.jsx       ← AI 助手
│   │   │   ├── SearchPage.jsx   ← 内容搜索
│   │   │   ├── ProfilePage.jsx
│   │   │   └── AdminPage.jsx    ← 管理员后台
│   │   ├── components/          ← 共享组件
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── AuthGuard.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   └── utils/               ← 工具函数
│
├── server/                      ← Express 后端
│   ├── server.js                ← 入口（HTTP + Socket.io 全部事件处理）
│   ├── app.js                   ← Express 应用配置
│   ├── .env                     ← 环境变量（不提交 Git）
│   ├── .env.example             ← 环境变量模板
│   ├── config/db.js             ← MySQL 连接池
│   ├── middleware/               ← 中间件
│   │   ├── auth.js              ← JWT 认证
│   │   ├── admin.js             ← 管理员权限检查
│   │   └── errorHandler.js      ← 全局错误处理
│   ├── routes/                  ← 路由定义（7 个模块）
│   │   ├── auth.routes.js
│   │   ├── message.routes.js
│   │   ├── friend.routes.js
│   │   ├── privateMessage.routes.js
│   │   ├── ai.routes.js
│   │   ├── search.routes.js
│   │   └── admin.routes.js
│   ├── controllers/             ← 控制器（7 个，一一对应 routes）
│   ├── models/                  ← 模型（7 个，一一对应 controllers）
│   └── utils/                   ← 工具（JWT 等）
│
├── database/
│   ├── schema.sql               ← 完整建表 DDL（8 张表）
│   └── seed.sql                 ← 种子数据
│
└── deploy/
    ├── nginx.conf                ← Nginx 配置模板
    └── deploy.sh                 ← 一键部署脚本
```

## 数据库表（8 张）

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `users` | 用户 | id, username, email, password_hash, role(enum:user/admin), avatar_url, is_online |
| `public_messages` | 公屏消息 | id, user_id(FK), content, created_at |
| `private_messages` | 私信 | id, sender_id(FK), receiver_id(FK), content, is_read |
| `ai_conversations` | AI 对话 | id, user_id(FK), title |
| `ai_messages` | AI 消息 | id, conversation_id(FK), sender_type(enum:user/ai), content |
| `friends` | 好友关系 | id, user_id(FK), friend_id(FK), status(enum:pending/accepted/blocked) |
| `search_history` | 搜索历史 | id, user_id(FK), query, result_count |
| `admin_actions_log` | 管理员操作日志 | id, admin_id(FK), action, target_type, target_id, description |

## 全部 API 端点

### 认证模块 `/api/auth`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 注册 | 否 |
| POST | `/api/auth/login` | 登录 | 否 |
| GET | `/api/auth/me` | 获取当前用户 | 是 |

### 公屏消息 `/api`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/messages?page=&limit=` | 获取历史消息（分页） | 是 |
| DELETE | `/api/messages/:id` | 删除消息（管理员或本人） | 是 |

### 私信 `/api`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/private-messages/:userId?page=&limit=` | 获取与某用户的私信 | 是 |
| GET | `/api/private-messages/unread/count` | 未读消息数 | 是 |
| POST | `/api/private-messages/:userId/read` | 标记已读 | 是 |

### 好友 `/api`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/friends` | 好友列表 | 是 |
| POST | `/api/friends/request/:userId` | 发送好友请求 | 是 |
| PUT | `/api/friends/accept/:userId` | 接受好友请求 | 是 |
| DELETE | `/api/friends/:userId` | 删除好友 | 是 |
| GET | `/api/friends/requests/pending` | 待处理请求 | 是 |

### AI 助手 `/api`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/ai/conversations` | 对话列表 | 是 |
| POST | `/api/ai/conversations` | 创建新对话 | 是 |
| GET | `/api/ai/conversations/:id/messages` | 对话消息 | 是 |
| POST | `/api/ai/chat` | 发送消息（模拟/AI回复） | 是 |
| DELETE | `/api/ai/conversations/:id` | 删除对话 | 是 |

### 搜索 `/api`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/search?q=&type=all|users|messages` | 搜索 | 是 |
| GET | `/api/search/history` | 搜索历史 | 是 |
| DELETE | `/api/search/history` | 清除搜索历史 | 是 |

### 管理员 `/api`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/admin/users?page=&limit=` | 用户列表 | 管理员 |
| GET | `/api/admin/users/:id` | 用户详情 | 管理员 |
| PUT | `/api/admin/users/:id` | 编辑用户 | 管理员 |
| DELETE | `/api/admin/users/:id` | 删除用户 | 管理员 |
| GET | `/api/admin/messages?page=&limit=` | 公屏消息列表 | 管理员 |
| DELETE | `/api/admin/messages/:id` | 删除消息 | 管理员 |
| GET | `/api/admin/logs?page=&limit=` | 操作日志 | 管理员 |
| GET | `/api/admin/stats` | 仪表盘统计 | 管理员 |

## Socket.io 事件

### 公屏聊天
| 事件 | 方向 | 说明 |
|------|------|------|
| `chat:message` | Client→Server | 发送公屏消息 |
| `chat:message` | Server→Client | 广播新消息 |
| `chat:onlineCount` | Server→Client | 在线人数 |

### 私信
| 事件 | 方向 | 说明 |
|------|------|------|
| `dm:send` | Client→Server | 发送私信 |
| `dm:message` | Server→Client | 接收私信 |

### AI 助手
| 事件 | 方向 | 说明 |
|------|------|------|
| `ai:chat` | Client→Server | 发送 AI 对话 |
| `ai:reply` | Server→Client | AI 回复 |
| `ai:typing` | Client→Server/Server→Client | 输入状态 |

## 架构约定

### 认证流程
1. 用户注册/登录 → 服务端返回 JWT
2. 前端 AuthContext 将 token 存入 localStorage
3. axios 拦截器自动在所有请求头附加 `Authorization: Bearer <token>`
4. auth 中间件验证 token，将用户信息注入 `req.user`（含 id, username, role）
5. 401 响应时拦截器自动清除 token 并跳转登录页
6. Socket.io 连接时发送 token 进行认证

### 状态管理（两个 Context）
- **AuthContext**: user, token, isAuthenticated, isLoading, login(), register(), logout()
- **SocketContext**: 在线用户列表、在线人数、socket 连接管理
- 各页面自行管理本页数据（消息列表等），不通过全局 Context

### 后端模式
- **Routes** → 只定义 HTTP 方法和路径，调用 controller
- **Controllers** → 处理请求验证和业务逻辑，调用 model
- **Models** → 纯数据库查询函数，返回数据
- **Middleware** → 认证、授权、错误处理
- 所有 SQL 查询必须使用参数化查询 `pool.query('...', [param])`，禁止字符串拼接

### 前端模式
- 函数组件 + Hooks，不使用 Class 组件
- 文件命名：组件用 PascalCase（`LoginPage.jsx`），工具用 camelCase（`client.js`）
- CSS class 用 kebab-case
- 中文注释用于解释业务逻辑

### 错误处理
- 后端统一返回 `{ error: string }` 格式
- 前端 apiClient 拦截器统一处理 401
- Controller 中用 try/catch 并通过 `next(err)` 传递给 errorHandler

### Socket.io 事件处理
- 所有 socket 事件处理集中在 `server/server.js` 中
- 用户-socket 映射存储在 `userSockets` Map（userId → Set<socketId>）
- 在线状态变化时广播给所有在线用户
- 消息长度限制 2000 字符

## 部署

详见 [DEPLOY.md](DEPLOY.md)。

```bash
# 构建前端
npm run build    # → client/dist/

# 生产启动
pm2 start ecosystem.config.js

# Nginx 配置见 deploy/nginx.conf
```

## 环境变量

**server/.env:**
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # 你的 MySQL 密码
DB_NAME=xiaobai_site
JWT_SECRET=           # 随机字符串，用于签名 JWT
JWT_EXPIRES_IN=7d
USE_LLM=false         # 是否启用真实 AI（false=模拟回复）
LLM_API_KEY=          # AI API Key（可选）
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-3.5-turbo
```

**client/.env（可选）:**
```
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

## 命令参考

```bash
npm run dev          # 同时启动前后端开发服务器
npm run dev:client   # 只启动前端 (port 5173)
npm run dev:server   # 只启动后端 (port 3000)
npm run build        # 构建前端到 client/dist/
npm run db:init      # 初始化数据库表
npm run db:seed      # 导入种子数据
```
