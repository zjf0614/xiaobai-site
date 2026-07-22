const adminModel = require('../models/admin.model');

class AdminController {
  async getStats(req, res) {
    try {
      const stats = await adminModel.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('[Admin Controller] Get stats error:', error.message);
      res.status(500).json({ error: '获取统计数据失败' });
    }
  }

  async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await adminModel.getUsers(parseInt(page), parseInt(limit), search);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('[Admin Controller] Get users error:', error.message);
      res.status(500).json({ error: '获取用户列表失败' });
    }
  }

  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await adminModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('[Admin Controller] Get user error:', error.message);
      res.status(500).json({ error: '获取用户信息失败' });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: '无效的角色类型' });
      }

      const user = await adminModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      if (user.role === role) {
        return res.status(400).json({ error: '用户已是该角色' });
      }

      await adminModel.updateUserRole(userId, role);
      await adminModel.addAdminLog(
        req.user.id,
        'update_role',
        'user',
        userId,
        `将用户 ${user.username} 的角色从 ${user.role} 改为 ${role}`
      );

      res.json({ success: true, message: '角色更新成功' });
    } catch (error) {
      console.error('[Admin Controller] Update user role error:', error.message);
      res.status(500).json({ error: '更新角色失败' });
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await adminModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      if (user.role === 'admin') {
        return res.status(403).json({ error: '无法删除管理员' });
      }

      await adminModel.deleteUser(userId);
      await adminModel.addAdminLog(
        req.user.id,
        'delete_user',
        'user',
        userId,
        `删除用户 ${user.username}`
      );

      res.json({ success: true, message: '用户删除成功' });
    } catch (error) {
      console.error('[Admin Controller] Delete user error:', error.message);
      res.status(500).json({ error: '删除用户失败' });
    }
  }

  async getPublicMessages(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await adminModel.getPublicMessages(parseInt(page), parseInt(limit), search);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('[Admin Controller] Get public messages error:', error.message);
      res.status(500).json({ error: '获取公屏消息失败' });
    }
  }

  async deletePublicMessage(req, res) {
    try {
      const { messageId } = req.params;

      await adminModel.deletePublicMessage(messageId);
      await adminModel.addAdminLog(
        req.user.id,
        'delete_public_message',
        'public_message',
        messageId,
        '删除公屏消息'
      );

      res.json({ success: true, message: '消息删除成功' });
    } catch (error) {
      console.error('[Admin Controller] Delete public message error:', error.message);
      res.status(500).json({ error: '删除消息失败' });
    }
  }

  async getPrivateMessages(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await adminModel.getPrivateMessages(parseInt(page), parseInt(limit), search);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('[Admin Controller] Get private messages error:', error.message);
      res.status(500).json({ error: '获取私信失败' });
    }
  }

  async deletePrivateMessage(req, res) {
    try {
      const { messageId } = req.params;

      await adminModel.deletePrivateMessage(messageId);
      await adminModel.addAdminLog(
        req.user.id,
        'delete_private_message',
        'private_message',
        messageId,
        '删除私信'
      );

      res.json({ success: true, message: '私信删除成功' });
    } catch (error) {
      console.error('[Admin Controller] Delete private message error:', error.message);
      res.status(500).json({ error: '删除私信失败' });
    }
  }

  async getAdminLogs(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await adminModel.getAdminLogs(parseInt(page), parseInt(limit));
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('[Admin Controller] Get admin logs error:', error.message);
      res.status(500).json({ error: '获取管理员日志失败' });
    }
  }
}

module.exports = new AdminController();