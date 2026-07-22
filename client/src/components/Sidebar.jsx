import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/search', label: '搜索', icon: '🔍' },
  { path: '/chat', label: '聊天室', icon: '💬' },
  { path: '/ai', label: 'AI助手', icon: '🤖' },
  { path: '/friends', label: '好友', icon: '👥' },
  { path: '/profile', label: '个人设置', icon: '⚙️' },
];

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">小白网站</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
        
        {isAdmin && (
          <NavLink
            key="/admin"
            to="/admin"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''} admin-nav-item`
            }
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">管理后台</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-info">
          <span className="version">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}