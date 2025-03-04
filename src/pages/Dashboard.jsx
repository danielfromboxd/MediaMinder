import React from 'react';
import { NavigationSelector, SearchBar, MediaCard } from '../components';
import '../styles/dashboard.css';

const Dashboard = () => {
  // Mock data for media items
  const generateMediaItems = (count) => {
    return Array(count).fill().map((_, index) => ({
      id: `media-${index}`,
      title: 'Media Name'
    }));
  };

  const wantToWatchItems = generateMediaItems(8);
  const inProgressItems = generateMediaItems(8);
  const finishedItems = generateMediaItems(4);

  return (
    // Depth 0: FRAME (Dashboard/home)
    <div className="dashboard-container">
      {/* Depth 1: INSTANCE (Navigation Selector) */}
      <div className="dashboard-nav">
        <NavigationSelector defaultOpen={true} />
      </div>

      <div className="dashboard-content">
        {/* Depth 1: INSTANCE (Searchbar) */}
        <div className="search-container">
          <SearchBar formFactor="wide" />
        </div>

        {/* Want to watch/read section */}
        <section className="media-section">
          {/* Depth 1: TEXT (Want to watch/read) */}
          <h2 className="section-title">WANT TO WATCH/READ</h2>
          
          {/* Depth 1: FRAME (Grouped Media) */}
          <div className="media-grid">
            {wantToWatchItems.map(item => (
              // Depth 2: INSTANCE (Media poster and title)
              <div key={item.id} className="media-item">
                <MediaCard />
              </div>
            ))}
          </div>
        </section>

        {/* In progress section */}
        <section className="media-section">
          {/* Depth 1: TEXT (in progress) */}
          <h2 className="section-title">IN PROGRESS</h2>
          
          {/* Depth 1: FRAME (Grouped Media) */}
          <div className="media-grid">
            {inProgressItems.map(item => (
              // Depth 2: INSTANCE (Media poster and title)
              <div key={item.id} className="media-item">
                <MediaCard />
              </div>
            ))}
          </div>
        </section>

        {/* Finished section */}
        <section className="media-section">
          {/* Depth 1: TEXT (finished) */}
          <h2 className="section-title">FINISHED</h2>
          
          {/* Depth 1: FRAME (Grouped Media) */}
          <div className="media-grid">
            {finishedItems.map(item => (
              // Depth 2: INSTANCE (Media poster and title)
              <div key={item.id} className="media-item">
                <MediaCard />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;