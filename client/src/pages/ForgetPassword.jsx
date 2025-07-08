import React, { useState, useEffect } from 'react';
import '../styles/ForgetPassword.css'; // reuse styles from Register.css

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const BASE_URL = 'https://pixvibe.onrender.com';
      const response = await fetch(`${BASE_URL}/api/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="forget-wrapper">
      <div className={`forget-container ${show ? 'show' : ''}`}>
        <h2 className="forget-heading">Forgot Password</h2>
        <form className="forget-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="forget-button">Send Reset Link</button>
        </form>
        {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
};

export default ForgetPassword;