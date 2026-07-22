import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';

const searchTypes = [
  { value: 'all', label: '全部', icon: '🔍' },
  { value: 'users', label: '用户', icon: '👤' },
  { value: 'public', label: '公屏消息', icon: '💬' },
  { value: 'private', label: '私信', icon: '📩' },
  { value: 'ai', label: 'AI对话', icon: '🤖' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trending, setTrending] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/search/history')
      .then((response) => {
        if (response.data && response.data.data) {
          setSearchHistory(response.data.data);
        }
      })
      .catch(() => {});

    apiClient.get('/search/trending')
      .then((response) => {
        if (response.data && response.data.data) {
          setTrending(response.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiClient.get('/search', {
        params: { q: query.trim(), type: searchType }
      });

      if (response.data && response.data.results) {
        setResults(response.data);
      }
    } catch (err) {
      setError('搜索失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [query, searchType]);

  const handleClearHistory = () => {
    if (confirm('确定要清空搜索历史吗？')) {
      apiClient.delete('/search/history')
        .then(() => {
          setSearchHistory([]);
        })
        .catch(() => {
          setError('清空失败');
          setTimeout(() => setError(null), 3000);
        });
    }
  };

  const handleQuickSearch = (q) => {
    setQuery(q);
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const highlightText = (text, keyword) => {
    if (!keyword || !text) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索用户、消息、对话..."
            />
            <button type="submit" className="search-submit-btn" disabled={isLoading || !query.trim()}>
              搜索
            </button>
          </div>
        </form>

        <div className="search-filters">
          {searchTypes.map((type) => (
            <button
              key={type.value}
              className={`filter-btn ${searchType === type.value ? 'active' : ''}`}
              onClick={() => setSearchType(type.value)}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>搜索中...</p>
        </div>
      ) : results ? (
        <div className="search-results">
          <div className="results-summary">
            找到 <strong>{results.total}</strong> 条结果
          </div>

          {(results.results.users && results.results.users.length > 0) && (
            <div className="result-section">
              <h3 className="section-title">
                👤 用户 ({results.results.users.length})
              </h3>
              <div className="result-list">
                {results.results.users.map((user) => (
                  <div key={user.id} className="result-item user-item">
                    <div className="result-avatar">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} />
                      ) : (
                        <span>👤</span>
                      )}
                      {user.is_online && (
                        <span className="online-indicator"></span>
                      )}
                    </div>
                    <div className="result-content">
                      <div className="result-title">
                        {highlightText(user.username, results.query)}
                      </div>
                      <div className="result-meta">
                        <span>{user.is_online ? '在线' : '离线'}</span>
                        <span>注册于 {formatTime(user.created_at)}</span>
                      </div>
                    </div>
                    <button 
                      className="result-action"
                      onClick={() => navigate(`/friends`)}
                    >
                      查看
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(results.results.publicMessages && results.results.publicMessages.length > 0) && (
            <div className="result-section">
              <h3 className="section-title">
                💬 公屏消息 ({results.results.publicMessages.length})
              </h3>
              <div className="result-list">
                {results.results.publicMessages.map((msg) => (
                  <div key={msg.id} className="result-item message-item">
                    <div className="result-avatar">
                      {msg.avatar_url ? (
                        <img src={msg.avatar_url} alt={msg.username} />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div className="result-content">
                      <div className="result-title">
                        {msg.username}
                      </div>
                      <div className="result-text">
                        <span dangerouslySetInnerHTML={{ __html: highlightText(msg.content, results.query) }} />
                      </div>
                      <div className="result-meta">
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(results.results.privateMessages && results.results.privateMessages.length > 0) && (
            <div className="result-section">
              <h3 className="section-title">
                📩 私信 ({results.results.privateMessages.length})
              </h3>
              <div className="result-list">
                {results.results.privateMessages.map((msg) => (
                  <div key={msg.id} className="result-item message-item">
                    <div className="result-avatar">
                      {msg.sender_avatar ? (
                        <img src={msg.sender_avatar} alt={msg.sender_username} />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div className="result-content">
                      <div className="result-title">
                        {msg.sender_username} → {msg.receiver_username}
                      </div>
                      <div className="result-text">
                        <span dangerouslySetInnerHTML={{ __html: highlightText(msg.content, results.query) }} />
                      </div>
                      <div className="result-meta">
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(results.results.aiHistory && results.results.aiHistory.length > 0) && (
            <div className="result-section">
              <h3 className="section-title">
                🤖 AI对话 ({results.results.aiHistory.length})
              </h3>
              <div className="result-list">
                {results.results.aiHistory.map((msg, index) => (
                  <div key={index} className="result-item message-item">
                    <div className="result-avatar">
                      {msg.sender_type === 'ai' ? '🤖' : '👤'}
                    </div>
                    <div className="result-content">
                      <div className="result-title">
                        {msg.sender_type === 'ai' ? '小白助手' : '你'}
                      </div>
                      <div className="result-text">
                        <span dangerouslySetInnerHTML={{ __html: highlightText(msg.content, results.query) }} />
                      </div>
                      <div className="result-meta">
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.total === 0 && (
            <div className="empty-results">
              <div className="empty-icon">🔍</div>
              <p>没有找到相关结果</p>
              <p className="empty-hint">试试其他关键词</p>
            </div>
          )}
        </div>
      ) : (
        <div className="search-home">
          {searchHistory.length > 0 && (
            <div className="history-section">
              <div className="section-header">
                <h3>搜索历史</h3>
                <button className="clear-history-btn" onClick={handleClearHistory}>
                  清空
                </button>
              </div>
              <div className="history-tags">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    className="history-tag"
                    onClick={() => handleQuickSearch(item.query)}
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {trending.length > 0 && (
            <div className="trending-section">
              <h3>热门搜索</h3>
              <div className="trending-list">
                {trending.map((item, index) => (
                  <div key={index} className="trending-item">
                    <span className="trending-rank">{index + 1}</span>
                    <button
                      className="trending-tag"
                      onClick={() => handleQuickSearch(item.query)}
                    >
                      {item.query}
                    </button>
                    <span className="trending-count">{item.count}次</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="suggestions-section">
            <h3>搜索建议</h3>
            <div className="suggestion-tags">
              <button className="suggestion-tag" onClick={() => handleQuickSearch('聊天')}>聊天</button>
              <button className="suggestion-tag" onClick={() => handleQuickSearch('帮助')}>帮助</button>
              <button className="suggestion-tag" onClick={() => handleQuickSearch('笑话')}>笑话</button>
              <button className="suggestion-tag" onClick={() => handleQuickSearch('天气')}>天气</button>
              <button className="suggestion-tag" onClick={() => handleQuickSearch('时间')}>时间</button>
              <button className="suggestion-tag" onClick={() => handleQuickSearch('学习')}>学习</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}