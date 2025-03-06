import React from 'react';
import Button from './Button';
import '../styles/authButtons.css';

const AuthButtons = () => {
  return (
    // Depth 0: FRAME (Log-in/Sign-up buttons)
    <div className="auth-buttons-container">
      {/* Depth 1: COMPONENT_SET (Sign-up Button) */}
      <div className="button-set signup-set">
        <Button variant="signup" />
      </div>
      
      {/* Depth 1: COMPONENT_SET (Log-in Button) */}
      <div className="button-set login-set">
        <Button variant="login" />
      </div>
    </div>
  );
};

export default AuthButtons;