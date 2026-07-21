import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">首页</h1>
      </div>

      <div className="header-right">
        <div className="user-menu">
          <div className="user-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <div className="user-info">
            <span className="user-name">{user?.username}</span>
            <span className="user-status online">在线</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </header>
  );
}