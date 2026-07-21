import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>个人设置</h2>
      <div style={{ marginTop: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          padding: '16px',
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px'
          }}>
            👤
          </div>
          <div>
            <h3 style={{ marginBottom: '4px' }}>{user?.username}</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}