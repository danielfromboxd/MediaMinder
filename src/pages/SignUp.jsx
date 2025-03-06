import React from 'react';
import { AuthForm } from '../components';
import '../styles/signup.css';

const SignUp = () => {
  return (
    // Depth 0: FRAME (Sign-up)
    <div className="signup-container">
      {/* Depth 1: RECTANGLE (Rectangle 2) */}
      <div className="signup-left-panel">
        {/* Depth 1: TEXT (Welcome to Mediaminder) */}
        <h1 className="welcome-title">WELCOME TO<br />MEDIAMINDER</h1>
        
        {/* Depth 1: TEXT (For all your media tracking needs...) */}
        <p className="welcome-subtitle">
          For all your media tracking needs — be they books, series, or movies!
        </p>
      </div>

      {/* Depth 1: INSTANCE (Sign-up) */}
      <div className="signup-right-panel">
        {/* Using the AuthForm component in signup mode */}
        <AuthForm initialMode="signup" />
      </div>
    </div>
  );
};

export default SignUp;