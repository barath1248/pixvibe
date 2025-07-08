import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserCircle,
  FaSearch,
  FaPlus,
  FaComments,
  FaVideo,
  FaRobot,
  FaUsers,
  FaChartLine,
  FaBell,
  FaStar,
  FaRocket,
  FaLightbulb,
  FaShieldAlt,
  FaMobile,
  FaDesktop,
  FaHeart,
  FaEye,
  FaPlay,
  FaBrain,
  FaFileAlt,
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaAward,
  FaGlobe,
  FaLock,
  FaSync
} from 'react-icons/fa';
import '../styles/Dashboard.css';
import { useTheme } from '../context/ThemeContext';

function formatDuration(seconds) {
  if (!seconds || seconds < 1) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    videosWatched: 0,
    aiInteractions: 0,
    postsCreated: 0,
    resumeScreened: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [averageSession, setAverageSession] = useState(0);
  const [totalSession, setTotalSession] = useState(0);

  useEffect(() => {
    // Get current user from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({ id: payload.id, username: payload.username });
      } catch (error) {
        console.error('Error parsing token:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch real dashboard stats
    const fetchStats = async () => {
      setLoadingStats(true);
      setStatsError(null);
      try {
        const token = localStorage.getItem('token');
        const BASE_URL = 'https://pixvibe.onrender.com';
        const response = await fetch(`${BASE_URL}/api/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalUsers: data.totalUsers,
            activeChats: data.totalChats,
            videosWatched: data.videosWatched,
            aiInteractions: data.aiInteractions,
            postsCreated: data.postsCreated,
            resumeScreened: data.resumesScreened
          });
        } else {
          setStatsError('Failed to load statistics.');
        }
      } catch (err) {
        setStatsError('Network error.');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();

    // Listen for video watching events to refresh stats
    const handleVideoWatched = () => {
      fetchStats();
    };

    window.addEventListener('videoWatched', handleVideoWatched);

    // Cleanup event listener
    return () => {
      window.removeEventListener('videoWatched', handleVideoWatched);
    };
  }, []);

  // Start/end session tracking
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const BASE_URL = 'https://pixvibe.onrender.com';
    fetch(`${BASE_URL}/api/dashboard/session/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const endSession = () => {
      fetch(`${BASE_URL}/api/dashboard/session/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    };
    window.addEventListener('beforeunload', endSession);
    return () => {
      endSession();
      window.removeEventListener('beforeunload', endSession);
    };
  }, []);

  // Fetch average session time
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const BASE_URL = 'https://pixvibe.onrender.com';
    fetch(`${BASE_URL}/api/dashboard/average-session`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAverageSession(data.averageSeconds || 0));
  }, []);

  // Fetch total session time
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const BASE_URL = 'https://pixvibe.onrender.com';
    fetch(`${BASE_URL}/api/dashboard/total-session`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTotalSession(data.totalSeconds || 0));
  }, []);

  const quickActions = [
    {
      title: "Start Chatting",
      description: "Connect with other users",
      icon: <FaComments />,
      route: "/chat",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      stats: `${stats.activeChats} active chats`
    },
    {
      title: "Watch Videos",
      description: "Discover amazing content",
      icon: <FaVideo />,
      route: "/watch",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      stats: `${stats.videosWatched} videos watched`
    },
    {
      title: "AI Assistant",
      description: "Get help from our AI",
      icon: <FaRobot />,
      route: "/AIChatbot",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      stats: `${stats.aiInteractions} interactions`
    },
    {
      title: "Create Post",
      description: "Share your thoughts",
      icon: <FaPlus />,
      route: "/post",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      stats: `${stats.postsCreated} posts created`
    },
    {
      title: "Resume Screening",
      description: "Analyze resumes with AI",
      icon: <FaSearch />,
      route: "/ResumeScreening",
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      stats: `${stats.resumeScreened} resumes screened`
    },
    {
      title: "View Profile",
      description: "Manage your account",
      icon: <FaUserCircle />,
      route: "/profile",
      color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      stats: "Profile settings"
    }
  ];

  const features = [
    {
      title: "Real-time Chat",
      description: "Connect with users instantly with our modern chat interface",
      icon: <FaComments />,
      color: "#667eea"
    },
    {
      title: "Video Hub",
      description: "Watch and discover amazing videos from YouTube",
      icon: <FaPlay />,
      color: "#f5576c"
    },
    {
      title: "AI Assistant",
      description: "Get intelligent help and answers from our AI chatbot",
      icon: <FaBrain />,
      color: "#4facfe"
    },
    {
      title: "Resume Screening",
      description: "AI-powered resume analysis and screening tools",
      icon: <FaFileAlt />,
      color: "#fa709a"
    },
    {
      title: "Secure Authentication",
      description: "JWT-based secure authentication system",
      icon: <FaLock />,
      color: "#43e97b"
    },
    {
      title: "Responsive Design",
      description: "Beautiful interface that works on all devices",
      icon: <FaMobile />,
      color: "#a8edea"
    }
  ];

  const recentActivity = [
    {
      action: "Started a chat with",
      user: "Alice Smith",
      time: "2 minutes ago",
      icon: <FaComments />,
      color: "#667eea"
    },
    {
      action: "Watched video",
      user: "React Tutorial",
      time: "15 minutes ago",
      icon: <FaVideo />,
      color: "#f5576c"
    },
    {
      action: "Asked AI about",
      user: "JavaScript best practices",
      time: "1 hour ago",
      icon: <FaRobot />,
      color: "#4facfe"
    },
    {
      action: "Created a new post",
      user: "Project update",
      time: "2 hours ago",
      icon: <FaPlus />,
      color: "#43e97b"
    }
  ];

  const handleQuickAction = (route) => {
    navigate(route);
  };

  if (!currentUser) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <FaSync className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {currentUser.username}! 👋</h1>
          <p>Here's what's happening with your PixVibe account today</p>
        </div>
        <div className="header-actions">
          <button className="notification-btn">
            <FaBell />
            <span className="notification-badge">3</span>
          </button>
          <div className="user-avatar">
            <FaUserCircle />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers.toLocaleString()}</h3>
            <p>Total Users</p>
            <span className="stat-trend positive">
              <FaChartLine /> +12% this week
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon chats">
            <FaComments />
          </div>
          <div className="stat-content">
            <h3>{stats.activeChats}</h3>
            <p>Active Chats</p>
            <span className="stat-trend positive">
              <FaChartLine /> +8% today
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon videos">
            <FaVideo />
          </div>
          <div className="stat-content">
            <h3>{stats.videosWatched}</h3>
            <p>Videos Watched</p>
            <span className="stat-trend positive">
              <FaChartLine /> +15% this month
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ai">
            <FaRobot />
          </div>
          <div className="stat-content">
            <h3>{stats.aiInteractions}</h3>
            <p>AI Interactions</p>
            <span className="stat-trend positive">
              <FaChartLine /> +23% this week
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <span role="img" aria-label="hourglass">⌛</span>
          </div>
          <div className="stat-content">
            <h3>{formatDuration(totalSession)}</h3>
            <p>Total Time Spent</p>
            <span className="stat-trend">
              {/* Optionally add a trend or info here */}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p>Access your favorite features instantly</p>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="quick-action-card"
              onClick={() => handleQuickAction(action.route)}
              style={{ background: action.color }}
            >
              <div className="action-icon">
                {action.icon}
              </div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                <span className="action-stats">{action.stats}</span>
              </div>
              <div className="action-arrow">
                <FaArrowRight />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Showcase */}
      <div className="features-section">
        <div className="section-header">
          <h2>Platform Features</h2>
          <p>Discover what makes PixVibe special</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Platform Highlights */}
      <div className="bottom-section">
        <div className="recent-activity">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <p>Your latest interactions</p>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon" style={{ color: activity.color }}>
                  {activity.icon}
                </div>
                <div className="activity-content">
                  <p>
                    <strong>{activity.action}</strong> {activity.user}
                  </p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="platform-highlights">
          <div className="section-header">
            <h2>Platform Highlights</h2>
            <p>Why choose PixVibe?</p>
          </div>
          <div className="highlights-list">
            <div className="highlight-item">
              <FaRocket className="highlight-icon" />
              <div>
                <h4>Lightning Fast</h4>
                <p>Optimized for speed and performance</p>
              </div>
            </div>
            <div className="highlight-item">
              <FaShieldAlt className="highlight-icon" />
              <div>
                <h4>Secure & Private</h4>
                <p>Your data is protected with encryption</p>
              </div>
            </div>
            <div className="highlight-item">
              <FaGlobe className="highlight-icon" />
              <div>
                <h4>Global Community</h4>
                <p>Connect with users worldwide</p>
              </div>
            </div>
            <div className="highlight-item">
              <FaAward className="highlight-icon" />
              <div>
                <h4>Premium Quality</h4>
                <p>Professional-grade features and design</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to explore more?</h2>
          <p>Start using all the amazing features PixVibe has to offer</p>
          <div className="cta-buttons">
            <button 
              className="cta-primary"
              onClick={() => navigate('/chat')}
            >
              Start Chatting
            </button>
            <button 
              className="cta-secondary"
              onClick={() => navigate('/watch')}
            >
              Watch Videos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 