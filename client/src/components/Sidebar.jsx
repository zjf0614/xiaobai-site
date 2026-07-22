import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/search', label: '搜索', icon: '🔍' },
  { path: '/chat', label: '聊天室', icon: '💬' },
  { path: '/ai', label: 'AI助手', icon: '🤖' },
  { path: '/friends', label: '好友', icon: '👥' },
  { path: '/profile', label: '个人设置', icon: '⚙️' },
];

export default function Sidebar() {
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
      </nav>

      <div className="sidebar-footer">
        <div className="footer-info">
          <span className="version">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}