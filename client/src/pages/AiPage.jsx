import { useState, useEffect, useRef, useContext } from 'react';
import apiClient from '../api/client';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';

export default function AiPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { socket, isConnected } = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    apiClient.get('/ai/history')
      .then((response) => {
        if (response.data && response.data.data) {
          setMessages(response.data.data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleAiReply = (data) => {
      setIsAiTyping(false);
      setMessages(prev => [...prev, {
        sender_type: 'ai',
        content: data.reply,
        created_at: data.timestamp
      }]);
    };

    const handleAiTyping = (data) => {
      setIsAiTyping(data.isTyping);
    };

    const handleAiError = (err) => {
      setError(err.message);
      setIsAiTyping(false);
      setTimeout(() => setError(null), 3000);
    };

    socket.on('ai:reply', handleAiReply);
    socket.on('ai:typing', handleAiTyping);
    socket.on('ai:error', handleAiError);

    return () => {
      socket.off('ai:reply', handleAiReply);
      socket.off('ai:typing', handleAiTyping);
      socket.off('ai:error', handleAiError);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !isConnected || isAiTyping) return;

    const userMessage = inputValue.trim();
    
    setMessages(prev => [...prev, {
      sender_type: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    }]);

    setIsAiTyping(true);
    setInputValue('');

    if (socket) {
      socket.emit('ai:chat', { content: userMessage });
    }
  };

  const handleClearHistory = () => {
    if (confirm('确定要清空聊天记录吗？')) {
      apiClient.delete('/ai/history')
        .then(() => {
          setMessages([]);
        })
        .catch(() => {
          setError('清空失败，请重试');
          setTimeout(() => setError(null), 3000);
        });
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>加载聊天记录中...</p>
      </div>
    );
  }

  return (
    <div className="ai-container">
      <div className="ai-header">
        <div className="ai-info">
          <div className="ai-avatar">🤖</div>
          <div>
            <h2>小白助手</h2>
            <span className="ai-status">在线</span>
          </div>
        </div>
        <button 
          className="ai-clear-btn" 
          onClick={handleClearHistory}
          title="清空聊天记录"
        >
          清空记录
        </button>
      </div>

      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}

      <div className="ai-messages">
        {messages.length === 0 ? (
          <div className="ai-welcome">
            <div className="welcome-icon">✨</div>
            <h3>你好！我是小白助手</h3>
            <p>有什么可以帮你的吗？</p>
            <div className="welcome-tips">
              <span className="tip">💡 试试问我：</span>
              <div className="tip-examples">
                <button 
                  onClick={() => setInputValue('你好')}
                  className="tip-btn"
                >你好</button>
                <button 
                  onClick={() => setInputValue('讲个笑话')}
                  className="tip-btn"
                >讲个笑话</button>
                <button 
                  onClick={() => setInputValue('现在几点')}
                  className="tip-btn"
                >现在几点</button>
                <button 
                  onClick={() => setInputValue('有什么功能')}
                  className="tip-btn"
                >有什么功能</button>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`ai-message-item ${msg.sender_type === 'user' ? 'self' : ''}`}
            >
              <div className="ai-message-avatar">
                {msg.sender_type === 'ai' ? (
                  <span>🤖</span>
                ) : user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className="ai-message-content">
                <div className="ai-message-header">
                  <span className="ai-message-username">
                    {msg.sender_type === 'ai' ? '小白助手' : user?.username}
                  </span>
                  <span className="ai-message-time">{formatTime(msg.created_at)}</span>
                </div>
                <div className="ai-message-text">{msg.content}</div>
              </div>
            </div>
          ))
        )}

        {isAiTyping && (
          <div className="ai-typing">
            <div className="ai-typing-avatar">🤖</div>
            <div className="ai-typing-content">
              <span className="ai-typing-text">正在输入...</span>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="ai-input-area">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="ai-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入消息..."
            disabled={!isConnected || isAiTyping}
          />
          <button 
            type="submit" 
            className="ai-send-btn" 
            disabled={!isConnected || !inputValue.trim() || isAiTyping}
          >
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