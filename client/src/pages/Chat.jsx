import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSearch, FaEllipsisV, FaCircle, FaUser, FaPlus, FaUsers, FaComments } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Chat.css';

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { userId } = useParams();

  // Get current user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({ id: payload.id, username: payload.username });
      } catch (error) {
        console.error('Error parsing token:', error);
        // Redirect to login if token is invalid
        window.location.href = '/login';
      }
    } else {
      // Redirect to login if no token
      window.location.href = '/login';
    }
  }, []);

  // Fetch users from API
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  // Fetch messages when user is selected
  useEffect(() => {
    if (selectedUser && currentUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser, currentUser]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update last seen periodically
  useEffect(() => {
    if (!currentUser) return;
    
    const interval = setInterval(updateLastSeen, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [currentUser]);

  // Set selected user from URL param
  useEffect(() => {
    if (userId && users.length > 0) {
      const found = users.find(u => String(u.id) === String(userId));
      if (found) setSelectedUser(found);
    }
  }, [userId, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = 'https://pixvibe.onrender.com';
      const response = await fetch(`${BASE_URL}/api/chat/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched users:', data);
        setUsers(data);
        
        // If no users found, show a helpful message
        if (data.length === 0) {
          setError('No other users found. Try creating a new account or ask an admin to add more users.');
        } else {
          setError(null);
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch users');
        setError('Failed to load users. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = 'https://pixvibe.onrender.com';
      const response = await fetch(`${BASE_URL}/api/chat/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch messages');
        setError('Failed to load messages. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Network error. Please check your connection.');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser || isSending || !currentUser) return;

    setIsSending(true);
    const messageContent = message.trim();

    try {
      const token = localStorage.getItem('token');
      const BASE_URL = 'https://pixvibe.onrender.com';
      const response = await fetch(`${BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: messageContent
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        setMessage('');
        
        // Update the last message in users list
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, lastMessage: messageContent, lastMessageTime: newMessage.timestamp }
            : user
        ));
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        console.error('Failed to send message');
        setError('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsSending(false);
    }
  };

  const updateLastSeen = async () => {
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = 'https://pixvibe.onrender.com';
      await fetch(`${BASE_URL}/api/chat/last-seen`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    navigate(`/chat/${user.id}`);
    // Mark messages as read when user is selected
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, unreadCount: 0 } : u
    ));
  };

  if (!currentUser) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Users Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>Messages</h2>
          <div className="chat-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="users-list">
          {error ? (
            <div className="error-state">
              <FaUsers className="error-icon" />
              <p className="error-message">{error}</p>
              <button className="retry-button" onClick={fetchUsers}>
                Try Again
              </button>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div
                key={user.id}
                className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName || user.username} />
                  ) : (
                    <FaUser className="default-avatar" />
                  )}
                  <div className={`online-indicator ${user.isOnline ? 'online' : 'offline'}`}>
                    <FaCircle />
                  </div>
                </div>
                
                <div className="user-info">
                  <div className="user-name">
                    <h4>{user.fullName || user.username}</h4>
                    {user.unreadCount > 0 && (
                      <span className="unread-badge">{user.unreadCount}</span>
                    )}
                  </div>
                  <p className="last-message">
                    {user.lastMessage || 'No messages yet'}
                  </p>
                  <span className="last-message-time">
                    {user.lastMessageTime || 'Never'}
                  </span>
                </div>
              </div>
            ))
          ) : searchTerm ? (
            <div className="no-users">
              <FaSearch className="no-users-icon" />
              <p>No users found matching "{searchTerm}"</p>
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="no-users">
              <FaUsers className="no-users-icon" />
              <p>No users found</p>
              <p className="no-users-subtitle">There are no other users to chat with yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-main">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="chat-main-header">
              <div className="chat-user-info">
                <div className="user-avatar">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.fullName || selectedUser.username} />
                  ) : (
                    <FaUser className="default-avatar" />
                  )}
                  <div className={`online-indicator ${selectedUser.isOnline ? 'online' : 'offline'}`}>
                    <FaCircle />
                  </div>
                </div>
                <div className="user-details">
                  <h3>{selectedUser.fullName || selectedUser.username}</h3>
                  <p className="user-status">
                    {selectedUser.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="chat-actions">
                <button className="action-btn">
                  <FaEllipsisV />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
              <div className="messages-list">
                {messages.length > 0 ? (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message ${msg.senderId === currentUser.id ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p>{msg.content}</p>
                        <span className="message-time">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-messages">
                    <FaComments className="no-messages-icon" />
                    <p>No messages yet</p>
                    <p className="no-messages-subtitle">Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <form className="message-input-container" onSubmit={sendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="message-input"
                disabled={isSending}
              />
              <button 
                type="submit" 
                className="send-button" 
                disabled={!message.trim() || isSending}
              >
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <FaUser className="no-chat-icon" />
              <h3>Select a conversation</h3>
              <p>Choose a user from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
