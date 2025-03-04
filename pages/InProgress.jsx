import React from 'react';
import { NavigationSelector, SearchBar, SearchResultPage } from '../components';
import '../styles/inProgress.css';

const InProgress = () => {
  return (
    <div className="in-progress-container">
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

        {/* Title */}
        <h2 className="section-title">IN PROGRESS</h2>

        {/* Search */}
        <div className="search-container">
          <SearchBar formFactor="wide" />
        </div>

        {/* Media Grid with Pagination */}
        <SearchResultPage 
          initialPage={1}
          totalPages={68}
          itemsPerPage={20}
          category="in-progress"  // Category set to in-progress
        />
      </div>
    </div>
  );
};

export default InProgress;