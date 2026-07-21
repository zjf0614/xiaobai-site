import { useState, useEffect, useRef, useContext } from 'react';
import apiClient from '../api/client';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  const { socket, isConnected, sendPrivateMessage } = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const messages = selectedFriend ? (messagesMap[selectedFriend.friend_user_id] || []) : [];

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = (message) => {
      const friendId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
      
      setMessagesMap(prev => ({
        ...prev,
        [friendId]: [...(prev[friendId] || []), message]
      }));

      if (selectedFriend?.friend_user_id !== friendId) {
        setUnreadCounts(prev => ({
          ...prev,
          [friendId]: (prev[friendId] || 0) + 1
        }));
      }
    };

    const handleFriendRequest = () => {
      loadRequests();
    };

    const handleDmError = (err) => {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    };

    socket.on('dm:message', handlePrivateMessage);
    socket.on('friend:request', handleFriendRequest);
    socket.on('dm:error', handleDmError);

    return () => {
      socket.off('dm:message', handlePrivateMessage);
      socket.off('friend:request', handleFriendRequest);
      socket.off('dm:error', handleDmError);
    };
  }, [socket, selectedFriend, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (searchQuery.trim()) {
      apiClient.get(`/users/search?q=${searchQuery}`)
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (selectedFriend) {
      loadConversation(selectedFriend.friend_user_id);
      setUnreadCounts(prev => ({
        ...prev,
        [selectedFriend.friend_user_id]: 0
      }));
    }
  }, [selectedFriend]);

  const loadFriends = () => {
    apiClient.get('/friends')
      .then(setFriends)
      .catch(() => setFriends([]));
  };

  const loadRequests = () => {
    apiClient.get('/friends/requests')
      .then(setRequests)
      .catch(() => setRequests([]));
    setIsLoading(false);
  };

  const loadConversation = (friendId) => {
    apiClient.get(`/dm/${friendId}`)
      .then(data => {
        setMessagesMap(prev => ({
          ...prev,
          [friendId]: data
        }));
      })
      .catch(() => {
        setMessagesMap(prev => ({
          ...prev,
          [friendId]: []
        }));
      });
  };

  const handleSendRequest = (friendId) => {
    apiClient.post('/friends/request', { friendId })
      .then(() => {
        setSearchResults([]);
        setSearchQuery('');
      })
      .catch(err => alert(err.message));
  };

  const handleAcceptRequest = (requestId) => {
    apiClient.put(`/friends/accept/${requestId}`)
      .then(() => {
        loadRequests();
        loadFriends();
      })
      .catch(err => alert(err.message));
  };

  const handleRejectRequest = (requestId) => {
    apiClient.delete(`/friends/reject/${requestId}`)
      .then(() => {
        loadRequests();
      })
      .catch(err => alert(err.message));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !isConnected || !selectedFriend) return;
    
    sendPrivateMessage(selectedFriend.friend_user_id, inputValue);
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
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="friends-page">
      <div className="friends-sidebar">
        <div className="friends-section">
          <div className="section-header">
            <h3>好友列表</h3>
            <span className="section-count">{friends.length}</span>
          </div>
          <div className="friends-list">
            {friends.length === 0 ? (
              <div className="empty-list">
                <p>暂无好友</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.friend_user_id}
                  className={`friend-item ${selectedFriend?.friend_user_id === friend.friend_user_id ? 'selected' : ''}`}
                  onClick={() => setSelectedFriend(friend)}
                >
                  <div className="friend-avatar">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} alt={friend.username} />
                    ) : (
                      <span className="avatar-placeholder">👤</span>
                    )}
                    <span className={`status-indicator ${friend.is_online ? 'online' : 'offline'}`}></span>
                  </div>
                  <div className="friend-info">
                    <span className="friend-name">{friend.username}</span>
                    <span className="friend-status">{friend.is_online ? '在线' : '离线'}</span>
                  </div>
                  {unreadCounts[friend.friend_user_id] > 0 && (
                    <span className="unread-badge">{unreadCounts[friend.friend_user_id]}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {requests.length > 0 && (
          <div className="friends-section">
            <div className="section-header">
              <h3>好友请求</h3>
              <span className="section-count">{requests.length}</span>
            </div>
            <div className="request-list">
              {requests.map((req) => (
                <div key={req.id} className="request-item">
                  <div className="request-avatar">
                    {req.avatar_url ? (
                      <img src={req.avatar_url} alt={req.username} />
                    ) : (
                      <span className="avatar-placeholder">👤</span>
                    )}
                  </div>
                  <div className="request-info">
                    <span className="request-name">{req.username}</span>
                    <span className="request-time">请求添加好友</span>
                  </div>
                  <div className="request-actions">
                    <button className="btn-accept" onClick={() => handleAcceptRequest(req.id)}>
                      接受
                    </button>
                    <button className="btn-reject" onClick={() => handleRejectRequest(req.id)}>
                      拒绝
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="friends-section">
          <div className="section-header">
            <h3>添加好友</h3>
          </div>
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索用户名..."
            />
          </div>
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((user) => (
                <div key={user.id} className="search-item">
                  <div className="search-avatar">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} />
                    ) : (
                      <span className="avatar-placeholder">👤</span>
                    )}
                  </div>
                  <div className="search-info">
                    <span className="search-name">{user.username}</span>
                    <span className="search-status">{user.is_online ? '在线' : '离线'}</span>
                  </div>
                  <button className="btn-add" onClick={() => handleSendRequest(user.id)}>
                    添加
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dm-panel">
        {selectedFriend ? (
          <>
            <div className="dm-header">
              <div className="dm-avatar">
                {selectedFriend.avatar_url ? (
                  <img src={selectedFriend.avatar_url} alt={selectedFriend.username} />
                ) : (
                  <span className="avatar-placeholder">👤</span>
                )}
                <span className={`status-indicator ${selectedFriend.is_online ? 'online' : 'offline'}`}></span>
              </div>
              <div className="dm-info">
                <span className="dm-name">{selectedFriend.username}</span>
                <span className="dm-status">{selectedFriend.is_online ? '在线' : '离线'}</span>
              </div>
            </div>

            {error && (
              <div className="chat-error">
                {error}
              </div>
            )}

            <div className="dm-messages">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <p>还没有消息，开始聊天吧！</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-item ${msg.sender_id === user?.id ? 'self' : ''}`}
                  >
                    <div className="message-avatar">
                      {msg.sender_id === user?.id ? (
                        user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.username} />
                        ) : (
                          <span className="avatar-placeholder">👤</span>
                        )
                      ) : (
                        selectedFriend.avatar_url ? (
                          <img src={selectedFriend.avatar_url} alt={selectedFriend.username} />
                        ) : (
                          <span className="avatar-placeholder">👤</span>
                        )
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-username">
                          {msg.sender_id === user?.id ? user.username : selectedFriend.username}
                        </span>
                        <span className="message-time">{formatTime(msg.created_at)}</span>
                      </div>
                      <div className="message-text">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="dm-input-area">
              <form onSubmit={handleSendMessage}>
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
          </>
        ) : (
          <div className="dm-empty">
            <p>选择好友开始私信</p>
          </div>
        )}
      </div>
    </div>
  );
}