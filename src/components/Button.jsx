import React, { useState } from 'react';
import './Button.css';

const Button = ({ variant = 'login', onClick }) => {
  const [state, setState] = useState('default');
  
  const handleMouseEnter = () => {
    setState('hover');
  };
  
  const handleMouseLeave = () => {
    setState('default');
  };
  
  const handleMouseDown = () => {
    setState('pressed');
  };
  
  const handleMouseUp = () => {
    setState('hover');
  };
  
  const buttonText = variant === 'signup' ? 'Sign up' : 'Log in';
  
  return (
    <button 
      className={`auth-button ${variant} ${state}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <span className="button-text">{buttonText}</span>
    </button>
  );
};

export default Button;