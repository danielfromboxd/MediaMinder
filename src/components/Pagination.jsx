import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 68, 
  onPageChange 
}) => {
  const handlePageClick = (page) => {
    if (page !== currentPage && onPageChange) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  // Determine which page numbers to show
  const renderPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first few pages
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      pageNumbers.push(
        <div 
          key={`page-${i}`}
          className={`pagination-page ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageClick(i)}
        >
          <span>{i}</span>
        </div>
      );
    }
    
    // If we have more than 3 pages, add gap
    if (totalPages > 3) {
      pageNumbers.push(
        <div key="gap" className="pagination-gap">
          <span>...</span>
        </div>
      );
      
      // Add last two pages
      for (let i = totalPages - 1; i <= totalPages; i++) {
        pageNumbers.push(
          <div 
            key={`page-${i}`}
            className={`pagination-page ${currentPage === i ? 'active' : ''}`}
            onClick={() => handlePageClick(i)}
          >
            <span>{i}</span>
          </div>
        );
      }
    }
    
    return pageNumbers;
  };

  return (
    // Depth 0: INSTANCE (Pagination)
    <div className="pagination">
      {/* Depth 1: INSTANCE (Pagination Previous) */}
      <div 
        className="pagination-previous"
        onClick={handlePrevious}
      >
        {/* Depth 2: INSTANCE (Arrow left) */}
        <div className="arrow-left">
          {/* Depth 3: VECTOR (Icon) */}
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 1.5L2 4.5L5.5 7.5" stroke="#1e1e1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {/* Depth 2: TEXT (Previous) */}
        <span className="previous-text">Previous</span>
      </div>

      {/* Depth 1: INSTANCE (Pagination List) */}
      <div className="pagination-list">
        {renderPageNumbers()}
      </div>

      {/* Depth 1: INSTANCE (Pagination Next) */}
      <div 
        className="pagination-next"
        onClick={handleNext}
      >
        {/* Depth 2: TEXT (Next) */}
        <span className="next-text">Next</span>
        {/* Depth 2: INSTANCE (Arrow right) */}
        <div className="arrow-right">
          {/* Depth 3: VECTOR (Icon) */}
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 1.5L7 4.5L3.5 7.5" stroke="#1e1e1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Pagination;