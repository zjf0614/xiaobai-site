# 小白网站 (Xiaobai Website) - 项目开发指南

## 项目概述

一个全栈实时聊天与 AI 助手网站，面向技术初学者设计。项目采用前后端分离架构，Monorepo 单仓库管理。

**当前状态：阶段 1 完成** — 数据库 + 登录注册已实现。

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
├── package.json                 ← 根脚本（concurrently 启动前后端）
├── .gitignore
│
├── client/                      ← React 前端 (Vite)
│   ├── vite.config.js           ← Vite 配置 + API 代理
│   ├── src/
│   │   ├── main.jsx             ← 入口
│   │   ├── App.jsx              ← 路由配置
│   │   ├── index.css            ← 全局样式 + CSS 变量
│   │   ├── api/client.js        ← axios 实例 + JWT 拦截器
│   │   ├── contexts/            ← React Context (AuthContext 等)
│   │   ├── hooks/               ← 自定义 Hook (useAuth 等)
│   │   ├── pages/               ← 页面组件
│   │   │   └── admin/           ← 管理员页面（阶段 7）
│   │   ├── components/          ← 共享组件
│   │   ├── services/            ← socket.io 客户端
│   │   └── utils/               ← 工具函数
│
├── server/                      ← Express 后端
│   ├── server.js                ← 入口（HTTP + Socket.io）
│   ├── app.js                   ← Express 应用配置
│   ├── .env                     ← 环境变量（不提交 Git）
│   ├── config/db.js             ← MySQL 连接池
│   ├── middleware/               ← 中间件
│   │   ├── auth.js              ← JWT 认证
│   │   ├── admin.js             ← 管理员权限检查
│   │   └── errorHandler.js      ← 全局错误处理
│   ├── routes/                  ← 路由定义（薄层，只定义路径）
│   ├── controllers/             ← 控制器（业务逻辑）
│   ├── models/                  ← 模型（数据库查询）
│   ├── socket/                  ← Socket.io 事件处理
│   └── utils/                   ← 工具（JWT、AI 模拟等）
│
└── database/
    ├── schema.sql               ← 完整建表 DDL（8 张表）
    └── seed.sql                 ← 种子数据
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

## 已实现的 API

### 认证模块 `/api/auth`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 注册 | 否 |
| POST | `/api/auth/login` | 登录 | 否 |
| GET | `/api/auth/me` | 获取当前用户 | 是 |

## 架构约定

### 认证流程
1. 用户注册/登录 → 服务端返回 JWT
2. 前端 AuthContext 将 token 存入 localStorage
3. axios 拦截器自动在所有请求头附加 `Authorization: Bearer <token>`
4. auth 中间件验证 token，将用户信息注入 `req.user`（含 id, username, role）
5. 401 响应时拦截器自动清除 token 并跳转登录页

### 状态管理（三个 Context）
- **AuthContext**: user, token, isAuthenticated, isLoading, login(), register(), logout()
- **ChatContext**: （阶段 3 实现）消息列表、在线用户、socket 事件
- **UIContext**: （后续实现）侧边栏、主题、Toast 通知

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

## 后续阶段

### 阶段 2：布局 + 导航
- 创建 Layout 组件（Navbar + Sidebar + Outlet）
- 所有页面占位组件
- 完善路由

### 阶段 3：公屏聊天
- Socket.io 服务端 JWT 认证
- public:send / public:new_message 事件
- PublicChatPage 完整 UI

### 阶段 4：私信 + 好友
- 好友请求系统
- 私信 Socket.io 事件
- 在线状态 + 未读计数

### 阶段 5：AI 助手
- AI 对话界面
- simulateAI.js 模拟回复
- 架构预留真实 API 接口

### 阶段 6：搜索
- 搜索 API + SearchPage

### 阶段 7：管理员后台
- AdminDashboard / AdminUsers / AdminMessages / AdminLogs

### 阶段 8：部署
- Nginx + PM2 配置
- DEPLOY.md 部署指南

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
