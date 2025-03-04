import React, { useState } from 'react';
import { NavigationSelector, UpdateButton } from '../components';
import '../styles/settings.css';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleUpdate = (e) => {
    e.preventDefault();
    // Handle update logic here
    console.log('Update with:', { email, password });
  };

  return (
    // Depth 0: FRAME (Settings)
    <div className="settings-container">
      {/* Depth 1: INSTANCE (Navigation Selector) */}
      <div className="navigation-sidebar">
        <NavigationSelector defaultOpen={true} />
      </div>

      <div className="content-area">
        {/* Depth 1: FRAME (Site title + logo) */}
        <div className="site-header">
          {/* Depth 2: RECTANGLE (Logo) */}
          <div className="site-logo">
            <img src="/assets/logo.svg" alt="Media Minder Logo" />
          </div>
          {/* Depth 2: TEXT (MEDIA MINDER) */}
          <h1 className="site-title">MEDIA<br />MINDER</h1>
        </div>

        {/* Depth 1: TEXT (Settings) */}
        <h2 className="settings-title">settings</h2>

        {/* Depth 1: FRAME (Frame 2) - Account Management */}
        <div className="account-management">
          {/* Depth 2: TEXT (Account management) */}
          <h3 className="section-title">Account management</h3>
          
          {/* Depth 2: TEXT (Email address:) */}
          <label className="input-label">Email address:</label>
          
          {/* Depth 2: FRAME (Email input) */}
          <div className="input-container">
            {/* Depth 3: TEXT (New email address) */}
            <input 
              type="email" 
              className="input-field" 
              placeholder="New email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {/* Depth 2: TEXT (Password:) */}
          <label className="input-label">Password:</label>
          
          {/* Depth 2: FRAME (Password Input) */}
          <div className="input-container">
            {/* Depth 3: TEXT (New password) */}
            <input 
              type="password" 
              className="input-field" 
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {/* Depth 2: INSTANCE (Update button) */}
          <div className="update-button-wrapper" onClick={handleUpdate}>
            <UpdateButton />
          </div>
        </div>

        {/* Depth 1: FRAME (Frame 1) - Acknowledgements */}
        <div className="acknowledgements">
          {/* Depth 2: TEXT (Acknowledgements) */}
          <h3 className="section-title">Acknowledgements</h3>
          
          {/* Depth 2: TEXT (This product uses...) */}
          <p className="acknowledgement-text">
            This product uses the TMDB API but is not endorsed or certified by TMDB.<br />
            This product likewise uses the OpenLibrary API, but is not endorsed or certified by OpenLibrary.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;