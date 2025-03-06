import React, { useState } from 'react';
import './SearchResultPage.css';
import { MediaCard, Pagination } from './';

const SearchResultPage = ({ 
  initialPage = 1,
  totalPages = 68,
  itemsPerPage = 20
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Mock data for demonstration - in a real app, this would come from props or API
  const generateMockData = (page, count) => {
    return Array(count).fill().map((_, index) => ({
      id: (page - 1) * count + index + 1,
      title: `Media Name`
    }));
  };
  
  const mediaItems = generateMockData(currentPage, itemsPerPage);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // In a real app, you would fetch new data here
    console.log(`Fetching page ${page} data`);
    
    // Scroll to top when page changes
    window.scrollTo(0, 0);
  };

  return (
    // Depth 0: COMPONENT (Search Result Page)
    <div className="search-result-page">
      {/* Media Cards Grid */}
      <div className="media-grid">
        {mediaItems.map(item => (
          // Depth 1: INSTANCE (Media poster and title)
          <MediaCard key={item.id} />
        ))}
      </div>
      
      {/* Depth 1: INSTANCE (Pagination) */}
      <div className="pagination-container">
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default SearchResultPage;