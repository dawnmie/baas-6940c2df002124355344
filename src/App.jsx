import React, { useState, useEffect } from 'react';
import { account, databases } from './lib/appwrite';
import './App.css';

const DATABASE_ID = '6940fa1f000ba38eed91';
const MESSAGES_TABLE_ID = '694103b40039a4f17d4c';

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 检查用户是否已登录
  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      // 用户登录后加载消息
      loadMessages();
    } catch (error) {
      setUser(null);
    }
  };

  const loadMessages = async () => {
    if (!user) return;
    
    try {
      const response = await databases.listDocuments(DATABASE_ID, MESSAGES_TABLE_ID);
      // 按创建时间倒序排列（最新在前）
      const sortedMessages = response.documents.sort((a, b) => 
        new Date(b.$createdAt) - new Date(a.$createdAt)
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      // 如果权限错误，尝试以游客身份加载（如果表设置了公开读取权限）
      try {
        const response = await databases.listDocuments(DATABASE_ID, MESSAGES_TABLE_ID);
        const sortedMessages = response.documents.sort((a, b) => 
          new Date(b.$createdAt) - new Date(a.$createdAt)
        );
        setMessages(sortedMessages);
      } catch (guestError) {
        console.error('Failed to load messages as guest:', guestError);
        setMessages([]);
      }
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        // 登录 - 使用正确的API方法
        await account.createEmailPasswordSession(username, password);
      } else {
        // 注册
        await account.create('unique()', username, password, username);
        // 登录新创建的用户
        await account.createEmailPasswordSession(username, password);
      }
      
      await checkUserStatus();
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setMessageContent('');
      setMessages([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      await databases.createDocument(
        DATABASE_ID,
        MESSAGES_TABLE_ID,
        'unique()',
        {
          content: messageContent.trim(),
          userId: user.$id,
          username: user.name || user.email
        },
        // 设置权限 - 允许任何人读取，只有创建者可以写入
        ['read("any")'],
        ['write("user:' + user.$id + '")']
      );
      
      setMessageContent('');
      loadMessages();
    } catch (error) {
      console.error('Failed to post message:', error);
      setError('Failed to post message');
    }
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2>{isLoginMode ? 'Login' : 'Register'}</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleAuth}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : (isLoginMode ? 'Login' : 'Register')}
            </button>
          </form>
          <p>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button 
              className="toggle-mode" 
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
            >
              {isLoginMode ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>留言板</h1>
        <div className="user-info">
          <span>Welcome, {user.name || user.email}!</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="app-main">
        <form onSubmit={handlePostMessage} className="message-form">
          <textarea
            placeholder="写下你的留言..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            rows="3"
            required
          />
          <button type="submit">发布留言</button>
        </form>

        <div className="messages-container">
          <h2>留言列表 ({messages.length})</h2>
          {messages.length === 0 ? (
            <p className="no-messages">还没有留言，快来发布第一条吧！</p>
          ) : (
            messages.map((message) => (
              <div key={message.$id} className="message-item">
                <div className="message-header">
                  <span className="message-username">{message.username}</span>
                  <span className="message-time">
                    {new Date(message.$createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;