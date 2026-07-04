// 认证状态管理 —— 提供登录、注册、登出功能
import { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // 应用启动时，用存储的 token 获取用户信息
  useEffect(() => {
    if (token) {
      apiClient.get('/auth/me')
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          // token 无效，清除
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  /** 登录 */
  const login = useCallback(async (username, password) => {
    const res = await apiClient.post('/auth/login', { username, password });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  /** 注册 */
  const register = useCallback(async (username, email, password) => {
    const res = await apiClient.post('/auth/register', { username, email, password });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  /** 登出 */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
