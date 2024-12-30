import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Welcome to Our Platform</h1>
        <p className="welcome-description">
          Your trusted destination for secure and efficient solutions. Join our community
          of users and experience the difference today.
        </p>
        <div className="welcome-features">
          <div className="feature-item">
            <h3>Secure</h3>
            <p>Advanced security measures to protect your data</p>
          </div>
          <div className="feature-item">
            <h3>Efficient</h3>
            <p>Streamlined processes for maximum productivity</p>
          </div>
          <div className="feature-item">
            <h3>Reliable</h3>
            <p>24/7 availability with robust infrastructure</p>
          </div>
        </div>
        <div className="welcome-buttons">
          <button className="get-started-btn" onClick={handleGetStarted}>
            Get Started
          </button>
          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
