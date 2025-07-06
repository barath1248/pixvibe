import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  FaUserCircle,
  FaSearch,
  FaPlus,
  FaComments,
  FaVideo,
  FaRobot,
  FaSignOutAlt,
  FaTachometerAlt,
  FaSun,
  FaMoon,
  FaFileAlt,
} from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, route: "/dashboard" },
    { label: "Profile", icon: <FaUserCircle />, route: "/profile" },
    { label: "ResumeScreening", icon: <FaFileAlt />, route: "/ResumeScreening" },
    { label: "Post", icon: <FaPlus />, route: "/post" },
    { label: "Chat", icon: <FaComments />, route: "/chat" },
    { label: "Watch", icon: <FaVideo />, route: "/watch" },
    { label: "AIChatbot", icon: <FaRobot />, route: "/AIChatbot" },
  ];

  return (
    <aside className="sidebar" >
      {/* Header */}
      <div className="sidebar__header">
        <img src="/pixvibe.jpg" alt="PixVibe Logo" className="sidebar__logo" />
        <h1 className="sidebar__brand">𝓟ix𝓥ibe</h1>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item, idx) => (
          <button
            key={idx}
            className={`sidebar__nav-item ${
              location.pathname === item.route ? "active" : ""
            }`}
            onClick={() => navigate(item.route)}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar__top-actions">
        <button className="sidebar__theme-toggle" onClick={toggleTheme}>
          <span className="icon">
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </span>
          <span className="label">
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
        <button className="sidebar__logout" onClick={() => navigate("/login")}> 
          <FaSignOutAlt className="icon" />
          <span className="label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
