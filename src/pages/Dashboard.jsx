import React, { useState } from 'react';
import { NavigationSelector, SearchBar, MediaCard } from '../components';
import '../styles/dashboard.css';

const Dashboard = () => {
  // Sample data for the media sections
  const [wantToWatchItems] = useState(Array(8).fill().map((_, i) => ({ id: `want-${i}` })));
  const [inProgressItems] = useState(Array(8).fill().map((_, i) => ({ id: `progress-${i}` })));
  const [finishedItems] = useState(Array(4).fill().map((_, i) => ({ id: `finished-${i}` })));

  return (
    // Depth 0: FRAME (Dashboard/home)
    <div className="dashboard-container">
      {/* Depth 1: FRAME (Main Content Container) */}
      <div className="main-content-container">
        <div className="navigation-area">
          {/* Depth 1: FRAME (Site title + logo) */}
          <div className="site-header">
            {/* Depth 2: RECTANGLE (Logo) */}
            <div className="site-logo">
              <img src="/assets/logo.svg" alt="Media Minder Logo" />
            </div>
            {/* Depth 2: TEXT (MEDIA MINDER) */}
            <h1 className="site-title">MEDIA<br />MINDER</h1>
          </div>
          
          {/* Depth 2: INSTANCE (Navigation Selector) */}
          <div className="navigation-sidebar">
            <NavigationSelector defaultOpen={true} />
          </div>
        </div>

        {/* Depth 2: FRAME (Searchbar + Media) */}
        <div className="searchbar-media-container">
          {/* Depth 3: INSTANCE (Searchbar) */}
          <div className="search-container">
            <SearchBar formFactor="wide" />
          </div>

          {/* Depth 3: FRAME (Want to Watch/Read container) */}
          <div className="media-section-container">
            {/* Depth 4: FRAME (Want to Watch/Read subcontainer) */}
            <div className="media-section-subcontainer">
              {/* Depth 5: TEXT (Want to watch/read) */}
              <h2 className="section-title">WANT TO WATCH/READ</h2>
              
              {/* Depth 5: FRAME (Grouped Media) */}
              <div className="media-grid">
                {wantToWatchItems.map(item => (
                  // Depth 6: INSTANCE (Media poster and title)
                  <div key={item.id} className="media-item">
                    <MediaCard />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Depth 3: FRAME (In Progress container) */}
          <div className="media-section-container">
            {/* Depth 4: TEXT (in progress) */}
            <h2 className="section-title">IN PROGRESS</h2>
            
            {/* Depth 4: FRAME (Grouped Media) */}
            <div className="media-grid">
              {inProgressItems.map(item => (
                // Depth 5: INSTANCE (Media poster and title)
                <div key={item.id} className="media-item">
                  <MediaCard />
                </div>
              ))}
            </div>
          </div>

          {/* Depth 3: FRAME (Finished container) */}
          <div className="media-section-container">
            {/* Depth 4: TEXT (finished) */}
            <h2 className="section-title">FINISHED</h2>
            
            {/* Depth 4: FRAME (Grouped Media Small) */}
            <div className="media-grid">
              {finishedItems.map(item => (
                // Depth 5: INSTANCE (Media poster and title)
                <div key={item.id} className="media-item">
                  <MediaCard />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;