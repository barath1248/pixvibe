import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'; 

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-body">
      <div className="container">
        <h1>PixVibe</h1>
        <p>Your all-in-one platform for AI-powered creativity, professional growth, and seamless collaboration.</p>
        <div className="btn-container">
          <button onClick={() => navigate('/login')}>Get Started</button>
          <button onClick={() => navigate('/register')}>Create Account</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
