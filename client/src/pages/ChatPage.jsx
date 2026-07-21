import { useState, useEffect, useRef, useContext } from 'react';
import apiClient from '../api/client';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { socket, isConnected, onlineCount, sendMessage } = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    apiClient.get('/messages')
      .then((data) => {
        setMessages(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleError = (err) => {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:error', handleError);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:error', handleError);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !isConnected) return;
    
    sendMessage(inputValue);
    setInputValue('');
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>加载消息中...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>公屏聊天室</h2>
        <div className="online-status">
          <span className="online-dot"></span>
          <span>{onlineCount} 人在线</span>
        </div>
      </div>

      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>还没有消息，快来发送第一条吧！</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-item ${msg.user_id === user?.id ? 'self' : ''}`}
            >
              <div className="message-avatar">
                {msg.avatar_url ? (
                  <img src={msg.avatar_url} alt={msg.username} />
                ) : (
                  <span className="avatar-placeholder">👤</span>
                )}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-username">{msg.username}</span>
                  <span className="message-time">{formatTime(msg.created_at)}</span>
                </div>
                <div className="message-text">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入消息..."
            disabled={!isConnected}
          />
          <button type="submit" className="chat-send-btn" disabled={!isConnected || !inputValue.trim()}>
            发送
          </button>
        </form>
        {!isConnected && (
          <div className="connection-status offline">
            <span className="status-dot"></span>
            <span>连接断开，无法发送消息</span>
          </div>
        )}
      </div>
    </div>
  );
}