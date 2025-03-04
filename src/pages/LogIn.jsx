import React from 'react';
import { AuthForm } from '../components';
import '../styles/login.css';

const LogIn = () => {
  return (
    // Depth 0: FRAME (Log-in)
    <div className="login-container">
      {/* Depth 1: RECTANGLE (Rectangle 2) */}
      <div className="login-left-panel">
        {/* Depth 1: TEXT (Welcome to Mediaminder) */}
        <h1 className="welcome-title">WELCOME TO<br />MEDIAMINDER</h1>
        
        {/* Depth 1: TEXT (For all your media tracking needs...) */}
        <p className="welcome-subtitle">
          For all your media tracking needs — be they books, series, or movies!
        </p>
      </div>

      {/* Depth 1: INSTANCE (Auth Form) */}
      <div className="login-right-panel">
        <AuthForm initialMode="login" />
      </div>
    </div>
  );
};

export default LogIn;