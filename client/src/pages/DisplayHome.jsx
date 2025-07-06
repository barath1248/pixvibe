import React, { useState, useEffect } from 'react';
import { FaUser, FaComments, FaVideo, FaRobot, FaSearch, FaPlus } from 'react-icons/fa';
import '../styles/DisplayHome.css';

const DisplayHome = () => {
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState({
    posts: 12,
    chats: 8,
    videos: 15,
    aiInteractions: 23
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const featureCards = [
    {
      icon: <FaUser />,
      title: 'Profile Management',
      description: 'Update your profile, bio, and profile picture',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      route: '/profile'
    },
    {
      icon: <FaSearch />,
      title: 'Resume Screening',
      description: 'AI-powered resume analysis and feedback',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      route: '/ResumeScreening'
    },
    {
      icon: <FaPlus />,
      title: 'Create Posts',
      description: 'Share your thoughts and content',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      route: '/post'
    },
    {
      icon: <FaComments />,
      title: 'Chat',
      description: 'Connect with other users',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      route: '/chat'
    },
    {
      icon: <FaVideo />,
      title: 'Watch Videos',
      description: 'Browse and watch video content',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      route: '/watch'
    },
    {
      icon: <FaRobot />,
      title: 'AI Chatbot',
      description: 'Interact with our AI assistant',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      route: '/AIChatbot'
    }
  ];

  return (
    <div className="display-home">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">
            Welcome back, <span className="username">{username}</span>! 👋
          </h1>
          <p className="welcome-subtitle">
            Ready to explore your PixVibe dashboard? Here's what you can do today.
          </p>
        </div>
        <div className="welcome-illustration">
          <div className="floating-card">
            <FaUser className="card-icon" />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <h2 className="section-title">Your Activity</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon posts">
              <FaPlus />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.posts}</h3>
              <p className="stat-label">Posts Created</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon chats">
              <FaComments />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.chats}</h3>
              <p className="stat-label">Chats Started</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon videos">
              <FaVideo />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.videos}</h3>
              <p className="stat-label">Videos Watched</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon ai">
              <FaRobot />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.aiInteractions}</h3>
              <p className="stat-label">AI Interactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="features-grid">
          {featureCards.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              style={{ '--card-color': feature.color }}
            >
              <div className="feature-icon" style={{ background: feature.color }}>
                {feature.icon}
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
              <div className="feature-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisplayHome;
