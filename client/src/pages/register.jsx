// Components/Register.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Register.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    setShowForm(true);
    // Force light mode for register page
    const prevTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');
    return () => {
      if (prevTheme) {
        document.documentElement.setAttribute('data-theme', prevTheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const BASE_URL = 'https://pixvibe.onrender.com';
      const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // alert(data.message); // Removed alert
        navigate("/login");  // ✅ Redirect to login page
      } else {
        // alert(data.error || "Registration failed"); // Removed alert
        setError(data.error || "Registration failed"); // Show error inline
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Server error");
    }
  };

  return (
    <div className="register-wrapper">
      <div className={`register-container ${showForm ? 'show' : ''}`}>
        <h2 className="register-heading">Register</h2>
        <form
          onSubmit={handleSubmit} // ✅ Important: bind to custom submit handler
          className="register-form"
        >
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="register-button">Register</button>
          {error && <p className="register-error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          <div className="link-row">
            <button type="button" className="link-button" onClick={() => navigate('/login')}>
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
