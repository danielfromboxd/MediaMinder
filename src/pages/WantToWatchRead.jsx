import React from 'react';
import { NavigationSelector, SearchBar, SearchResultPage } from '../components';
import '../styles/wantToWatchRead.css';

const WantToWatchRead = () => {
  return (
    <div className="want-to-watch-read-container">
      {/* Navigation */}
      <div className="navigation-selector">
        <NavigationSelector defaultOpen={true} />
      </div>

      <div className="content-area">
        {/* Header */}
        <div className="site-header">
          <div className="site-logo">
            <img src="/assets/logo.svg" alt="Media Minder Logo" />
          </div>
          <h1 className="site-title">MEDIA<br />MINDER</h1>
        </div>

        {/* Search */}
        <div className="search-container">
          <SearchBar formFactor="wide" />
        </div>

        {/* Title */}
        <h2 className="section-title">WANT TO WATCH/READ</h2>

        {/* Media Grid with Pagination */}
        <SearchResultPage 
          initialPage={1}
          totalPages={68}
          itemsPerPage={20}
          category="want-to-watch"  // You might need to add this prop to filter by category
        />
      </div>
    </div>
  );
};

export default WantToWatchRead;