import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCircle,
  FaSearch,
  FaPlus,
  FaComments,
  FaVideo,
  FaMusic,
  FaSignOutAlt,
} from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Profile", icon: <FaUserCircle />, route: "/profile" },
    { label: "Explore", icon: <FaSearch />, route: "/explore" },
    { label: "Post", icon: <FaPlus />, route: "/post" },
    { label: "Chat", icon: <FaComments />, route: "/chat" },
    { label: "Watch", icon: <FaVideo />, route: "/watch" },
    { label: "Music", icon: <FaMusic />, route: "/music" },
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

      {/* Footer */}
      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={() => navigate("/login")}>
          <FaSignOutAlt className="icon" />
          <span className="label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
