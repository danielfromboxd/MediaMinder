import React from 'react';
import { NavigationSelector, SearchBar, SearchResultPage } from '../components';
import '../styles/series.css';

const Series = () => {
  return (
    // Depth 0: FRAME (Series)
    <div className="series-container">
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

        {/* Depth 1: TEXT (SERIES) */}
        <h2 className="series-title">SERIES</h2>

        {/* Depth 1: INSTANCE (Searchbar) */}
        <div className="search-container">
          <SearchBar formFactor="wide" />
        </div>

        {/* Depth 1: INSTANCE (Search Result Page) */}
        <div className="search-results">
          <SearchResultPage 
            initialPage={1}
            totalPages={68}
            itemsPerPage={20}
          />
        </div>
      </div>
    </div>
  );
};

export default Series;