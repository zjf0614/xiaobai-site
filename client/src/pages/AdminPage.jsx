import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

const tabs = [
  { id: 'dashboard', label: '仪表盘', icon: '📊' },
  { id: 'users', label: '用户管理', icon: '👥' },
  { id: 'public-messages', label: '公屏消息', icon: '💬' },
  { id: 'private-messages', label: '私信管理', icon: '📩' },
  { id: 'logs', label: '操作日志', icon: '📝' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [publicMessages, setPublicMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      if (response.data && response.data.data) {
        setStats(response.data.data);
      }
    } catch (err) {
      setError('获取统计数据失败');
      setTimeout(() => setError(null), 3000);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await apiClient.get('/admin/users', { params });
      if (response.data && response.data.data) {
        setUsers(response.data.data.users);
      }
    } catch (err) {
      setError('获取用户列表失败');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const loadPublicMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await apiClient.get('/admin/messages/public', { params });
      if (response.data && response.data.data) {
        setPublicMessages(response.data.data.messages);
      }
    } catch (err) {
      setError('获取公屏消息失败');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const loadPrivateMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await apiClient.get('/admin/messages/private', { params });
      if (response.data && response.data.data) {
        setPrivateMessages(response.data.data.messages);
      }
    } catch (err) {
      setError('获取私信失败');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/admin/logs');
      if (response.data && response.data.data) {
        setLogs(response.data.data.logs);
      }
    } catch (err) {
      setError('获取日志失败');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'public-messages') {
      loadPublicMessages();
    } else if (activeTab === 'private-messages') {
      loadPrivateMessages();
    } else if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab, loadStats, loadUsers, loadPublicMessages, loadPrivateMessages, loadLogs]);

  const handleUpdateRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`确定要将该用户角色改为${newRole === 'admin' ? '管理员' : '普通用户'}吗？`)) {
      return;
    }

    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
      loadUsers();
    } catch (err) {
      setError('更新角色失败');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`确定要删除用户 ${username} 吗？此操作不可撤销！`)) {
      return;
    }

    try {
      await apiClient.delete(`/admin/users/${userId}`);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || '删除用户失败');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteMessage = async (messageId, type) => {
    if (!confirm('确定要删除这条消息吗？')) {
      return;
    }

    try {
      if (type === 'public') {
        await apiClient.delete(`/admin/messages/public/${messageId}`);
        loadPublicMessages();
      } else {
        await apiClient.delete(`/admin/messages/private/${messageId}`);
        loadPrivateMessages();
      }
    } catch (err) {
      setError('删除消息失败');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN');
  };

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.users?.total || 0}</div>
            <div className="stat-label">总用户数</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.users?.online || 0}</div>
            <div className="stat-label">在线用户</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.messages?.public || 0}</div>
            <div className="stat-label">公屏消息</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📩</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.messages?.private || 0}</div>
            <div className="stat-label">私信消息</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👫</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.friends || 0}</div>
            <div className="stat-label">好友关系</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.aiConversations || 0}</div>
            <div className="stat-label">AI对话</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-content">
      <div className="admin-search">
        <input
          type="text"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索用户名或邮箱..."
        />
      </div>
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>{user.role === 'admin' ? '管理员' : '用户'}</span>
                </td>
                <td>
                  <span className={`status-badge ${user.is_online ? 'online' : 'offline'}`}>
                    {user.is_online ? '在线' : '离线'}
                  </span>
                </td>
                <td>{formatTime(user.created_at)}</td>
                <td>
                  <div className="admin-actions">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleUpdateRole(user.id, user.role)}
                    >
                      {user.role === 'admin' ? '降级' : '设为管理员'}
                    </button>
                    {user.role !== 'admin' && (
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                      >
                        删除
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderPublicMessages = () => (
    <div className="admin-content">
      <div className="admin-search">
        <input
          type="text"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索消息内容..."
        />
      </div>
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>发送者</th>
              <th>内容</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {publicMessages.map((msg) => (
              <tr key={msg.id}>
                <td>{msg.id}</td>
                <td>{msg.username}</td>
                <td className="message-content-cell">{msg.content}</td>
                <td>{formatTime(msg.created_at)}</td>
                <td>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteMessage(msg.id, 'public')}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderPrivateMessages = () => (
    <div className="admin-content">
      <div className="admin-search">
        <input
          type="text"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索消息内容..."
        />
      </div>
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>发送者</th>
              <th>接收者</th>
              <th>内容</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {privateMessages.map((msg) => (
              <tr key={msg.id}>
                <td>{msg.id}</td>
                <td>{msg.sender_username}</td>
                <td>{msg.receiver_username}</td>
                <td className="message-content-cell">{msg.content}</td>
                <td>{formatTime(msg.created_at)}</td>
                <td>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteMessage(msg.id, 'private')}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderLogs = () => (
    <div className="admin-content">
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>管理员</th>
              <th>操作</th>
              <th>目标类型</th>
              <th>目标ID</th>
              <th>描述</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.admin_username}</td>
                <td><span className="action-badge">{log.action.replace(/_/g, ' ')}</span></td>
                <td>{log.target_type || '-'}</td>
                <td>{log.target_id || '-'}</td>
                <td className="log-desc-cell">{log.description}</td>
                <td>{formatTime(log.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>⚙️ 管理员后台</h1>
        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'public-messages' && renderPublicMessages()}
      {activeTab === 'private-messages' && renderPrivateMessages()}
      {activeTab === 'logs' && renderLogs()}
    </div>
  );
}