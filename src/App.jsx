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

  // 检查用户是否已登录并加载消息
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await checkUserStatus();
    await loadMessages();
  };

  const checkUserStatus = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  const loadMessages = async () => {
    try {
      // 任何人都可以读取留言
      const response = await databases.listDocuments(DATABASE_ID, MESSAGES_TABLE_ID);
      const sortedMessages = response.documents.sort((a, b) => 
        new Date(b.$createdAt) - new Date(a.$createdAt)
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        // 尝试不同的登录方法
        try {
          // 方法1: createEmailPasswordSession
          await account.createEmailPasswordSession(username, password);
        } catch (method1Error) {
          try {
            // 方法2: createSession
            await account.createSession(username, password);
          } catch (method2Error) {
            // 方法3: createEmailSession (旧版本)
            await account.createEmailSession(username, password);
          }
        }
      } else {
        // 注册新用户
        await account.create('unique()', username, password, username);
        // 登录新用户
        try {
          await account.createEmailPasswordSession(username, password);
        } catch (loginError) {
          await account.createSession(username, password);
        }
      }
      
      await checkUserStatus();
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setMessageContent('');
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
        ['read("any")'] // 允许任何人读取
      );
      
      setMessageContent('');
      loadMessages();
    } catch (error) {
      console.error('Failed to post message:', error);
      setError('Failed to post message. Please try again.');
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