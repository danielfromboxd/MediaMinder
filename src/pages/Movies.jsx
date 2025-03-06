import React, { useState } from 'react';
import { NavigationSelector, SearchBar, Pagination } from '../components';
import '../styles/movies.css';

const Movies = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 68;
  
  // Mock data for media items (20 items per page)
  const mediaItems = Array(20).fill().map((_, index) => ({
    id: `movie-${index}`,
    title: 'Media Name'
  }));
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // In a real application, you would fetch data for the new page here
    window.scrollTo(0, 0);
  };

  return (
    // Depth 0: FRAME (Movies)
    <div className="movies-container">
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

        {/* Depth 1: TEXT (MOVIES) */}
        <h2 className="movies-title">MOVIES</h2>

        {/* Depth 1: INSTANCE (Searchbar) */}
        <div className="search-container">
          <SearchBar formFactor="wide" />
        </div>

        {/* Depth 1: INSTANCE (Search Result Page) */}
        <div className="search-results">
          {/* Media Grid */}
          <div className="media-grid">
            {mediaItems.map((item) => (
              // Depth 2: INSTANCE (Media poster and title)
              <div key={item.id} className="media-card">
                {/* Depth 3: TEXT (Media Name) */}
                <h3 className="media-title">{item.title}</h3>
                {/* Depth 3: RECTANGLE (Rectangle 1) */}
                <div className="media-placeholder"></div>
              </div>
            ))}
          </div>
          
          {/* Depth 2: INSTANCE (Pagination) */}
          <div className="pagination-container">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movies;