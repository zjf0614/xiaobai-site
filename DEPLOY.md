# 小白网站 - 部署指南

本指南教你如何将小白网站部署到一台 **Ubuntu/Debian 服务器**上。

## 📋 前置要求

- 一台服务器（推荐 Ubuntu 20.04+ 或 Debian 11+）
- 一个域名（可选，用于配置 HTTPS）
- 服务器已开放 80、443 端口（防火墙/安全组）
- 本指南假设你已通过 SSH 连接到服务器

## 🚀 快速部署（一键脚本）

```bash
# 1. SSH 登录服务器
ssh root@你的服务器IP

# 2. 克隆代码
git clone https://github.com/你的用户名/xiaobai-site.git /var/www/xiaobai-site
cd /var/www/xiaobai-site

# 3. 运行部署脚本
chmod +x deploy/deploy.sh
sudo ./deploy/deploy.sh all
```

脚本会引导你完成以下步骤：
1. 安装系统依赖（Nginx、MySQL、Node.js、PM2）
2. 配置数据库
3. 克隆/更新代码
4. 安装 Node.js 依赖并构建前端
5. 配置环境变量
6. 配置 Nginx
7. 启动应用

---

## 📖 手动部署（逐步操作）

### 步骤 1：安装系统依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y nginx mysql-server git curl

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v   # 应输出 v20.x.x
npm -v    # 应输出 10.x.x

# 安装 PM2（全局）
sudo npm install -g pm2
```

### 步骤 2：配置 MySQL 数据库

```bash
# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 登录并创建数据库
sudo mysql -u root
```

在 MySQL 命令行中执行：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS xiaobai_site
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 创建专用用户（替换 your_password 为强密码）
CREATE USER IF NOT EXISTS 'xiaobai_user'@'localhost'
  IDENTIFIED BY 'your_password';

-- 授权
GRANT ALL PRIVILEGES ON xiaobai_site.* TO 'xiaobai_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# 导入表结构和种子数据
mysql -u xiaobai_user -p xiaobai_site < database/schema.sql
mysql -u xiaobai_user -p xiaobai_site < database/seed.sql
```

### 步骤 3：部署代码

```bash
# 创建应用目录
sudo mkdir -p /var/www/xiaobai-site
sudo chown $USER:$USER /var/www/xiaobai-site

# 克隆代码
git clone https://github.com/你的用户名/xiaobai-site.git /var/www/xiaobai-site
cd /var/www/xiaobai-site
```

### 步骤 4：安装依赖并构建

```bash
# 安装后端依赖
cd /var/www/xiaobai-site/server
npm install --production

# 安装前端依赖并构建
cd /var/www/xiaobai-site/client
npm install
npm run build
# 构建产物在 client/dist/ 目录
```

### 步骤 5：配置环境变量

```bash
cd /var/www/xiaobai-site/server
cp .env.example .env
nano .env   # 修改数据库密码和 JWT_SECRET
```

**重要配置项：**

```env
PORT=3000
DB_HOST=localhost
DB_USER=xiaobai_user
DB_PASSWORD=你设置的数据库密码
DB_NAME=xiaobai_site
JWT_SECRET=使用随机生成的32位字符串
JWT_EXPIRES_IN=7d
USE_LLM=false
```

> 生成随机 JWT_SECRET：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 步骤 6：配置 Nginx

```bash
# 复制 Nginx 配置文件
sudo cp /var/www/xiaobai-site/deploy/nginx.conf /etc/nginx/sites-available/xiaobai-site

# 修改域名（将 your-domain.com 替换为你的实际域名或服务器 IP）
sudo nano /etc/nginx/sites-available/xiaobai-site

# 启用站点
sudo ln -sf /etc/nginx/sites-available/xiaobai-site /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 步骤 7：启动应用

```bash
cd /var/www/xiaobai-site

# 创建日志目录
mkdir -p logs

# 用 PM2 启动
pm2 start ecosystem.config.js

# 设置开机自启
pm2 save
pm2 startup
```

---

## 🔧 日常运维命令

### PM2 进程管理

```bash
pm2 list               # 查看所有进程状态
pm2 logs xiaobai-api   # 查看实时日志
pm2 restart xiaobai-api # 重启应用
pm2 stop xiaobai-api   # 停止应用
pm2 delete xiaobai-api # 删除进程
pm2 monit              # 实时监控面板
```

### 更新代码

```bash
cd /var/www/xiaobai-site
git pull origin main

# 安装新依赖（如有）
cd server && npm install --production && cd ..
cd client && npm install && npm run build && cd ..

# 重启应用
pm2 restart xiaobai-api
```

### 查看日志

```bash
# PM2 日志
pm2 logs xiaobai-api

# Nginx 日志
sudo tail -f /var/log/nginx/xiaobai-site.access.log
sudo tail -f /var/log/nginx/xiaobai-site.error.log
```

---

## 🔒 配置 HTTPS（推荐）

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 自动配置 SSL（替换为你的域名）
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

---

## 📁 目录结构（生产环境）

```
/var/www/xiaobai-site/
├── ecosystem.config.js    ← PM2 配置
├── client/dist/           ← 前端构建产物（Nginx 静态服务）
├── server/                ← 后端代码
│   ├── .env               ← 生产环境配置
│   └── server.js          ← 入口
├── database/              ← SQL 脚本
├── logs/                  ← PM2 日志
└── deploy/                ← 部署相关文件
```

---

## ⚠️ 常见问题

### 1. 数据库连接失败
- 检查 MySQL 是否启动：`sudo systemctl status mysql`
- 检查 `.env` 中的数据库密码是否正确
- 检查用户权限：`mysql -u xiaobai_user -p`

### 2. Nginx 502 Bad Gateway
- 检查后端是否在运行：`pm2 list`
- 检查端口是否正确：`sudo netstat -tlnp | grep 3000`

### 3. WebSocket 连接失败
- 确认 Nginx 配置中有 `/socket.io/` 的代理块
- 确认 `proxy_http_version 1.1` 和 `Upgrade` 头配置正确

### 4. 页面刷新 404
- 确认 Nginx 配置中有 `try_files $uri $uri/ /index.html;`

---

## 🎯 首次部署检查清单

- [ ] 服务器安全组/防火墙开放 80 和 443 端口
- [ ] MySQL 已安装并创建数据库
- [ ] 代码已克隆到 `/var/www/xiaobai-site`
- [ ] `npm run build` 构建成功
- [ ] `server/.env` 已配置（数据库密码、JWT_SECRET）
- [ ] Nginx 配置已启用且测试通过
- [ ] PM2 已启动且应用运行正常
- [ ] 浏览器访问正常
- [ ] 登录功能正常（默认账号：admin / admin123）
- [ ] HTTPS 已配置（可选）
