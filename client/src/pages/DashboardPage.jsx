// 首页/仪表盘（阶段 1 占位，阶段 2 完善）
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1>欢迎，{user?.username}！</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
        这是你的个人主页。更多功能正在开发中...
      </p>
    </div>
  );
}
