import React, { useState } from 'react';
import './AuthForm.css';
import { Button } from './';

const AuthForm = ({ initialMode = 'signup' }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission based on mode
    console.log(`${mode} form submitted:`, formData);
  };

  const toggleMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
  };

  return (
    // Depth 0: COMPONENT_SET (Sign-up)
    <div className="auth-form-container">
      {/* Depth 1: COMPONENT (Property 1=Default, Property 2=Sign-up/Log-in) */}
      <div className={`auth-form ${mode}`}>
        {mode === 'login' ? (
          <>
            {/* Depth 2: TEXT (Log In!) */}
            <h1 className="auth-title">Log In!</h1>

            {/* Depth 2: INSTANCE (Email input) */}
            <div className="form-field">
              {/* Depth 3: TEXT (Label) */}
              <label className="input-label">Enter your e-mail</label>
              {/* Depth 3: FRAME (Input) */}
              <div className="input-container">
                {/* Depth 4: TEXT (Value) */}
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Depth 2: INSTANCE (Password input) */}
            <div className="form-field">
              {/* Depth 3: TEXT (Label) */}
              <label className="input-label">Enter your password</label>
              {/* Depth 3: FRAME (Input) */}
              <div className="input-container">
                {/* Depth 4: TEXT (Value) */}
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Depth 2: INSTANCE (Log-in Button) */}
            <button 
              className="auth-button" 
              onClick={handleSubmit}
            >
              {/* Depth 3: TEXT (Log in) */}
              <span className="button-text">Log in</span>
            </button>

            {/* Depth 2: TEXT (Don't have an account? Sign up!) */}
            <p className="auth-toggle-text">
              Don't have an account? 
              <span className="auth-toggle-link" onClick={toggleMode}>
                Sign up!
              </span>
            </p>
          </>
        ) : (
          <>
            {/* Depth 2: FRAME (Sign-up) */}
            <div className="signup-container">
              {/* Depth 3: INSTANCE (Sign up!) */}
              <div className="title-container">
                {/* Depth 4: TEXT (Title) */}
                <h1 className="auth-title">Sign Up!</h1>
              </div>

              {/* Depth 3: FRAME (Form Contact) */}
              <div className="form-container">
                {/* Depth 4: INSTANCE (Name input) */}
                <div className="form-field">
                  {/* Depth 5: TEXT (Label) */}
                  <label className="input-label">Enter your name</label>
                  {/* Depth 5: FRAME (Input) */}
                  <div className="input-container">
                    {/* Depth 6: TEXT (Value) */}
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Depth 4: INSTANCE (Email input) */}
                <div className="form-field">
                  {/* Depth 5: TEXT (Label) */}
                  <label className="input-label">Enter your email</label>
                  {/* Depth 5: FRAME (Input) */}
                  <div className="input-container">
                    {/* Depth 6: TEXT (Value) */}
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Depth 4: INSTANCE (Password input) */}
                <div className="form-field">
                  {/* Depth 5: TEXT (Label) */}
                  <label className="input-label">Enter your password</label>
                  {/* Depth 5: FRAME (Input) */}
                  <div className="input-container">
                    {/* Depth 6: TEXT (Value) */}
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Depth 4: INSTANCE (Sign-up Button) */}
                <button 
                  className="auth-button" 
                  onClick={handleSubmit}
                >
                  {/* Depth 5: TEXT (Button) */}
                  <span className="button-text">Sign up</span>
                </button>
              </div>
            </div>

            {/* Depth 2: TEXT (Already have an account? Log in!) */}
            <p className="auth-toggle-text">
              Already have an account? 
              <span className="auth-toggle-link" onClick={toggleMode}>
                Log in!
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;