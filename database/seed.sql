-- ============================================
-- 小白网站 - 种子数据（初始数据）
-- 使用方法: mysql -u root -p xiaobai_site < seed.sql
-- ============================================

USE xiaobai_site;

-- ============================================
-- 管理员账号 (密码: admin123，已用 bcrypt 加密)
-- 生产环境请立即修改密码！
-- ============================================
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@xiaobai.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
('testuser', 'test@xiaobai.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user'),
('alice', 'alice@xiaobai.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user'),
('bob', 'bob@xiaobai.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user');

-- ============================================
-- 示例公屏消息
-- ============================================
INSERT INTO public_messages (user_id, content) VALUES
(1, '欢迎来到小白网站！这是公屏聊天区，大家可以在这里自由交流 🎉'),
(2, '大家好，我是测试用户~'),
(3, '有人一起讨论技术话题吗？'),
(4, '这里好棒！界面很清爽');
